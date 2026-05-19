import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface TimelineItemResponse {
  id: string;
  type: string;
  title: string;
  summary: string;
  occurredAt: string;
  visibility: string;
}

export interface ProfileSectionResponse {
  key: string;
  title: string;
  description: string;
  visibility: string;
  editable: boolean;
  completionPercent: number;
  data: Record<string, unknown>;
  timeline: TimelineItemResponse[];
}

export interface StudentProfile360Response {
  studentId: string;
  profileCompletionPercent: number;
  sections: ProfileSectionResponse[];
  timeline: TimelineItemResponse[];
  quickStats: Record<string, unknown>;
  header?: Record<string, unknown>;
  completion?: Record<string, unknown>;
  activityFeed?: Record<string, unknown>;
  aiInsights?: Record<string, unknown>[];
  academicAnalytics?: Record<string, unknown>;
  healthWellbeing?: Record<string, unknown>;
  parentFamily?: Record<string, unknown>;
  riskProfile?: Record<string, unknown>[];
  documentVault?: Record<string, unknown>;
  communicationCenter?: Record<string, unknown>;
}

export async function getStudentProfile360(studentId: string): Promise<StudentProfile360Response> {
  const { data } = await axiosInstance.get<ApiResponse<StudentProfile360Response>>(
    `/v1/school-admin/students/${studentId}/profile-360`,
  );
  return data.data!;
}

export async function updateStudentProfile360Section(
  studentId: string,
  sectionKey: string,
  sectionData: Record<string, unknown>,
): Promise<StudentProfile360Response> {
  const { data } = await axiosInstance.put<ApiResponse<StudentProfile360Response>>(
    `/v1/school-admin/students/${studentId}/profile-360/sections/${sectionKey}`,
    { data: sectionData },
  );
  return data.data!;
}
