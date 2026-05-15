import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface TenantAnalyticsSummary {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  tenantStatus: string;
  activeStudents: number;
  activeStaff: number;
  activeSchools: number;
  totalFeeDue: number;
  totalFeePaid: number;
  feeCollectionRate: number;
}

export interface PlatformAnalyticsResponse {
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  totalStaff: number;
  totalSchools: number;
  totalFeeDue: number;
  totalFeePaid: number;
  feeCollectionRate: number;
  tenants: TenantAnalyticsSummary[];
}

export async function getPlatformAnalytics(): Promise<PlatformAnalyticsResponse> {
  const { data } = await axiosInstance.get<ApiResponse<PlatformAnalyticsResponse>>(
    '/v1/super-admin/analytics',
  );
  return data.data!;
}
