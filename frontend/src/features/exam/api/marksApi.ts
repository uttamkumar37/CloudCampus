import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  BulkMarksEntryRequest,
  MarksEntryRequest,
  StudentMarkResponse,
} from '../types/marks';

const base = (schoolId: string, examId: string, subjectEntryId: string) =>
  `/v1/school-admin/schools/${schoolId}/exams/${examId}/subjects/${subjectEntryId}/marks`;

export async function bulkSaveMarks(
  schoolId: string,
  examId: string,
  subjectEntryId: string,
  body: BulkMarksEntryRequest,
): Promise<StudentMarkResponse[]> {
  const { data } = await axiosInstance.post<ApiResponse<StudentMarkResponse[]>>(
    `${base(schoolId, examId, subjectEntryId)}/bulk`,
    body,
  );
  return data.data ?? [];
}

export async function listMarks(
  schoolId: string,
  examId: string,
  subjectEntryId: string,
): Promise<StudentMarkResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentMarkResponse[]>>(
    base(schoolId, examId, subjectEntryId),
  );
  return data.data ?? [];
}

export async function updateMark(
  schoolId: string,
  examId: string,
  subjectEntryId: string,
  markId: string,
  body: MarksEntryRequest,
): Promise<StudentMarkResponse> {
  const { data } = await axiosInstance.put<ApiResponse<StudentMarkResponse>>(
    `${base(schoolId, examId, subjectEntryId)}/${markId}`,
    body,
  );
  return data.data!;
}

export async function deleteMark(
  schoolId: string,
  examId: string,
  subjectEntryId: string,
  markId: string,
): Promise<void> {
  await axiosInstance.delete(`${base(schoolId, examId, subjectEntryId)}/${markId}`);
}
