import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface StudentDocumentResponse {
  id:           string;
  studentId:    string;
  documentType: string;
  fileName:     string;
  mimeType:     string;
  sizeBytes:    number;
  uploadedBy:   string;
  uploadedAt:   string;
}

const base = (schoolId: string, studentId: string) =>
  `/v1/school-admin/schools/${schoolId}/students/${studentId}/documents`;

export async function listStudentDocuments(
  schoolId: string,
  studentId: string,
): Promise<StudentDocumentResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentDocumentResponse[]>>(
    base(schoolId, studentId),
  );
  return data.data!;
}

export async function uploadStudentDocument(
  schoolId: string,
  studentId: string,
  documentType: string,
  file: File,
): Promise<StudentDocumentResponse> {
  const form = new FormData();
  form.append('documentType', documentType);
  form.append('file', file);
  const { data } = await axiosInstance.post<ApiResponse<StudentDocumentResponse>>(
    base(schoolId, studentId),
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data!;
}

export async function getPresignedUrl(
  schoolId: string,
  studentId: string,
  documentId: string,
): Promise<string> {
  const { data } = await axiosInstance.get<ApiResponse<{ url: string }>>(
    `${base(schoolId, studentId)}/${documentId}/url`,
  );
  return data.data!.url;
}

export async function deleteStudentDocument(
  schoolId: string,
  studentId: string,
  documentId: string,
): Promise<void> {
  await axiosInstance.delete(`${base(schoolId, studentId)}/${documentId}`);
}
