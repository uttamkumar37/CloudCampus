import { httpClient } from '../../../shared/api/httpClient';

export type AcademicYearStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED';

export type AcademicYearRequest = {
  name: string;
  startDate: string;
  endDate: string;
  activate: boolean;
};

export type AcademicYearResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
};

export type ClassLevelRequest = {
  academicYearId: string;
  name: string;
  displayOrder: number;
};

export type ClassLevelResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  displayOrder: number;
  active: boolean;
};

export type SectionRequest = {
  classLevelId: string;
  name: string;
  capacity?: number;
};

export type SectionResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string;
  name: string;
  capacity: number | null;
  active: boolean;
};

export async function createAcademicYear(
  payload: AcademicYearRequest,
  accessToken: string,
): Promise<AcademicYearResponse> {
  return httpClient.post<AcademicYearResponse>('/v1/school-admin/academic-years', payload, { accessToken });
}

export async function createClassLevel(
  payload: ClassLevelRequest,
  accessToken: string,
): Promise<ClassLevelResponse> {
  return httpClient.post<ClassLevelResponse>('/v1/school-admin/classes', payload, { accessToken });
}

export async function createSection(
  payload: SectionRequest,
  accessToken: string,
): Promise<SectionResponse> {
  return httpClient.post<SectionResponse>('/v1/school-admin/sections', payload, { accessToken });
}
