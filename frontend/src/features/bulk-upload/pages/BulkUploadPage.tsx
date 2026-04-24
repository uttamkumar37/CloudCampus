import { AxiosError } from 'axios'
import { useRef, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { showToast } from '../../../utils/toast'
import type { ApiResponse } from '../../../types/api'

import { BulkUploadInstructionsModal } from '../components/BulkUploadInstructionsModal'
import { BulkUploadResultCard } from '../components/BulkUploadResultCard'
import { useBulkSampleDownload, useBulkUpload } from '../hooks/useBulkUpload'
import type { BulkUploadSummary } from '../types'

export function BulkUploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<BulkUploadSummary | null>(null)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)

  const uploadMutation = useBulkUpload()
  const sampleMutation = useBulkSampleDownload()

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      showToast({
        title: 'Unsupported file type',
        description: 'Please upload an .xlsx workbook.',
        tone: 'error',
      })
      return
    }

    setSelectedFile(file)
    setResult(null)
    setProgress(0)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast({
        title: 'No file selected',
        description: 'Choose a workbook before starting the upload.',
        tone: 'error',
      })
      return
    }

    try {
      const response = await uploadMutation.mutateAsync({
        file: selectedFile,
        onProgress: setProgress,
      })

      setResult(response.data)
      showToast({
        title: 'Bulk upload completed',
        description:
          response.data.failedCount === 0
            ? 'All rows were uploaded successfully.'
            : `${response.data.failedCount} rows need correction.`,
        tone: response.data.failedCount === 0 ? 'success' : 'info',
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({
        title: 'Bulk upload failed',
        description: axiosError.response?.data?.message ?? 'Unable to process workbook.',
        tone: 'error',
      })
    }
  }

  const handleSampleDownload = async () => {
    try {
      const blob = await sampleMutation.mutateAsync()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'campuscloud-bulk-upload-sample.xlsx'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      showToast({
        title: 'Sample download failed',
        description: 'Unable to download the sample workbook right now.',
        tone: 'error',
      })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Bulk Upload"
        subtitle="Onboard students, teachers, classes, and sections in one structured Excel upload."
      />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Upload Workbook</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload a single `.xlsx` file up to 5MB with the required four sheets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleSampleDownload} disabled={sampleMutation.isPending}>
              {sampleMutation.isPending ? 'Preparing Sample...' : 'Download Sample Excel'}
            </Button>
            <Button variant="ghost" onClick={() => setIsInstructionsOpen(true)}>
              ℹ️ Instructions
            </Button>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            handleFileSelection(event.dataTransfer.files?.[0] ?? null)
          }}
          className={`mt-6 rounded-[28px] border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? 'border-slate-950 bg-slate-100'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
          />
          <p className="text-base font-semibold text-slate-950">
            {selectedFile ? selectedFile.name : 'Drag and drop your Excel workbook here'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Or click to browse for a file with sheets: STUDENTS, TEACHERS, CLASSES, SECTIONS.
          </p>
        </div>

        {uploadMutation.isPending ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Uploading workbook...</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-slate-950 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleUpload} disabled={!selectedFile || uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Excel'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedFile(null)
              setResult(null)
              setProgress(0)
            }}
            disabled={uploadMutation.isPending}
          >
            Reset
          </Button>
        </div>
      </Card>

      {result ? (
        <BulkUploadResultCard summary={result} />
      ) : (
        <EmptyState
          title="No upload summary yet"
          description="Upload a workbook to see row-level validation results and success counts."
        />
      )}

      <BulkUploadInstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </section>
  )
}
