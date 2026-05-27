import { httpClient } from '../../../shared/api/httpClient';

export function listSchoolAdminNotices(accessToken?: string | null) {
  return httpClient.get<unknown[]>('/v1/school-admin/notices', { accessToken });
}

export function createSchoolAdminNotice(payload: unknown, accessToken?: string | null) {
  return httpClient.post<unknown>('/v1/school-admin/notices', payload, { accessToken });
}

export function publishSchoolAdminNotice(noticeId: string, accessToken?: string | null) {
  return httpClient.post<unknown>(`/v1/school-admin/notices/${encodeURIComponent(noticeId)}/publish`, undefined, { accessToken });
}
