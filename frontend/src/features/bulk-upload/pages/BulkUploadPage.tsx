import { AxiosError } from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { showToast } from '../../../utils/toast'
import type { ApiResponse } from '../../../types/api'

import { BulkUploadInstructionsModal } from '../components/BulkUploadInstructionsModal'
import {
  useBulkErrorReportDownload,
  useBulkExecute,
  useBulkJob,
  useBulkJobs,
  useBulkOperationsMetadata,
  useBulkPreview,
  useBulkSampleDownload,
  useBulkValidate,
  useRetryBulkJob,
} from '../hooks/useBulkUpload'
import type { BulkOperationId, BulkUploadSummary, BulkValidationResult } from '../types'

const wizardSteps = [
  'Upload File',
  'Data Validation',
  'Field Mapping',
  'Preview Changes',
  'Confirm and Execute',
]

const iconMap: Record<string, string> = {
  students: 'ST',
  teachers: 'TC',
  academic: 'AC',
  timetable: 'TT',
  attendance: 'AT',
  parents: 'PR',
  master: 'MS',
}

export function BulkUploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const operationsQuery = useBulkOperationsMetadata()
  const validateMutation = useBulkValidate()
  const executeMutation = useBulkExecute()
  const sampleMutation = useBulkSampleDownload()
  const jobsQuery = useBulkJobs()
  const retryMutation = useRetryBulkJob()
  const errorReportMutation = useBulkErrorReportDownload()

  const operations = operationsQuery.data?.data.operations ?? []
  const defaultOperation = operations[0]?.id ?? 'students'

  const [selectedOperation, setSelectedOperation] = useState<BulkOperationId>('students')
  const [activeStep, setActiveStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<BulkUploadSummary | null>(null)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const [autoCreateParents, setAutoCreateParents] = useState(true)
  const [sendCredentials, setSendCredentials] = useState(true)
  const [forceResetPassword, setForceResetPassword] = useState(true)
  const [validationResult, setValidationResult] = useState<BulkValidationResult | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  const previewQuery = useBulkPreview(validationResult?.validationId ?? null)
  const activeJobQuery = useBulkJob(activeJobId)

  const selectedOperationCard = operations.find((card) => card.id === selectedOperation)
  const validationRows = validationResult?.rows ?? []
  const validationColumns = validationResult?.columns ?? selectedOperationCard?.requiredColumns ?? []
  const validationStats = {
    errors: validationResult?.errorCount ?? 0,
    warnings: validationResult?.warningCount ?? 0,
    ready: validationResult?.readyCount ?? 0,
  }
  const previewData = previewQuery.data?.data
  const totalRecords =
    (previewData?.newRecords ?? 0) + (previewData?.updatedRecords ?? 0) + (previewData?.skippedRecords ?? 0)

  useEffect(() => {
    if (operations.length > 0 && !operations.some((item) => item.id === selectedOperation)) {
      setSelectedOperation(defaultOperation)
    }
  }, [defaultOperation, operations, selectedOperation])

  useEffect(() => {
    if (!validationResult) {
      return
    }

    setColumnMapping(validationResult.autoMapping)
  }, [validationResult])

  const latestJob = useMemo(() => jobsQuery.data?.data.jobs[0] ?? null, [jobsQuery.data])

  useEffect(() => {
    if (latestJob && !activeJobId) {
      setActiveJobId(latestJob.jobId)
    }
  }, [activeJobId, latestJob])

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      return
    }

    const supported = selectedOperationCard?.acceptedFileTypes ?? ['.xlsx', '.xls', '.csv']
    const lowerName = file.name.toLowerCase()
    const isSupported = supported.some((extension) => lowerName.endsWith(extension))

    if (!isSupported) {
      showToast({
        title: 'Unsupported file type',
        description: `Please upload one of: ${supported.join(', ')}`,
        tone: 'error',
      })
      return
    }

    setSelectedFile(file)
    setResult(null)
    setValidationResult(null)
    setActiveStep(2)
    setProgress(0)

    validateMutation
      .mutateAsync({
        operation: selectedOperation,
        file,
        onProgress: setProgress,
      })
      .then((response) => {
        setValidationResult(response.data)
        setColumnMapping(response.data.autoMapping)
        showToast({
          title: 'Validation completed',
          description: 'Data validation and mapping suggestions are ready.',
          tone: 'success',
        })
      })
      .catch((error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        showToast({
          title: 'Validation failed',
          description: axiosError.response?.data?.message ?? 'Unable to validate uploaded file.',
          tone: 'error',
        })
      })
  }

  const handleUpload = async () => {
    if (!validationResult) {
      showToast({
        title: 'Validation required',
        description: 'Upload and validate a file before execution.',
        tone: 'error',
      })
      return
    }

    try {
      const response = await executeMutation.mutateAsync({
        validationId: validationResult.validationId,
        autoCreateParentAccounts: autoCreateParents,
        sendCredentials,
        forcePasswordReset: forceResetPassword,
      })

      setResult(response.data)
      setActiveStep(5)
      const refreshed = await jobsQuery.refetch()
      const firstJob = refreshed.data?.data.jobs[0]
      if (firstJob) {
        setActiveJobId(firstJob.jobId)
      }

      showToast({
        title: 'Bulk operation completed',
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
      const blob = await sampleMutation.mutateAsync(selectedOperation ?? undefined)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cloudcampus-${selectedOperation}-sample.xlsx`
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
        title="Bulk Operations"
        subtitle="Enterprise control center for guided, no-code bulk updates across your entire school data."
      />

      <Card className="overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-900 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Bulk Operations Center</p>
            <h2 className="mt-2 text-2xl font-semibold">Unified Data Workbench</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-200">
              Manage students, teachers, academics, timetable, attendance, and parent links with validated uploads,
              preview checks, and safe execution controls.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Pending Jobs</p>
              <p className="mt-2 text-2xl font-semibold">{jobsQuery.data?.data.jobs.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Success Rate</p>
              <p className="mt-2 text-2xl font-semibold">
                {jobsQuery.data?.data.jobs.length ? 'Live' : '--'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="cc-fade-up">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Select Operation</h2>
          <p className="text-sm text-slate-500">Choose a workflow to start upload and validation.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {operations.map((item) => {
            const isSelected = selectedOperation === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedOperation(item.id)
                  setActiveStep(1)
                  setSelectedFile(null)
                  setResult(null)
                  setProgress(0)
                }}
                className={`rounded-3xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50 shadow-[0_18px_40px_-24px_rgba(8,145,178,0.45)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${
                      isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {iconMap[item.id] ?? 'OP'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" className="px-3 py-2 text-xs" onClick={(event) => event.stopPropagation()}>
                    Upload File
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-2 text-xs"
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleSampleDownload()
                    }}
                  >
                    Download Sample Template
                  </Button>
                </div>
              </button>
            )
          })}
          {operationsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading operations...</p>
          ) : null}

          {operationsQuery.isError ? (
            <p className="text-sm text-rose-600">Unable to load operation metadata from server.</p>
          ) : null}
        </div>
      </Card>

      <Card className="cc-fade-up cc-delay-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Guided Workflow</h2>
            <p className="text-sm text-slate-500">{selectedOperationCard?.title ?? 'Bulk operation'}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
            Step {activeStep} of {wizardSteps.length}
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-5">
          {wizardSteps.map((step, index) => {
            const stepNumber = index + 1
            const isCurrent = stepNumber === activeStep
            const isComplete = stepNumber < activeStep

            return (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(stepNumber)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  isCurrent
                    ? 'border-cyan-500 bg-cyan-50'
                    : isComplete
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step {stepNumber}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{step}</p>
              </button>
            )
          })}
        </div>

        {activeStep === 1 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Upload CSV or Excel file and review file details before validation starts.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSampleDownload} disabled={sampleMutation.isPending}>
                  {sampleMutation.isPending ? 'Preparing...' : 'Download Sample Template'}
                </Button>
                <Button variant="ghost" onClick={() => setIsInstructionsOpen(true)}>
                  View Instructions
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
              className={`rounded-[28px] border-2 border-dashed p-8 text-center transition ${
                isDragging ? 'border-cyan-600 bg-cyan-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
              />
              <p className="text-base font-semibold text-slate-900">
                {selectedFile ? selectedFile.name : 'Drag and drop your data file here'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Supported formats: {(selectedOperationCard?.acceptedFileTypes ?? ['.csv', '.xls', '.xlsx']).join(', ')}
                {' '} (max 5MB).
              </p>
            </div>

            {selectedFile ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">File Preview</p>
                <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <p>Name: {selectedFile.name}</p>
                  <p>Type: {selectedFile.type || 'Unknown'}</p>
                  <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : null}

            {validateMutation.isPending ? (
              <p className="text-sm text-slate-500">Running server-side validation...</p>
            ) : null}
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Errors</p>
                <p className="mt-1 text-2xl font-semibold text-rose-800">{validationStats.errors}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Warnings</p>
                <p className="mt-1 text-2xl font-semibold text-amber-800">{validationStats.warnings}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Ready</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">{validationStats.ready}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    {validationColumns.map((column) => (
                      <th key={column} className="px-3 py-3 text-left font-semibold">{column}</th>
                    ))}
                    <th className="px-3 py-3 text-left font-semibold">Status</th>
                    <th className="px-3 py-3 text-left font-semibold">Issue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {validationRows.map((row) => {
                    const statusClass =
                      row.status === 'error'
                        ? 'bg-rose-100 text-rose-700'
                        : row.status === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'

                    return (
                      <tr key={`${row.rowNumber}-${row.issue}`}>
                        {validationColumns.map((column) => (
                          <td key={column} className="px-3 py-2">{row.values[column] || '--'}</td>
                        ))}
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.issue}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Auto-mapped columns are preselected. Adjust mapping before execution.</p>
            <div className="space-y-3">
              {Object.entries(columnMapping).map(([targetField, mappedColumn]) => (
                <div
                  key={targetField}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
                >
                  <p className="text-sm font-semibold text-slate-900">{targetField}</p>
                  <select
                    value={mappedColumn}
                    onChange={(event) =>
                      setColumnMapping((previous) => ({
                        ...previous,
                        [targetField]: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
                  >
                    {validationColumns.map((column) => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                    <option>Ignore Column</option>
                  </select>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Auto mapped
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeStep === 4 ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">New Records</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-800">{previewData?.newRecords ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Updated Records</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-800">{previewData?.updatedRecords ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Skipped Records</p>
                <p className="mt-2 text-2xl font-semibold text-amber-800">{previewData?.skippedRecords ?? 0}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Timetable and conflict validation preview</h3>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Day</th>
                      <th className="px-3 py-2 text-left">09:00-10:00</th>
                      <th className="px-3 py-2 text-left">10:00-11:00</th>
                      <th className="px-3 py-2 text-left">11:00-12:00</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="px-3 py-2 font-semibold">Mon</td>
                      <td className="px-3 py-2">Math - Class 8A</td>
                      <td className="px-3 py-2">Science - Class 8A</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                          Conflict: Teacher overlap
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="px-3 py-2 font-semibold">Tue</td>
                      <td className="px-3 py-2">English - Class 8B</td>
                      <td className="px-3 py-2">History - Class 8B</td>
                      <td className="px-3 py-2">Sports - Class 8B</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {previewData?.validationNotes.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Preview Notes</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {previewData.validationNotes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeStep === 5 ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Records</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{totalRecords}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Ready To Process</p>
                <p className="mt-2 text-xl font-semibold text-emerald-800">{previewData?.newRecords ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Needs Attention</p>
                <p className="mt-2 text-xl font-semibold text-amber-800">{validationStats.errors + validationStats.warnings}</p>
              </div>
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Estimated Time</p>
                <p className="mt-2 text-xl font-semibold text-cyan-800">2 mins</p>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={autoCreateParents}
                  onChange={(event) => setAutoCreateParents(event.target.checked)}
                />
                Auto-create parent accounts
              </label>
              <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={sendCredentials}
                  onChange={(event) => setSendCredentials(event.target.checked)}
                />
                Send credentials via Email or SMS
              </label>
              <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={forceResetPassword}
                  onChange={(event) => setForceResetPassword(event.target.checked)}
                />
                Force password reset on first login
              </label>
            </div>

            {executeMutation.isPending ? (
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-cyan-800">
                  <span>Running bulk operation...</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-cyan-100">
                  <div className="h-3 rounded-full bg-cyan-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleUpload} disabled={!validationResult || executeMutation.isPending}>
                {executeMutation.isPending ? 'Running...' : 'Run Bulk Operation'}
              </Button>
              <Button variant="secondary" onClick={() => setActiveStep(1)}>
                Back to Upload
              </Button>
            </div>

            {result ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Execution Summary</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{result.totalRows}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Success</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-800">{result.successCount}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Failed</p>
                    <p className="mt-1 text-xl font-semibold text-rose-800">{result.failedCount}</p>
                  </div>
                </div>
                {result.errors.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {result.errors.slice(0, 4).map((error, index) => (
                      <div
                        key={`${error.sheet}-${error.row}-${index}`}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm"
                      >
                        {error.sheet}, row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={() => setActiveStep((previous) => Math.max(previous - 1, 1))}>
            Previous Step
          </Button>
          <Button onClick={() => setActiveStep((previous) => Math.min(previous + 1, wizardSteps.length))}>
            Next Step
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedFile(null)
              setResult(null)
              setProgress(0)
              setActiveStep(1)
              setValidationResult(null)
            }}
          >
            Reset Workflow
          </Button>
        </div>
      </Card>

      <Card className="cc-fade-up cc-delay-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Bulk Job History</h2>
          <Button
            variant="secondary"
            disabled={!activeJobId || errorReportMutation.isPending}
            onClick={async () => {
              if (!activeJobId) {
                return
              }

              try {
                const blob = await errorReportMutation.mutateAsync(activeJobId)
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${activeJobId}-errors.csv`
                link.click()
                window.URL.revokeObjectURL(url)
              } catch {
                showToast({
                  title: 'Download failed',
                  description: 'Unable to download error report right now.',
                  tone: 'error',
                })
              }
            }}
          >
            {errorReportMutation.isPending ? 'Preparing...' : 'Download Error Reports'}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Job ID</th>
                <th className="px-3 py-3 text-left font-semibold">Operation</th>
                <th className="px-3 py-3 text-left font-semibold">Started</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Success</th>
                <th className="px-3 py-3 text-left font-semibold">Failed</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(jobsQuery.data?.data.jobs.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No bulk jobs yet. Execute your first operation to build history.
                  </td>
                </tr>
              ) : (
                (jobsQuery.data?.data.jobs ?? []).map((job) => {
                  const statusClass =
                    job.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : job.status === 'Partial'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'

                  return (
                    <tr key={job.jobId}>
                      <td className="px-3 py-3 font-semibold text-slate-900">{job.jobId}</td>
                      <td className="px-3 py-3 text-slate-700">{job.operation}</td>
                      <td className="px-3 py-3 text-slate-600">{job.startedAt}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-emerald-700">{job.successCount}</td>
                      <td className="px-3 py-3 text-rose-700">{job.failedCount}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            className="px-3 py-2 text-xs"
                            onClick={async () => {
                              try {
                                const response = await retryMutation.mutateAsync(job.jobId)
                                setActiveJobId(response.data.jobId)
                                await jobsQuery.refetch()
                                showToast({
                                  title: 'Retry scheduled',
                                  description: `${job.jobId} failed records are being retried.`,
                                  tone: 'info',
                                })
                              } catch {
                                showToast({
                                  title: 'Retry failed',
                                  description: 'Unable to retry this job right now.',
                                  tone: 'error',
                                })
                              }
                            }}
                          >
                            Retry Failed
                          </Button>
                          <Button
                            variant="ghost"
                            className="px-3 py-2 text-xs"
                            onClick={async () => {
                              try {
                                const blob = await errorReportMutation.mutateAsync(job.jobId)
                                const url = window.URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `${job.jobId}-errors.csv`
                                link.click()
                                window.URL.revokeObjectURL(url)
                              } catch {
                                showToast({
                                  title: 'Download failed',
                                  description: 'Unable to download error report right now.',
                                  tone: 'error',
                                })
                              }
                            }}
                          >
                            Error Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="cc-fade-up cc-delay-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Live Job Monitor</h2>
          <Button
            variant="ghost"
            onClick={async () => {
              const refreshed = await jobsQuery.refetch()
              const firstJob = refreshed.data?.data.jobs[0]
              if (firstJob) {
                setActiveJobId(firstJob.jobId)
              }
            }}
          >
            Refresh Jobs
          </Button>
        </div>

        {activeJobQuery.data?.data ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Job ID</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{activeJobQuery.data.data.jobId}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{activeJobQuery.data.data.status}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Success</p>
              <p className="mt-2 text-sm font-semibold text-emerald-800">{activeJobQuery.data.data.successCount}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Failed</p>
              <p className="mt-2 text-sm font-semibold text-rose-800">{activeJobQuery.data.data.failedCount}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No active job selected for polling.</p>
        )}
      </Card>

      {!selectedFile && !validateMutation.isPending ? (
        <EmptyState
          title="No file selected"
          description="Pick an operation card and upload a CSV/Excel file to begin guided bulk processing."
        />
      ) : null}

      <BulkUploadInstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </section>
  )
}
