import { httpClient } from '../../../shared/api/httpClient';

export type BulkJobStatus =
  | 'QUEUED'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type BulkJobCreateRequest = {
  jobType: string;
  totalRecords: number;
  inputFileReference?: string;
  metadata?: Record<string, unknown>;
};

export type BulkJobResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  jobType: string;
  requestedByUserId: string;
  status: BulkJobStatus;
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  inputFileReference?: string;
  errorFileReference?: string;
  lastError?: string;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  updatedAt: string;
};

export async function createBulkJob(
  request: BulkJobCreateRequest,
  accessToken: string,
): Promise<BulkJobResponse> {
  return httpClient.post<BulkJobResponse>('/v1/school-admin/bulk-jobs', request, { accessToken });
}

export async function listBulkJobs(accessToken: string): Promise<BulkJobResponse[]> {
  return httpClient.get<BulkJobResponse[]>('/v1/school-admin/bulk-jobs', { accessToken });
}

export async function cancelBulkJob(bulkJobId: string, accessToken: string): Promise<BulkJobResponse> {
  return httpClient.post<BulkJobResponse>(`/v1/school-admin/bulk-jobs/${encodeURIComponent(bulkJobId)}/cancel`, undefined, { accessToken });
}
