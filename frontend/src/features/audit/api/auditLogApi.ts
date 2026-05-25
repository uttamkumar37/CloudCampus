import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

export type AuditCategory =
  | 'AUTH'
  | 'TENANT'
  | 'PERMISSION'
  | 'SECURITY'
  | 'CONFIG'
  | 'FINANCE'
  | 'DATA'
  | 'SYSTEM';

export type AuditLogScope = 'school-admin' | 'super-admin';

export interface AuditLogEntry {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  actorUsername: string | null;
  category: AuditCategory;
  eventType: string;
  resourceType: string | null;
  resourceId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  tenantId?: string;
  category?: string;
  eventType?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string;
  to?: string;
}

export interface AuditLogListParams extends AuditLogFilters {
  page: number;
  size: number;
}

const ENDPOINTS: Record<AuditLogScope, string> = {
  'school-admin': '/v1/school-admin/audit-logs',
  'super-admin': '/v1/super-admin/audit-logs',
};

export async function listAuditLogs(
  scope: AuditLogScope,
  params: AuditLogListParams,
): Promise<PageResponse<AuditLogEntry>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<AuditLogEntry>>>(
    ENDPOINTS[scope],
    { params: compactParams(params) },
  );
  return data.data!;
}

function compactParams(params: AuditLogListParams): Record<string, string | number> {
  const compact: Record<string, string | number> = {
    page: params.page,
    size: params.size,
  };

  ([
    'tenantId',
    'category',
    'eventType',
    'actorId',
    'resourceType',
    'resourceId',
    'from',
    'to',
  ] as const).forEach((key) => {
    const value = params[key];
    if (typeof value === 'string' && value.trim()) {
      compact[key] = value.trim();
    }
  });

  return compact;
}
