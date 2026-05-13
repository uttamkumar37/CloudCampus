import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}`;

export type StaffAttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

export interface StaffAttendanceRow {
  staffId:        string;
  firstName:      string;
  lastName:       string;
  employeeNumber: string;
  status:         StaffAttendanceStatus | null;
  notes:          string | null;
}

export interface StaffAttendanceResponse {
  id:             string;
  staffId:        string;
  attendanceDate: string;
  status:         StaffAttendanceStatus;
  notes:          string | null;
  markedBy:       string | null;
  updatedAt:      string;
}

export interface AttendanceEntry {
  staffId: string;
  status:  StaffAttendanceStatus;
  notes?:  string | null;
}

export interface BulkMarkRequest {
  date:    string;
  entries: AttendanceEntry[];
}

export async function listStaffAttendance(
  schoolId: string,
  date: string,
): Promise<StaffAttendanceRow[]> {
  const { data } = await axiosInstance.get<ApiResponse<StaffAttendanceRow[]>>(
    `${base(schoolId)}/staff-attendance`,
    { params: { date } },
  );
  return data.data ?? [];
}

export async function markStaffAttendance(
  schoolId: string,
  req: BulkMarkRequest,
): Promise<StaffAttendanceResponse[]> {
  const { data } = await axiosInstance.post<ApiResponse<StaffAttendanceResponse[]>>(
    `${base(schoolId)}/staff-attendance/mark`,
    req,
  );
  return data.data ?? [];
}

export async function getStaffAttendanceHistory(
  schoolId: string,
  staffId: string,
): Promise<StaffAttendanceResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StaffAttendanceResponse[]>>(
    `${base(schoolId)}/staff/${staffId}/attendance`,
  );
  return data.data ?? [];
}
