import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

export type HomeworkStatus   = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type AssignmentStatus = 'DRAFT' | 'OPEN'      | 'CLOSED';

export interface TeacherHomework {
  homeworkId:      string;
  title:           string;
  description:     string | null;
  dueDate:         string;
  status:          HomeworkStatus;
  classId:         string;
  sectionId:       string | null;
  subjectId:       string;
  submissionCount: number;
}

export interface TeacherAssignment {
  assignmentId:    string;
  title:           string;
  description:     string | null;
  dueDate:         string;
  maxMarks:        number | null;
  status:          AssignmentStatus;
  classId:         string;
  sectionId:       string | null;
  subjectId:       string;
  submissionCount: number;
  gradedCount:     number;
}

export async function getTeacherHomework(page = 0): Promise<PageResponse<TeacherHomework>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<TeacherHomework>>>(
    '/v1/teacher/homework', { params: { page, size: 20 } });
  return data.data ?? { items: [], offset: 0, limit: 20, total: 0 };
}

export async function getTeacherAssignments(page = 0): Promise<PageResponse<TeacherAssignment>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<TeacherAssignment>>>(
    '/v1/teacher/assignments', { params: { page, size: 20 } });
  return data.data ?? { items: [], offset: 0, limit: 20, total: 0 };
}
