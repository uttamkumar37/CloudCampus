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
    try {
      const res = await paymentMutation.mutateAsync({ ...payForm, amountPaid: Number(payForm.amountPaid), paymentMethod: payForm.paymentMethod.trim(), referenceNo: payForm.referenceNo?.trim() || null })
      if (!res.success) { showToast({ title: 'Payment not recorded', description: res.message, tone: 'error' }); return }
      showToast({ title: 'Payment recorded', description: `₹${res.data.amountPaid} received`, tone: 'success' })
      setPayForm(emptyPayForm)
      if (searchId) feeQuery.refetch()
    } catch (err) {
      const e = err as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Payment not recorded', description: e.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Fees" subtitle="Assign fees, record payments, and track balances per student." />

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
    </section>
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
