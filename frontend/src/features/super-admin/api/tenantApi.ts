import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  ComparisonResponse,
  FeatureResponse,
  SuperAdminStatsResponse,
  TenantConfigResponse,
  TenantCreateRequest,
  TenantFeatureResponse,
  TenantResponse,
} from '../types/tenant';

const BASE = '/v1/super-admin/tenants';

export async function listTenants(offset: number, limit: number): Promise<PageResponse<TenantResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<TenantResponse>>>(BASE, {
    params: { offset, limit },
  });
  return data.data!;
}

export async function getTenant(id: string): Promise<TenantResponse> {
  const { data } = await axiosInstance.get<ApiResponse<TenantResponse>>(`${BASE}/${id}`);
  return data.data!;
}

export async function createTenant(body: TenantCreateRequest): Promise<TenantResponse> {
  const { data } = await axiosInstance.post<ApiResponse<TenantResponse>>(BASE, body);
  return data.data!;
}

export async function suspendTenant(id: string): Promise<TenantResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<TenantResponse>>(`${BASE}/${id}/suspend`);
  return data.data!;
}

export async function activateTenant(id: string): Promise<TenantResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<TenantResponse>>(`${BASE}/${id}/activate`);
  return data.data!;
}

export async function getTenantStats(): Promise<SuperAdminStatsResponse> {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminStatsResponse>>(`${BASE}/stats`);
  return data.data!;
}

export async function listAllFeatures(): Promise<FeatureResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<FeatureResponse[]>>('/v1/super-admin/features');
  return data.data ?? [];
}

export async function listTenantFeatures(tenantId: string): Promise<TenantFeatureResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<TenantFeatureResponse[]>>(
    `${BASE}/${tenantId}/features`,
  );
  return data.data ?? [];
}

export async function enableFeature(tenantId: string, featureKey: string): Promise<void> {
  await axiosInstance.post(`${BASE}/${tenantId}/features/${featureKey}/enable`);
}

export async function disableFeature(tenantId: string, featureKey: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${tenantId}/features/${featureKey}`);
}

export async function getTenantConfig(tenantId: string): Promise<TenantConfigResponse> {
  const { data } = await axiosInstance.get<ApiResponse<TenantConfigResponse>>(
    `${BASE}/${tenantId}/config`,
  );
  return data.data!;
}

export async function setTenantConfig(
  tenantId: string,
  key: string,
  value: string,
): Promise<TenantConfigResponse> {
  const { data } = await axiosInstance.put<ApiResponse<TenantConfigResponse>>(
    `${BASE}/${tenantId}/config/${key}`,
    { value },
  );
  return data.data!;
}

export async function getComparisonReport(tenantId: string): Promise<ComparisonResponse> {
  const { data } = await axiosInstance.get<ApiResponse<ComparisonResponse>>(
    `${BASE}/${tenantId}/comparison`,
  );
  return data.data!;
}
