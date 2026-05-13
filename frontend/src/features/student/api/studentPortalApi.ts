import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Homework ─────────────────────────────────────────────────────────────────

export type HomeworkStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface HomeworkResponse {
  id:             string;
  schoolId:       string;
  academicYearId: string;
  classId:        string;
  sectionId:      string | null;
  subjectId:      string;
  assignedBy:     string | null;
  title:          string;
  description:    string | null;
  dueDate:        string;
  status:         HomeworkStatus;
  attachmentUrls: string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface HomeworkSubmissionResponse {
  id:          string;
  homeworkId:  string;
  studentId:   string;
  notes:       string | null;
  status:      'SUBMITTED' | 'REVIEWED';
  submittedAt: string;
  reviewedAt:  string | null;
}

export async function getMyHomework(): Promise<HomeworkResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<HomeworkResponse[]>>('/v1/student/homework');
  return data.data ?? [];
}

export async function submitHomework(homeworkId: string, notes: string): Promise<HomeworkSubmissionResponse> {
  const { data } = await axiosInstance.post<ApiResponse<HomeworkSubmissionResponse>>(
    `/v1/student/homework/${homeworkId}/submit`, { notes });
  return data.data!;
}

// ── Assignments ───────────────────────────────────────────────────────────────

export type AssignmentStatus  = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus  = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';

export interface AssignmentView {
  assignmentId:     string;
  title:            string;
  description:      string | null;
  dueDate:          string;
  maxMarks:         number | null;
  assignmentStatus: AssignmentStatus;
  submitted:        boolean;
  submissionStatus: SubmissionStatus | null;
  marksObtained:    number | null;
  feedback:         string | null;
  submittedAt:      string | null;
}

export async function getMyAssignments(): Promise<AssignmentView[]> {
  const { data } = await axiosInstance.get<ApiResponse<AssignmentView[]>>('/v1/student/assignments');
  return data.data ?? [];
}

export async function submitAssignment(assignmentId: string, textResponse: string): Promise<AssignmentView> {
  const { data } = await axiosInstance.post<ApiResponse<AssignmentView>>(
    `/v1/student/assignments/${assignmentId}/submit`, { textResponse });
  return data.data!;
}

// ── Timetable ─────────────────────────────────────────────────────────────────

import type { TimetableSlot } from '@/features/timetable/types/timetable';

export async function getMyTimetable(): Promise<TimetableSlot[]> {
  const { data } = await axiosInstance.get<ApiResponse<TimetableSlot[]>>('/v1/student/timetable');
  return data.data ?? [];
}

// ── Notices ───────────────────────────────────────────────────────────────────

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

export async function getMyNotices(page = 0): Promise<NoticePage> {
  const { data } = await axiosInstance.get<ApiResponse<NoticePage>>(
    '/v1/mobile/notices', { params: { page, limit: 20 } });
  return data.data!;
}

// ── Exam Results ──────────────────────────────────────────────────────────────

export interface StudentResultSummary {
  resultId:            string;
  examId:              string;
  examName:            string;
  examType:            string | null;
  examStatus:          string | null;
  totalMarksObtained:  number;
  totalMarksPossible:  number;
  percentage:          number;
  grade:               string | null;
  rank:                number | null;
  passed:              boolean;
  generatedAt:         string;
}

export async function getMyResults(): Promise<StudentResultSummary[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentResultSummary[]>>('/v1/student/results');
  return data.data ?? [];
}

// ── Fees ──────────────────────────────────────────────────────────────────────

export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'OVERDUE';

export interface StudentFeeRecord {
  id:             string;
  schoolId:       string;
  studentId:      string;
  feeStructureId: string;
  categoryName:   string;
  academicYearId: string;
  amountDue:      number;
  amountPaid:     number;
  discount:       number;
  balance:        number;
  dueDate:        string;
  status:         FeeStatus;
  notes:          string | null;
  createdAt:      string;
  updatedAt:      string;
}

export async function getMyFees(academicYearId?: string): Promise<StudentFeeRecord[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentFeeRecord[]>>(
    '/v1/student/fees', { params: academicYearId ? { academicYearId } : {} });
  return data.data ?? [];
}
