import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type { MobileNotice, NoticeCategory, NoticeTarget } from './noticeApi';

export type { NoticeCategory, NoticeTarget };
export type { MobileNotice as AdminNotice };

export interface CreateNoticePayload {
  title:              string;
  content:            string;
  category:           NoticeCategory;
  target:             NoticeTarget;
  priority:           number;
  expiresAt?:         string | null;
  publishImmediately: boolean;
}

export async function listNoticesAdmin(
  schoolId: string,
  page = 0,
  size = 30,
): Promise<PageResponse<MobileNotice>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<MobileNotice>>>(
    `/v1/school-admin/schools/${schoolId}/notices`,
    { params: { page, size } },
  );
  return data.data!;
}

export async function createNotice(
  schoolId: string,
  payload:  CreateNoticePayload,
): Promise<MobileNotice> {
  const { data } = await axiosInstance.post<ApiResponse<MobileNotice>>(
    `/v1/school-admin/schools/${schoolId}/notices`,
    payload,
  );
  return data.data!;
}

export async function publishNotice(schoolId: string, noticeId: string): Promise<MobileNotice> {
  const { data } = await axiosInstance.patch<ApiResponse<MobileNotice>>(
    `/v1/school-admin/schools/${schoolId}/notices/${noticeId}/publish`,
  );
  return data.data!;
}

export async function deleteNotice(schoolId: string, noticeId: string): Promise<void> {
  await axiosInstance.delete(`/v1/school-admin/schools/${schoolId}/notices/${noticeId}`);
}
