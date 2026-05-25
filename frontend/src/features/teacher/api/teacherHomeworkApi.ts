import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type { HomeworkAssignment, HomeworkCreateRequest } from '@/features/homework/types/homework';

export type HomeworkStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus = 'SUBMITTED' | 'REVIEWED';

export interface HomeworkSummary {
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

export interface HomeworkSubmission {
  id:          string;
  homeworkId:  string;
  studentId:   string;
  notes:       string | null;
  status:      SubmissionStatus;
  submittedAt: string;
  reviewedAt:  string | null;
}

export async function listMyHomework(page = 0, size = 20): Promise<PageResponse<HomeworkSummary>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<HomeworkSummary>>>(
    '/v1/teacher/homework', { params: { page, size } });
  return data.data!;
}

export async function createTeacherHomework(body: HomeworkCreateRequest): Promise<HomeworkAssignment> {
  const { data } = await axiosInstance.post<ApiResponse<HomeworkAssignment>>(
    '/v1/teacher/homework', body);
  return data.data!;
}

export async function listSubmissions(homeworkId: string): Promise<HomeworkSubmission[]> {
  const { data } = await axiosInstance.get<ApiResponse<HomeworkSubmission[]>>(
    `/v1/teacher/homework/${homeworkId}/submissions`);
  return data.data ?? [];
}

export async function reviewSubmission(
  homeworkId: string,
  subId: string,
): Promise<HomeworkSubmission> {
  const { data } = await axiosInstance.patch<ApiResponse<HomeworkSubmission>>(
    `/v1/teacher/homework/${homeworkId}/submissions/${subId}/review`);
  return data.data!;
}
