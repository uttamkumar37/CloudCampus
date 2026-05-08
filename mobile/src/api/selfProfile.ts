import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { StudentFullDetail } from '../types/student';

export async function getMyStudentDetails(): Promise<StudentFullDetail> {
  const { data } = await apiClient.get<ApiResponse<StudentFullDetail>>(
    '/students/me/details',
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
