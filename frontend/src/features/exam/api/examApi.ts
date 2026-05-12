import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  ExamCreateRequest,
  ExamResponse,
  ExamStatus,
  ExamSubjectRequest,
  ExamSubjectResponse,
} from '../types/exam';

const base = '/v1/school-admin';

export async function createExam(
  schoolId: string,
  body: ExamCreateRequest,
): Promise<ExamResponse> {
  const { data } = await axiosInstance.post<ApiResponse<ExamResponse>>(
    `${base}/schools/${schoolId}/exams`,
    body,
  );
  return data.data!;
}

export async function listExams(
  schoolId: string,
  page: number,
  size: number,
  academicYearId?: string,
  status?: ExamStatus,
): Promise<PageResponse<ExamResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<ExamResponse>>>(
    `${base}/schools/${schoolId}/exams`,
    { params: { page, size, academicYearId, status } },
  );
  return data.data ?? { items: [], offset: 0, limit: size, total: 0 };
}

export async function getExam(schoolId: string, examId: string): Promise<ExamResponse> {
  const { data } = await axiosInstance.get<ApiResponse<ExamResponse>>(
    `${base}/schools/${schoolId}/exams/${examId}`,
  );
  return data.data!;
}

export async function updateExamStatus(
  schoolId: string,
  examId: string,
  status: ExamStatus,
): Promise<ExamResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<ExamResponse>>(
    `${base}/schools/${schoolId}/exams/${examId}/status`,
    { status },
  );
  return data.data!;
}

export async function addExamSubject(
  schoolId: string,
  examId: string,
  body: ExamSubjectRequest,
): Promise<ExamSubjectResponse> {
  const { data } = await axiosInstance.post<ApiResponse<ExamSubjectResponse>>(
    `${base}/schools/${schoolId}/exams/${examId}/subjects`,
    body,
  );
  return data.data!;
}

export async function removeExamSubject(
  schoolId: string,
  examId: string,
  entryId: string,
): Promise<void> {
  await axiosInstance.delete(
    `${base}/schools/${schoolId}/exams/${examId}/subjects/${entryId}`,
  );
}
