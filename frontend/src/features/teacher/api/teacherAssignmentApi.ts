import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';

export interface AssignmentSummary {
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

export interface AssignmentSubmission {
  id:            string;
  assignmentId:  string;
  studentId:     string;
  status:        SubmissionStatus;
  textResponse:  string | null;
  submittedAt:   string | null;
  marksObtained: number | null;
  feedback:      string | null;
  gradedBy:      string | null;
  gradedAt:      string | null;
}

export interface GradeRequest {
  marksObtained: number;
  feedback?:     string;
}

export async function listMyAssignments(page = 0, size = 20): Promise<PageResponse<AssignmentSummary>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<AssignmentSummary>>>(
    '/v1/teacher/assignments', { params: { page, size } });
  return data.data!;
}

export async function listAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
  const { data } = await axiosInstance.get<ApiResponse<AssignmentSubmission[]>>(
    `/v1/teacher/assignments/${assignmentId}/submissions`);
  return data.data ?? [];
}

export async function gradeSubmission(
  assignmentId: string,
  subId: string,
  body: GradeRequest,
): Promise<AssignmentSubmission> {
  const { data } = await axiosInstance.patch<ApiResponse<AssignmentSubmission>>(
    `/v1/teacher/assignments/${assignmentId}/submissions/${subId}/grade`, body);
  return data.data!;
}
