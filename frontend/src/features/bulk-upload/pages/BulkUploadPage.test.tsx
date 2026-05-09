import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BulkUploadPage } from './BulkUploadPage'

vi.mock('../hooks/useBulkUpload', () => ({
  useBulkOperationsMetadata: () => ({
    isLoading: false,
    data: {
      data: {
        operations: [
          { id: 'students', title: 'Students', description: 'Student imports', acceptedFileTypes: ['.xlsx'], requiredColumns: ['name'] },
          { id: 'teachers', title: 'Teachers', description: 'Teacher imports', acceptedFileTypes: ['.xlsx'], requiredColumns: ['name'] },
        ],
      },
    },
  }),
  useBulkValidate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBulkExecute: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBulkSampleDownload: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBulkJobs: () => ({
    isLoading: false,
    data: {
      data: {
        jobs: [
          { jobId: 'job-1', operation: 'students', startedAt: '2026-05-01T00:00:00Z', status: 'Completed', successCount: 10, failedCount: 0 },
        ],
      },
    },
    refetch: vi.fn(),
  }),
  useRetryBulkJob: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBulkErrorReportDownload: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBulkPreview: () => ({ data: undefined }),
  useBulkJob: () => ({ data: undefined }),
}))

vi.mock('../components/BulkUploadInstructionsModal', () => ({
  BulkUploadInstructionsModal: () => null,
}))

describe('BulkUploadPage', () => {
  it('shows a bulk upload snapshot with operations and job counts', () => {
    render(<BulkUploadPage />)

    expect(screen.getByText('Bulk Upload Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Students workflow ready')).toBeInTheDocument()
    expect(screen.getAllByText('Operations').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Jobs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })
})
