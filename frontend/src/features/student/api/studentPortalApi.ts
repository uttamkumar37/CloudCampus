import { httpClient } from '../../../shared/api/httpClient';
import { getDashboardSummary, type DashboardSummary } from '../../portal/api/dashboardApi';

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

export type StudentProfile = {
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
  active: boolean;
};

export type StudentHomeworkSubmission = {
  id: string;
  studentId: string;
  studentName: string;
  submittedByUserId: string;
  content: string;
  submittedAt: string;
};

export type StudentHomework = {
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
  instructions: string;
  dueDate: string;
  status: string;
  createdByUserId: string;
  createdByRole: string;
  createdAt: string;
  publishedAt: string | null;
  submissions: StudentHomeworkSubmission[];
};

export type StudentHomeworkSubmissionRequest = {
  content: string;
};

export type StudentResultRow = {
  id: string;
  studentId: string;
  studentName: string;
  recordedByUserId: string;
  marksObtained: number;
  recordedAt: string;
};

export type StudentExamResult = {
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
  results: StudentResultRow[];
};

export type StudentFeePayment = {
  id: string;
  tenantId: string;
  schoolId: string;
  demandId: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string | null;
  receiptNumber: string;
  paidAt: string;
};

export type StudentFeeDemand = {
  id: string;
  tenantId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  description: string;
  amountDue: number;
  amountPaid: number;
  outstandingAmount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  payments: StudentFeePayment[];
};

export type StudentNotice = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string | null;
  className: string | null;
  sectionId: string | null;
  sectionName: string | null;
  title: string;
  body: string;
  audience: string;
  status: string;
  createdByUserId: string;
  publishedByUserId: string | null;
  createdAt: string;
  publishedAt: string | null;
};

export type StudentAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type StudentAttendanceRecord = {
  id: string;
  tenantId: string;
  schoolId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classLevelId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  subjectId: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  attendanceDate: string;
  status: StudentAttendanceStatus;
  remark: string | null;
  recordedAt: string;
};

export type StudentTimetableEntry = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string;
  classLevelName: string;
  sectionId: string | null;
  sectionName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  weekday: string;
  startTime: string;
  endTime: string;
  title: string;
  createdAt: string;
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

export function getStudentDashboardSummary(accessToken?: string | null): Promise<DashboardSummary> {
  return getDashboardSummary('STUDENT', accessToken);
}

export function getStudentProfile(accessToken?: string | null) {
  return httpClient.get<StudentProfile>('/v1/student/profile', { accessToken });
}

export function listStudentHomework(accessToken?: string | null) {
  return httpClient.get<StudentHomework[]>('/v1/student/homework', { accessToken });
}

export function submitStudentHomework(homeworkId: string, payload: StudentHomeworkSubmissionRequest, accessToken?: string | null) {
  return httpClient.post<StudentHomework>(`/v1/student/homework/${encodeURIComponent(homeworkId)}/submissions`, payload, { accessToken });
}

export function listStudentResults(accessToken?: string | null) {
  return httpClient.get<StudentExamResult[]>('/v1/student/results', { accessToken });
}

export function listStudentFees(accessToken?: string | null) {
  return httpClient.get<StudentFeeDemand[]>('/v1/student/fees', { accessToken });
}

export function listStudentNotices(accessToken?: string | null) {
  return httpClient.get<StudentNotice[]>('/v1/student/notices', { accessToken });
}

export function listStudentAttendance(accessToken?: string | null) {
  return httpClient.get<StudentAttendanceRecord[]>('/v1/student/attendance', { accessToken });
}

export function listStudentTimetable(accessToken?: string | null) {
  return httpClient.get<StudentTimetableEntry[]>('/v1/student/timetable', { accessToken });
}

export function listStudentAiRecommendations(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiRecommendation>>(`/v1/ai/recommendations${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getStudentAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.get<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}`, { accessToken });
}

export function acceptStudentAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/accept`, undefined, { accessToken });
}

export function dismissStudentAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/dismiss`, undefined, { accessToken });
}

export function rejectStudentAiRecommendation(recommendationId: string, reason: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/reject`, { reason }, { accessToken });
}

export function executeStudentAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/execute`, undefined, { accessToken });
}

export function getStudentAiEntitlement(accessToken?: string | null) {
  return httpClient.get<AiEntitlement>('/v1/ai/entitlement', { accessToken });
}

function queryString(params: PageQuery) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value));
    }
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}
