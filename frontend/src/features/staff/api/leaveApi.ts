import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/leave-requests`;

export type LeaveType   = 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequestResponse {
  id:          string;
  staffId:     string;
  leaveType:   LeaveType;
  startDate:   string;
  endDate:     string;
  totalDays:   number;
  reason:      string;
  status:      LeaveStatus;
  reviewedBy:  string | null;
  reviewNotes: string | null;
  reviewedAt:  string | null;
  createdAt:   string;
}

export interface CreateLeaveRequest {
  staffId:   string;
  leaveType: LeaveType;
  startDate: string;
  endDate:   string;
  reason:    string;
}

export async function listLeaveRequests(
  schoolId: string,
  params?: { status?: LeaveStatus; staffId?: string; page?: number; size?: number },
): Promise<LeaveRequestResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<LeaveRequestResponse[]>>(
    base(schoolId), { params });
  return data.data ?? [];
}

export async function createLeaveRequest(
  schoolId: string,
  req: CreateLeaveRequest,
): Promise<LeaveRequestResponse> {
  const { data } = await axiosInstance.post<ApiResponse<LeaveRequestResponse>>(
    base(schoolId), req);
  return data.data!;
}

export async function approveLeave(
  schoolId: string, id: string, notes?: string,
): Promise<LeaveRequestResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<LeaveRequestResponse>>(
    `${base(schoolId)}/${id}/approve`, { notes: notes ?? null });
  return data.data!;
}

export async function rejectLeave(
  schoolId: string, id: string, notes?: string,
): Promise<LeaveRequestResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<LeaveRequestResponse>>(
    `${base(schoolId)}/${id}/reject`, { notes: notes ?? null });
  return data.data!;
}

export async function cancelLeave(schoolId: string, id: string): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/${id}`);
}
