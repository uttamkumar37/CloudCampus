export interface BulkUploadError {
  sheet: string
  row: number
  message: string
}

export interface BulkUploadSummary {
  totalRows: number
  successCount: number
  failedCount: number
  errors: BulkUploadError[]
}
