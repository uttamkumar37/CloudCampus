import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type { HomeworkAssignment, HomeworkCreateRequest, HomeworkStatus } from '../types/homework';

const base = (schoolId: string) => `/v1/school-admin/schools/${schoolId}/homework`;

export async function createHomework(
  schoolId: string,
  body: HomeworkCreateRequest,
): Promise<HomeworkAssignment> {
  const { data } = await axiosInstance.post<ApiResponse<HomeworkAssignment>>(
    base(schoolId),
    body,
  );
  return data.data!;
}

export async function listHomework(
  schoolId: string,
  academicYearId: string,
  params?: { classId?: string; sectionId?: string; status?: HomeworkStatus; page?: number; size?: number },
): Promise<PageResponse<HomeworkAssignment>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<HomeworkAssignment>>>(
    base(schoolId),
    { params: { academicYearId, ...params } },
  );
  return data.data ?? { items: [], offset: 0, limit: 20, total: 0 };
}

export async function getHomework(schoolId: string, homeworkId: string): Promise<HomeworkAssignment> {
  const { data } = await axiosInstance.get<ApiResponse<HomeworkAssignment>>(
    `${base(schoolId)}/${homeworkId}`,
  );
  return data.data!;
}

export async function updateHomeworkStatus(
  schoolId: string,
  homeworkId: string,
  status: HomeworkStatus,
): Promise<HomeworkAssignment> {
  const { data } = await axiosInstance.patch<ApiResponse<HomeworkAssignment>>(
    `${base(schoolId)}/${homeworkId}/status`,
    { status },
  );
  return data.data!;
}

export async function deleteHomework(schoolId: string, homeworkId: string): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/${homeworkId}`);
}
