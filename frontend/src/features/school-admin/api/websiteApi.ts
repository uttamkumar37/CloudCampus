import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WebsiteResponse {
  id: string;
  schoolId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse {
  id: string;
  schoolId: string;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageRequest {
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  displayOrder: number;
}

export interface SectionResponse {
  id: string;
  pageId: string;
  sectionType: string;
  position: number;
  content: Record<string, unknown>;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SectionRequest {
  sectionType: string;
  position: number;
  content: Record<string, unknown>;
  visible: boolean;
}

export interface NavItemResponse {
  id: string;
  schoolId: string;
  label: string;
  url: string | null;
  pageId: string | null;
  position: number;
  parentId: string | null;
}

export interface NavItemRequest {
  label: string;
  url?: string;
  pageId?: string;
  position: number;
  parentId?: string;
}

// ── URL helpers ───────────────────────────────────────────────────────────────

const base = (schoolId: string) =>
  `/v1/school-admin/schools/${schoolId}/website`;

// ── Website root ──────────────────────────────────────────────────────────────

export async function getWebsiteApi(schoolId: string): Promise<WebsiteResponse> {
  const { data } = await axiosInstance.get<ApiResponse<WebsiteResponse>>(base(schoolId));
  return data.data!;
}

export async function setPublishedApi(schoolId: string, published: boolean): Promise<WebsiteResponse> {
  const { data } = await axiosInstance.put<ApiResponse<WebsiteResponse>>(
    `${base(schoolId)}/publish?published=${published}`,
  );
  return data.data!;
}

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function listPagesApi(schoolId: string): Promise<PageResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse[]>>(
    `${base(schoolId)}/pages`,
  );
  return data.data ?? [];
}

export async function createPageApi(schoolId: string, body: PageRequest): Promise<PageResponse> {
  const { data } = await axiosInstance.post<ApiResponse<PageResponse>>(
    `${base(schoolId)}/pages`,
    body,
  );
  return data.data!;
}

export async function updatePageApi(
  schoolId: string,
  pageId: string,
  body: PageRequest,
): Promise<PageResponse> {
  const { data } = await axiosInstance.put<ApiResponse<PageResponse>>(
    `${base(schoolId)}/pages/${pageId}`,
    body,
  );
  return data.data!;
}

export async function deletePageApi(schoolId: string, pageId: string): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/pages/${pageId}`);
}

// ── Sections ──────────────────────────────────────────────────────────────────

export async function listSectionsApi(
  schoolId: string,
  pageId: string,
): Promise<SectionResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<SectionResponse[]>>(
    `${base(schoolId)}/pages/${pageId}/sections`,
  );
  return data.data ?? [];
}

export async function addSectionApi(
  schoolId: string,
  pageId: string,
  body: SectionRequest,
): Promise<SectionResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SectionResponse>>(
    `${base(schoolId)}/pages/${pageId}/sections`,
    body,
  );
  return data.data!;
}

export async function updateSectionApi(
  schoolId: string,
  pageId: string,
  sectionId: string,
  body: SectionRequest,
): Promise<SectionResponse> {
  const { data } = await axiosInstance.put<ApiResponse<SectionResponse>>(
    `${base(schoolId)}/pages/${pageId}/sections/${sectionId}`,
    body,
  );
  return data.data!;
}

export async function deleteSectionApi(
  schoolId: string,
  pageId: string,
  sectionId: string,
): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/pages/${pageId}/sections/${sectionId}`);
}

// ── Nav ───────────────────────────────────────────────────────────────────────

export async function listNavApi(schoolId: string): Promise<NavItemResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<NavItemResponse[]>>(
    `${base(schoolId)}/nav`,
  );
  return data.data ?? [];
}

export async function addNavItemApi(
  schoolId: string,
  body: NavItemRequest,
): Promise<NavItemResponse> {
  const { data } = await axiosInstance.post<ApiResponse<NavItemResponse>>(
    `${base(schoolId)}/nav`,
    body,
  );
  return data.data!;
}

export async function updateNavItemApi(
  schoolId: string,
  itemId: string,
  body: NavItemRequest,
): Promise<NavItemResponse> {
  const { data } = await axiosInstance.put<ApiResponse<NavItemResponse>>(
    `${base(schoolId)}/nav/${itemId}`,
    body,
  );
  return data.data!;
}

export async function deleteNavItemApi(schoolId: string, itemId: string): Promise<void> {
  await axiosInstance.delete(`${base(schoolId)}/nav/${itemId}`);
}
