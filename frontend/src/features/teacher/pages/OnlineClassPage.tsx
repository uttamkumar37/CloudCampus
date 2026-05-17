import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMyClassesApi, scheduleClassApi, updateClassStatusApi,
  addRecordingApi, deleteClassApi,
  type OnlineClassResponse, type OnlineClassRequest, type MeetingPlatform,
} from '../api/onlineClassApi';

function todayStr() { return new Date().toISOString().slice(0, 10); }
function plusDays(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'bg-blue-100  text-blue-800',
  LIVE:      'bg-green-100 text-green-800',
  ENDED:     'bg-gray-100  text-gray-600',
  CANCELLED: 'bg-red-100   text-red-700',
};

const PLATFORMS: MeetingPlatform[] = ['ZOOM', 'GMEET', 'TEAMS', 'CUSTOM'];

export function OnlineClassPage() {
  const qc = useQueryClient();
  const [from, setFrom] = useState(todayStr());
  const [to, setTo]     = useState(plusDays(30));
  const [showForm, setShowForm] = useState(false);
  const [recordingModal, setRecordingModal] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');

  const defaultForm: OnlineClassRequest = {
    title: '', description: '', meetingUrl: '', platform: 'CUSTOM',
    scheduledAt: new Date().toISOString().slice(0, 16), durationMinutes: 60,
  };
  const [form, setForm] = useState<OnlineClassRequest>(defaultForm);

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['online-classes', from, to],
    queryFn:  () => listMyClassesApi(from, to),
  });

  const schedule = useMutation({
    mutationFn: () => scheduleClassApi({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['online-classes'] }); setShowForm(false); setForm(defaultForm); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'end' | 'cancel' }) =>
      updateClassStatusApi(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-classes'] }),
  });

  const addRec = useMutation({
    mutationFn: () => addRecordingApi(recordingModal!, recordingUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['online-classes'] });
      setRecordingModal(null); setRecordingUrl('');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteClassApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-classes'] }),
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Online Classes</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {showForm ? 'Cancel' : '+ Schedule Class'}
        </button>
      </div>

      {/* Date filter */}
      <div className="flex gap-3 mb-4">
        {[{ label: 'From', val: from, set: setFrom }, { label: 'To', val: to, set: setTo }].map(({ label, val, set }) => (
          <div key={label}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input type="date" value={val} onChange={(e) => set(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm" />
          </div>
        ))}
      </div>

      {/* Schedule form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-sm font-semibold text-blue-800 mb-3">Schedule Online Class</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Title *</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Scheduled At *</label>
              <input type="datetime-local" value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Duration (minutes)</label>
              <input type="number" min={15} max={240} value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as MeetingPlatform })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm">
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Meeting URL</label>
              <input type="url" value={form.meetingUrl ?? ''}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
          </div>
          <button onClick={() => schedule.mutate()}
            disabled={!form.title.trim() || schedule.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {schedule.isPending ? 'Scheduling…' : 'Schedule'}
          </button>
        </div>
      )}

      {/* Class list */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-gray-500">No classes in this date range.</p>
      ) : (
        <div className="space-y-3">
          {classes.map((cls: OnlineClassResponse) => (
            <div key={cls.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{cls.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(cls.scheduledAt).toLocaleString()} · {cls.durationMinutes} min · {cls.platform}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[cls.status]}`}>
                  {cls.status}
                </span>
              </div>

              {cls.meetingUrl && (
                <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-block text-xs text-blue-600 hover:underline mb-2">
                  Join Meeting →
                </a>
              )}
              {cls.recordingUrl && (
                <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-block ml-3 text-xs text-purple-600 hover:underline mb-2">
                  Recording →
                </a>
              )}

              <div className="flex gap-2 flex-wrap mt-2">
                {cls.status === 'SCHEDULED' && (
                  <button onClick={() => updateStatus.mutate({ id: cls.id, action: 'start' })}
                    className="text-xs font-medium text-green-700 hover:underline">Start</button>
                )}
                {cls.status === 'LIVE' && (
                  <button onClick={() => updateStatus.mutate({ id: cls.id, action: 'end' })}
                    className="text-xs font-medium text-gray-700 hover:underline">End</button>
                )}
                {cls.status === 'ENDED' && !cls.recordingUrl && (
                  <button onClick={() => setRecordingModal(cls.id)}
                    className="text-xs font-medium text-purple-700 hover:underline">Add Recording</button>
                )}
                {(cls.status === 'SCHEDULED') && (
                  <button onClick={() => updateStatus.mutate({ id: cls.id, action: 'cancel' })}
                    className="text-xs font-medium text-red-600 hover:underline">Cancel</button>
                )}
                <button onClick={() => { if (confirm('Delete this class?')) remove.mutate(cls.id); }}
                  className="text-xs font-medium text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recording URL modal */}
      {recordingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Add Recording URL</h3>
            <input type="url" value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setRecordingModal(null); setRecordingUrl(''); }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">Cancel</button>
              <button onClick={() => addRec.mutate()}
                disabled={!recordingUrl.trim() || addRec.isPending}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
