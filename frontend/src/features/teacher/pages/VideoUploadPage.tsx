import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  initiateUploadApi, confirmUploadApi, listMyVideosApi, deleteVideoApi,
  type VideoResponse, type VideoVisibility,
} from '../api/videoApi';

const VISIBILITY_LABEL: Record<VideoVisibility, string> = {
  CLASS: 'Class only',
  SCHOOL: 'Whole school',
  PUBLIC: 'Public',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  READY:   'bg-green-100  text-green-800',
  FAILED:  'bg-red-100    text-red-700',
};

function formatBytes(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoUploadPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<VideoVisibility>('CLASS');
  const [file, setFile]             = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError]       = useState('');

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['my-videos'],
    queryFn:  listMyVideosApi,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVideoApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-videos'] }),
  });

  async function handleUpload() {
    if (!file || !title.trim()) return;
    setUploadError('');
    setUploadProgress(0);

    try {
      const { videoId, uploadUrl } = await initiateUploadApi({
        title,
        description: description || undefined,
        contentType: file.type || 'video/mp4',
        visibility,
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      await confirmUploadApi(videoId, file.size);
      qc.invalidateQueries({ queryKey: ['my-videos'] });

      setTitle(''); setDescription(''); setFile(null); setUploadProgress(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Video Resources</h1>

      {/* Upload form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Upload Video</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Algebra"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm resize-y" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as VideoVisibility)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm">
              {(Object.keys(VISIBILITY_LABEL) as VideoVisibility[]).map((v) => (
                <option key={v} value={v}>{VISIBILITY_LABEL[v]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Video file *</label>
            <input ref={fileRef} type="file" accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600" />
          </div>
        </div>

        {uploadProgress !== null && (
          <div className="mb-3">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}
        {uploadError && <p className="mb-3 text-xs text-red-600">{uploadError}</p>}

        <button
          onClick={handleUpload}
          disabled={!title.trim() || !file || uploadProgress !== null}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploadProgress !== null ? 'Uploading…' : 'Upload Video'}
        </button>
      </div>

      {/* Video list */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-gray-500">No videos uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((v: VideoResponse) => (
            <div key={v.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-gray-900">{v.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {VISIBILITY_LABEL[v.visibility]} · {formatBytes(v.fileSizeBytes)} · {v.viewCount} views
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[v.uploadStatus]}`}>
                  {v.uploadStatus}
                </span>
              </div>

              {v.description && (
                <p className="text-xs text-gray-500 mt-1">{v.description}</p>
              )}

              <div className="flex gap-3 mt-2">
                {v.streamUrl && (
                  <a href={v.streamUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline">
                    Watch →
                  </a>
                )}
                <button
                  onClick={() => { if (confirm('Delete this video?')) remove.mutate(v.id); }}
                  disabled={remove.isPending}
                  className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
