import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface SubscriptionPlan {
  code:                 string;
  displayName:          string;
  priceMonthlyPaise:    number;
  maxStudentsPerSchool: number;
  maxStaffPerSchool:    number;
  maxSchools:           number;
  description:          string;
}

export interface TenantSubscription {
  id:                 string | null;
  tenantId:           string;
  plan:               SubscriptionPlan;
  billingCycle:       'MONTHLY' | 'ANNUAL';
  status:             'ACTIVE' | 'TRIALING' | 'CANCELLED';
  currentPeriodStart: string | null;
  currentPeriodEnd:   string | null;
  assignedAt:         string | null;
  notes:              string | null;
}

export interface AssignPlanRequest {
  planCode:     string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  notes?:       string;
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await axiosInstance.get<ApiResponse<SubscriptionPlan[]>>(
    '/v1/super-admin/subscription-plans',
  );
  return data.data ?? [];
}

export async function getTenantSubscription(tenantId: string): Promise<TenantSubscription> {
  const { data } = await axiosInstance.get<ApiResponse<TenantSubscription>>(
    `/v1/super-admin/tenants/${tenantId}/subscription`,
  );
  return data.data!;
}

export async function assignTenantPlan(
  tenantId: string,
  request: AssignPlanRequest,
): Promise<TenantSubscription> {
  const { data } = await axiosInstance.put<ApiResponse<TenantSubscription>>(
    `/v1/super-admin/tenants/${tenantId}/subscription`,
    request,
  );
  return data.data!;
}
