import type { UserRole } from '../../auth/api/authApi';
import { httpClient } from '../../../shared/api/httpClient';

export type DashboardSummary = {
  metrics?: Array<{
    label: string;
    value: string | number;
    detail?: string;
  }>;
  alerts?: Array<{
    title: string;
    detail?: string;
  }>;
  activity?: Array<{
    title: string;
    detail?: string;
    occurredAt?: string;
  }>;
};

const DASHBOARD_SUMMARY_ENDPOINTS: Record<UserRole, string> = {
  SUPER_ADMIN: '/v1/super-admin/dashboard/summary',
  TENANT_ADMIN: '/v1/tenant-admin/dashboard/summary',
  SCHOOL_ADMIN: '/v1/school-admin/dashboard/summary',
  TEACHER: '/v1/teacher/dashboard/summary',
  FINANCE_STAFF: '/v1/finance/dashboard/summary',
  STAFF: '/v1/staff/dashboard/summary',
  PARENT: '/v1/parent/dashboard/summary',
  STUDENT: '/v1/student/dashboard/summary',
};

export function getDashboardSummary(role: UserRole, accessToken?: string | null) {
  return httpClient.get<DashboardSummary>(DASHBOARD_SUMMARY_ENDPOINTS[role], { accessToken });
}
