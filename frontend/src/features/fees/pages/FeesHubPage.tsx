import { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FormInput } from '../../../components/ui/FormInput'
import { PageHeader } from '../../../components/ui/PageHeader'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useSchoolDirectory } from '../../academic/hooks/useSchoolDirectory'
import { useStudentDashboard } from '../../dashboard/hooks/useStudentDashboard'
import { useMyChildren } from '../../parent/hooks/useMyChildren'
import type { ApiResponse } from '../../../types/api'
import { storage } from '../../../utils/storage'
import { showToast } from '../../../utils/toast'

import { useAssignFee, useFeeAssignments, useRecordPayment } from '../hooks/useFees'
import type { AssignFeeRequest, FeeAssignment, FeeStatus, RecordPaymentRequest } from '../types'

const STATUS_BADGE: Record<FeeStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700',
}

const emptyAssignForm: AssignFeeRequest = { studentId: '', feeTitle: '', amount: 0, dueDate: '' }
const emptyPayForm: RecordPaymentRequest = {
  feeAssignmentId: '',
  amountPaid: 0,
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: '',
  referenceNo: null,
}

// ─── Admin / Teacher view ─────────────────────────────────────────────────────

function AdminFeesView() {
  const [searchId, setSearchId] = useState('')
  const [assignForm, setAssignForm] = useState<AssignFeeRequest>(emptyAssignForm)
  const [payForm, setPayForm] = useState<RecordPaymentRequest>(emptyPayForm)
  const [recentReceipts, setRecentReceipts] = useState<Array<{
    id: string
    feeTitle: string
    studentLabel: string
    amountPaid: number
    paymentDate: string
    paymentMethod: string | null
    referenceNo: string | null
    createdAt: string
  }>>([])

  const directory = useSchoolDirectory()
  const feeQuery = useFeeAssignments(searchId)
  const assignMutation = useAssignFee()
  const paymentMutation = useRecordPayment()

  const assignments = feeQuery.data?.data ?? []
  const studentLabelById = useMemo(
    () => Object.fromEntries(directory.students.map((s) => [s.id, `${s.firstName} ${s.lastName} (${s.admissionNo})`])),
    [directory.students],
  )
  const feeAssignmentOptions = useMemo(
    () => assignments.map((a) => ({ value: a.id, label: `${a.feeTitle} — ₹${a.amount.toLocaleString('en-IN')} — ${a.status.replace('_', ' ')}` })),
    [assignments],
  )

  const totalDue = assignments.reduce((sum, item) => sum + (item.dueAmount ?? 0), 0)
  const totalPaid = assignments.reduce((sum, item) => sum + (item.paidAmount ?? 0), 0)
  const pendingCount = assignments.filter((item) => item.status === 'PENDING' || item.status === 'PARTIALLY_PAID').length
  const overdueCount = assignments.filter((item) => item.status === 'OVERDUE').length
  const snapshotReady = searchId.length > 0 && assignments.length > 0

  useEffect(() => {
    if (!searchId && directory.studentOptions.length > 0) {
      setSearchId(directory.studentOptions[0].value)
    }
  }, [directory.studentOptions, searchId])

  useEffect(() => {
    if (payForm.feeAssignmentId && !assignments.some((a) => a.id === payForm.feeAssignmentId)) {
      setPayForm((p) => ({ ...p, feeAssignmentId: '' }))
    }
  }, [assignments, payForm.feeAssignmentId])

  const columns: DataTableColumn<FeeAssignment>[] = [
    { key: 'studentId', header: 'Student', cell: (r) => <span className="font-medium text-slate-900">{studentLabelById[r.studentId] ?? 'Unknown student'}</span> },
    { key: 'feeTitle', header: 'Title', cell: (r) => r.feeTitle },
    { key: 'amount', header: 'Amount', cell: (r) => `₹ ${r.amount.toLocaleString('en-IN')}` },
    { key: 'paidAmount', header: 'Paid', cell: (r) => <span className="text-emerald-700">₹ {r.paidAmount.toLocaleString('en-IN')}</span> },
    { key: 'dueAmount', header: 'Due', cell: (r) => <span className={r.dueAmount > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}>₹ {r.dueAmount.toLocaleString('en-IN')}</span> },
    { key: 'dueDate', header: 'Due Date', cell: (r) => r.dueDate },
    { key: 'status', header: 'Status', cell: (r) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>{r.status.replace('_', ' ')}</span> },
  ]

  const handleAssign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const res = await assignMutation.mutateAsync({ ...assignForm, amount: Number(assignForm.amount) })
      if (!res.success) { showToast({ title: 'Fee not assigned', description: res.message, tone: 'error' }); return }
      showToast({ title: 'Fee assigned', description: `${res.data.feeTitle} — ₹${res.data.amount}`, tone: 'success' })
      setAssignForm(emptyAssignForm)
    } catch (err) {
      const e = err as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Fee not assigned', description: e.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const matchedAssignment = assignments.find((a) => a.id === payForm.feeAssignmentId)
    const matchedStudent = matchedAssignment ? studentLabelById[matchedAssignment.studentId] ?? 'Unknown student' : 'Unknown student'
    try {
      const res = await paymentMutation.mutateAsync({ ...payForm, amountPaid: Number(payForm.amountPaid), paymentMethod: payForm.paymentMethod.trim(), referenceNo: payForm.referenceNo?.trim() || null })
      if (!res.success) { showToast({ title: 'Payment not recorded', description: res.message, tone: 'error' }); return }
      showToast({ title: 'Payment recorded', description: `₹${res.data.amountPaid} received`, tone: 'success' })
      setRecentReceipts((current) => [
        {
          id: res.data.id,
          feeTitle: matchedAssignment?.feeTitle ?? 'Fee payment',
          studentLabel: matchedStudent,
          amountPaid: res.data.amountPaid,
          paymentDate: res.data.paymentDate,
          paymentMethod: res.data.paymentMethod,
          referenceNo: res.data.referenceNo,
          createdAt: res.data.createdAt,
        },
        ...current,
      ].slice(0, 5))
      setPayForm(emptyPayForm)
      if (searchId) feeQuery.refetch()
    } catch (err) {
      const e = err as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Payment not recorded', description: e.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  const handleExportReceipts = async () => {
    if (recentReceipts.length === 0) {
      showToast({ title: 'No receipts to export', description: 'Record a payment first.', tone: 'error' })
      return
    }

    const csvRows = [
      ['Receipt ID', 'Fee Title', 'Student', 'Amount Paid', 'Payment Date', 'Payment Method', 'Reference No.', 'Created At'],
      ...recentReceipts.map((receipt) => [
        receipt.id,
        receipt.feeTitle,
        receipt.studentLabel,
        String(receipt.amountPaid),
        receipt.paymentDate,
        receipt.paymentMethod ?? '',
        receipt.referenceNo ?? '',
        receipt.createdAt,
      ]),
    ]
    const csvText = csvRows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    try {
      await navigator.clipboard.writeText(csvText)
      showToast({ title: 'Receipts exported', description: 'Receipt summary copied as CSV text.', tone: 'success' })
    } catch {
      showToast({ title: 'Export failed', description: 'Copy the receipt summary manually.', tone: 'error' })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Fees" subtitle="Assign fees, record payments, and track balances per student." />

      {snapshotReady && (
        <Card className="p-0">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-950">Fee Health Snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">Quick visibility into what is due, paid, pending, and overdue for the selected student.</p>
          </div>
          <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryChip label="Total Due" value={`₹ ${totalDue.toLocaleString('en-IN')}`} color={totalDue > 0 ? 'amber' : 'emerald'} />
            <SummaryChip label="Total Paid" value={`₹ ${totalPaid.toLocaleString('en-IN')}`} color="emerald" />
            <SummaryChip label="Pending Items" value={pendingCount} color={pendingCount > 0 ? 'amber' : 'slate'} />
            <SummaryChip label="Overdue Items" value={overdueCount} color={overdueCount > 0 ? 'rose' : 'slate'} />
          </div>
        </Card>
      )}

      {/* Fee default risk alerts */}
      {snapshotReady && overdueCount > 0 && (() => {
        const overdueItems = assignments.filter((a) => a.status === 'OVERDUE')
        const studentLabel = studentLabelById[overdueItems[0]?.studentId ?? ''] ?? 'This student'
        return (
          <Card className="p-0 border-rose-200">
            <div className="border-b border-rose-100 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-200 text-sm font-bold text-rose-700">!</span>
                <div>
                  <h2 className="text-base font-semibold text-rose-900">Fee Default Risk Alert</h2>
                  <p className="text-sm text-rose-700">{studentLabel} has {overdueCount} overdue fee item{overdueCount !== 1 ? 's' : ''} requiring immediate action.</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {overdueItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.feeTitle}</p>
                    <p className="text-xs text-slate-500">Due {item.dueDate} · Outstanding ₹ {item.dueAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">OVERDUE</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-6 py-3">
              <p className="text-xs text-slate-400">Contact the guardian to collect payment or apply a concession. Overdue fees block certificate issuance.</p>
            </div>
          </Card>
        )
      })()}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Collection Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Live payment desk readiness across selected student, fee assignments, and receipt flow.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryChip label="Student" value={searchId ? 'Set' : 'Open'} color={searchId ? 'emerald' : 'slate'} />
            <SummaryChip label="Assignments" value={assignments.length} color="slate" />
            <SummaryChip label="Receipts" value={recentReceipts.length} color="emerald" />
            <SummaryChip label="Desk" value={paymentMutation.isPending ? 'Busy' : 'Ready'} color="amber" />
          </div>
        </div>
      </Card>

      {/* Assign fee */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handleAssign}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Assign Fee</h2>
            <p className="mt-1 text-sm text-slate-500">Create a fee obligation for a student.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SearchableSelect label="Student" selectedValue={assignForm.studentId} onSelect={(v) => setAssignForm((p) => ({ ...p, studentId: v }))} options={directory.studentOptions} placeholder="Search by name or admission number" emptyMessage="No student matched." required />
            <FormInput label="Fee Title" value={assignForm.feeTitle} onChange={(v) => setAssignForm((p) => ({ ...p, feeTitle: v }))} placeholder="Term 1 Tuition Fee" required />
            <FormInput label="Amount (₹)" type="number" value={String(assignForm.amount || '')} onChange={(v) => setAssignForm((p) => ({ ...p, amount: Number(v) }))} placeholder="15000" required />
            <FormInput label="Due Date" type="date" value={assignForm.dueDate} onChange={(v) => setAssignForm((p) => ({ ...p, dueDate: v }))} required />
          </div>
          <div><Button type="submit" disabled={assignMutation.isPending || directory.isLoading}>{assignMutation.isPending ? 'Assigning…' : 'Assign Fee'}</Button></div>
        </form>
      </Card>

      {/* Record payment */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handlePayment}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Record Payment</h2>
            <p className="mt-1 text-sm text-slate-500">Log a fee payment against an existing assignment.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SearchableSelect label="Fee Assignment" selectedValue={payForm.feeAssignmentId} onSelect={(v) => setPayForm((p) => ({ ...p, feeAssignmentId: v }))} options={feeAssignmentOptions} placeholder={searchId ? 'Search fee assignment' : 'Select a student first'} emptyMessage="No fee assignment matched." helperText="Load a student's fee history first to choose the assignment." disabled={!searchId} required />
            <FormInput label="Amount Paid (₹)" type="number" value={String(payForm.amountPaid || '')} onChange={(v) => setPayForm((p) => ({ ...p, amountPaid: Number(v) }))} placeholder="5000" required />
            <FormInput label="Payment Date" type="date" value={payForm.paymentDate} onChange={(v) => setPayForm((p) => ({ ...p, paymentDate: v }))} required />
            <FormInput label="Payment Method" value={payForm.paymentMethod ?? ''} onChange={(v) => setPayForm((p) => ({ ...p, paymentMethod: v }))} placeholder="CASH / BANK_TRANSFER / CHEQUE" />
            <FormInput label="Reference No." value={payForm.referenceNo ?? ''} onChange={(v) => setPayForm((p) => ({ ...p, referenceNo: v }))} placeholder="RCP-20260428-001" />
          </div>
          <div><Button type="submit" disabled={paymentMutation.isPending || directory.isLoading}>{paymentMutation.isPending ? 'Saving…' : 'Record Payment'}</Button></div>
        </form>
      </Card>

      {recentReceipts.length > 0 && (
        <Card className="p-0">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Recent Receipts</h2>
                <p className="mt-1 text-sm text-slate-500">Latest payment confirmations captured from the fee desk.</p>
              </div>
              <Button type="button" onClick={handleExportReceipts}>
                Export Receipts CSV
              </Button>
            </div>
          </div>
          <div className="grid gap-3 px-6 py-5">
            {recentReceipts.map((receipt) => (
              <div key={receipt.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{receipt.feeTitle}</p>
                    <p className="text-sm text-slate-500">{receipt.studentLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">₹ {receipt.amountPaid.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">{receipt.paymentDate}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Method: {receipt.paymentMethod ?? '—'}</span>
                  <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Ref: {receipt.referenceNo ?? '—'}</span>
                  <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Created: {receipt.createdAt.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fee history lookup */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-950">Fee History</h2>
            <p className="mt-1 text-sm text-slate-500">Search a student to view all fee assignments.</p>
          </div>
          <div className="w-full max-w-md">
            <SearchableSelect label="Student" selectedValue={searchId} onSelect={setSearchId} options={directory.studentOptions} placeholder="Search by name or admission number" emptyMessage="No student matched." />
          </div>
        </div>
        {feeQuery.isLoading ? (
          <div className="grid gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        ) : feeQuery.isError ? (
          <EmptyState title="Unable to load fees" description="Fee records could not be fetched for this student." />
        ) : (
          <DataTable columns={columns} rows={assignments} rowKey={(r) => r.id} emptyText={searchId ? 'No fee assignments for this student.' : 'Search for a student above to load fee history.'} />
        )}
      </div>
    </section>
  )
}

// ─── Student view ─────────────────────────────────────────────────────────────

function StudentFeesView() {
  const dashboardQuery = useStudentDashboard()
  const studentId = dashboardQuery.data?.data?.profile?.id ?? ''
  const studentName = dashboardQuery.data?.data?.profile
    ? `${dashboardQuery.data.data.profile.firstName} ${dashboardQuery.data.data.profile.lastName}`
    : ''

  const feeQuery = useFeeAssignments(studentId)
  const assignments = feeQuery.data?.data ?? []

  const columns: DataTableColumn<FeeAssignment>[] = [
    { key: 'feeTitle', header: 'Fee', cell: (r) => <span className="font-medium text-slate-900">{r.feeTitle}</span> },
    { key: 'amount', header: 'Total', cell: (r) => `₹ ${r.amount.toLocaleString('en-IN')}` },
    { key: 'paidAmount', header: 'Paid', cell: (r) => <span className="text-emerald-700">₹ {r.paidAmount.toLocaleString('en-IN')}</span> },
    { key: 'dueAmount', header: 'Due', cell: (r) => <span className={r.dueAmount > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}>₹ {r.dueAmount.toLocaleString('en-IN')}</span> },
    { key: 'dueDate', header: 'Due Date', cell: (r) => r.dueDate },
    { key: 'status', header: 'Status', cell: (r) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>{r.status.replace('_', ' ')}</span> },
  ]

  if (dashboardQuery.isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader title="My Fees" subtitle="Your fee obligations and payment status." />
        <div className="grid gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
      </section>
    )
  }

  const pending = assignments.filter((a) => a.status === 'PENDING' || a.status === 'PARTIALLY_PAID')
  const overdue = assignments.filter((a) => a.status === 'OVERDUE')
  const totalDue = assignments.reduce((sum, a) => sum + (a.dueAmount ?? 0), 0)

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Fees"
        subtitle={studentName ? `Fee statement for ${studentName}` : 'Your fee obligations and payment status.'}
      />

      {/* Summary chips */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryChip label="Total Fees" value={assignments.length} color="slate" />
          <SummaryChip label="Amount Due" value={`₹ ${totalDue.toLocaleString('en-IN')}`} color={totalDue > 0 ? 'amber' : 'emerald'} />
          <SummaryChip label="Pending" value={pending.length} color={pending.length > 0 ? 'amber' : 'slate'} />
          <SummaryChip label="Overdue" value={overdue.length} color={overdue.length > 0 ? 'rose' : 'slate'} />
        </div>
      )}

      {/* Fee table — student name fixed, no search */}
      <Card className="p-0">
        <div className="px-6 pt-5 pb-3 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
            {studentName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{studentName || '—'}</p>
            <p className="text-xs text-slate-400">Your fee history</p>
          </div>
        </div>
        <div className="p-4">
          {feeQuery.isLoading ? (
            <div className="grid gap-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
          ) : feeQuery.isError ? (
            <EmptyState title="Unable to load fees" description="Please try again later." />
          ) : (
            <DataTable columns={columns} rows={assignments} rowKey={(r) => r.id} emptyText="No fee assignments yet. Contact your school admin." />
          )}
        </div>
      </Card>
    </section>
  )
}

// ─── Parent view ──────────────────────────────────────────────────────────────

function ParentFeesView() {
  const childrenQuery = useMyChildren()
  const children = childrenQuery.data?.data ?? []

  const [selectedChildId, setSelectedChildId] = useState('')

  // Auto-select first child when data loads
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].studentId)
    }
  }, [children, selectedChildId])

  const selectedChild = children.find((c) => c.studentId === selectedChildId)
  const feeQuery = useFeeAssignments(selectedChildId)
  const assignments = feeQuery.data?.data ?? []

  const columns: DataTableColumn<FeeAssignment>[] = [
    { key: 'feeTitle', header: 'Fee', cell: (r) => <span className="font-medium text-slate-900">{r.feeTitle}</span> },
    { key: 'amount', header: 'Total', cell: (r) => `₹ ${r.amount.toLocaleString('en-IN')}` },
    { key: 'paidAmount', header: 'Paid', cell: (r) => <span className="text-emerald-700">₹ {r.paidAmount.toLocaleString('en-IN')}</span> },
    { key: 'dueAmount', header: 'Due', cell: (r) => <span className={r.dueAmount > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}>₹ {r.dueAmount.toLocaleString('en-IN')}</span> },
    { key: 'dueDate', header: 'Due Date', cell: (r) => r.dueDate },
    { key: 'status', header: 'Status', cell: (r) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>{r.status.replace('_', ' ')}</span> },
  ]

  if (childrenQuery.isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader title="Fee Statement" subtitle="View fee status for your linked children." />
        <div className="grid gap-3"><Skeleton className="h-16" /><Skeleton className="h-20" /></div>
      </section>
    )
  }

  if (children.length === 0) {
    return (
      <section className="space-y-6">
        <PageHeader title="Fee Statement" subtitle="View fee status for your linked children." />
        <EmptyState title="No linked students" description="Contact your school administrator to link students to your parent account." />
      </section>
    )
  }

  const pending = assignments.filter((a) => a.status === 'PENDING' || a.status === 'PARTIALLY_PAID')
  const overdue = assignments.filter((a) => a.status === 'OVERDUE')
  const totalDue = assignments.reduce((sum, a) => sum + (a.dueAmount ?? 0), 0)

  return (
    <section className="space-y-6">
      <PageHeader title="Fee Statement" subtitle="View fee status for your linked children." />

      {/* Child selector — only linked children shown */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-600">Select child</p>
        <div className="flex flex-wrap gap-2">
          {children.map((child) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedChildId(child.studentId)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedChildId === child.studentId
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {child.firstName} {child.lastName}
              <span className="ml-1.5 text-xs opacity-60">({child.admissionNo})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary chips for selected child */}
      {selectedChild && assignments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryChip label="Total Fees" value={assignments.length} color="slate" />
          <SummaryChip label="Amount Due" value={`₹ ${totalDue.toLocaleString('en-IN')}`} color={totalDue > 0 ? 'amber' : 'emerald'} />
          <SummaryChip label="Pending" value={pending.length} color={pending.length > 0 ? 'amber' : 'slate'} />
          <SummaryChip label="Overdue" value={overdue.length} color={overdue.length > 0 ? 'rose' : 'slate'} />
        </div>
      )}

      {/* Fee table for selected child */}
      {selectedChild && (
        <Card className="p-0">
          <div className="px-6 pt-5 pb-3 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
              {selectedChild.firstName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{selectedChild.firstName} {selectedChild.lastName}</p>
              <p className="text-xs text-slate-400">Admission No: {selectedChild.admissionNo}</p>
            </div>
            {overdue.length > 0 && (
              <span className="ml-auto inline-flex rounded-full bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1">
                {overdue.length} overdue
              </span>
            )}
          </div>
          <div className="p-4">
            {feeQuery.isLoading ? (
              <div className="grid gap-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
            ) : feeQuery.isError ? (
              <EmptyState title="Unable to load fees" description="Please try again later." />
            ) : (
              <DataTable columns={columns} rows={assignments} rowKey={(r) => r.id} emptyText="No fee assignments for this student yet." />
            )}
          </div>
        </Card>
      )}

      {/* Scholarship & Concession Rules */}
      <ScholarshipPanel />
    </section>
  )
}

// ─── Scholarship & Concession panel ──────────────────────────────────────────

type ConcessionType = 'SCHOLARSHIP' | 'SIBLING' | 'STAFF_WARD' | 'MERIT' | 'NEED_BASED'

interface ConcessionRule {
  id: string
  studentName: string
  type: ConcessionType
  discountPercent: number
  reason: string
  approvedBy: string
  appliedOn: string
}

const CONCESSION_STYLE: Record<ConcessionType, string> = {
  SCHOLARSHIP: 'bg-violet-100 text-violet-700',
  SIBLING: 'bg-sky-100 text-sky-700',
  STAFF_WARD: 'bg-emerald-100 text-emerald-700',
  MERIT: 'bg-amber-100 text-amber-700',
  NEED_BASED: 'bg-rose-100 text-rose-700',
}

function ScholarshipPanel() {
  const [rules, setRules] = useState<ConcessionRule[]>([])
  const [form, setForm] = useState({ studentName: '', type: 'SCHOLARSHIP' as ConcessionType, discountPercent: 10, reason: '', approvedBy: '' })

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.reason.trim() || !form.approvedBy.trim()) return
    setRules((prev) => [...prev, { id: crypto.randomUUID(), ...form, appliedOn: new Date().toISOString().slice(0, 10) }])
    setForm((p) => ({ ...p, studentName: '', reason: '', approvedBy: '' }))
  }

  return (
    <Card className="p-0">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-950">Scholarship & Concession Rules</h2>
        <p className="mt-1 text-sm text-slate-500">Apply fee discounts with approval — scholarships, sibling concessions, merit awards, and need-based relief.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryChip label="Total Rules" value={rules.length} color="slate" />
          <SummaryChip label="Avg Discount" value={rules.length > 0 ? `${Math.round(rules.reduce((s, r) => s + r.discountPercent, 0) / rules.length)}%` : '—'} color="emerald" />
          <SummaryChip label="Max Discount" value={rules.length > 0 ? `${Math.max(...rules.map((r) => r.discountPercent))}%` : '—'} color="amber" />
          <SummaryChip label="Categories" value={new Set(rules.map((r) => r.type)).size} color="slate" />
        </div>
      </div>

      <div className="p-6 space-y-3">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleAdd}>
          <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ConcessionType }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
            <option value="SCHOLARSHIP">Scholarship</option>
            <option value="MERIT">Merit Award</option>
            <option value="NEED_BASED">Need Based</option>
            <option value="SIBLING">Sibling Concession</option>
            <option value="STAFF_WARD">Staff Ward</option>
          </select>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
            <input type="number" min={1} max={100} value={form.discountPercent} onChange={(e) => setForm((p) => ({ ...p, discountPercent: Number(e.target.value) }))} className="w-16 text-sm font-bold focus:outline-none" />
            <span className="text-sm text-slate-500">% discount</span>
          </div>
          <input type="text" placeholder="Approved by (name / designation)" value={form.approvedBy} onChange={(e) => setForm((p) => ({ ...p, approvedBy: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <div className="sm:col-span-2">
            <input type="text" placeholder="Reason / basis for concession" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add Concession Rule</button>
          </div>
        </form>

        {rules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">No concession rules yet. Add the first scholarship or discount above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{rule.studentName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CONCESSION_STYLE[rule.type]}`}>{rule.type.replace('_', ' ')}</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{rule.discountPercent}% off</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{rule.reason} · Approved by {rule.approvedBy}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Applied {rule.appliedOn}</p>
                </div>
                <button type="button" onClick={() => setRules((prev) => prev.filter((r) => r.id !== rule.id))} className="text-xs text-slate-400 hover:text-rose-500 transition">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Shared summary chip ──────────────────────────────────────────────────────

function SummaryChip({ label, value, color }: { label: string; value: string | number; color: 'slate' | 'amber' | 'rose' | 'emerald' }) {
  const colors = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[color]}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  )
}

// ─── Entry point — role switch ────────────────────────────────────────────────

export function FeesHubPage() {
  const role = storage.getRole()

  if (role === 'STUDENT') return <StudentFeesView />
  if (role === 'PARENT') return <ParentFeesView />
  return <AdminFeesView />
}
