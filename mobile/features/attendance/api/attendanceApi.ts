import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

export interface StudentDto {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  sectionId: string;
}

export interface ClassAttendanceSummary {
  classId: string;
  sectionId: string;
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
}

export async function fetchStudentsByClass(
  classId: string,
  sectionId: string,
): Promise<StudentDto[]> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<StudentDto>>>(
    `/v1/classes/${classId}/sections/${sectionId}/students`,
    { params: { offset: 0, limit: 200 } },
  );
  return data.data?.items ?? [];
}
