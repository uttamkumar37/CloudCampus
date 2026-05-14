import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

// ── Children ──────────────────────────────────────────────────────────────────

export interface ChildSummary {
  studentId:     string;
  firstName:     string;
  lastName:      string;
  studentNumber: string | null;
  relationship:  string;
  totalSessions: number;
  presentCount:  number;
  attendancePct: number;
}

export async function getMyChildren(): Promise<ChildSummary[]> {
  const { data } = await axiosInstance.get<ApiResponse<ChildSummary[]>>('/v1/parent/children');
  return data.data ?? [];
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceSummary {
  studentId:     string;
  firstName:     string;
  lastName:      string;
  totalSessions: number;
  present:       number;
  absent:        number;
  late:          number;
  attendancePct: number;
}

export async function getChildAttendance(studentId: string): Promise<AttendanceSummary> {
  const { data } = await axiosInstance.get<ApiResponse<AttendanceSummary>>(
    `/v1/parent/children/${studentId}/attendance`);
  return data.data!;
}

// ── Results ───────────────────────────────────────────────────────────────────

export interface ExamResult {
  id:                  string;
  examId:              string;
  studentId:           string;
  totalMarksObtained:  number | null;
  totalMarksPossible:  number | null;
  percentage:          number | null;
  grade:               string | null;
  rank:                number | null;
  passed:              boolean;
  generatedAt:         string;
}

export async function getChildResults(studentId: string): Promise<ExamResult[]> {
  const { data } = await axiosInstance.get<ApiResponse<ExamResult[]>>(
    `/v1/parent/children/${studentId}/results`);
  return data.data ?? [];
}

// ── Homework ──────────────────────────────────────────────────────────────────

export type HomeworkStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface HomeworkItem {
  id:          string;
  title:       string;
  description: string | null;
  dueDate:     string;
  status:      HomeworkStatus;
}

export async function getChildHomework(studentId: string): Promise<HomeworkItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<HomeworkItem[]>>(
    `/v1/parent/children/${studentId}/homework`);
  return data.data ?? [];
}

// ── Timetable ─────────────────────────────────────────────────────────────────

export async function getChildTimetable(studentId: string): Promise<TimetableSlot[]> {
  const { data } = await axiosInstance.get<ApiResponse<TimetableSlot[]>>(
    `/v1/parent/children/${studentId}/timetable`);
  return data.data ?? [];
}

// ── Fees ──────────────────────────────────────────────────────────────────────

export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'OVERDUE';

export interface ChildFeeRecord {
  id:             string;
  categoryName:   string;
  academicYearId: string;
  amountDue:      number;
  amountPaid:     number;
  discount:       number;
  balance:        number;
  dueDate:        string | null;
  status:         FeeStatus;
  notes:          string | null;
}

export async function getChildFees(studentId: string): Promise<ChildFeeRecord[]> {
  const { data } = await axiosInstance.get<ApiResponse<ChildFeeRecord[]>>(
    `/v1/parent/children/${studentId}/fees`);
  return data.data ?? [];
}

// ── Notices (shared with student portal) ─────────────────────────────────────

export interface NoticeItem {
  id:          string;
  title:       string;
  content:     string;
  category:    string;
  target:      string;
  priority:    number;
  published:   boolean;
  publishedAt: string | null;
  expiresAt:   string | null;
}

export interface NoticePage {
  items:  NoticeItem[];
  offset: number;
  limit:  number;
  total:  number;
}

export async function getNotices(page = 0): Promise<NoticePage> {
  const { data } = await axiosInstance.get<ApiResponse<NoticePage>>(
    '/v1/mobile/notices', { params: { page, limit: 20 } });
  return data.data!;
}
