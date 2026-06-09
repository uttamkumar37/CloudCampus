import { httpClient } from '../../../shared/api/httpClient';

export type TenantSchoolRequest = {
  code: string;
  name: string;
};

export type TenantSchoolResponse = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  primarySchool: boolean;
  active: boolean;
  maxSchools: number;
  schoolsUsed: number;
};

export type TenantSchoolUpdateRequest = {
  name: string;
};

export type TenantSchoolAdminInviteRequest = {
  fullName: string;
  email: string;
};

export type TenantSchoolAdminInviteResponse = {
  tenantId: string;
  schoolId: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'SCHOOL_ADMIN';
  userStatus: 'INVITED' | 'ACTIVE' | 'DISABLED';
  schoolAccessGranted: boolean;
  invitationCreated: boolean;
  invitationId: string | null;
  invitationExpiresAt: string | null;
  invitationToken: string | null;
  invitationAcceptUrl: string | null;
};

export type TenantSchoolAdminSummary = {
  tenantId: string;
  schoolId: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'SCHOOL_ADMIN';
  userStatus: 'INVITED' | 'ACTIVE' | 'DISABLED';
  accessGrantId: string;
  primaryAccess: boolean;
  latestInvitationId: string | null;
  latestInvitationStatus: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | null;
  latestInvitationExpiresAt: string | null;
};

export type TenantSchoolAdminAccessRevokeResponse = {
  tenantId: string;
  schoolId: string;
  userId: string;
  accessRevoked: boolean;
  remainingSchoolAdmins: number;
};

export async function createTenantSchool(
  payload: TenantSchoolRequest,
  accessToken: string,
): Promise<TenantSchoolResponse> {
  return httpClient.post<TenantSchoolResponse>('/v1/tenant-admin/schools', payload, { accessToken });
}

export async function listTenantSchools(accessToken: string): Promise<TenantSchoolResponse[]> {
  return httpClient.get<TenantSchoolResponse[]>('/v1/tenant-admin/schools', { accessToken });
}

export async function updateTenantSchool(
  schoolId: string,
  payload: TenantSchoolUpdateRequest,
  accessToken: string,
): Promise<TenantSchoolResponse> {
  return httpClient.patch<TenantSchoolResponse>(`/v1/tenant-admin/schools/${encodeURIComponent(schoolId)}`, payload, { accessToken });
}

export async function deactivateTenantSchool(
  schoolId: string,
  accessToken: string,
): Promise<TenantSchoolResponse> {
  return httpClient.post<TenantSchoolResponse>(`/v1/tenant-admin/schools/${encodeURIComponent(schoolId)}/deactivate`, undefined, { accessToken });
}

export async function inviteTenantSchoolAdmin(
  schoolId: string,
  payload: TenantSchoolAdminInviteRequest,
  accessToken: string,
): Promise<TenantSchoolAdminInviteResponse> {
  return httpClient.post<TenantSchoolAdminInviteResponse>(`/v1/tenant-admin/schools/${encodeURIComponent(schoolId)}/admins/invite`, payload, { accessToken });
}

export async function listTenantSchoolAdmins(
  schoolId: string,
  accessToken: string,
): Promise<TenantSchoolAdminSummary[]> {
  return httpClient.get<TenantSchoolAdminSummary[]>(`/v1/tenant-admin/schools/${encodeURIComponent(schoolId)}/admins`, { accessToken });
}

export async function resendTenantSchoolAdminInvitation(
  schoolId: string,
  userId: string,
  accessToken: string,
): Promise<TenantSchoolAdminInviteResponse> {
  return httpClient.post<TenantSchoolAdminInviteResponse>(
    `/v1/tenant-admin/schools/${encodeURIComponent(schoolId)}/admins/${encodeURIComponent(userId)}/resend-invitation`,
    undefined,
    { accessToken },
  );
}

export async function revokeTenantSchoolAdminAccess(
  schoolId: string,
  userId: string,
  accessToken: string,
): Promise<TenantSchoolAdminAccessRevokeResponse> {
  return httpClient.delete<TenantSchoolAdminAccessRevokeResponse>(
    `/v1/tenant-admin/schools/${encodeURIComponent(schoolId)}/admins/${encodeURIComponent(userId)}/access`,
    { accessToken },
  );
}
