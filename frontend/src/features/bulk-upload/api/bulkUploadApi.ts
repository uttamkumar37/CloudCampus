import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type {
  BulkExecuteRequest,
  BulkJob,
  BulkJobList,
  BulkOperationsMetadata,
  BulkPreviewResult,
  BulkUploadSummary,
  BulkValidationResult,
} from '../types'

export async function fetchBulkOperationsMetadata() {
  const { data } = await apiClient.get<ApiResponse<BulkOperationsMetadata>>(ENDPOINTS.bulk.operations)
  return data
}

export async function validateBulkUploadFile(
  operation: string,
  file: File,
  onProgress?: (progress: number) => void,
) {
  const formData = new FormData()
  formData.append('operation', operation)
  formData.append('file', file)

  const { data } = await apiClient.post<ApiResponse<BulkValidationResult>>(
    ENDPOINTS.bulk.validate,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!event.total) {
          return
        }

        onProgress?.(Math.round((event.loaded * 100) / event.total))
      },
    },
  )

  return data
}

export async function fetchBulkPreview(validationId: string) {
  const { data } = await apiClient.get<ApiResponse<BulkPreviewResult>>(ENDPOINTS.bulk.preview, {
    params: { validationId },
  })

  return data
}

export async function executeBulkOperation(request: BulkExecuteRequest) {
  const { data } = await apiClient.post<ApiResponse<BulkUploadSummary>>(ENDPOINTS.bulk.execute, request)
  return data
}

export async function fetchBulkJobs() {
  const { data } = await apiClient.get<ApiResponse<BulkJobList>>(ENDPOINTS.bulk.jobs)
  return data
}

export async function fetchBulkJob(jobId: string) {
  const { data } = await apiClient.get<ApiResponse<BulkJob>>(ENDPOINTS.bulk.jobById(jobId))
  return data
}

export async function retryBulkJob(jobId: string) {
  const { data } = await apiClient.post<ApiResponse<BulkJob>>(ENDPOINTS.bulk.retryJob(jobId))
  return data
}

export async function downloadBulkErrorReport(jobId: string) {
  const response = await apiClient.get(ENDPOINTS.bulk.errorReport(jobId), {
    responseType: 'blob',
  })

  return response.data as Blob
}

export async function uploadBulkWorkbook(
  file: File,
  onProgress?: (progress: number) => void,
) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post<ApiResponse<BulkUploadSummary>>(
    ENDPOINTS.bulk.upload,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!event.total) {
          return
        }

        onProgress?.(Math.round((event.loaded * 100) / event.total))
      },
    },
  )

  return data
}

export async function downloadBulkSampleWorkbook(operation?: string) {
  const response = await apiClient.get(ENDPOINTS.bulk.sample(operation), {
    responseType: 'blob',
  })

  return response.data as Blob
}
