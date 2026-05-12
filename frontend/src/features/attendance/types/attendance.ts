// ── Enums ─────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

// ── Request shapes ────────────────────────────────────────────────────────────

export interface CreateSessionRequest {
  classId: string;
  sectionId?: string;
  academicYearId: string;
  subjectId?: string;
  takenByStaffId?: string;
  /** ISO date string YYYY-MM-DD */
  sessionDate: string;
  /** 0 = whole-day, 1-12 = period number */
  periodNumber: number;
}

export interface AttendanceRecordEntry {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface MarkAttendanceRequest {
  records: AttendanceRecordEntry[];
  /** true = lock session after saving */
  lockSession: boolean;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface AttendanceRecordResponse {
  id: string;
  studentId: string;
  status: AttendanceStatus;
  remarks: string | null;
  updatedAt: string;
}

export interface AttendanceSessionSummaryResponse {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string | null;
  academicYearId: string;
  subjectId: string | null;
  takenByStaffId: string | null;
  /** YYYY-MM-DD */
  sessionDate: string;
  periodNumber: number;
  finalized: boolean;
  createdAt: string;
}

export interface AttendanceSessionResponse extends AttendanceSessionSummaryResponse {
  updatedAt: string;
  records: AttendanceRecordResponse[];
}

export interface StudentAttendanceReport {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}
