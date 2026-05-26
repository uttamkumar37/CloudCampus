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
  const response = await fetch('/v1/school-admin/subjects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Subject creation failed.');
  }

  return response.json() as Promise<SubjectResponse>;
}

export async function assignSubjectToClass(
  payload: ClassSubjectAssignmentRequest,
  accessToken: string,
): Promise<ClassSubjectAssignmentResponse> {
  const response = await fetch('/v1/school-admin/class-subjects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Class subject assignment failed.');
  }

  return response.json() as Promise<ClassSubjectAssignmentResponse>;
}

export async function assignTeacher(
  payload: TeacherAssignmentRequest,
  accessToken: string,
): Promise<TeacherAssignmentResponse> {
  const response = await fetch('/v1/school-admin/teacher-assignments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Teacher assignment failed.');
  }

  return response.json() as Promise<TeacherAssignmentResponse>;
}
