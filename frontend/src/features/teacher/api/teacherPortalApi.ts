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

export type TeacherAssignment = {
  id: string;
  tenantId?: string;
  schoolId?: string;
  teacherUserId?: string;
  teacherName?: string;
  classSubjectAssignmentId?: string;
  classLevelId: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  active: boolean;
};

export type TeacherAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type TeacherAttendanceRecord = {
  id: string;
  studentId: string;
  admissionNumber: string;
  studentName: string;
  status: TeacherAttendanceStatus;
  remark: string | null;
};

export type TeacherAttendanceSession = {
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
  records: TeacherAttendanceRecord[];
};

export type TeacherAttendanceSessionRequest = {
  classLevelId: string;
  sectionId?: string | null;
  subjectId: string;
  attendanceDate: string;
  records: Array<{
    studentId: string;
    status: TeacherAttendanceStatus;
    remark?: string | null;
  }>;
};

export type TeacherHomework = {
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
  submissions: TeacherHomeworkSubmission[];
};

export type TeacherHomeworkSubmission = {
  id: string;
  studentId: string;
  studentName: string;
  submittedByUserId: string;
  submittedAt: string;
  content: string;
};

export type TeacherHomeworkRequest = {
  classLevelId: string;
  sectionId?: string | null;
  subjectId: string;
  title: string;
  instructions: string;
  dueDate: string;
};

export type TeacherExamResult = {
  id: string;
  studentId: string;
  studentName: string;
  recordedByUserId: string;
  marksObtained: number;
  recordedAt: string;
};

export type TeacherExam = {
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
  results: TeacherExamResult[];
};

export type TeacherExamRosterStudent = {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  classLevelId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  rollNumber: string | null;
  resultId: string | null;
  marksObtained: number | null;
  recordedAt: string | null;
};

export type TeacherNotice = {
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

export type TeacherTimetableEntry = {
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

export function getTeacherDashboardSummary(accessToken?: string | null): Promise<DashboardSummary> {
  return getDashboardSummary('TEACHER', accessToken);
}

export function listTeacherAssignments(accessToken?: string | null) {
  return httpClient.get<TeacherAssignment[]>('/v1/teacher/assignments', { accessToken });
}

export function listTeacherAttendance(classLevelId: string, subjectId: string, accessToken?: string | null) {
  return httpClient.get<TeacherAttendanceSession[]>(
    `/v1/teacher/attendance/sessions?classLevelId=${encodeURIComponent(classLevelId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { accessToken },
  );
}

export function getTeacherAttendanceSession(sessionId: string, accessToken?: string | null) {
  return httpClient.get<TeacherAttendanceSession>(`/v1/teacher/attendance/sessions/${encodeURIComponent(sessionId)}`, { accessToken });
}

export function createTeacherAttendanceSession(payload: TeacherAttendanceSessionRequest, accessToken?: string | null) {
  return httpClient.post<TeacherAttendanceSession>('/v1/teacher/attendance/sessions', payload, { accessToken });
}

export function listTeacherHomework(classLevelId: string, subjectId: string, accessToken?: string | null) {
  return httpClient.get<TeacherHomework[]>(
    `/v1/teacher/homework?classLevelId=${encodeURIComponent(classLevelId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { accessToken },
  );
}

export function getTeacherHomework(homeworkId: string, accessToken?: string | null) {
  return httpClient.get<TeacherHomework>(`/v1/teacher/homework/${encodeURIComponent(homeworkId)}`, { accessToken });
}

export function createTeacherHomework(payload: TeacherHomeworkRequest, accessToken?: string | null) {
  return httpClient.post<TeacherHomework>('/v1/teacher/homework', payload, { accessToken });
}

export function listTeacherExams(classLevelId: string, subjectId: string, accessToken?: string | null) {
  return httpClient.get<TeacherExam[]>(
    `/v1/teacher/exams?classLevelId=${encodeURIComponent(classLevelId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { accessToken },
  );
}

export function getTeacherExam(examId: string, accessToken?: string | null) {
  return httpClient.get<TeacherExam>(`/v1/teacher/exams/${encodeURIComponent(examId)}`, { accessToken });
}

export function listTeacherExamRoster(examId: string, accessToken?: string | null) {
  return httpClient.get<TeacherExamRosterStudent[]>(
    `/v1/teacher/exams/${encodeURIComponent(examId)}/roster`,
    { accessToken },
  );
}

export function recordTeacherExamMarks(
  examId: string,
  studentId: string,
  marksObtained: number,
  accessToken?: string | null,
) {
  return httpClient.post<TeacherExam>(
    `/v1/teacher/exams/${encodeURIComponent(examId)}/results`,
    { studentId, marksObtained },
    { accessToken },
  );
}

export function listTeacherNotices(accessToken?: string | null) {
  return httpClient.get<TeacherNotice[]>('/v1/teacher/notices', { accessToken });
}

export function listTeacherTimetable(accessToken?: string | null) {
  return httpClient.get<TeacherTimetableEntry[]>('/v1/teacher/timetable', { accessToken });
}

export function listTeacherAiRecommendations(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiRecommendation>>(`/v1/ai/recommendations${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getTeacherAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.get<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}`, { accessToken });
}

export function acceptTeacherAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/accept`, undefined, { accessToken });
}

export function rejectTeacherAiRecommendation(recommendationId: string, reason: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/reject`, { reason }, { accessToken });
}

export function dismissTeacherAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/dismiss`, undefined, { accessToken });
}

export function executeTeacherAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(`/v1/ai/recommendations/${encodeURIComponent(recommendationId)}/execute`, undefined, { accessToken });
}

export function getTeacherAiEntitlement(accessToken?: string | null) {
  return httpClient.get<AiEntitlement>('/v1/ai/entitlement', { accessToken });
}

function queryString(params: PageQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : '';
}
