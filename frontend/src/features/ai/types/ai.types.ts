import type { UserRole } from "../../auth/auth.types";

export type RouteKey =
  | "dashboard"
  | "recommendations"
  | "notice"
  | "homework"
  | "lessonPlan"
  | "quiz"
  | "reportSummary"
  | "settings"
  | "audit";

export type AiQuickAction = {
  label: string;
  prompt: string;
  endpoint?: string;
};

export type AiAssistantResponse = {
  feature?: string;
  role?: string;
  tenantId?: string;
  schoolId?: string | null;
  answer?: string;
  highlights?: string[];
  recommendedActions?: string[];
  quickActions?: AiQuickAction[];
  disclaimer?: string;
  usageAuditId?: string;
  provider?: string;
  model?: string;
};

export type AiAssistantQueryRequest = {
  prompt: string;
  module?: string;
  tone?: string;
  language?: string;
};

export type AiNoticeGenerationRequest = {
  topic: string;
  audience?: string;
  channel?: string;
  tone?: string;
  language?: string;
  details?: string;
};

export type AiHomeworkGenerationRequest = {
  className: string;
  section?: string;
  subject: string;
  chapter: string;
  difficulty?: string;
  studentLevel?: string;
  instructions?: string;
};

export type AiLessonPlanGenerationRequest = AiHomeworkGenerationRequest & {
  boardType?: string;
  durationMinutes?: number;
};

export type AiQuizGenerationRequest = {
  className: string;
  section?: string;
  subject: string;
  chapter: string;
  difficulty?: string;
  questionCount?: number;
  instructions?: string;
};

export type AiReportSummaryRequest = {
  reportType: string;
  reportScope?: string;
  reportText: string;
  tone?: string;
  language?: string;
};

export type AiRoleCapability = {
  role: UserRole | string;
  features: string[];
  quickActions: AiQuickAction[];
};

export type AiPortalSettings = {
  tenantId?: string;
  schoolId?: string | null;
  enabled: boolean;
  monthlyUnitBudget: number;
  unitsUsedThisMonth: number;
  remainingUnitsThisMonth: number;
  enabledFeatures: string[];
  humanApprovalRequired: boolean;
  retentionDays: number;
  capabilities: AiRoleCapability[];
};

export type AiPortalAuditLog = {
  id: string;
  tenantId?: string;
  schoolId?: string | null;
  userId?: string;
  role?: string;
  feature?: string;
  scopeType?: string;
  scopeId?: string;
  requestType?: string;
  promptSha256?: string;
  promptLength?: number;
  estimatedUnits?: number;
  estimatedCostCents?: number;
  status?: string;
  denialReason?: string | null;
  createdAt?: string;
};

export type AiRecommendation = {
  recommendationId: string;
  tenantId?: string;
  schoolId?: string | null;
  targetType?: string;
  targetId?: string;
  recommendationType?: string;
  title: string;
  summary?: string;
  rationale?: string;
  confidenceScore?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  status?: string;
  approvalRequired?: boolean;
  metadataJson?: string;
  createdAt?: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  response?: AiAssistantResponse;
};

export type RecommendationAction = "accept" | "approve" | "dismiss" | "execute" | "reject" | "viewed";
