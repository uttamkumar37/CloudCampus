import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { ExamResultResponse } from '../types/result';

const base = (schoolId: string, examId: string) =>
  `/v1/school-admin/schools/${schoolId}/exams/${examId}/results`;

/** Trigger result generation (idempotent — safe to call multiple times). */
export async function generateResults(
  schoolId: string,
  examId: string,
): Promise<ExamResultResponse[]> {
  const { data } = await axiosInstance.post<ApiResponse<ExamResultResponse[]>>(
    `${base(schoolId, examId)}/generate`,
  );
  return data.data ?? [];
}

/** Get ranked results list for all students. */
export async function listResults(
  schoolId: string,
  examId: string,
): Promise<ExamResultResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<ExamResultResponse[]>>(
    base(schoolId, examId),
  );
  return data.data ?? [];
}

/** Get individual student result with per-subject breakdown (report card). */
export async function getStudentResult(
  schoolId: string,
  examId: string,
  studentId: string,
): Promise<ExamResultResponse> {
  const { data } = await axiosInstance.get<ApiResponse<ExamResultResponse>>(
    `${base(schoolId, examId)}/students/${studentId}`,
  );
  return data.data!;
}
