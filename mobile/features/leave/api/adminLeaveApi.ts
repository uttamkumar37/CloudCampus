import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { LeaveRequest, LeaveStatus } from './leaveApi';

export async function getLeaveRequests(
  schoolId: string,
  status?: LeaveStatus,
  page = 0,
  size = 50,
): Promise<LeaveRequest[]> {
  const { data } = await axiosInstance.get<ApiResponse<LeaveRequest[]>>(
    `/v1/school-admin/schools/${schoolId}/leave-requests`,
    { params: { ...(status ? { status } : {}), page, size } },
  );
  return data.data ?? [];
}

export async function approveLeave(schoolId: string, id: string, notes?: string): Promise<LeaveRequest> {
  const { data } = await axiosInstance.patch<ApiResponse<LeaveRequest>>(
    `/v1/school-admin/schools/${schoolId}/leave-requests/${id}/approve`,
    notes ? { notes } : {},
  );
  return data.data!;
}

export async function rejectLeave(schoolId: string, id: string, notes?: string): Promise<LeaveRequest> {
  const { data } = await axiosInstance.patch<ApiResponse<LeaveRequest>>(
    `/v1/school-admin/schools/${schoolId}/leave-requests/${id}/reject`,
    notes ? { notes } : {},
  );
  return data.data!;
}
