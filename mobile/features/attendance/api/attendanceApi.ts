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

export interface ClassPickerItem { id: string; name: string; }
export interface SectionPickerItem { id: string; name: string; }

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

export async function fetchClassesForSchool(schoolId: string): Promise<ClassPickerItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<ClassPickerItem[]>>(
    `/v1/school-admin/schools/${schoolId}/classes`,
  );
  return data.data ?? [];
}

export async function fetchSectionsForClass(classId: string): Promise<SectionPickerItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<SectionPickerItem[]>>(
    `/v1/school-admin/classes/${classId}/sections`,
  );
  return data.data ?? [];
}
