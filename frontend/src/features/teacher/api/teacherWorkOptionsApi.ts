import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  AcademicYearResponse,
  ClassRoomResponse,
  SectionResponse,
  SubjectResponse,
} from '@/features/school-admin/types/academic';

export interface TeacherWorkOptions {
  academicYears: AcademicYearResponse[];
  classes: ClassRoomResponse[];
  sections: SectionResponse[];
  subjects: SubjectResponse[];
}

export async function getTeacherWorkOptions(): Promise<TeacherWorkOptions> {
  const { data } = await axiosInstance.get<ApiResponse<TeacherWorkOptions>>('/v1/teacher/work-options');
  return data.data ?? { academicYears: [], classes: [], sections: [], subjects: [] };
}
