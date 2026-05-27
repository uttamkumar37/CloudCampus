import { httpClient } from '../../../shared/api/httpClient';

export type TeacherAssignment = {
  id: string;
  classLevelId: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  active: boolean;
};

export type TeacherExamResult = {
  id: string;
  studentId: string;
  studentName: string;
  recordedByUserId: string;
  marksObtained: number;
  recordedAt: string;
};

export type TeacherExam = {
  id: string;
  tenantId: string;
  schoolId: string;
  classLevelId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  examDate: string;
  maxMarks: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdByUserId: string;
  publishedByUserId: string | null;
  createdAt: string;
  publishedAt: string | null;
  results: TeacherExamResult[];
};

export type TeacherExamRosterStudent = {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  classLevelId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  rollNumber: string | null;
  resultId: string | null;
  marksObtained: number | null;
  recordedAt: string | null;
};

export function listTeacherAssignments(accessToken?: string | null) {
  return httpClient.get<TeacherAssignment[]>('/v1/teacher/assignments', { accessToken });
}

export function listTeacherAttendance(classLevelId: string, subjectId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(
    `/v1/teacher/attendance/sessions?classLevelId=${encodeURIComponent(classLevelId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { accessToken },
  );
}

export function listTeacherHomework(classLevelId: string, subjectId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(
    `/v1/teacher/homework?classLevelId=${encodeURIComponent(classLevelId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { accessToken },
  );
}

export function listTeacherExams(classLevelId: string, subjectId: string, accessToken?: string | null) {
  return httpClient.get<TeacherExam[]>(
    `/v1/teacher/exams?classLevelId=${encodeURIComponent(classLevelId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { accessToken },
  );
}

export function getTeacherExam(examId: string, accessToken?: string | null) {
  return httpClient.get<TeacherExam>(`/v1/teacher/exams/${encodeURIComponent(examId)}`, { accessToken });
}

export function listTeacherExamRoster(examId: string, accessToken?: string | null) {
  return httpClient.get<TeacherExamRosterStudent[]>(
    `/v1/teacher/exams/${encodeURIComponent(examId)}/roster`,
    { accessToken },
  );
}

export function recordTeacherExamMarks(
  examId: string,
  studentId: string,
  marksObtained: number,
  accessToken?: string | null,
) {
  return httpClient.post<TeacherExam>(
    `/v1/teacher/exams/${encodeURIComponent(examId)}/results`,
    { studentId, marksObtained },
    { accessToken },
  );
}

export function listTeacherTimetable(accessToken?: string | null) {
  return httpClient.get<unknown[]>('/v1/teacher/timetable', { accessToken });
}
