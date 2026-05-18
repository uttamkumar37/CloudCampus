import api from '@/shared/api/axiosInstance';

const BASE = '/v1/super-admin/experience';

type ApiEnvelope<T> = { data: T };

export type BrandSystem = {
  id: string;
  name: string;
  code: string;
  status: string;
  tokenJson: Record<string, unknown>;
  typographyJson: Record<string, unknown>;
  motionJson: Record<string, unknown>;
  version: number;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type WebsiteRoute = {
  id: string;
  routePath: string;
  audienceType: string;
  title: string;
  status: string;
  seoJson: Record<string, unknown>;
  layoutJson: Record<string, unknown>;
  ctaJson: Record<string, unknown>;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type StakeholderJourney = {
  id: string;
  stakeholderType: string;
  journeyKey: string;
  name: string;
  conversionGoal: string | null;
  status: string;
  narrativeJson: Record<string, unknown>;
  touchpointsJson: unknown[];
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type PublicRenderProfile = {
  audienceType: string;
  routePath: string;
  brandCode: string;
  brandTokens: Record<string, unknown>;
  typography: Record<string, unknown>;
  motion: Record<string, unknown>;
  seo: Record<string, unknown>;
  layout: Record<string, unknown>;
  cta: Record<string, unknown>;
  journeyKey: string;
  conversionGoal: string;
  narrative: Record<string, unknown>;
  touchpoints: unknown;
};

export type ExperienceSeedHealth = {
  ready: boolean;
  requiredAudienceCount: number;
  publishedBrandSystems: number;
  publishedWebsiteRoutes: number;
  publishedStakeholderJourneys: number;
  activeDemoScenarios: number;
  activeInvestorRooms: number;
  publishedPresentations: number;
  publishedContentBlocks: number;
  missingRouteAudiences: string[];
  missingJourneyAudiences: string[];
  checks: Record<string, boolean>;
};

export type Presentation = {
  id: string;
  title: string;
  slug: string;
  audienceType: string;
  status: string;
  meta: Record<string, unknown>;
  branding: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CampaignStep = {
  id: string;
  position: number;
  delayMinutes: number;
  actionType: string;
  actionConfig: Record<string, unknown>;
};

export type MarketingCampaign = {
  id: string;
  name: string;
  campaignType: string;
  audienceFilter: Record<string, unknown>;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  status: string;
  updatedAt: string;
  steps: CampaignStep[];
};

export type WebsiteTemplate = {
  id: string;
  templateKey: string;
  name: string;
  category: string;
  status: string;
  previewImageUrl: string | null;
  tags: string[];
  schema: Record<string, unknown>;
  defaultBranding: Record<string, unknown>;
  usageCount: number;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type StoryScene = {
  id: string;
  sceneKey: string;
  title: string;
  audienceType: string;
  status: string;
  timeline: Record<string, unknown>;
  proofPoints: unknown[];
  animation: Record<string, unknown>;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type TrustModule = {
  id: string;
  moduleKey: string;
  title: string;
  category: string;
  status: string;
  evidence: Record<string, unknown>;
  metrics: Record<string, unknown>;
  display: Record<string, unknown>;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export async function listBrandSystems(): Promise<BrandSystem[]> {
  const res = await api.get<ApiEnvelope<BrandSystem[]>>(`${BASE}/branding`);
  return res.data.data;
}

export async function createBrandSystem(payload: {
  name: string;
  code: string;
  tokenJson: Record<string, unknown>;
  typographyJson: Record<string, unknown>;
  motionJson: Record<string, unknown>;
}): Promise<BrandSystem> {
  const res = await api.post<ApiEnvelope<BrandSystem>>(`${BASE}/branding`, payload);
  return res.data.data;
}

export async function publishBrandSystem(id: string): Promise<BrandSystem> {
  const res = await api.post<ApiEnvelope<BrandSystem>>(`${BASE}/branding/${id}/publish`);
  return res.data.data;
}

export async function listWebsiteRoutes(): Promise<WebsiteRoute[]> {
  const res = await api.get<ApiEnvelope<WebsiteRoute[]>>(`${BASE}/website-routes`);
  return res.data.data;
}

export async function createWebsiteRoute(payload: {
  routePath: string;
  audienceType: string;
  title: string;
  seoJson: Record<string, unknown>;
  layoutJson: Record<string, unknown>;
  ctaJson: Record<string, unknown>;
}): Promise<WebsiteRoute> {
  const res = await api.post<ApiEnvelope<WebsiteRoute>>(`${BASE}/website-routes`, payload);
  return res.data.data;
}

export async function publishWebsiteRoute(id: string): Promise<WebsiteRoute> {
  const res = await api.post<ApiEnvelope<WebsiteRoute>>(`${BASE}/website-routes/${id}/publish`);
  return res.data.data;
}

export async function listStakeholderJourneys(): Promise<StakeholderJourney[]> {
  const res = await api.get<ApiEnvelope<StakeholderJourney[]>>(`${BASE}/stakeholder-journeys`);
  return res.data.data;
}

export async function createStakeholderJourney(payload: {
  stakeholderType: string;
  journeyKey: string;
  name: string;
  conversionGoal: string;
  narrativeJson: Record<string, unknown>;
  touchpointsJson: unknown[];
}): Promise<StakeholderJourney> {
  const res = await api.post<ApiEnvelope<StakeholderJourney>>(`${BASE}/stakeholder-journeys`, payload);
  return res.data.data;
}

export async function publishStakeholderJourney(id: string): Promise<StakeholderJourney> {
  const res = await api.post<ApiEnvelope<StakeholderJourney>>(`${BASE}/stakeholder-journeys/${id}/publish`);
  return res.data.data;
}

export async function resolvePublicRenderProfile(params: {
  routePath: string;
  audienceType: string;
  brandCode?: string;
}): Promise<PublicRenderProfile> {
  const res = await api.get<ApiEnvelope<PublicRenderProfile>>('/v1/experience/public/render-profile', { params });
  return res.data.data;
}

export async function getExperienceSeedHealth(): Promise<ExperienceSeedHealth> {
  const res = await api.get<ApiEnvelope<ExperienceSeedHealth>>(`${BASE}/seed-health`);
  return res.data.data;
}

export async function listPresentations(): Promise<Presentation[]> {
  const res = await api.get<ApiEnvelope<Presentation[]>>(`${BASE}/presentations`);
  return res.data.data;
}

export async function createPresentation(payload: {
  title: string;
  slug: string;
  audienceType: string;
}): Promise<Presentation> {
  const res = await api.post<ApiEnvelope<Presentation>>(`${BASE}/presentations`, payload);
  return res.data.data;
}

export async function publishPresentation(id: string): Promise<Presentation> {
  const res = await api.post<ApiEnvelope<Presentation>>(`${BASE}/presentations/${id}/publish`);
  return res.data.data;
}

export async function listCampaigns(): Promise<MarketingCampaign[]> {
  const res = await api.get<ApiEnvelope<MarketingCampaign[]>>(`${BASE}/campaigns`);
  return res.data.data;
}

export async function createCampaign(payload: {
  name: string;
  campaignType: string;
  audienceFilter: Record<string, unknown>;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  steps: Array<{ position: number; delayMinutes: number; actionType: string; actionConfig: Record<string, unknown> }>;
}): Promise<MarketingCampaign> {
  const res = await api.post<ApiEnvelope<MarketingCampaign>>(`${BASE}/campaigns`, payload);
  return res.data.data;
}

export async function publishCampaign(id: string): Promise<MarketingCampaign> {
  const res = await api.post<ApiEnvelope<MarketingCampaign>>(`${BASE}/campaigns/${id}/publish`);
  return res.data.data;
}

export async function pauseCampaign(id: string): Promise<MarketingCampaign> {
  const res = await api.post<ApiEnvelope<MarketingCampaign>>(`${BASE}/campaigns/${id}/pause`);
  return res.data.data;
}

export async function listTemplates(): Promise<WebsiteTemplate[]> {
  const res = await api.get<ApiEnvelope<WebsiteTemplate[]>>(`${BASE}/templates`);
  return res.data.data;
}

export async function createTemplate(payload: {
  templateKey: string;
  name: string;
  category: string;
  previewImageUrl?: string;
  tags: string[];
  schemaJson: Record<string, unknown>;
  defaultBrandingJson: Record<string, unknown>;
}): Promise<WebsiteTemplate> {
  const res = await api.post<ApiEnvelope<WebsiteTemplate>>(`${BASE}/templates`, payload);
  return res.data.data;
}

export async function publishTemplate(id: string): Promise<WebsiteTemplate> {
  const res = await api.post<ApiEnvelope<WebsiteTemplate>>(`${BASE}/templates/${id}/publish`);
  return res.data.data;
}

export async function listStoryScenes(): Promise<StoryScene[]> {
  const res = await api.get<ApiEnvelope<StoryScene[]>>(`${BASE}/story-scenes`);
  return res.data.data;
}

export async function createStoryScene(payload: {
  sceneKey: string;
  title: string;
  audienceType: string;
  timelineJson: Record<string, unknown>;
  proofPointsJson: unknown[];
  animationJson: Record<string, unknown>;
}): Promise<StoryScene> {
  const res = await api.post<ApiEnvelope<StoryScene>>(`${BASE}/story-scenes`, payload);
  return res.data.data;
}

export async function publishStoryScene(id: string): Promise<StoryScene> {
  const res = await api.post<ApiEnvelope<StoryScene>>(`${BASE}/story-scenes/${id}/publish`);
  return res.data.data;
}

export async function listTrustModules(): Promise<TrustModule[]> {
  const res = await api.get<ApiEnvelope<TrustModule[]>>(`${BASE}/trust-modules`);
  return res.data.data;
}

export async function createTrustModule(payload: {
  moduleKey: string;
  title: string;
  category: string;
  evidenceJson: Record<string, unknown>;
  metricsJson: Record<string, unknown>;
  displayJson: Record<string, unknown>;
}): Promise<TrustModule> {
  const res = await api.post<ApiEnvelope<TrustModule>>(`${BASE}/trust-modules`, payload);
  return res.data.data;
}

export async function publishTrustModule(id: string): Promise<TrustModule> {
  const res = await api.post<ApiEnvelope<TrustModule>>(`${BASE}/trust-modules/${id}/publish`);
  return res.data.data;
}

// ── Experience Analytics ─────────────────────────────────────────────────────

export type ExperienceAnalytics = {
  totalPageViews: number;
  totalCtaClicks: number;
  totalDemoStarts: number;
  totalInvestorViews: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  periodLabel: string;
};

export async function getExperienceAnalytics(days: number): Promise<ExperienceAnalytics> {
  const res = await api.get<ApiEnvelope<ExperienceAnalytics>>(`${BASE}/analytics`, { params: { days } });
  return res.data.data;
}

// ── AI Content Generation ─────────────────────────────────────────────────────

export type AiContentGenerateRequest = {
  prompt: string;
  contentType: string;
};

export type AiContentGenerateResponse = {
  generatedContent: string;
  tokensUsed: number;
};

export async function generateAiContent(
  blockId: string,
  req: AiContentGenerateRequest,
): Promise<AiContentGenerateResponse> {
  const res = await api.post<ApiEnvelope<AiContentGenerateResponse>>(
    `${BASE}/content-blocks/${blockId}/ai-generate`,
    req,
  );
  return res.data.data;
}
