import { httpClient } from '../../../shared/api/httpClient';

export type ParentLeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ParentLeaveRequestCreatePayload = {
  startDate: string;
  endDate: string;
  reason: string;
};

export type ParentLeaveDecisionPayload = {
  status: Exclude<ParentLeaveRequestStatus, 'PENDING'>;
  adminNote?: string;
};

export type ParentLeaveRequestResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  parentUserId: string;
  parentEmail: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: ParentLeaveRequestStatus;
  adminNote: string | null;
  decidedByUserId: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export async function createParentLeaveRequest(
  studentId: string,
  payload: ParentLeaveRequestCreatePayload,
  accessToken: string,
): Promise<ParentLeaveRequestResponse> {
  return httpClient.post<ParentLeaveRequestResponse>(
    `/v1/parent/children/${encodeURIComponent(studentId)}/leave-requests`,
    payload,
    { accessToken },
  );
}

export async function listParentLeaveRequests(
  studentId: string,
  accessToken: string,
): Promise<ParentLeaveRequestResponse[]> {
  return httpClient.get<ParentLeaveRequestResponse[]>(
    `/v1/parent/children/${encodeURIComponent(studentId)}/leave-requests`,
    { accessToken },
  );
}

export async function listSchoolParentLeaveRequests(
  accessToken: string,
): Promise<ParentLeaveRequestResponse[]> {
  return httpClient.get<ParentLeaveRequestResponse[]>('/v1/school-admin/parent-leave-requests', { accessToken });
}

export async function decideSchoolParentLeaveRequest(
  leaveRequestId: string,
  payload: ParentLeaveDecisionPayload,
  accessToken: string,
): Promise<ParentLeaveRequestResponse> {
  return httpClient.patch<ParentLeaveRequestResponse>(
    `/v1/school-admin/parent-leave-requests/${encodeURIComponent(leaveRequestId)}`,
    payload,
    { accessToken },
  );
}
