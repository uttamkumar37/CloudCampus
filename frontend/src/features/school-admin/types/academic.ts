/**
 * TypeScript types for school-admin academic domain.
 * Mirrors backend DTOs — keep in sync with:
 *   com.cloudcampus.school.dto.*
 */

// ── Academic Year ─────────────────────────────────────────────────────────────

export type AcademicYearStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface AcademicYearResponse {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  isCurrent: boolean;
  calendarType: string;
  gradingScheme: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYearCreateRequest {
  name: string;
  startDate: string;
  endDate: string;
  calendarType?: string;
  gradingScheme?: string;
}

// ── ClassRoom ─────────────────────────────────────────────────────────────────

export interface ClassRoomResponse {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  gradeLevel: number | null;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassRoomCreateRequest {
  academicYearId: string;
  name: string;
  gradeLevel?: number;
  capacity?: number;
}

// ── Section ───────────────────────────────────────────────────────────────────

export interface SectionResponse {
  id: string;
  classId: string;
  name: string;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SectionCreateRequest {
  name: string;
  capacity?: number;
}

// ── Subject ───────────────────────────────────────────────────────────────────

export interface SubjectResponse {
  id: string;
  schoolId: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectCreateRequest {
  name: string;
  code?: string;
  description?: string;
}
