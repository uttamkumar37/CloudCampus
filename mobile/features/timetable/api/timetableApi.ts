import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetableSlot {
  id:             string;
  schoolId:       string;
  academicYearId: string;
  classId:        string;
  sectionId:      string;
  subjectId:      string;
  staffId:        string | null;
  dayOfWeek:      DayOfWeek;
  periodNumber:   number;
  startTime:      string | null;
  endTime:        string | null;
}

export async function getMyTimetable(academicYearId?: string): Promise<TimetableSlot[]> {
  const { data } = await axiosInstance.get<ApiResponse<TimetableSlot[]>>(
    '/v1/teacher/timetable',
    { params: academicYearId ? { academicYearId } : undefined },
  );
  return data.data ?? [];
}
