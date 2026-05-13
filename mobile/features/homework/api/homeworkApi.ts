import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export type HomeworkStatus     = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus   = 'SUBMITTED' | 'REVIEWED';

export interface MobileHomework {
  id:             string;
  title:          string;
  description:    string | null;
  subjectId:      string;
  classId:        string;
  sectionId:      string | null;
  dueDate:        string;
  status:         HomeworkStatus;
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

export async function listMyHomework(): Promise<MobileHomework[]> {
  const { data } = await axiosInstance.get<ApiResponse<MobileHomework[]>>('/v1/student/homework');
  return data.data ?? [];
}

export async function submitHomework(homeworkId: string, notes: string): Promise<HomeworkSubmission> {
  const { data } = await axiosInstance.post<ApiResponse<HomeworkSubmission>>(
    `/v1/student/homework/${homeworkId}/submit`,
    { notes },
  );
  return data.data!;
}
