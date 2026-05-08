import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { AttendanceRecord } from '../types/attendance';

export async function getAttendance(params?: {
  date?: string;
  classId?: string;
  studentId?: string;
}): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
    '/attendances',
    { params },
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
