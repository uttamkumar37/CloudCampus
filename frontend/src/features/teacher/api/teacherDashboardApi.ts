import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

export interface TeacherMe {
  staffId:        string;
  firstName:      string;
  lastName:       string;
  email:          string | null;
  phone:          string | null;
  employeeNumber: string | null;
  staffType:      string | null;
  status:         string | null;
  departmentId:   string | null;
  joiningDate:    string | null;
  schoolId:       string;
  schoolName:     string;
  photoUrl:       string | null;
}

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

export async function getTeacherMe(): Promise<TeacherMe> {
  const { data } = await axiosInstance.get<ApiResponse<TeacherMe>>('/v1/teacher/me');
  return data.data!;
}
