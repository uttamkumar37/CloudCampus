import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface AttendanceStudent {
  id:            string;
  studentNumber: string;
  firstName:     string;
  lastName:      string;
  classId:       string;
  sectionId:     string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface StudentMark {
  studentId: string;
  status:    AttendanceStatus;
  remarks?:  string;
}

export interface TakeAttendanceRequest {
  classId:       string;
  sectionId?:    string;
  academicYearId: string;
  subjectId?:    string;
  sessionDate:   string;   // YYYY-MM-DD
  periodNumber:  number;
  marks:         StudentMark[];
}

export async function getAttendanceStudents(
  classId: string,
  sectionId?: string,
): Promise<AttendanceStudent[]> {
  const { data } = await axiosInstance.get<ApiResponse<AttendanceStudent[]>>(
    '/v1/teacher/attendance/students',
    { params: { classId, ...(sectionId ? { sectionId } : {}) } },
  );
  return data.data ?? [];
}

export async function takeAttendance(req: TakeAttendanceRequest): Promise<void> {
  await axiosInstance.post('/v1/teacher/attendance/sessions', req);
}

export interface QrCodeResponse {
  token:     string;
  qrBase64:  string;
  expiresAt: string;
}

export interface SessionWithQrResponse extends QrCodeResponse {
  sessionId: string;
}

export interface OpenWithQrRequest {
  classId:       string;
  sectionId?:    string;
  academicYearId: string;
  subjectId?:    string;
  sessionDate:   string;
  periodNumber:  number;
}

export async function openSessionWithQr(req: OpenWithQrRequest): Promise<SessionWithQrResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SessionWithQrResponse>>(
    '/v1/teacher/attendance/sessions/with-qr',
    req,
  );
  return data.data!;
}

export async function generateSessionQr(sessionId: string): Promise<QrCodeResponse> {
  const { data } = await axiosInstance.post<ApiResponse<QrCodeResponse>>(
    `/v1/teacher/attendance/sessions/${sessionId}/qr`,
  );
  return data.data!;
}
