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
  const response = await fetch('/v1/school-admin/bulk-jobs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Bulk job creation failed.');
  }

  return response.json() as Promise<BulkJobResponse>;
}

export async function listBulkJobs(accessToken: string): Promise<BulkJobResponse[]> {
  const response = await fetch('/v1/school-admin/bulk-jobs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Bulk job loading failed.');
  }

  return response.json() as Promise<BulkJobResponse[]>;
}

export async function cancelBulkJob(bulkJobId: string, accessToken: string): Promise<BulkJobResponse> {
  const response = await fetch(`/v1/school-admin/bulk-jobs/${bulkJobId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Bulk job cancellation failed.');
  }

  return response.json() as Promise<BulkJobResponse>;
}
