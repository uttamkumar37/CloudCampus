import { httpClient } from '../../../shared/api/httpClient';

export type TenantReportMetrics = {
  totalStudents: number;
  activeStudents: number;
  totalFeeDemands: number;
  amountDue: number;
  amountPaid: number;
  outstandingAmount: number;
};

export type TenantReportSchoolSummary = {
  schoolId: string;
  code: string;
  name: string;
  primarySchool: boolean;
  active: boolean;
  metrics: TenantReportMetrics;
};

export type TenantReportSummary = {
  tenantId: string;
  tenantName: string;
  schoolId: string | null;
  schoolName: string | null;
  totalSchools: number;
  activeSchools: number;
  totals: TenantReportMetrics;
  schools: TenantReportSchoolSummary[];
};

export async function getTenantReportSummary(accessToken: string): Promise<TenantReportSummary> {
  return httpClient.get<TenantReportSummary>('/v1/tenant-admin/reports/summary', { accessToken });
}

export async function getTenantSchoolReportSummary(
  schoolId: string,
  accessToken: string,
): Promise<TenantReportSummary> {
  return httpClient.get<TenantReportSummary>(`/v1/tenant-admin/reports/schools/${encodeURIComponent(schoolId)}/summary`, { accessToken });
}
