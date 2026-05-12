import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type { TenantCreateRequest, TenantResponse } from '../types/tenant';

const BASE = '/v1/super-admin/tenants';

/**
 * List all tenants (paginated).
 * GET /v1/super-admin/tenants?offset=0&limit=20
 */
export async function listTenants(
  offset: number,
  limit: number,
): Promise<PageResponse<TenantResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<TenantResponse>>>(BASE, {
    params: { offset, limit },
  });
  return data.data!;
}

/**
 * Create a new tenant.
 * POST /v1/super-admin/tenants
 */
export async function createTenant(body: TenantCreateRequest): Promise<TenantResponse> {
  const { data } = await axiosInstance.post<ApiResponse<TenantResponse>>(BASE, body);
  return data.data!;
}
