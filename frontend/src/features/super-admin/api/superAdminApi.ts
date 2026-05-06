import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type {
  CreateTenantRequest,
  SuperAdminDashboardSummary,
  Tenant,
  UpdateTenantStatusRequest,
} from '../types'

export async function getSuperAdminDashboardSummary() {
  const { data } = await apiClient.get<ApiResponse<SuperAdminDashboardSummary>>(
    ENDPOINTS.dashboard.superAdminSummary,
  )

  return data
}

export async function getTenants() {
  const { data } = await apiClient.get<ApiResponse<Tenant[]>>(ENDPOINTS.tenants.base)
  return data
}

export async function createTenant(payload: CreateTenantRequest) {
  const { data } = await apiClient.post<ApiResponse<Tenant>>(ENDPOINTS.tenants.base, payload)
  return data
}

export async function updateTenantStatus(tenantId: string, payload: UpdateTenantStatusRequest) {
  const { data } = await apiClient.patch<ApiResponse<Tenant>>(ENDPOINTS.tenants.status(tenantId), payload)
  return data
}
