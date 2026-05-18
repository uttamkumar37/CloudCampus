import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWebsiteDashboard,
  listPages,
  createPage,
  publishPage,
  listSections,
  createSection,
  publishSection,
  listNavigation,
  listThemes,
  createTheme,
  publishTheme,
  listSeo,
  upsertSeo,
  publishSeo,
  listMedia,
  getWebsiteAnalytics,
  publishWebsite,
  listSnapshots,
  rollbackSnapshot,
  listRollbackAudit,
  listAuditTimeline,
} from '../api/publicWebsiteApi';
import type { WebsiteSection } from '../types';

export function useWebsiteDashboardQuery() {
  return useQuery({ queryKey: ['public-website', 'dashboard'], queryFn: getWebsiteDashboard });
}

export function useWebsiteAnalyticsQuery() {
  return useQuery({ queryKey: ['public-website', 'analytics'], queryFn: getWebsiteAnalytics });
}

export function useWebsitePagesQuery() {
  return useQuery({ queryKey: ['public-website', 'pages'], queryFn: listPages });
}

export function useCreatePageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function usePublishPageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function useWebsiteSectionsQuery(pageId: string | null) {
  return useQuery({
    queryKey: ['public-website', 'pages', pageId, 'sections'],
    queryFn: () => listSections(pageId ?? ''),
    enabled: Boolean(pageId),
  });
}

export function useCreateSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      payload,
    }: {
      pageId: string;
      payload: {
        sectionKey: string;
        title: string;
        sectionType: string;
        position: number;
        configJson?: Record<string, unknown>;
      };
    }) => createSection(pageId, payload),
    onSuccess: (section: WebsiteSection) => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages', section.pageId, 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function usePublishSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishSection,
    onSuccess: (section: WebsiteSection) => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages', section.pageId, 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function useWebsiteThemesQuery() {
  return useQuery({ queryKey: ['public-website', 'themes'], queryFn: listThemes });
}

export function useWebsiteNavigationQuery() {
  return useQuery({ queryKey: ['public-website', 'navigation'], queryFn: listNavigation });
}

export function useCreateThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'themes'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function usePublishThemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'themes'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function useWebsiteSeoQuery() {
  return useQuery({ queryKey: ['public-website', 'seo'], queryFn: listSeo });
}

export function useUpsertSeoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertSeo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'seo'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function usePublishSeoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishSeo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'seo'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function useWebsiteMediaQuery() {
  return useQuery({ queryKey: ['public-website', 'media'], queryFn: listMedia });
}

export function usePublishWebsiteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishWebsite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'navigation'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'themes'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'seo'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'rollback-audit'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function useSnapshotsQuery() {
  return useQuery({ queryKey: ['public-website', 'snapshots'], queryFn: listSnapshots });
}

export function useRollbackSnapshotMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rollbackSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-website', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'navigation'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'themes'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'seo'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'rollback-audit'] });
      queryClient.invalidateQueries({ queryKey: ['public-website', 'audit-timeline'] });
    },
  });
}

export function useRollbackAuditQuery(snapshotId: string | null) {
  return useQuery({
    queryKey: ['public-website', 'rollback-audit', snapshotId],
    queryFn: () => listRollbackAudit(snapshotId ?? undefined),
    enabled: Boolean(snapshotId),
  });
}

export function useAuditTimelineQuery(limit = 50) {
  return useQuery({
    queryKey: ['public-website', 'audit-timeline', limit],
    queryFn: () => listAuditTimeline(limit),
  });
}
