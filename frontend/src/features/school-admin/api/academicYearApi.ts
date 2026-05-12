import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  AcademicYearCreateRequest,
  AcademicYearResponse,
} from '../types/academic';

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/academic-years`;

const byId = (id: string) => `/v1/school-admin/academic-years/${id}`;

export async function listAcademicYears(
  schoolId: string,
): Promise<AcademicYearResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<AcademicYearResponse[]>>(
    base(schoolId),
  );
  return data.data ?? [];
}

export async function createAcademicYear(
  schoolId: string,
  body: AcademicYearCreateRequest,
): Promise<AcademicYearResponse> {
  const { data } = await axiosInstance.post<ApiResponse<AcademicYearResponse>>(
    base(schoolId),
    body,
  );
  return data.data!;
}

export async function setCurrentAcademicYear(
  id: string,
): Promise<AcademicYearResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<AcademicYearResponse>>(
    `${byId(id)}/set-current`,
  );
  return data.data!;
}

export async function closeAcademicYear(
  id: string,
): Promise<AcademicYearResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<AcademicYearResponse>>(
    `${byId(id)}/close`,
  );
  return data.data!;
}
