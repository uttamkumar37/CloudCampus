import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  AttendanceSessionResponse,
  AttendanceSessionSummaryResponse,
  CreateSessionRequest,
  MarkAttendanceRequest,
  StudentAttendanceReport,
} from '../types/attendance';

const base = '/v1/school-admin';

// ── Session management ────────────────────────────────────────────────────────

export async function openSession(
  schoolId: string,
  body: CreateSessionRequest,
): Promise<AttendanceSessionResponse> {
  const { data } = await axiosInstance.post<ApiResponse<AttendanceSessionResponse>>(
    `${base}/schools/${schoolId}/attendance/sessions`,
    body,
  );
  return data.data!;
}

export async function markAttendance(
  sessionId: string,
  body: MarkAttendanceRequest,
): Promise<AttendanceSessionResponse> {
  const { data } = await axiosInstance.post<ApiResponse<AttendanceSessionResponse>>(
    `${base}/attendance/sessions/${sessionId}/mark`,
    body,
  );
  return data.data!;
}

export async function getSession(
  sessionId: string,
): Promise<AttendanceSessionResponse> {
  const { data } = await axiosInstance.get<ApiResponse<AttendanceSessionResponse>>(
    `${base}/attendance/sessions/${sessionId}`,
  );
  return data.data!;
}

// ── Listing ───────────────────────────────────────────────────────────────────

export async function listSessionsByDate(
  schoolId: string,
  date: string,
): Promise<AttendanceSessionSummaryResponse[]> {
  const { data } = await axiosInstance.get<
    ApiResponse<AttendanceSessionSummaryResponse[]>
  >(`${base}/schools/${schoolId}/attendance/sessions`, { params: { date } });
  return data.data ?? [];
}

export async function listSessionsByClassDateRange(
  classId: string,
  from: string,
  to: string,
  sectionId?: string,
): Promise<AttendanceSessionSummaryResponse[]> {
  const { data } = await axiosInstance.get<
    ApiResponse<AttendanceSessionSummaryResponse[]>
  >(`${base}/classes/${classId}/attendance/sessions`, {
    params: { from, to, sectionId },
  });
  return data.data ?? [];
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getStudentAttendanceReport(
  studentId: string,
  from: string,
  to: string,
): Promise<StudentAttendanceReport> {
  const { data } = await axiosInstance.get<ApiResponse<StudentAttendanceReport>>(
    `${base}/students/${studentId}/attendance/report`,
    { params: { from, to } },
  );
  return data.data!;
}

export async function getClassAttendanceReport(
  classId: string,
  from: string,
  to: string,
  sectionId?: string,
): Promise<StudentAttendanceReport[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentAttendanceReport[]>>(
    `${base}/classes/${classId}/attendance/report`,
    { params: { from, to, sectionId } },
  );
  return data.data ?? [];
}

// ── QR attendance (CC-0802) ───────────────────────────────────────────────────

export interface QrResponse {
  token:     string;
  qrBase64:  string;
  expiresAt: string;
}

export async function generateSessionQr(sessionId: string): Promise<QrResponse> {
  const { data } = await axiosInstance.post<ApiResponse<QrResponse>>(
    `/v1/teacher/attendance/sessions/${sessionId}/qr`,
  );
  return data.data!;
}

export async function qrSelfMark(token: string): Promise<void> {
  await axiosInstance.post('/v1/student/attendance/qr-mark', { token });
}
