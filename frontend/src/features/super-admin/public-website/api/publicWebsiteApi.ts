import api from '@/shared/api/axiosInstance';
import type {
  ApiEnvelope,
  PublicPagePayload,
  WebsiteDashboard,
  WebsiteNavigation,
  WebsitePage,
  WebsiteAuditTimelineEvent,
  WebsiteSection,
  WebsiteSeo,
  WebsiteRollbackAudit,
  WebsiteSnapshot,
  WebsiteTheme,
} from '../types';

const ADMIN_BASE = '/v1/super-admin/public-website';
const PUBLIC_BASE = '/v1/experience/public/website';

export async function getWebsiteDashboard(): Promise<WebsiteDashboard> {
  const res = await api.get<ApiEnvelope<WebsiteDashboard>>(`${ADMIN_BASE}/dashboard`);
  return res.data.data;
}

export async function getWebsiteAnalytics(): Promise<WebsiteDashboard> {
  const res = await api.get<ApiEnvelope<WebsiteDashboard>>(`${ADMIN_BASE}/analytics`);
  return res.data.data;
}

export async function listPages(): Promise<WebsitePage[]> {
  const res = await api.get<ApiEnvelope<WebsitePage[]>>(`${ADMIN_BASE}/pages`);
  return res.data.data;
}

export async function createPage(payload: {
  pageKey: string;
  title: string;
  slug: string;
  seoJson?: Record<string, unknown>;
  settingsJson?: Record<string, unknown>;
}): Promise<WebsitePage> {
  const res = await api.post<ApiEnvelope<WebsitePage>>(`${ADMIN_BASE}/pages`, payload);
  return res.data.data;
}

export async function publishPage(id: string): Promise<WebsitePage> {
  const res = await api.post<ApiEnvelope<WebsitePage>>(`${ADMIN_BASE}/pages/${id}/publish`);
  return res.data.data;
}

export async function listSections(pageId: string): Promise<WebsiteSection[]> {
  const res = await api.get<ApiEnvelope<WebsiteSection[]>>(`${ADMIN_BASE}/pages/${pageId}/sections`);
  return res.data.data;
}

export async function createSection(pageId: string, payload: {
  sectionKey: string;
  title: string;
  sectionType: string;
  position: number;
  configJson?: Record<string, unknown>;
}): Promise<WebsiteSection> {
  const res = await api.post<ApiEnvelope<WebsiteSection>>(`${ADMIN_BASE}/pages/${pageId}/sections`, payload);
  return res.data.data;
}

export async function publishSection(sectionId: string): Promise<WebsiteSection> {
  const res = await api.post<ApiEnvelope<WebsiteSection>>(`${ADMIN_BASE}/sections/${sectionId}/publish`);
  return res.data.data;
}

export async function listNavigation(): Promise<WebsiteNavigation[]> {
  const res = await api.get<ApiEnvelope<WebsiteNavigation[]>>(`${ADMIN_BASE}/navigation`);
  return res.data.data;
}

export async function createNavigation(payload: {
  label: string;
  path: string;
  target: string;
  groupName: string;
  position: number;
  visible: boolean;
}): Promise<WebsiteNavigation> {
  const res = await api.post<ApiEnvelope<WebsiteNavigation>>(`${ADMIN_BASE}/navigation`, payload);
  return res.data.data;
}

export async function publishNavigation(id: string): Promise<WebsiteNavigation> {
  const res = await api.post<ApiEnvelope<WebsiteNavigation>>(`${ADMIN_BASE}/navigation/${id}/publish`);
  return res.data.data;
}

export async function listThemes(): Promise<WebsiteTheme[]> {
  const res = await api.get<ApiEnvelope<WebsiteTheme[]>>(`${ADMIN_BASE}/branding/themes`);
  return res.data.data;
}

export async function createTheme(payload: {
  themeKey: string;
  name: string;
  tokensJson: Record<string, unknown>;
  typographyJson: Record<string, unknown>;
  effectsJson: Record<string, unknown>;
}): Promise<WebsiteTheme> {
  const res = await api.post<ApiEnvelope<WebsiteTheme>>(`${ADMIN_BASE}/branding/themes`, payload);
  return res.data.data;
}

export async function publishTheme(id: string): Promise<WebsiteTheme> {
  const res = await api.post<ApiEnvelope<WebsiteTheme>>(`${ADMIN_BASE}/branding/themes/${id}/publish`);
  return res.data.data;
}

export async function listSeo(): Promise<WebsiteSeo[]> {
  const res = await api.get<ApiEnvelope<WebsiteSeo[]>>(`${ADMIN_BASE}/seo`);
  return res.data.data;
}

export async function upsertSeo(payload: {
  pageId?: string;
  routePath: string;
  metaTitle: string;
  metaDescription: string;
  openGraphJson?: Record<string, unknown>;
  twitterJson?: Record<string, unknown>;
  structuredDataJson?: Record<string, unknown>;
  robots: string;
  sitemapPriority: number;
  sitemapChangeFreq: string;
}): Promise<WebsiteSeo> {
  const res = await api.put<ApiEnvelope<WebsiteSeo>>(`${ADMIN_BASE}/seo`, payload);
  return res.data.data;
}

export async function publishSeo(routePath: string): Promise<WebsiteSeo> {
  const res = await api.post<ApiEnvelope<WebsiteSeo>>(`${ADMIN_BASE}/seo/publish`, null, { params: { routePath } });
  return res.data.data;
}

export async function listMedia(): Promise<Array<Record<string, string>>> {
  const res = await api.get<ApiEnvelope<Array<Record<string, string>>>>(`${ADMIN_BASE}/media`);
  return res.data.data;
}

export async function getDemoShowcase(): Promise<Array<Record<string, unknown>>> {
  const res = await api.get<ApiEnvelope<Array<Record<string, unknown>>>>(`${ADMIN_BASE}/demo-showcase`);
  return res.data.data;
}

export async function getInvestorShowcase(): Promise<Array<Record<string, unknown>>> {
  const res = await api.get<ApiEnvelope<Array<Record<string, unknown>>>>(`${ADMIN_BASE}/investor-showcase`);
  return res.data.data;
}

export async function publishWebsite(): Promise<WebsiteSnapshot> {
  const res = await api.post<ApiEnvelope<WebsiteSnapshot>>(`${ADMIN_BASE}/publish`);
  return res.data.data;
}

export async function listSnapshots(): Promise<WebsiteSnapshot[]> {
  const res = await api.get<ApiEnvelope<WebsiteSnapshot[]>>(`${ADMIN_BASE}/publish/snapshots`);
  return res.data.data;
}

export async function rollbackSnapshot(snapshotId: string): Promise<WebsiteSnapshot> {
  const res = await api.post<ApiEnvelope<WebsiteSnapshot>>(`${ADMIN_BASE}/publish/rollback/${snapshotId}`);
  return res.data.data;
}

export async function listRollbackAudit(snapshotId?: string): Promise<WebsiteRollbackAudit[]> {
  const res = await api.get<ApiEnvelope<WebsiteRollbackAudit[]>>(`${ADMIN_BASE}/publish/rollback-audit`, {
    params: snapshotId ? { snapshotId } : undefined,
  });
  return res.data.data;
}

export async function listAuditTimeline(limit = 50): Promise<WebsiteAuditTimelineEvent[]> {
  const res = await api.get<ApiEnvelope<WebsiteAuditTimelineEvent[]>>(`${ADMIN_BASE}/audit-timeline`, {
    params: { limit },
  });
  return res.data.data;
}

export async function getPublicPage(slug: string): Promise<PublicPagePayload> {
  const normalized = slug === '' || slug === '/' ? 'home' : slug;
  const res = await api.get<ApiEnvelope<PublicPagePayload>>(`${PUBLIC_BASE}/pages/${normalized}`);
  return res.data.data;
}

export async function getPublicNavigation(): Promise<WebsiteNavigation[]> {
  const res = await api.get<ApiEnvelope<WebsiteNavigation[]>>(`${PUBLIC_BASE}/navigation`);
  return res.data.data;
}

export async function getPublicTheme(): Promise<WebsiteTheme> {
  const res = await api.get<ApiEnvelope<WebsiteTheme>>(`${PUBLIC_BASE}/theme`);
  return res.data.data;
}
