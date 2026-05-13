import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

export async function getMyTimetable(academicYearId?: string): Promise<TimetableSlot[]> {
  const { data } = await axiosInstance.get<ApiResponse<TimetableSlot[]>>(
    '/v1/teacher/timetable',
    { params: academicYearId ? { academicYearId } : undefined },
  );
  return data.data ?? [];
}
