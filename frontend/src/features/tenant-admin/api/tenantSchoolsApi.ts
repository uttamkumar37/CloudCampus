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
  const response = await fetch('/v1/tenant-admin/schools', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('School creation failed.');
  }

  return response.json() as Promise<TenantSchoolResponse>;
}

export async function listTenantSchools(accessToken: string): Promise<TenantSchoolResponse[]> {
  const response = await fetch('/v1/tenant-admin/schools', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School listing failed.');
  }

  return response.json() as Promise<TenantSchoolResponse[]>;
}

export async function updateTenantSchool(
  schoolId: string,
  payload: TenantSchoolUpdateRequest,
  accessToken: string,
): Promise<TenantSchoolResponse> {
  const response = await fetch(`/v1/tenant-admin/schools/${schoolId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('School update failed.');
  }

  return response.json() as Promise<TenantSchoolResponse>;
}

export async function deactivateTenantSchool(
  schoolId: string,
  accessToken: string,
): Promise<TenantSchoolResponse> {
  const response = await fetch(`/v1/tenant-admin/schools/${schoolId}/deactivate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School deactivation failed.');
  }

  return response.json() as Promise<TenantSchoolResponse>;
}

export async function inviteTenantSchoolAdmin(
  schoolId: string,
  payload: TenantSchoolAdminInviteRequest,
  accessToken: string,
): Promise<TenantSchoolAdminInviteResponse> {
  const response = await fetch(`/v1/tenant-admin/schools/${schoolId}/admins/invite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('School Admin invitation failed.');
  }

  return response.json() as Promise<TenantSchoolAdminInviteResponse>;
}

export async function listTenantSchoolAdmins(
  schoolId: string,
  accessToken: string,
): Promise<TenantSchoolAdminSummary[]> {
  const response = await fetch(`/v1/tenant-admin/schools/${schoolId}/admins`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School Admin listing failed.');
  }

  return response.json() as Promise<TenantSchoolAdminSummary[]>;
}

export async function resendTenantSchoolAdminInvitation(
  schoolId: string,
  userId: string,
  accessToken: string,
): Promise<TenantSchoolAdminInviteResponse> {
  const response = await fetch(`/v1/tenant-admin/schools/${schoolId}/admins/${userId}/resend-invitation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School Admin invitation resend failed.');
  }

  return response.json() as Promise<TenantSchoolAdminInviteResponse>;
}

export async function revokeTenantSchoolAdminAccess(
  schoolId: string,
  userId: string,
  accessToken: string,
): Promise<TenantSchoolAdminAccessRevokeResponse> {
  const response = await fetch(`/v1/tenant-admin/schools/${schoolId}/admins/${userId}/access`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School Admin access revoke failed.');
  }

  return response.json() as Promise<TenantSchoolAdminAccessRevokeResponse>;
}
