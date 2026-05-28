import { httpClient } from '../../../shared/api/httpClient';

type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type SubjectRequest = {
  code: string;
  name: string;
};

export type SubjectResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  code: string;
  name: string;
  active: boolean;
};

export type ClassSubjectAssignmentRequest = {
  classLevelId: string;
  subjectId: string;
};

export type ClassSubjectAssignmentResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  active: boolean;
};

export type TeacherAssignmentRequest = {
  teacherUserId: string;
  classSubjectAssignmentId: string;
};

export type TeacherAssignmentResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  teacherUserId: string;
  teacherName: string;
  classSubjectAssignmentId: string;
  classLevelId: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  active: boolean;
};

export type TeacherDirectorySummary = {
  id: string;
  tenantId: string;
  schoolId: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'TEACHER';
  userStatus: 'INVITED' | 'ACTIVE' | 'DISABLED';
  employeeNumber?: string | null;
  department?: string | null;
  designation?: string | null;
  portalLoginRequired: boolean;
  active: boolean;
  createdAt: string;
};

export async function createSubject(
  payload: SubjectRequest,
  accessToken: string,
): Promise<SubjectResponse> {
  return httpClient.post<SubjectResponse>('/v1/school-admin/subjects', payload, { accessToken });
}

export async function listSubjects(accessToken: string): Promise<SubjectResponse[]> {
  return httpClient.get<SubjectResponse[]>('/v1/school-admin/subjects', { accessToken });
}

export async function assignSubjectToClass(
  payload: ClassSubjectAssignmentRequest,
  accessToken: string,
): Promise<ClassSubjectAssignmentResponse> {
  return httpClient.post<ClassSubjectAssignmentResponse>('/v1/school-admin/class-subjects', payload, { accessToken });
}

export async function listClassSubjectAssignments(
  classLevelId: string,
  accessToken: string,
): Promise<ClassSubjectAssignmentResponse[]> {
  return httpClient.get<ClassSubjectAssignmentResponse[]>(
    `/v1/school-admin/class-subjects?classLevelId=${encodeURIComponent(classLevelId)}`,
    { accessToken },
  );
}

export async function assignTeacher(
  payload: TeacherAssignmentRequest,
  accessToken: string,
): Promise<TeacherAssignmentResponse> {
  return httpClient.post<TeacherAssignmentResponse>('/v1/school-admin/teacher-assignments', payload, { accessToken });
}

export async function listTeacherAssignments(
  classLevelId: string,
  accessToken: string,
): Promise<TeacherAssignmentResponse[]> {
  return httpClient.get<TeacherAssignmentResponse[]>(
    `/v1/school-admin/teacher-assignments?classLevelId=${encodeURIComponent(classLevelId)}`,
    { accessToken },
  );
}

export async function listTeacherDirectory(accessToken: string): Promise<TeacherDirectorySummary[]> {
  const response = await httpClient.get<PageResponse<TeacherDirectorySummary>>('/v1/school-admin/teachers?size=100', {
    accessToken,
  });
  return response.items;
}
