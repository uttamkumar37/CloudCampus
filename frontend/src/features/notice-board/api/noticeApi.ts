import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/notices`;

export type NoticeCategory = 'GENERAL' | 'ACADEMIC' | 'EXAM' | 'FEE' | 'HOLIDAY' | 'CIRCULAR' | 'URGENT';
export type NoticeTarget   = 'ALL' | 'STUDENT' | 'PARENT' | 'TEACHER' | 'STAFF';

export interface NoticeResponse {
  id:          string;
  schoolId:    string;
  title:       string;
  content:     string;
  category:    NoticeCategory;
  target:      NoticeTarget;
  priority:    number;
  published:   boolean;
  publishedAt: string | null;
  expiresAt:   string | null;
  postedBy:    string | null;
  createdAt:   string;
}

export interface NoticeCreateRequest {
  title:              string;
  content:            string;
  category:           NoticeCategory;
  target?:            NoticeTarget;
  priority:           number;
  expiresAt?:         string | null;
  publishImmediately: boolean;
}

export async function listNotices(
  schoolId: string,
  params?: { category?: NoticeCategory; published?: boolean; page?: number; size?: number },
): Promise<PageResponse<NoticeResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<NoticeResponse>>>(
    base(schoolId), { params });
  return data.data!;
}

export async function createNotice(
  schoolId: string,
  body: NoticeCreateRequest,
): Promise<NoticeResponse> {
  const { data } = await axiosInstance.post<ApiResponse<NoticeResponse>>(base(schoolId), body);
  return data.data!;
}

export async function publishNotice(
  schoolId: string,
  noticeId: string,
): Promise<NoticeResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<NoticeResponse>>(
    `${base(schoolId)}/${noticeId}/publish`);
  return data.data!;
}

export async function deleteNotice(schoolId: string, noticeId: string): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/${noticeId}`);
}
