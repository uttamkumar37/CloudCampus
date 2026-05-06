import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../app/queryKeys'
import {
  downloadBulkErrorReport,
  downloadBulkSampleWorkbook,
  executeBulkOperation,
  fetchBulkJob,
  fetchBulkJobs,
  fetchBulkOperationsMetadata,
  fetchBulkPreview,
  retryBulkJob,
  uploadBulkWorkbook,
  validateBulkUploadFile,
} from '../api/bulkUploadApi'
import type { BulkExecuteRequest } from '../types'

export function useBulkOperationsMetadata() {
  return useQuery({
    queryKey: ['bulk', 'operations'],
    queryFn: fetchBulkOperationsMetadata,
  })
}

export function useBulkValidate() {
  return useMutation({
    mutationFn: ({
      operation,
      file,
      onProgress,
    }: {
      operation: string
      file: File
      onProgress?: (progress: number) => void
    }) => validateBulkUploadFile(operation, file, onProgress),
  })
}

export function useBulkPreview(validationId: string | null) {
  return useQuery({
    queryKey: ['bulk', 'preview', validationId],
    queryFn: () => fetchBulkPreview(validationId ?? ''),
    enabled: Boolean(validationId),
  })
}

export function useBulkExecute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BulkExecuteRequest) => executeBulkOperation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk', 'jobs'] })
      queryClient.invalidateQueries({ queryKey: ['bulk', 'active-job'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.academicClasses })
      queryClient.invalidateQueries({ queryKey: queryKeys.academicSections })
    },
  })
}

export function useBulkJobs() {
  return useQuery({
    queryKey: ['bulk', 'jobs'],
    queryFn: fetchBulkJobs,
  })
}

export function useBulkJob(jobId: string | null) {
  return useQuery({
    queryKey: ['bulk', 'active-job', jobId],
    queryFn: () => fetchBulkJob(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: 2500,
  })
}

export function useRetryBulkJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => retryBulkJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk', 'jobs'] })
      queryClient.invalidateQueries({ queryKey: ['bulk', 'active-job'] })
    },
  })
}

export function useBulkErrorReportDownload() {
  return useMutation({
    mutationFn: (jobId: string) => downloadBulkErrorReport(jobId),
  })
}

export function useBulkUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: number) => void
    }) => uploadBulkWorkbook(file, onProgress),
    onSuccess: () => {
      // Invalidate all caches that bulk upload may have populated
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.academicClasses })
      queryClient.invalidateQueries({ queryKey: queryKeys.academicSections })
    },
  })
}

export function useBulkSampleDownload() {
  return useMutation({
    mutationFn: (operation?: string) => downloadBulkSampleWorkbook(operation),
  })
}
