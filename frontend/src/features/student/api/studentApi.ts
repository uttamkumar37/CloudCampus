import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  AdmitStudentRequest,
  StudentResponse,
  StudentSummaryResponse,
  StudentStatus,
  UpdateStudentRequest,
} from '../types/student';

const bySchool = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/students`;

const byId = (id: string) => `/v1/school-admin/students/${id}`;

export async function listStudents(
  schoolId: string,
  params?: { status?: StudentStatus; search?: string },
): Promise<StudentSummaryResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentSummaryResponse[]>>(
    bySchool(schoolId),
    { params },
  );
  return data.data ?? [];
}

export async function listStudentsByClass(
  classId: string,
): Promise<StudentSummaryResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentSummaryResponse[]>>(
    `/v1/school-admin/classes/${classId}/students`,
  );
  return data.data ?? [];
}

export async function listStudentsBySection(
  sectionId: string,
): Promise<StudentSummaryResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentSummaryResponse[]>>(
    `/v1/school-admin/sections/${sectionId}/students`,
  );
  return data.data ?? [];
}

export async function getStudent(id: string): Promise<StudentResponse> {
  const { data } = await axiosInstance.get<ApiResponse<StudentResponse>>(byId(id));
  return data.data!;
}

export async function admitStudent(
  schoolId: string,
  body: AdmitStudentRequest,
): Promise<StudentResponse> {
  const { data } = await axiosInstance.post<ApiResponse<StudentResponse>>(
    bySchool(schoolId),
    body,
  );
  return data.data!;
}

export async function updateStudent(
  id: string,
  body: UpdateStudentRequest,
): Promise<StudentResponse> {
  const { data } = await axiosInstance.put<ApiResponse<StudentResponse>>(
    byId(id),
    body,
  );
  return data.data!;
}

export async function graduateStudent(id: string): Promise<StudentResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StudentResponse>>(
    `${byId(id)}/graduate`,
  );
  return data.data!;
}

export async function transferStudent(id: string): Promise<StudentResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StudentResponse>>(
    `${byId(id)}/transfer`,
  );
  return data.data!;
}

export async function suspendStudent(id: string): Promise<StudentResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StudentResponse>>(
    `${byId(id)}/suspend`,
  );
  return data.data!;
}

export async function reinstateStudent(id: string): Promise<StudentResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StudentResponse>>(
    `${byId(id)}/reinstate`,
  );
  return data.data!;
}

// ── Bulk import (CC-0508) ─────────────────────────────────────────────────────

export interface BulkStudentRow {
  firstName:     string;
  lastName:      string;
  admissionDate?: string | null;
  dateOfBirth?:  string | null;
  gender?:       'MALE' | 'FEMALE' | 'OTHER' | null;
  studentNumber?: string | null;
  classId?:      string | null;
  sectionId?:    string | null;
  phone?:        string | null;
}

export interface RowError {
  row:    number;
  reason: string;
}

export interface BulkImportResult {
  totalRows:    number;
  successCount: number;
  failedCount:  number;
  errors:       RowError[];
}

export async function bulkImportStudents(
  schoolId: string,
  rows: BulkStudentRow[],
): Promise<BulkImportResult> {
  const { data } = await axiosInstance.post<ApiResponse<BulkImportResult>>(
    `${bySchool(schoolId)}/bulk`,
    rows,
  );
  return data.data!;
}

// ── Parent links (CC-0506) ────────────────────────────────────────────────────

export type Relationship = 'FATHER' | 'MOTHER' | 'GUARDIAN';

export interface ParentLinkResponse {
  id:           string;
  studentId:    string;
  parentUserId: string;
  relationship: Relationship;
  isPrimary:    boolean;
  createdAt:    string;
}

export interface ParentLinkRequest {
  parentUserId: string;
  relationship: Relationship;
  makePrimary:  boolean;
}

export async function listParentLinks(studentId: string): Promise<ParentLinkResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<ParentLinkResponse[]>>(
    `/v1/school-admin/students/${studentId}/parents`,
  );
  return data.data ?? [];
}

export async function addParentLink(
  studentId: string,
  body: ParentLinkRequest,
): Promise<ParentLinkResponse> {
  const { data } = await axiosInstance.post<ApiResponse<ParentLinkResponse>>(
    `/v1/school-admin/students/${studentId}/parents`,
    body,
  );
  return data.data!;
}

export async function removeParentLink(linkId: string): Promise<void> {
  await axiosInstance.delete(`/v1/school-admin/student-parent-links/${linkId}`);
}
