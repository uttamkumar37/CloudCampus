import { apiRequest } from "../../../lib/http";
import type {
  AiAssistantQueryRequest,
  AiAssistantResponse,
  AiHomeworkGenerationRequest,
  AiLessonPlanGenerationRequest,
  AiNoticeGenerationRequest,
  AiPortalAuditLog,
  AiPortalSettings,
  AiQuizGenerationRequest,
  AiRecommendation,
  AiReportSummaryRequest,
  PageResponse,
  RecommendationAction
} from "../types/ai.types";

export function assistantQuery(token: string, request: AiAssistantQueryRequest, signal?: AbortSignal) {
  return apiRequest<AiAssistantResponse>("/v1/ai/assistant/query", {
    method: "POST",
    token,
    body: request,
    signal
  });
}

export function generateNotice(token: string, request: AiNoticeGenerationRequest) {
  return apiRequest<AiAssistantResponse>("/v1/ai/generate/notice", {
    method: "POST",
    token,
    body: request
  });
}

export function generateHomework(token: string, request: AiHomeworkGenerationRequest) {
  return apiRequest<AiAssistantResponse>("/v1/ai/generate/homework", {
    method: "POST",
    token,
    body: request
  });
}

export function generateLessonPlan(token: string, request: AiLessonPlanGenerationRequest) {
  return apiRequest<AiAssistantResponse>("/v1/ai/generate/lesson-plan", {
    method: "POST",
    token,
    body: request
  });
}

export function generateQuiz(token: string, request: AiQuizGenerationRequest) {
  return apiRequest<AiAssistantResponse>("/v1/ai/generate/quiz", {
    method: "POST",
    token,
    body: request
  });
}

export function summarizeReport(token: string, request: AiReportSummaryRequest) {
  return apiRequest<AiAssistantResponse>("/v1/ai/reports/summary", {
    method: "POST",
    token,
    body: request
  });
}

export function getAiSettings(token: string) {
  return apiRequest<AiPortalSettings>("/v1/ai/settings", { token });
}

export function getAiAuditLogs(token: string, page = 0, size = 25) {
  return apiRequest<PageResponse<AiPortalAuditLog>>(`/v1/ai/audit-logs?page=${page}&size=${size}`, { token });
}

export function getRecommendations(token: string, page = 0, size = 25) {
  return apiRequest<PageResponse<AiRecommendation>>(`/v1/ai/recommendations?page=${page}&size=${size}`, { token });
}

export function getRecommendation(token: string, recommendationId: string) {
  return apiRequest<AiRecommendation>(`/v1/ai/recommendations/${recommendationId}`, { token });
}

export function updateRecommendation(token: string, recommendationId: string, action: RecommendationAction) {
  if (action === "viewed") {
    return getRecommendation(token, recommendationId);
  }
  if (action === "reject") {
    return apiRequest<AiRecommendation>(`/v1/ai/recommendations/${recommendationId}/reject`, {
      method: "POST",
      token,
      body: { reason: "Rejected from CloudCampus AI frontend." }
    });
  }
  return apiRequest<AiRecommendation>(`/v1/ai/recommendations/${recommendationId}/${action}`, {
    method: "POST",
    token
  });
}
