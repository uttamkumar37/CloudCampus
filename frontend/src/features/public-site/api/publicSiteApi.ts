import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface PublicPageResponse {
  id: string;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  displayOrder: number;
}

export interface PublicNavItemResponse {
  id: string;
  label: string;
  url: string | null;
  pageId: string | null;
  position: number;
  parentId: string | null;
}

export interface PublicSiteResponse {
  schoolName: string;
  tenantCode: string;
  pages: PublicPageResponse[];
  nav: PublicNavItemResponse[];
}

export interface PublicSectionResponse {
  id: string;
  sectionType: string;
  position: number;
  content: Record<string, unknown>;
  visible: boolean;
}

export interface PublicPageWithSectionsResponse {
  page: PublicPageResponse;
  sections: PublicSectionResponse[];
}

export async function getPublicSiteApi(tenantCode: string): Promise<PublicSiteResponse> {
  const { data } = await axiosInstance.get<ApiResponse<PublicSiteResponse>>(
    `/v1/public/sites/${tenantCode}`,
  );
  return data.data!;
}

export async function getPublicPageApi(
  tenantCode: string,
  slug: string,
): Promise<PublicPageWithSectionsResponse> {
  const { data } = await axiosInstance.get<ApiResponse<PublicPageWithSectionsResponse>>(
    `/v1/public/sites/${tenantCode}/pages/${slug}`,
  );
  return data.data!;
}
