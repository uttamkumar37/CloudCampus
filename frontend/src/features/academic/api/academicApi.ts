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
  const response = await fetch('/v1/school-admin/academic-years', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Academic year creation failed.');
  }

  return response.json() as Promise<AcademicYearResponse>;
}

export async function createClassLevel(
  payload: ClassLevelRequest,
  accessToken: string,
): Promise<ClassLevelResponse> {
  const response = await fetch('/v1/school-admin/classes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Class creation failed.');
  }

  return response.json() as Promise<ClassLevelResponse>;
}

export async function createSection(
  payload: SectionRequest,
  accessToken: string,
): Promise<SectionResponse> {
  const response = await fetch('/v1/school-admin/sections', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Section creation failed.');
  }

  return response.json() as Promise<SectionResponse>;
}
