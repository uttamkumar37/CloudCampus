import { httpClient } from '../../../shared/api/httpClient';

export function listSchoolAdminHomework(accessToken?: string | null) {
  return httpClient.get<unknown[]>('/v1/school-admin/homework', { accessToken });
}

export function createSchoolAdminHomework(payload: unknown, accessToken?: string | null) {
  return httpClient.post<unknown>('/v1/school-admin/homework', payload, { accessToken });
}
