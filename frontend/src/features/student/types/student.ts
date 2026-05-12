// ── Enums ─────────────────────────────────────────────────────────────────────

export type StudentStatus =
  | 'ACTIVE'
  | 'GRADUATED'
  | 'TRANSFERRED'
  | 'SUSPENDED'
  | 'WITHDRAWN';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// ── API response shapes ───────────────────────────────────────────────────────

export interface StudentSummaryResponse {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  status: StudentStatus;
  classId: string | null;
  sectionId: string | null;
  photoUrl: string | null;
}

export interface StudentResponse {
  id: string;
  schoolId: string;
  studentNumber: string;
  admissionDate: string; // ISO date
  status: StudentStatus;
  classId: string | null;
  sectionId: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  bloodGroup: string | null;
  phone: string | null;
  address: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface AdmitStudentRequest {
  firstName: string;
  lastName: string;
  admissionDate?: string;
  studentNumber?: string;
  classId?: string;
  sectionId?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  classId?: string;
  sectionId?: string;
}
