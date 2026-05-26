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
  const response = await fetch('/v1/tenant-admin/reports/summary', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Tenant report summary lookup failed.');
  }

  return response.json() as Promise<TenantReportSummary>;
}

export async function getTenantSchoolReportSummary(
  schoolId: string,
  accessToken: string,
): Promise<TenantReportSummary> {
  const response = await fetch(`/v1/tenant-admin/reports/schools/${schoolId}/summary`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Tenant school report summary lookup failed.');
  }

  return response.json() as Promise<TenantReportSummary>;
}
