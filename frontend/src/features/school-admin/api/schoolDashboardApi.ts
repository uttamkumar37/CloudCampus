import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface SchoolDashboardStats {
  totalStudents:       number;
  totalStaff:          number;
  totalClasses:        number;
  pendingLeaveRequests: number;
  pendingFeeRecords:   number;
  partialFeeRecords:   number;
  publishedNotices:    number;
}

export async function getSchoolDashboard(schoolId: string): Promise<SchoolDashboardStats> {
  const { data } = await axiosInstance.get<ApiResponse<SchoolDashboardStats>>(
    `/v1/school-admin/schools/${schoolId}/dashboard`,
  );
  return data.data!;
}
