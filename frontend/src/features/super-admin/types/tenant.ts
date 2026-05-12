/** Mirrors com.cloudcampus.tenant.entity.TenantStatus */
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

/** Mirrors com.cloudcampus.tenant.dto.TenantResponse */
export interface TenantResponse {
  id: string;
  code: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors com.cloudcampus.tenant.dto.TenantCreateRequest */
export interface TenantCreateRequest {
  /** Lowercase alphanumeric + hyphens, 2–64 chars, cannot start/end with hyphen. */
  code: string;
  /** 2–200 chars. */
  name: string;
}
