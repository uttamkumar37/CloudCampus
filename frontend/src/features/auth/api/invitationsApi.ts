import { httpClient } from '../../../shared/api/httpClient';

export type AcceptInvitationRequest = {
  token: string;
  password: string;
  displayName?: string;
};

export type AcceptInvitationResponse = {
  userId: string;
  tenantId: string;
  schoolId: string;
  role: 'SCHOOL_ADMIN' | 'TENANT_ADMIN' | 'TEACHER' | 'FINANCE_STAFF' | 'STAFF' | 'PARENT' | 'STUDENT';
  status: 'ACTIVE';
  schoolAccessGranted: boolean;
};

export async function acceptInvitation(
  payload: AcceptInvitationRequest,
): Promise<AcceptInvitationResponse> {
  return httpClient.post<AcceptInvitationResponse>('/v1/invitations/accept', payload, { accessToken: null, retryOnUnauthorized: false });
}
