import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface ChildSummary {
  studentId:     string;
  firstName:     string;
  lastName:      string;
  studentNumber: string;
  relationship:  string;
  totalSessions: number;
  presentCount:  number;
  attendancePct: number;
}

export interface AttendanceSummary {
  studentId:     string;
  firstName:     string;
  lastName:      string;
  totalSessions: number;
  present:       number;
  absent:        number;
  late:          number;
  attendancePct: number;
}

export interface ChildResult {
  id:                  string;
  examId:              string;
  percentage:          number;
  grade:               string;
  rank:                number | null;
  passed:              boolean;
  totalMarksObtained:  number;
  totalMarksPossible:  number;
  generatedAt:         string;
}

export async function getChildren(): Promise<ChildSummary[]> {
  const { data } = await axiosInstance.get<ApiResponse<ChildSummary[]>>('/v1/parent/children');
  return data.data ?? [];
}

export async function getChildAttendance(studentId: string): Promise<AttendanceSummary> {
  const { data } = await axiosInstance.get<ApiResponse<AttendanceSummary>>(
    `/v1/parent/children/${studentId}/attendance`,
  );
  return data.data!;
}

export async function getChildResults(studentId: string): Promise<ChildResult[]> {
  const { data } = await axiosInstance.get<ApiResponse<ChildResult[]>>(
    `/v1/parent/children/${studentId}/results`,
  );
  return data.data ?? [];
}
