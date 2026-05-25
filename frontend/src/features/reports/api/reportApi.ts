import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/reports`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AttendanceReportRow {
  studentId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
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
  studentNumber: string;
  firstName: string;
  lastName: string;
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

export type ReportExportJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ReportExportJob {
  jobId: string;
  type: 'ATTENDANCE' | 'FEES' | 'PERFORMANCE';
  status: ReportExportJobStatus;
  filename: string | null;
  contentType: string | null;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  downloadUrl: string | null;
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

// ── CSV exports ───────────────────────────────────────────────────────────────

export async function exportAttendanceCsv(schoolId: string, academicYearId: string): Promise<Blob> {
  return runReportExportJob(
    () => createAttendanceExportJob(schoolId, academicYearId),
    schoolId,
  );
}

export async function exportFeesCsv(schoolId: string, academicYearId: string): Promise<Blob> {
  return runReportExportJob(
    () => createFeesExportJob(schoolId, academicYearId),
    schoolId,
  );
}

export async function exportPerformanceCsv(schoolId: string, examId: string): Promise<Blob> {
  return runReportExportJob(
    () => createPerformanceExportJob(schoolId, examId),
    schoolId,
  );
}

export async function createAttendanceExportJob(
  schoolId: string,
  academicYearId: string,
): Promise<ReportExportJob> {
  const { data } = await axiosInstance.post<ApiResponse<ReportExportJob>>(
    `${base(schoolId)}/attendance/export-jobs`,
    null,
    { params: { academicYearId } },
  );
  return data.data!;
}

export async function createFeesExportJob(
  schoolId: string,
  academicYearId: string,
): Promise<ReportExportJob> {
  const { data } = await axiosInstance.post<ApiResponse<ReportExportJob>>(
    `${base(schoolId)}/fees/export-jobs`,
    null,
    { params: { academicYearId } },
  );
  return data.data!;
}

export async function createPerformanceExportJob(
  schoolId: string,
  examId: string,
): Promise<ReportExportJob> {
  const { data } = await axiosInstance.post<ApiResponse<ReportExportJob>>(
    `${base(schoolId)}/performance/export-jobs`,
    null,
    { params: { examId } },
  );
  return data.data!;
}

export async function getReportExportJob(
  schoolId: string,
  jobId: string,
): Promise<ReportExportJob> {
  const { data } = await axiosInstance.get<ApiResponse<ReportExportJob>>(
    `${base(schoolId)}/jobs/${jobId}`,
  );
  return data.data!;
}

export async function downloadReportExportJob(
  schoolId: string,
  jobId: string,
): Promise<Blob> {
  const { data } = await axiosInstance.get<Blob>(
    `${base(schoolId)}/jobs/${jobId}/download`,
    { responseType: 'blob' },
  );
  return data;
}

async function runReportExportJob(
  createJob: () => Promise<ReportExportJob>,
  schoolId: string,
): Promise<Blob> {
  let job = await createJob();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (job.status === 'COMPLETED') {
      return downloadReportExportJob(schoolId, job.jobId);
    }
    if (job.status === 'FAILED') {
      throw new Error(job.errorMessage ?? 'Report export failed');
    }
    await delay(1000);
    job = await getReportExportJob(schoolId, job.jobId);
  }
  throw new Error('Report export is still running. Try again in a moment.');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
