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
import type { ApiResponse } from '../../../types/api'
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
  paymentMethod: null,
  referenceNo: null,
}

export function FeesHubPage() {
  const [searchId, setSearchId] = useState('')
  const [assignForm, setAssignForm] = useState<AssignFeeRequest>(emptyAssignForm)
  const [payForm, setPayForm] = useState<RecordPaymentRequest>(emptyPayForm)

  const directory = useSchoolDirectory()
  const feeQuery = useFeeAssignments(searchId)
  const assignMutation = useAssignFee()
  const paymentMutation = useRecordPayment()

  const assignments = feeQuery.data?.data ?? []
  const studentLabelById = useMemo(
    () => Object.fromEntries(directory.students.map((student) => [student.id, `${student.firstName} ${student.lastName} (${student.admissionNo})`])),
    [directory.students],
  )
  const feeAssignmentOptions = useMemo(
    () => assignments.map((assignment) => ({ value: assignment.id, label: `${assignment.feeTitle} - ₹${assignment.amount.toLocaleString('en-IN')} - ${assignment.status.replace('_', ' ')}` })),
    [assignments],
  )

  useEffect(() => {
    if (payForm.feeAssignmentId && !assignments.some((assignment) => assignment.id === payForm.feeAssignmentId)) {
      setPayForm((current) => ({ ...current, feeAssignmentId: '' }))
    }
  }, [assignments, payForm.feeAssignmentId])

  const columns: DataTableColumn<FeeAssignment>[] = [
    {
      key: 'studentId',
      header: 'Student',
      cell: (r) => <span className="font-medium text-slate-900">{studentLabelById[r.studentId] ?? 'Unknown student'}</span>,
    },
    { key: 'feeTitle', header: 'Title', cell: (r) => r.feeTitle },
    {
      key: 'amount',
      header: 'Amount',
      cell: (r) => `₹ ${r.amount.toLocaleString('en-IN')}`,
    },
    { key: 'dueDate', header: 'Due Date', cell: (r) => r.dueDate },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>
          {r.status.replace('_', ' ')}
        </span>
      ),
    },
  ]

  const handleAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const res = await assignMutation.mutateAsync({ ...assignForm, amount: Number(assignForm.amount) })
      if (!res.success) {
        showToast({ title: 'Fee not assigned', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Fee assigned', description: `${res.data.feeTitle} — ₹${res.data.amount}`, tone: 'success' })
      setAssignForm(emptyAssignForm)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Fee not assigned', description: axiosError.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  const handlePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const res = await paymentMutation.mutateAsync({
        ...payForm,
        amountPaid: Number(payForm.amountPaid),
        paymentMethod: payForm.paymentMethod?.trim() || null,
        referenceNo: payForm.referenceNo?.trim() || null,
      })
      if (!res.success) {
        showToast({ title: 'Payment not recorded', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Payment recorded', description: `₹${res.data.amountPaid} received`, tone: 'success' })
      setPayForm(emptyPayForm)
      if (searchId) feeQuery.refetch()
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({
        title: 'Payment not recorded',
        description: axiosError.response?.data?.message ?? 'Error',
        tone: 'error',
      })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Fees" subtitle="Assign fees, record payments, and track balances per student." />

      {/* Assign fee form */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handleAssign}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Assign Fee</h2>
            <p className="mt-1 text-sm text-slate-500">Create a fee obligation for a student.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SearchableSelect
              label="Student"
              selectedValue={assignForm.studentId}
              onSelect={(value) => setAssignForm((current) => ({ ...current, studentId: value }))}
              options={directory.studentOptions}
              placeholder="Search by name or admission number"
              emptyMessage="No student matched that search."
              required
            />
            <FormInput
              label="Fee Title"
              value={assignForm.feeTitle}
              onChange={(v) => setAssignForm((f) => ({ ...f, feeTitle: v }))}
              placeholder="Term 1 Tuition Fee"
              required
            />
            <FormInput
              label="Amount (₹)"
              type="number"
              value={String(assignForm.amount || '')}
              onChange={(v) => setAssignForm((f) => ({ ...f, amount: Number(v) }))}
              placeholder="15000"
              required
            />
            <FormInput
              label="Due Date"
              type="date"
              value={assignForm.dueDate}
              onChange={(v) => setAssignForm((f) => ({ ...f, dueDate: v }))}
              required
            />
          </div>
          <div>
            <Button type="submit" disabled={assignMutation.isPending || directory.isLoading}>
              {assignMutation.isPending ? 'Assigning…' : 'Assign Fee'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Record payment form */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handlePayment}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Record Payment</h2>
            <p className="mt-1 text-sm text-slate-500">Log a fee payment against an existing assignment.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SearchableSelect
              label="Fee Assignment"
              selectedValue={payForm.feeAssignmentId}
              onSelect={(value) => setPayForm((current) => ({ ...current, feeAssignmentId: value }))}
              options={feeAssignmentOptions}
              placeholder={searchId ? 'Search fee assignment' : 'Select a student first'}
              emptyMessage="No fee assignment matched that search."
              helperText="Load a student's fee history first to choose the assignment."
              disabled={!searchId}
              required
            />
            <FormInput
              label="Amount Paid (₹)"
              type="number"
              value={String(payForm.amountPaid || '')}
              onChange={(v) => setPayForm((f) => ({ ...f, amountPaid: Number(v) }))}
              placeholder="5000"
              required
            />
            <FormInput
              label="Payment Date"
              type="date"
              value={payForm.paymentDate}
              onChange={(v) => setPayForm((f) => ({ ...f, paymentDate: v }))}
              required
            />
            <FormInput
              label="Payment Method"
              value={payForm.paymentMethod ?? ''}
              onChange={(v) => setPayForm((f) => ({ ...f, paymentMethod: v }))}
              placeholder="CASH / BANK_TRANSFER / CHEQUE"
            />
            <FormInput
              label="Reference No."
              value={payForm.referenceNo ?? ''}
              onChange={(v) => setPayForm((f) => ({ ...f, referenceNo: v }))}
              placeholder="RCP-20260428-001"
            />
          </div>
          <div>
            <Button type="submit" disabled={paymentMutation.isPending || directory.isLoading}>
              {paymentMutation.isPending ? 'Saving…' : 'Record Payment'}
            </Button>
          </div>
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
            <SearchableSelect
              label="Student"
              selectedValue={searchId}
              onSelect={setSearchId}
              options={directory.studentOptions}
              placeholder="Search by name or admission number"
              emptyMessage="No student matched that search."
            />
          </div>
        </div>

        {feeQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : feeQuery.isError ? (
          <EmptyState title="Unable to load fees" description="Fee records could not be fetched for this student." />
        ) : (
          <DataTable
            columns={columns}
            rows={assignments}
            rowKey={(r) => r.id}
            emptyText={searchId ? 'No fee assignments for this student.' : 'Search for a student above to load fee history.'}
          />
        )}
      </div>
    </section>
  )
}
