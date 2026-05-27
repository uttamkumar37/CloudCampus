import { httpClient } from '../../../shared/api/httpClient';

export function listSchoolAdminAttendanceSessions(accessToken?: string | null) {
  return httpClient.get<unknown[]>('/v1/school-admin/attendance/sessions', { accessToken });
}

export function createSchoolAdminAttendanceSession(payload: unknown, accessToken?: string | null) {
  return httpClient.post<unknown>('/v1/school-admin/attendance/sessions', payload, { accessToken });
}
