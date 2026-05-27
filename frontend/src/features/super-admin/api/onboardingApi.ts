import { httpClient } from '../../../shared/api/httpClient';

export type TenantOnboardingRequest = {
  tenant: {
    code: string;
    name: string;
  };
  firstSchool: {
    code: string;
    name: string;
  };
  primaryAdmin: {
    fullName: string;
    email: string;
  };
};

export type TenantOnboardingResponse = {
  tenant: {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'SUSPENDED';
  };
  school: {
    id: string;
    code: string;
    name: string;
    primarySchool: boolean;
  };
  schoolAdminInvitation: {
    invitationId: string;
    userId: string;
    email: string;
    role: 'SCHOOL_ADMIN';
    expiresAt: string;
    token: string;
    acceptanceUrl: string;
  };
  schoolAccess: {
    userId: string;
    schoolId: string;
    role: 'SCHOOL_ADMIN';
    primaryAccess: boolean;
  };
};

export async function onboardTenant(
  payload: TenantOnboardingRequest,
  accessToken: string,
): Promise<TenantOnboardingResponse> {
  return httpClient.post<TenantOnboardingResponse>('/v1/super-admin/tenants/onboard', payload, { accessToken });
}
