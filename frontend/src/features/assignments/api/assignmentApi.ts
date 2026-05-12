import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  Assignment,
  AssignmentCreateRequest,
  AssignmentStatus,
  AssignmentSubmission,
  GradeSubmissionRequest,
} from '../types/assignment';

const base = (schoolId: string) => `/v1/school-admin/schools/${schoolId}/assignments`;

export async function createAssignment(
  schoolId: string,
  body: AssignmentCreateRequest,
): Promise<Assignment> {
  const { data } = await axiosInstance.post<ApiResponse<Assignment>>(base(schoolId), body);
  return data.data!;
}

export async function listAssignments(
  schoolId: string,
  academicYearId: string,
  params?: { classId?: string; sectionId?: string; status?: AssignmentStatus; page?: number; size?: number },
): Promise<PageResponse<Assignment>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<Assignment>>>(
    base(schoolId),
    { params: { academicYearId, ...params } },
  );
  return data.data ?? { items: [], offset: 0, limit: 20, total: 0 };
}

export async function getAssignment(schoolId: string, assignmentId: string): Promise<Assignment> {
  const { data } = await axiosInstance.get<ApiResponse<Assignment>>(
    `${base(schoolId)}/${assignmentId}`,
  );
  return data.data!;
}

export async function updateAssignmentStatus(
  schoolId: string,
  assignmentId: string,
  status: AssignmentStatus,
): Promise<Assignment> {
  const { data } = await axiosInstance.patch<ApiResponse<Assignment>>(
    `${base(schoolId)}/${assignmentId}/status`,
    { status },
  );
  return data.data!;
}

export async function deleteAssignment(schoolId: string, assignmentId: string): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/${assignmentId}`);
}

export async function listSubmissions(
  schoolId: string,
  assignmentId: string,
): Promise<AssignmentSubmission[]> {
  const { data } = await axiosInstance.get<ApiResponse<AssignmentSubmission[]>>(
    `${base(schoolId)}/${assignmentId}/submissions`,
  );
  return data.data ?? [];
}

export async function gradeSubmission(
  schoolId: string,
  assignmentId: string,
  submissionId: string,
  body: GradeSubmissionRequest,
): Promise<AssignmentSubmission> {
  const { data } = await axiosInstance.patch<ApiResponse<AssignmentSubmission>>(
    `${base(schoolId)}/${assignmentId}/submissions/${submissionId}/grade`,
    body,
  );
  return data.data!;
}
