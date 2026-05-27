import { httpClient } from '../../../shared/api/httpClient';

export type ParentChild = {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  relationship?: string | null;
  primaryContact?: boolean;
};

export function listParentChildren(accessToken?: string | null) {
  return httpClient.get<ParentChild[]>('/v1/parent/children', { accessToken });
}

export function listParentChildAttendance(studentId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(`/v1/parent/children/${encodeURIComponent(studentId)}/attendance`, { accessToken });
}

export function listParentChildHomework(studentId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(`/v1/parent/children/${encodeURIComponent(studentId)}/homework`, { accessToken });
}

export function listParentChildResults(studentId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(`/v1/parent/children/${encodeURIComponent(studentId)}/results`, { accessToken });
}

export function listParentChildFees(studentId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(`/v1/parent/children/${encodeURIComponent(studentId)}/fees`, { accessToken });
}

export function listParentChildNotices(studentId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(`/v1/parent/children/${encodeURIComponent(studentId)}/notices`, { accessToken });
}

export function listParentChildTimetable(studentId: string, accessToken?: string | null) {
  return httpClient.get<unknown[]>(`/v1/parent/children/${encodeURIComponent(studentId)}/timetable`, { accessToken });
}
