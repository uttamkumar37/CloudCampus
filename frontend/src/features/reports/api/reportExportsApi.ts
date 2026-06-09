import { httpClient } from '../../../shared/api/httpClient';

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
  return requestReportExportAt('/v1/school-admin/reports/exports', request, accessToken);
}

export async function listReportExports(accessToken: string): Promise<ReportExportResponse[]> {
  return listReportExportsAt('/v1/school-admin/reports/exports', accessToken);
}

export async function downloadReportExport(exportId: string, accessToken: string): Promise<string> {
  return downloadReportExportAt('/v1/school-admin/reports/exports', exportId, accessToken);
}

export async function requestFinanceReportExport(
  request: ReportExportRequest,
  accessToken: string,
): Promise<ReportExportResponse> {
  return requestReportExportAt('/v1/finance/reports/exports', request, accessToken);
}

export async function listFinanceReportExports(accessToken: string): Promise<ReportExportResponse[]> {
  return listReportExportsAt('/v1/finance/reports/exports', accessToken);
}

export async function downloadFinanceReportExport(exportId: string, accessToken: string): Promise<string> {
  return downloadReportExportAt('/v1/finance/reports/exports', exportId, accessToken);
}

function requestReportExportAt(
  path: string,
  request: ReportExportRequest,
  accessToken: string,
): Promise<ReportExportResponse> {
  return httpClient.post<ReportExportResponse>(path, request, { accessToken });
}

function listReportExportsAt(path: string, accessToken: string): Promise<ReportExportResponse[]> {
  return httpClient.get<ReportExportResponse[]>(path, { accessToken });
}

function downloadReportExportAt(path: string, exportId: string, accessToken: string): Promise<string> {
  return httpClient.get<string>(`${path}/${encodeURIComponent(exportId)}/download`, { accessToken });
}
