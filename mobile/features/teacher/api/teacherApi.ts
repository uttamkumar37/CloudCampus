import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

export type HomeworkStatus   = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type AssignmentStatus = 'DRAFT' | 'OPEN'      | 'CLOSED';

export interface TeacherHomework {
  homeworkId:      string;
  title:           string;
  description:     string | null;
  dueDate:         string;
  status:          HomeworkStatus;
  classId:         string;
  sectionId:       string | null;
  subjectId:       string;
  submissionCount: number;
}

export interface TeacherAssignment {
  assignmentId:    string;
  title:           string;
  description:     string | null;
  dueDate:         string;
  maxMarks:        number | null;
  status:          AssignmentStatus;
  classId:         string;
  sectionId:       string | null;
  subjectId:       string;
  submissionCount: number;
  gradedCount:     number;
}

export async function getTeacherHomework(page = 0): Promise<PageResponse<TeacherHomework>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<TeacherHomework>>>(
    '/v1/teacher/homework', { params: { page, size: 20 } });
  return data.data ?? { items: [], offset: 0, limit: 20, total: 0 };
}

export async function getTeacherAssignments(page = 0): Promise<PageResponse<TeacherAssignment>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<TeacherAssignment>>>(
    '/v1/teacher/assignments', { params: { page, size: 20 } });
  return data.data ?? { items: [], offset: 0, limit: 20, total: 0 };
}

// ── Teacher attendance (E67) ──────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface TeacherStudentRow {
  id:            string;
  studentNumber: string;
  firstName:     string;
  lastName:      string;
  classId:       string;
  sectionId:     string;
}

export interface StudentMark {
  studentId: string;
  status:    AttendanceStatus;
  remarks?:  string;
}

export interface TakeAttendancePayload {
  classId:        string;
  sectionId?:     string;
  academicYearId: string;
  subjectId?:     string;
  sessionDate:    string;   // YYYY-MM-DD
  periodNumber:   number;
  marks:          StudentMark[];
}

export async function getStudentsForAttendance(
  classId: string,
  sectionId?: string,
): Promise<TeacherStudentRow[]> {
  const { data } = await axiosInstance.get<ApiResponse<TeacherStudentRow[]>>(
    '/v1/teacher/attendance/students',
    { params: { classId, ...(sectionId ? { sectionId } : {}) } },
  );
  return data.data ?? [];
}

export async function submitTeacherAttendance(
  payload: TakeAttendancePayload,
): Promise<void> {
  await axiosInstance.post('/v1/teacher/attendance/sessions', payload);
}

export interface QrAttendanceResponse {
  sessionId:   string;
  qrToken:     string;
  qrDeepLink:  string;
}

export async function generateQrAttendanceSession(
  payload: TakeAttendancePayload,
): Promise<QrAttendanceResponse> {
  const { data } = await axiosInstance.post<{ data: QrAttendanceResponse }>(
    '/v1/teacher/attendance/sessions/with-qr',
    payload,
  );
  return data.data;
}
