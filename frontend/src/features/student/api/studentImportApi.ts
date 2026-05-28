import { httpClient } from '../../../shared/api/httpClient';

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
  students: StudentSummary[];
  errors: StudentImportError[];
};

export type StudentSummary = {
  id: string;
  tenantId: string;
  schoolId: string;
  admissionNumber: string;
  fullName: string;
  classLevelId: string;
  sectionId: string;
  rollNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  guardianName?: string | null;
  guardianEmail?: string | null;
  guardianMobile?: string | null;
  active: boolean;
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
  return httpClient.post<StudentImportValidationResponse>('/v1/school-admin/students/import/validate', { rows }, { accessToken });
}

export async function importStudents(
  rows: StudentImportRow[],
  accessToken: string,
): Promise<StudentImportResponse> {
  return httpClient.post<StudentImportResponse>('/v1/school-admin/students/import', { rows }, { accessToken });
}

export async function queueStudentImport(
  rows: StudentImportRow[],
  accessToken: string,
): Promise<StudentImportJobResponse> {
  return httpClient.post<StudentImportJobResponse>('/v1/school-admin/students/import/jobs', { rows }, { accessToken });
}

export async function listStudents(accessToken: string): Promise<StudentSummary[]> {
  return httpClient.get<StudentSummary[]>('/v1/school-admin/students', { accessToken });
}

export async function inviteStudentLogin(
  studentId: string,
  email: string,
  accessToken: string,
): Promise<StudentLoginInvitationResponse> {
  return httpClient.post<StudentLoginInvitationResponse>(
    `/v1/school-admin/students/${studentId}/login-invitation`,
    { email },
    { accessToken },
  );
}
