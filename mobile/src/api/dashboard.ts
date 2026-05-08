import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { TenantDashboardSummary } from '../types/dashboard';

export async function getTenantDashboardSummary(): Promise<TenantDashboardSummary> {
  const { data } = await apiClient.get<ApiResponse<TenantDashboardSummary>>(
    '/dashboard/tenant-summary',
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
