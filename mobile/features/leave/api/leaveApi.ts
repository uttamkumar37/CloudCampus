import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export type LeaveType   = 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
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

export interface SubmitLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate:   string;
  reason:    string;
}

export async function getMyLeave(status?: LeaveStatus): Promise<LeaveRequest[]> {
  const { data } = await axiosInstance.get<ApiResponse<LeaveRequest[]>>(
    '/v1/teacher/leave',
    { params: status ? { status } : undefined },
  );
  return data.data ?? [];
}

export async function submitLeave(payload: SubmitLeavePayload): Promise<LeaveRequest> {
  const { data } = await axiosInstance.post<ApiResponse<LeaveRequest>>(
    '/v1/teacher/leave',
    payload,
  );
  return data.data!;
}

export async function cancelLeave(id: string): Promise<void> {
  await axiosInstance.delete(`/v1/teacher/leave/${id}`);
}
