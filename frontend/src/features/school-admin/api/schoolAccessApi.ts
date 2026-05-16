import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface SchoolAccess {
  schoolId:   string;
  schoolName: string;
  schoolCode: string;
  isPrimary:  boolean;
}

export interface SwitchSchoolResponse {
  accessToken: string;
  expiresIn:   number;
  schoolId:    string;
}

export async function listMySchoolsApi(): Promise<SchoolAccess[]> {
  const { data } = await axiosInstance.get<ApiResponse<SchoolAccess[]>>('/v1/me/schools');
  return data.data!;
}

export async function switchSchoolApi(schoolId: string): Promise<SwitchSchoolResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SwitchSchoolResponse>>(
    `/v1/me/schools/${schoolId}/activate`,
  );
  return data.data!;
}
