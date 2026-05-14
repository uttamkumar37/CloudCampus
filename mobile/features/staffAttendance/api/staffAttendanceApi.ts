import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export type StaffAttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

export interface StaffAttendanceRow {
  staffId:        string;
  firstName:      string;
  lastName:       string;
  employeeNumber: string;
  status:         StaffAttendanceStatus | null;
  notes:          string | null;
}

export interface AttendanceEntry {
  staffId: string;
  status:  StaffAttendanceStatus;
  notes?:  string;
}

export async function getStaffAttendance(schoolId: string, date: string): Promise<StaffAttendanceRow[]> {
  const { data } = await axiosInstance.get<ApiResponse<StaffAttendanceRow[]>>(
    `/v1/school-admin/schools/${schoolId}/staff-attendance`,
    { params: { date } },
  );
  return data.data ?? [];
}

export async function markStaffAttendance(
  schoolId: string,
  date:     string,
  entries:  AttendanceEntry[],
): Promise<void> {
  await axiosInstance.post(
    `/v1/school-admin/schools/${schoolId}/staff-attendance/mark`,
    { date, entries },
  );
}
