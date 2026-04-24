import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type { BulkUploadSummary } from '../types'

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

export async function downloadBulkSampleWorkbook() {
  const response = await apiClient.get(ENDPOINTS.bulk.sample, {
    responseType: 'blob',
  })

  return response.data as Blob
}
