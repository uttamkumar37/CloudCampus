export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  sectionId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  remarks: string | null;
  createdAt: string;
}
