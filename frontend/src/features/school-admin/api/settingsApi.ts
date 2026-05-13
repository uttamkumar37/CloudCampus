import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export type AcademicCalendarType = 'TERM' | 'SEMESTER' | 'TRIMESTER' | 'QUARTER';
export type GradingScheme        = 'PERCENTAGE' | 'GRADE_LETTER' | 'GPA' | 'CGPA';

export interface SchoolSettingsResponse {
  schoolId:            string;
  timezone:            string;
  locale:              string;
  academicCalendarType: AcademicCalendarType;
  workingDaysMask:     number;
  gradingScheme:       GradingScheme;
  minAttendancePct:    number;
  maxClassCapacity:    number;
  allowLateAttendance: boolean;
  lateCutoffMinutes:   number;
  schoolLogoUrl:       string | null;
  primaryColor:        string | null;
  updatedAt:           string;
}

export interface SchoolSettingsRequest {
  timezone:            string;
  locale:              string;
  academicCalendarType: AcademicCalendarType;
  workingDaysMask:     number;
  gradingScheme:       GradingScheme;
  minAttendancePct:    number;
  maxClassCapacity:    number;
  allowLateAttendance: boolean;
  lateCutoffMinutes:   number;
  schoolLogoUrl:       string | null;
  primaryColor:        string | null;
}

const url = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/settings`;

export async function getSchoolSettings(schoolId: string): Promise<SchoolSettingsResponse> {
  const { data } = await axiosInstance.get<ApiResponse<SchoolSettingsResponse>>(url(schoolId));
  return data.data!;
}

export async function updateSchoolSettings(
  schoolId: string,
  body: SchoolSettingsRequest,
): Promise<SchoolSettingsResponse> {
  const { data } = await axiosInstance.put<ApiResponse<SchoolSettingsResponse>>(url(schoolId), body);
  return data.data!;
}
