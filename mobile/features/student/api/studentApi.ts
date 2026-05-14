import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Assignments ───────────────────────────────────────────────────────────────

export type AssignmentStatus  = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus  = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';

export interface MobileAssignment {
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

export async function listMyAssignments(): Promise<MobileAssignment[]> {
  const { data } = await axiosInstance.get<ApiResponse<MobileAssignment[]>>('/v1/student/assignments');
  return data.data ?? [];
}

export async function submitAssignment(assignmentId: string, textResponse: string): Promise<MobileAssignment> {
  const { data } = await axiosInstance.post<ApiResponse<MobileAssignment>>(
    `/v1/student/assignments/${assignmentId}/submit`,
    { textResponse },
  );
  return data.data!;
}

// ── Results ───────────────────────────────────────────────────────────────────

export interface MobileResult {
  resultId:           string;
  examId:             string;
  examName:           string;
  examType:           string | null;
  examStatus:         string | null;
  totalMarksObtained: number;
  totalMarksPossible: number;
  percentage:         number;
  grade:              string | null;
  rank:               number | null;
  passed:             boolean;
  generatedAt:        string;
}

export async function listMyResults(): Promise<MobileResult[]> {
  const { data } = await axiosInstance.get<ApiResponse<MobileResult[]>>('/v1/student/results');
  return data.data ?? [];
}

// ── Fees ──────────────────────────────────────────────────────────────────────

export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'OVERDUE';

export interface MobileFeeRecord {
  id:           string;
  categoryName: string;
  amountDue:    number;
  amountPaid:   number;
  discount:     number;
  balance:      number;
  dueDate:      string;
  status:       FeeStatus;
  notes:        string | null;
}

export async function listMyFees(): Promise<MobileFeeRecord[]> {
  const { data } = await axiosInstance.get<ApiResponse<MobileFeeRecord[]>>('/v1/student/fees');
  return data.data ?? [];
}
