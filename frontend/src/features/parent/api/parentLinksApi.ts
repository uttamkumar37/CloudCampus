import { httpClient } from '../../../shared/api/httpClient';

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
  return httpClient.post<ParentLinkResponse>('/v1/school-admin/parent-links', payload, { accessToken });
}
