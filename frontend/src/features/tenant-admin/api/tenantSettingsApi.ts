import { httpClient } from '../../../shared/api/httpClient';

export type TenantSettings = {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  billingEmail: string | null;
  supportEmail: string | null;
  timezone: string;
  locale: string;
  updatedAt: string | null;
};

export type TenantSettingsRequest = {
  displayName: string;
  billingEmail: string;
  supportEmail: string;
  timezone: string;
  locale: string;
};

export type TenantUsage = {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantStatus: string;
  planCode: string;
  maxSchools: number;
  schoolsUsed: number;
  activeSchools: number;
  remainingSchools: number;
  schoolAdmins: number;
  teachers: number;
  staff: number;
  students: number;
  schoolLimitReached: boolean;
};

export async function getTenantSettings(accessToken: string): Promise<TenantSettings> {
  return httpClient.get<TenantSettings>('/v1/tenant-admin/settings', { accessToken });
}

export async function updateTenantSettings(
  payload: TenantSettingsRequest,
  accessToken: string,
): Promise<TenantSettings> {
  return httpClient.patch<TenantSettings>('/v1/tenant-admin/settings', payload, { accessToken });
}

export async function getTenantUsage(accessToken: string): Promise<TenantUsage> {
  return httpClient.get<TenantUsage>('/v1/tenant-admin/subscription/usage', { accessToken });
}
