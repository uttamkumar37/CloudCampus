// ── Enums ─────────────────────────────────────────────────────────────────────

export type StaffType =
  | 'TEACHER'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'LAB_ASSISTANT'
  | 'HOSTEL_WARDEN'
  | 'TRANSPORT_STAFF'
  | 'ADMIN_STAFF'
  | 'OTHER';

export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// ── API response shapes ───────────────────────────────────────────────────────

export interface StaffSummaryResponse {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  staffType: StaffType;
  status: StaffStatus;
  departmentId: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
}

export interface StaffResponse {
  id: string;
  schoolId: string;
  departmentId: string | null;
  employeeNumber: string;
  staffType: StaffType;
  status: StaffStatus;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  photoUrl: string | null;
  qualification: string | null;
  specialization: string | null;
  joiningDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  staffType: StaffType;
  employeeNumber?: string;
  joiningDate?: string;
  departmentId?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  qualification?: string;
  specialization?: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  departmentId?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  qualification?: string;
  specialization?: string;
}
