export type WebsitePage = {
  id: string;
  pageKey: string;
  title: string;
  slug: string;
  status: string;
  seoJson: Record<string, unknown>;
  settingsJson: Record<string, unknown>;
  version: number;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type WebsiteSection = {
  id: string;
  pageId: string;
  sectionKey: string;
  title: string;
  sectionType: string;
  position: number;
  configJson: Record<string, unknown>;
  status: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type WebsiteTheme = {
  id: string;
  themeKey: string;
  name: string;
  status: string;
  tokensJson: Record<string, unknown>;
  typographyJson: Record<string, unknown>;
  effectsJson: Record<string, unknown>;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type WebsiteNavigation = {
  id: string;
  label: string;
  path: string;
  target: string;
  groupName: string;
  position: number;
  visible: boolean;
  status: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type WebsiteSeo = {
  id: string;
  pageId: string | null;
  routePath: string;
  metaTitle: string;
  metaDescription: string;
  openGraphJson: Record<string, unknown>;
  twitterJson: Record<string, unknown>;
  structuredDataJson: Record<string, unknown>;
  robots: string;
  sitemapPriority: number;
  sitemapChangeFreq: string;
  status: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type WebsiteSnapshot = {
  id: string;
  versionLabel: string;
  createdAt: string;
};

export type WebsiteDashboard = {
  totalVisitors: number;
  pageViews: number;
  ctaClicks: number;
  demoRequests: number;
  investorVisits: number;
  publishedPages: number;
  seoCoverage: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
  engagementMetrics: Record<string, number>;
};

export type PublicPagePayload = {
  page: WebsitePage;
  sections: WebsiteSection[];
};

export type ApiEnvelope<T> = { data: T };
