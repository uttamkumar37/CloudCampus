import axiosInstance from '@/shared/api/axiosInstance';

export type VideoUploadStatus = 'PENDING' | 'READY' | 'FAILED';
export type VideoVisibility = 'CLASS' | 'SCHOOL' | 'PUBLIC';

export interface VideoResponse {
  id: string;
  staffId: string;
  subjectId: string | null;
  classId: string | null;
  title: string;
  description: string | null;
  uploadStatus: VideoUploadStatus;
  visibility: VideoVisibility;
  contentType: string;
  fileSizeBytes: number | null;
  durationSeconds: number | null;
  viewCount: number;
  streamUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface VideoInitiateResponse {
  videoId: string;
  uploadUrl: string;
  fileKey: string;
}

export async function initiateUploadApi(payload: {
  title: string;
  description?: string;
  subjectId?: string;
  classId?: string;
  contentType?: string;
  visibility?: VideoVisibility;
}): Promise<VideoInitiateResponse> {
  const res = await axiosInstance.post('/teacher/videos/initiate', payload);
  return res.data.data;
}

export async function confirmUploadApi(videoId: string, fileSizeBytes?: number, durationSeconds?: number): Promise<VideoResponse> {
  const res = await axiosInstance.post(`/teacher/videos/${videoId}/confirm`, { fileSizeBytes, durationSeconds });
  return res.data.data;
}

export async function listMyVideosApi(): Promise<VideoResponse[]> {
  const res = await axiosInstance.get('/teacher/videos');
  return res.data.data;
}

export async function deleteVideoApi(videoId: string): Promise<void> {
  await axiosInstance.delete(`/teacher/videos/${videoId}`);
}

export async function listStudentVideosApi(subjectId: string): Promise<VideoResponse[]> {
  const res = await axiosInstance.get('/student/videos', { params: { subjectId } });
  return res.data.data;
}
