import { httpClient } from '../../../shared/api/httpClient';

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

export async function createSubject(
  payload: SubjectRequest,
  accessToken: string,
): Promise<SubjectResponse> {
  return httpClient.post<SubjectResponse>('/v1/school-admin/subjects', payload, { accessToken });
}

export async function assignSubjectToClass(
  payload: ClassSubjectAssignmentRequest,
  accessToken: string,
): Promise<ClassSubjectAssignmentResponse> {
  return httpClient.post<ClassSubjectAssignmentResponse>('/v1/school-admin/class-subjects', payload, { accessToken });
}

export async function assignTeacher(
  payload: TeacherAssignmentRequest,
  accessToken: string,
): Promise<TeacherAssignmentResponse> {
  return httpClient.post<TeacherAssignmentResponse>('/v1/school-admin/teacher-assignments', payload, { accessToken });
}
