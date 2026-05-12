import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  CreateStaffRequest,
  StaffResponse,
  StaffStatus,
  StaffSummaryResponse,
  StaffType,
  UpdateStaffRequest,
} from '../types/staff';

const bySchool = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/staff`;

const byId = (id: string) => `/v1/school-admin/staff/${id}`;

export async function listStaff(
  schoolId: string,
  params?: { status?: StaffStatus; type?: StaffType; search?: string },
): Promise<StaffSummaryResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StaffSummaryResponse[]>>(
    bySchool(schoolId),
    { params },
  );
  return data.data ?? [];
}

export async function listStaffByDepartment(
  departmentId: string,
): Promise<StaffSummaryResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StaffSummaryResponse[]>>(
    `/v1/school-admin/departments/${departmentId}/staff`,
  );
  return data.data ?? [];
}

export async function getStaff(id: string): Promise<StaffResponse> {
  const { data } = await axiosInstance.get<ApiResponse<StaffResponse>>(byId(id));
  return data.data!;
}

export async function createStaff(
  schoolId: string,
  body: CreateStaffRequest,
): Promise<StaffResponse> {
  const { data } = await axiosInstance.post<ApiResponse<StaffResponse>>(
    bySchool(schoolId),
    body,
  );
  return data.data!;
}

export async function updateStaff(
  id: string,
  body: UpdateStaffRequest,
): Promise<StaffResponse> {
  const { data } = await axiosInstance.put<ApiResponse<StaffResponse>>(byId(id), body);
  return data.data!;
}

export async function markOnLeave(id: string): Promise<StaffResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StaffResponse>>(
    `${byId(id)}/on-leave`,
  );
  return data.data!;
}

export async function returnFromLeave(id: string): Promise<StaffResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StaffResponse>>(
    `${byId(id)}/return-from-leave`,
  );
  return data.data!;
}

export async function resignStaff(id: string): Promise<StaffResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StaffResponse>>(
    `${byId(id)}/resign`,
  );
  return data.data!;
}

export async function terminateStaff(id: string): Promise<StaffResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StaffResponse>>(
    `${byId(id)}/terminate`,
  );
  return data.data!;
}
