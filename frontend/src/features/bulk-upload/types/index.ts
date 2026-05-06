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

export type BulkOperationId =
  | 'students'
  | 'teachers'
  | 'academic'
  | 'timetable'
  | 'attendance'
  | 'parents'
  | 'master'

export interface BulkOperationDefinition {
  id: BulkOperationId
  title: string
  description: string
  acceptedFileTypes: string[]
  requiredColumns: string[]
}

export interface BulkOperationsMetadata {
  operations: BulkOperationDefinition[]
}

export type BulkValidationStatus = 'error' | 'warning' | 'ready'

export interface BulkValidationRow {
  rowNumber: number
  values: Record<string, string>
  status: BulkValidationStatus
  issue: string
}

export interface BulkValidationResult {
  validationId: string
  operation: BulkOperationId
  columns: string[]
  autoMapping: Record<string, string>
  errorCount: number
  warningCount: number
  readyCount: number
  rows: BulkValidationRow[]
}

export interface BulkPreviewResult {
  validationId: string
  operation: BulkOperationId
  newRecords: number
  updatedRecords: number
  skippedRecords: number
  validationNotes: string[]
}

export interface BulkExecuteRequest {
  validationId: string
  autoCreateParentAccounts: boolean
  sendCredentials: boolean
  forcePasswordReset: boolean
}

export type BulkJobStatus = 'Completed' | 'Partial' | 'Failed'

export interface BulkJob {
  jobId: string
  operation: string
  startedAt: string
  status: BulkJobStatus
  successCount: number
  failedCount: number
}

export interface BulkJobList {
  jobs: BulkJob[]
}
