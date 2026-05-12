import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { SectionCreateRequest, SectionResponse } from '../types/academic';

const byClass = (classId: string) =>
  `/v1/school-admin/classes/${classId}/sections`;

const byId = (id: string) => `/v1/school-admin/sections/${id}`;

export async function listSections(classId: string): Promise<SectionResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<SectionResponse[]>>(
    byClass(classId),
  );
  return data.data ?? [];
}

export async function createSection(
  classId: string,
  body: SectionCreateRequest,
): Promise<SectionResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SectionResponse>>(
    byClass(classId),
    body,
  );
  return data.data!;
}

export async function deleteSection(id: string): Promise<void> {
  await axiosInstance.delete(byId(id));
}
