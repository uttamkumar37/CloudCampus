import { useMutation } from '@tanstack/react-query'

import { downloadBulkSampleWorkbook, uploadBulkWorkbook } from '../api/bulkUploadApi'

export function useBulkUpload() {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: number) => void
    }) => uploadBulkWorkbook(file, onProgress),
  })
}

export function useBulkSampleDownload() {
  return useMutation({
    mutationFn: downloadBulkSampleWorkbook,
  })
}
