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
  const response = await fetch(`/v1/parent/children/${encodeURIComponent(studentId)}/leave-requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Leave request failed.');
  }

  return response.json() as Promise<ParentLeaveRequestResponse>;
}

export async function listParentLeaveRequests(
  studentId: string,
  accessToken: string,
): Promise<ParentLeaveRequestResponse[]> {
  const response = await fetch(`/v1/parent/children/${encodeURIComponent(studentId)}/leave-requests`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Leave request lookup failed.');
  }

  return response.json() as Promise<ParentLeaveRequestResponse[]>;
}

export async function listSchoolParentLeaveRequests(
  accessToken: string,
): Promise<ParentLeaveRequestResponse[]> {
  const response = await fetch('/v1/school-admin/parent-leave-requests', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('School leave request lookup failed.');
  }

  return response.json() as Promise<ParentLeaveRequestResponse[]>;
}

export async function decideSchoolParentLeaveRequest(
  leaveRequestId: string,
  payload: ParentLeaveDecisionPayload,
  accessToken: string,
): Promise<ParentLeaveRequestResponse> {
  const response = await fetch(`/v1/school-admin/parent-leave-requests/${encodeURIComponent(leaveRequestId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Leave request decision failed.');
  }

  return response.json() as Promise<ParentLeaveRequestResponse>;
}
