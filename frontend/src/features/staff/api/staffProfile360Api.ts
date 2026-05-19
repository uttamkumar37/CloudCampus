import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface StaffTimelineItemResponse {
  id: string;
  type: string;
  title: string;
  summary: string | null;
  occurredAt: string;
  visibility: string;
}

export interface StaffProfileSectionResponse {
  key: string;
  title: string;
  description: string;
  visibility: string;
  editable: boolean;
  completionPercent: number;
  data: Record<string, unknown>;
  timeline: StaffTimelineItemResponse[];
}

export interface StaffInsight {
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO' | string;
  summary: string;
  recommendation: string;
  confidence: number;
  category: string;
}

export interface StaffRisk {
  label: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO' | string;
  explanation: string;
  suggestedHrAction: string;
}

export interface StaffProfile360Response {
  staffId: string;
  profileCompletionPercent: number;
  sections: StaffProfileSectionResponse[];
  timeline: StaffTimelineItemResponse[];
  quickStats: Record<string, unknown>;
  header: Record<string, unknown>;
  completion: Record<string, unknown>;
  activityFeed: Record<string, unknown>;
  aiInsights: StaffInsight[];
  performanceAnalytics: Record<string, unknown>;
  hrEmployment: Record<string, unknown>;
  payrollFinance: Record<string, unknown>;
  skillsDevelopment: Record<string, unknown>;
  attendanceLeave: Record<string, unknown>;
  documentVault: Record<string, unknown>;
  communicationCenter: Record<string, unknown>;
  healthWellbeing: Record<string, unknown>;
  riskProfile: StaffRisk[];
  roleViews: Record<string, unknown>;
}

export async function getStaffProfile360(id: string): Promise<StaffProfile360Response> {
  const { data } = await axiosInstance.get<ApiResponse<StaffProfile360Response>>(
    `/v1/school-admin/staff/${id}/profile-360`,
  );
  return data.data!;
}
