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
  const response = await fetch('/v1/tenant-admin/settings', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Tenant settings lookup failed.');
  }

  return response.json() as Promise<TenantSettings>;
}

export async function updateTenantSettings(
  payload: TenantSettingsRequest,
  accessToken: string,
): Promise<TenantSettings> {
  const response = await fetch('/v1/tenant-admin/settings', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Tenant settings update failed.');
  }

  return response.json() as Promise<TenantSettings>;
}

export async function getTenantUsage(accessToken: string): Promise<TenantUsage> {
  const response = await fetch('/v1/tenant-admin/subscription/usage', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Tenant usage lookup failed.');
  }

  return response.json() as Promise<TenantUsage>;
}
