import { httpClient } from '../../../shared/api/httpClient';

export type SchoolSettings = {
  tenantId: string;
  schoolId: string;
  code: string;
  name: string;
  primarySchool: boolean;
  active: boolean;
  createdAt: string;
};

export type SchoolSettingsUpdate = {
  name: string;
};

export function getSchoolSettings(accessToken: string) {
  return httpClient.get<SchoolSettings>('/v1/school-admin/settings', { accessToken });
}

export function updateSchoolSettings(payload: SchoolSettingsUpdate, accessToken: string) {
  return httpClient.patch<SchoolSettings>('/v1/school-admin/settings', payload, { accessToken });
}
