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
  const response = await fetch('/v1/invitations/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Invitation acceptance failed.');
  }

  return response.json() as Promise<AcceptInvitationResponse>;
}
