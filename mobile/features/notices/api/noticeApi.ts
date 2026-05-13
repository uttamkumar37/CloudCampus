import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

export type NoticeCategory = 'GENERAL' | 'ACADEMIC' | 'EXAM' | 'FEE' | 'HOLIDAY' | 'CIRCULAR' | 'URGENT';
export type NoticeTarget   = 'ALL' | 'STUDENT' | 'PARENT' | 'TEACHER' | 'STAFF';

export interface MobileNotice {
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

export async function listNotices(page = 0, limit = 20): Promise<PageResponse<MobileNotice>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<MobileNotice>>>(
    '/v1/mobile/notices',
    { params: { page, limit } },
  );
  return data.data!;
}

export async function getNotice(id: string): Promise<MobileNotice> {
  const { data } = await axiosInstance.get<ApiResponse<MobileNotice>>(`/v1/mobile/notices/${id}`);
  return data.data!;
}
