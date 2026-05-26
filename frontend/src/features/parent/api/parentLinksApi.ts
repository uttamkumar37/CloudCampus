export type ParentLinkRequest = {
  studentId: string;
  parentFullName: string;
  parentEmail: string;
  parentMobile?: string;
  relationship: string;
  primaryContact: boolean;
};

export type ParentLinkResponse = {
  linkId: string;
  tenantId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  parentUserId: string;
  parentEmail: string;
  relationship: string;
  primaryContact: boolean;
  invitationCreated: boolean;
  invitationId: string | null;
  invitationExpiresAt: string | null;
  invitationToken: string | null;
  acceptanceUrl: string | null;
};

export async function linkParentToStudent(
  payload: ParentLinkRequest,
  accessToken: string,
): Promise<ParentLinkResponse> {
  const response = await fetch('/v1/school-admin/parent-links', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Parent link failed.');
  }

  return response.json() as Promise<ParentLinkResponse>;
}
