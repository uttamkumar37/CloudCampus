import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type { SubjectCreateRequest, SubjectResponse } from '../types/academic';

const bySchool = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/subjects`;

const byId = (id: string) => `/v1/school-admin/subjects/${id}`;

export async function listSubjects(
  schoolId: string,
  activeOnly?: boolean,
): Promise<SubjectResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<SubjectResponse[]>>(
    bySchool(schoolId),
    { params: activeOnly != null ? { activeOnly } : undefined },
  );
  return data.data ?? [];
}

export async function createSubject(
  schoolId: string,
  body: SubjectCreateRequest,
): Promise<SubjectResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SubjectResponse>>(
    bySchool(schoolId),
    body,
  );
  return data.data!;
}

export async function deactivateSubject(id: string): Promise<SubjectResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<SubjectResponse>>(
    `${byId(id)}/deactivate`,
  );
  return data.data!;
}

export async function activateSubject(id: string): Promise<SubjectResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<SubjectResponse>>(
    `${byId(id)}/activate`,
  );
  return data.data!;
}
