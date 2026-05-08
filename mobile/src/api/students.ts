import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { Student, StudentFullDetail } from '../types/student';

export async function getStudents(
  page = 0,
  size = 20,
  search?: string,
): Promise<PageResponse<Student>> {
  const params: Record<string, string | number> = { page, size };
  if (search) params.search = search;
  const { data } = await apiClient.get<ApiResponse<PageResponse<Student>>>(
    '/students',
    { params },
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getStudentDetails(id: string): Promise<StudentFullDetail> {
  const { data } = await apiClient.get<ApiResponse<StudentFullDetail>>(
    `/students/${id}/details`,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
