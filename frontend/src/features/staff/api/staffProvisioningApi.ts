export type StaffProvisioningRole = 'TEACHER' | 'STAFF';

export type StaffProvisioningRequest = {
  fullName: string;
  email: string;
  role: StaffProvisioningRole;
  employeeNumber?: string;
  department?: string;
  designation?: string;
  portalLoginRequired: boolean;
};

export type StaffProvisioningResponse = {
  staffProfileId: string;
  tenantId: string;
  schoolId: string;
  userId: string;
  email: string;
  fullName: string;
  role: StaffProvisioningRole;
  userStatus: 'INVITED' | 'ACTIVE' | 'DISABLED';
  employeeNumber?: string | null;
  department?: string | null;
  designation?: string | null;
  portalLoginRequired: boolean;
  schoolAccessGranted: boolean;
  invitationCreated: boolean;
  invitationId?: string | null;
  invitationExpiresAt?: string | null;
  invitationToken?: string | null;
  invitationAcceptUrl?: string | null;
};

export async function provisionStaff(
  payload: StaffProvisioningRequest,
  accessToken: string,
): Promise<StaffProvisioningResponse> {
  const response = await fetch('/v1/school-admin/staff/provision', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Staff provisioning failed.');
  }

  return response.json() as Promise<StaffProvisioningResponse>;
}
