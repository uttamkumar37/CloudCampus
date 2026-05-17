import axiosInstance from '@/shared/api/axiosInstance';

export type MeetingPlatform = 'ZOOM' | 'GMEET' | 'TEAMS' | 'CUSTOM';
export type OnlineClassStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface OnlineClassResponse {
  id: string;
  staffId: string;
  classId: string | null;
  sectionId: string | null;
  subjectId: string | null;
  title: string;
  description: string | null;
  meetingUrl: string | null;
  platform: MeetingPlatform;
  scheduledAt: string;
  durationMinutes: number;
  status: OnlineClassStatus;
  recordingUrl: string | null;
  createdAt: string;
}

export interface OnlineClassRequest {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  title: string;
  description?: string;
  meetingUrl?: string;
  platform?: MeetingPlatform;
  scheduledAt: string;
  durationMinutes: number;
}

export async function scheduleClassApi(req: OnlineClassRequest): Promise<OnlineClassResponse> {
  const res = await axiosInstance.post('/teacher/online-classes', req);
  return res.data.data;
}

export async function listMyClassesApi(from: string, to: string): Promise<OnlineClassResponse[]> {
  const res = await axiosInstance.get('/teacher/online-classes', { params: { from, to } });
  return res.data.data;
}

export async function updateClassStatusApi(classId: string, action: 'start' | 'end' | 'cancel'): Promise<OnlineClassResponse> {
  const res = await axiosInstance.patch(`/teacher/online-classes/${classId}/status`, { action });
  return res.data.data;
}

export async function addRecordingApi(classId: string, recordingUrl: string): Promise<OnlineClassResponse> {
  const res = await axiosInstance.patch(`/teacher/online-classes/${classId}/recording`, { recordingUrl });
  return res.data.data;
}

export async function deleteClassApi(classId: string): Promise<void> {
  await axiosInstance.delete(`/teacher/online-classes/${classId}`);
}

export async function listStudentClassesApi(sectionId: string, from: string, to: string): Promise<OnlineClassResponse[]> {
  const res = await axiosInstance.get('/student/online-classes', { params: { sectionId, from, to } });
  return res.data.data;
}
