import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { ClassRoomCreateRequest, ClassRoomResponse } from '../types/academic';

const byYear = (academicYearId: string) =>
  `/v1/school-admin/academic-years/${academicYearId}/classes`;

const bySchool = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/classes`;

const byId = (id: string) => `/v1/school-admin/classes/${id}`;

export async function listClasses(
  academicYearId: string,
): Promise<ClassRoomResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<ClassRoomResponse[]>>(
    byYear(academicYearId),
  );
  return data.data ?? [];
}

export async function createClass(
  schoolId: string,
  body: ClassRoomCreateRequest,
): Promise<ClassRoomResponse> {
  const { data } = await axiosInstance.post<ApiResponse<ClassRoomResponse>>(
    bySchool(schoolId),
    body,
  );
  return data.data!;
}

export async function deleteClass(id: string): Promise<void> {
  await axiosInstance.delete(byId(id));
}
