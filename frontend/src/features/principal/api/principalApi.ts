import { httpClient } from '../../../shared/api/httpClient';
import { getDashboardSummary } from '../../portal/api/dashboardApi';
import type { ReportExportRequest, ReportExportResponse } from '../../reports/api/reportExportsApi';

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type PageQuery = {
  page?: number;
  search?: string;
  size?: number;
  status?: string;
};

export type PrincipalTeacher = {
  id: string;
  tenantId: string;
  schoolId: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  userStatus: string;
  employeeNumber: string | null;
  department: string | null;
  designation: string | null;
  portalLoginRequired: boolean;
  active: boolean;
  createdAt: string;
};

export type PrincipalStudent = {
  id: string;
  tenantId: string;
  schoolId: string;
  admissionNumber: string;
  fullName: string;
  classLevelId: string | null;
  sectionId: string | null;
  rollNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianMobile: string | null;
  active: boolean;
};

export type PrincipalAttendanceRecord = {
  id: string;
  studentId: string;
  admissionNumber: string;
  studentName: string;
  status: string;
  remark: string | null;
};

export type PrincipalAttendanceSession = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string;
  classLevelName: string;
  sectionId: string | null;
  sectionName: string | null;
  subjectId: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  submittedByUserId: string;
  submittedByRole: string;
  attendanceDate: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  createdAt: string;
  records: PrincipalAttendanceRecord[];
};

export type PrincipalExamResult = {
  id: string;
  studentId: string;
  studentName: string;
  recordedByUserId: string;
  marksObtained: number;
  recordedAt: string;
};

export type PrincipalExam = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  subjectId: string;
  subjectCode: string | null;
  subjectName: string;
  title: string;
  examDate: string;
  maxMarks: number;
  status: string;
  createdByUserId: string;
  publishedByUserId: string | null;
  createdAt: string;
  publishedAt: string | null;
  results: PrincipalExamResult[];
};

export type AiRecommendation = {
  recommendationId: string;
  tenantId: string;
  schoolId: string | null;
  targetType: string;
  targetId: string | null;
  recommendationType: string;
  title: string;
  summary: string;
  rationale: string;
  confidenceScore: number;
  riskLevel: string;
  status: string;
  approvalRequired: boolean;
  metadataJson: string;
  createdAt: string;
};

export type AiAutomationRule = {
  ruleId: string;
  code: string;
  name: string;
  description: string;
  triggerType: string;
  actionType: string;
  enabled: boolean;
  requiresApproval: boolean;
  approvalRole: string | null;
  riskLevel: string;
};

export type AiAutomationRun = {
  runId: string;
  ruleId: string;
  status: string;
  triggeredByActorType: string;
  inputSummaryJson: string;
  outputSummaryJson: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type AiEntitlement = {
  tenantId: string;
  enabled: boolean;
  monthlyUnitBudget: number;
  unitsUsedThisMonth: number;
  unitsRemainingThisMonth: number;
  enabledFeatures: string[];
  humanApprovalRequired: boolean;
  retentionDays: number;
  updatedByUserId: string | null;
  updatedAt: string | null;
};

export function getPrincipalDashboardSummary(accessToken?: string | null) {
  return getDashboardSummary('PRINCIPAL', accessToken);
}

export function listPrincipalTeachers(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<PrincipalTeacher>>(`/v1/school-admin/teachers${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function listPrincipalStudents(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<PrincipalStudent>>(`/v1/school-admin/students${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function listPrincipalAttendanceSessions(accessToken?: string | null) {
  return httpClient.get<PrincipalAttendanceSession[]>('/v1/school-admin/attendance/sessions', { accessToken });
}

export function getPrincipalAttendanceSession(sessionId: string, accessToken?: string | null) {
  return httpClient.get<PrincipalAttendanceSession>(`/v1/school-admin/attendance/sessions/${encodeURIComponent(sessionId)}`, { accessToken });
}

export function listPrincipalExams(accessToken?: string | null) {
  return httpClient.get<PrincipalExam[]>('/v1/school-admin/exams', { accessToken });
}

export function getPrincipalExam(examId: string, accessToken?: string | null) {
  return httpClient.get<PrincipalExam>(`/v1/school-admin/exams/${encodeURIComponent(examId)}`, { accessToken });
}

export function publishPrincipalExam(examId: string, accessToken?: string | null) {
  return httpClient.post<PrincipalExam>(`/v1/school-admin/exams/${encodeURIComponent(examId)}/publish`, undefined, { accessToken });
}

export function listPrincipalAiRecommendations(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiRecommendation>>(`/v1/ai/recommendations${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getPrincipalAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.get<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}`, { accessToken });
}

export function approvePrincipalAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/approve`, undefined, { accessToken });
}

export function rejectPrincipalAiRecommendation(recommendationId: string, reason: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/reject`, { reason }, { accessToken });
}

export function dismissPrincipalAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/dismiss`, undefined, { accessToken });
}

export function executePrincipalAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/execute`, undefined, { accessToken });
}

export function listPrincipalAutomationRules(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiAutomationRule>>(`/v1/ai/automation-rules${queryString({ page: 0, size: 10, ...params })}`, { accessToken });
}

export function listPrincipalAutomationRuns(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiAutomationRun>>(`/v1/ai/automation-runs${queryString({ page: 0, size: 10, ...params })}`, { accessToken });
}

export function getPrincipalAiEntitlement(accessToken?: string | null) {
  return httpClient.get<AiEntitlement>('/v1/ai/entitlement', { accessToken });
}

export function listPrincipalReportExports(accessToken?: string | null) {
  return httpClient.get<ReportExportResponse[]>('/v1/school-admin/reports/exports', { accessToken });
}

export function getPrincipalReportExport(exportId: string, accessToken?: string | null) {
  return httpClient.get<ReportExportResponse>(`/v1/school-admin/reports/exports/${encodeURIComponent(exportId)}`, { accessToken });
}

export function requestPrincipalReportExport(request: ReportExportRequest, accessToken?: string | null) {
  return httpClient.post<ReportExportResponse>('/v1/school-admin/reports/exports', request, { accessToken });
}

export function downloadPrincipalReportExport(exportId: string, accessToken?: string | null) {
  return httpClient.get<string>(`/v1/school-admin/reports/exports/${encodeURIComponent(exportId)}/download`, { accessToken });
}

function queryString(params: PageQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : '';
}
