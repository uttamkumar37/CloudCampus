import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface AiUsageSummaryResponse {
  tenantId:              string;
  periodStart:           string;
  tokensThisMonth:       number;
  requestsThisMonth:     number;
  requestsToday:         number;
  monthlyTokenBudget:    number;
  dailyRequestLimit:     number;
  budgetUtilisationPct:  number | null;
}

export interface TenantAiUsage {
  tenantId:             string | null;
  tokens:               number;
  requests:             number;
  failedRequests:       number;
  estimatedCostUsd:     number;
  budgetUtilisationPct: number | null;
}

export interface FeatureAiUsage {
  feature:          string;
  tokens:           number;
  requests:         number;
  failedRequests:   number;
  estimatedCostUsd: number;
}

export interface ModelAiUsage {
  provider:         string;
  model:            string;
  tokens:           number;
  requests:         number;
  failedRequests:   number;
  avgLatencyMs:     number;
  estimatedCostUsd: number;
}

export interface AiUsageAnomaly {
  severity: string;
  tenantId: string | null;
  scope:    string;
  signal:   string;
  detail:   string;
  tokens:   number;
  requests: number;
}

export interface GlobalAiUsageResponse {
  periodStart:           string;
  totalTokensThisMonth:  number;
  totalRequestsThisMonth: number;
  estimatedCostUsd:      number;
  byTenant:              TenantAiUsage[];
  byFeature:             FeatureAiUsage[];
  byModel:               ModelAiUsage[];
  anomalies:             AiUsageAnomaly[];
}

export async function getGlobalAiUsage(): Promise<GlobalAiUsageResponse> {
  const { data } = await axiosInstance.get<ApiResponse<GlobalAiUsageResponse>>(
    '/v1/super-admin/ai/usage',
  );
  return data.data!;
}

export async function getTenantAiUsage(tenantId: string): Promise<AiUsageSummaryResponse> {
  const { data } = await axiosInstance.get<ApiResponse<AiUsageSummaryResponse>>(
    `/v1/super-admin/ai/usage/${tenantId}`,
  );
  return data.data!;
}
