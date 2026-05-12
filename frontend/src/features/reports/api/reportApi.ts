import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/reports`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AttendanceReportRow {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

export interface AttendanceReport {
  schoolId: string;
  academicYearId: string;
  totalSessions: number;
  rows: AttendanceReportRow[];
}

export interface FeeReport {
  schoolId: string;
  academicYearId: string;
  totalRecords: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
  waivedCount: number;
  collectionRate: number;
}

export interface PerformanceReportRow {
  studentId: string;
  totalMarksObtained: number;
  totalMarksPossible: number;
  percentage: number;
  grade: string;
  rank: number | null;
  passed: boolean;
}

export interface PerformanceReport {
  schoolId: string;
  examId: string;
  totalStudents: number;
  passedCount: number;
  failedCount: number;
  classAverage: number;
  rows: PerformanceReportRow[];
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getAttendanceReport(
  schoolId: string,
  academicYearId: string,
): Promise<AttendanceReport> {
  const { data } = await axiosInstance.get<ApiResponse<AttendanceReport>>(
    `${base(schoolId)}/attendance`,
    { params: { academicYearId } },
  );
  return data.data!;
}

export async function getFeeReport(
  schoolId: string,
  academicYearId: string,
): Promise<FeeReport> {
  const { data } = await axiosInstance.get<ApiResponse<FeeReport>>(
    `${base(schoolId)}/fees`,
    { params: { academicYearId } },
  );
  return data.data!;
}

export async function getPerformanceReport(
  schoolId: string,
  examId: string,
): Promise<PerformanceReport> {
  const { data } = await axiosInstance.get<ApiResponse<PerformanceReport>>(
    `${base(schoolId)}/performance`,
    { params: { examId } },
  );
  return data.data!;
}
