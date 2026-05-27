import { httpClient } from '../../../shared/api/httpClient';

export function listSchoolAdminExams(accessToken?: string | null) {
  return httpClient.get<unknown[]>('/v1/school-admin/exams', { accessToken });
}

export function createSchoolAdminExam(payload: unknown, accessToken?: string | null) {
  return httpClient.post<unknown>('/v1/school-admin/exams', payload, { accessToken });
}

export function publishSchoolAdminExam(examId: string, accessToken?: string | null) {
  return httpClient.post<unknown>(`/v1/school-admin/exams/${encodeURIComponent(examId)}/publish`, undefined, { accessToken });
}
