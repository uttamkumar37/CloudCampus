import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface DepartmentResponse {
  id:          string;
  schoolId:    string;
  name:        string;
  code:        string | null;
  description: string | null;
  isActive:    boolean;
  createdAt:   string;
  updatedAt:   string;
}

export interface DepartmentRequest {
  name:        string;
  code?:       string | null;
  description?: string | null;
}

const bySchool = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/departments`;

const byId = (id: string) => `/v1/school-admin/departments/${id}`;

export async function listDepartments(
  schoolId: string,
  activeOnly = true,
): Promise<DepartmentResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<DepartmentResponse[]>>(
    bySchool(schoolId), { params: { activeOnly } },
  );
  return data.data ?? [];
}

export async function createDepartment(
  schoolId: string,
  body: DepartmentRequest,
): Promise<DepartmentResponse> {
  const { data } = await axiosInstance.post<ApiResponse<DepartmentResponse>>(
    bySchool(schoolId), body,
  );
  return data.data!;
}

export async function updateDepartment(
  id: string,
  body: DepartmentRequest,
): Promise<DepartmentResponse> {
  const { data } = await axiosInstance.put<ApiResponse<DepartmentResponse>>(byId(id), body);
  return data.data!;
}

export async function deactivateDepartment(id: string): Promise<DepartmentResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<DepartmentResponse>>(
    `${byId(id)}/deactivate`,
  );
  return data.data!;
}

export async function activateDepartment(id: string): Promise<DepartmentResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<DepartmentResponse>>(
    `${byId(id)}/activate`,
  );
  return data.data!;
}
