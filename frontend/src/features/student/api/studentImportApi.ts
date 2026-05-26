export type StudentImportRow = {
  admissionNumber: string;
  fullName: string;
  classLevelId: string;
  sectionId: string;
  rollNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianMobile?: string;
};

export type StudentImportError = {
  rowNumber: number;
  field: string;
  message: string;
};

export type StudentImportValidationResponse = {
  valid: boolean;
  rowCount: number;
  errors: StudentImportError[];
};

export type StudentImportResponse = {
  imported: boolean;
  importedCount: number;
  students: Array<{
    id: string;
    tenantId: string;
    schoolId: string;
    admissionNumber: string;
    fullName: string;
    classLevelId: string;
    sectionId: string;
    active: boolean;
  }>;
  errors: StudentImportError[];
};

export type StudentImportJobResponse = {
  id: string;
  bulkJobId: string;
  tenantId: string;
  schoolId: string;
  status: 'QUEUED' | 'VALIDATING' | 'PROCESSING' | 'PARTIALLY_COMPLETED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  errorFileReference?: string;
  validationErrors: StudentImportError[];
  createdAt: string;
  processedAt?: string;
};

export type StudentLoginInvitationResponse = {
  studentId: string;
  tenantId: string;
  schoolId: string;
  userId: string;
  email: string;
  userStatus: 'INVITED' | 'ACTIVE' | 'DISABLED';
  schoolAccessGranted: boolean;
  invitationCreated: boolean;
  invitationId?: string;
  invitationExpiresAt?: string;
  invitationToken?: string;
  invitationAcceptUrl?: string;
};

export async function validateStudentImport(
  rows: StudentImportRow[],
  accessToken: string,
): Promise<StudentImportValidationResponse> {
  const response = await fetch('/v1/school-admin/students/import/validate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rows }),
  });

  if (!response.ok) {
    throw new Error('Student import validation failed.');
  }

  return response.json() as Promise<StudentImportValidationResponse>;
}

export async function importStudents(
  rows: StudentImportRow[],
  accessToken: string,
): Promise<StudentImportResponse> {
  const response = await fetch('/v1/school-admin/students/import', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rows }),
  });

  if (!response.ok) {
    const body = (await response.json()) as StudentImportResponse;
    return body;
  }

  return response.json() as Promise<StudentImportResponse>;
}

export async function queueStudentImport(
  rows: StudentImportRow[],
  accessToken: string,
): Promise<StudentImportJobResponse> {
  const response = await fetch('/v1/school-admin/students/import/jobs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rows }),
  });

  if (!response.ok) {
    throw new Error('Student import job creation failed.');
  }

  return response.json() as Promise<StudentImportJobResponse>;
}

export async function inviteStudentLogin(
  studentId: string,
  email: string,
  accessToken: string,
): Promise<StudentLoginInvitationResponse> {
  const response = await fetch(`/v1/school-admin/students/${studentId}/login-invitation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Student login invitation failed.');
  }

  return response.json() as Promise<StudentLoginInvitationResponse>;
}
