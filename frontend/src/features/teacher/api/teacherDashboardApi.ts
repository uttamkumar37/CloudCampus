import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

export interface TeacherDashboardData {
  todaySlots:              TimetableSlot[];
  pendingHomeworkReview:   number;
  pendingAssignmentGrading: number;
  totalHomeworkPosted:     number;
  totalAssignmentsPosted:  number;
}

export async function getTeacherDashboard(): Promise<TeacherDashboardData> {
  const { data } = await axiosInstance.get<ApiResponse<TeacherDashboardData>>(
    '/v1/teacher/dashboard',
  );
  return data.data!;
}
