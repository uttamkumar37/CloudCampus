export type ReportType = 'STUDENT_DIRECTORY' | 'FEE_DEMANDS';

export type ReportExportFormat = 'CSV';

export type ReportExportStatus =
  | 'QUEUED'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type ReportExportRequest = {
  reportType: ReportType;
  format: ReportExportFormat;
};

export type ReportExportResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  requestedByUserId: string;
  bulkJobId: string;
  reportType: ReportType;
  format: ReportExportFormat;
  status: ReportExportStatus;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  checksumSha256: string | null;
  requestedAt: string;
  completedAt: string | null;
};

export async function requestReportExport(
  request: ReportExportRequest,
  accessToken: string,
): Promise<ReportExportResponse> {
  const response = await fetch('/v1/school-admin/reports/exports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Report export request failed.');
  }

  return response.json() as Promise<ReportExportResponse>;
}

export async function listReportExports(accessToken: string): Promise<ReportExportResponse[]> {
  const response = await fetch('/v1/school-admin/reports/exports', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Report export lookup failed.');
  }

  return response.json() as Promise<ReportExportResponse[]>;
}

export async function downloadReportExport(exportId: string, accessToken: string): Promise<string> {
  const response = await fetch(`/v1/school-admin/reports/exports/${exportId}/download`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Report export download failed.');
  }

  return response.text();
}
