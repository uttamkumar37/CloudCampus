import { AxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { FormInput } from '../../../components/ui/FormInput'
import { FormSelect } from '../../../components/ui/FormSelect'
import { Modal } from '../../../components/ui/Modal'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'
import { useAuth } from '../../auth/hooks/useAuth'

import { useCreateStudent } from '../hooks/useCreateStudent'
import { useDeleteStudent } from '../hooks/useDeleteStudent'
import { useStudents } from '../hooks/useStudents'
import { useUpdateStudent } from '../hooks/useUpdateStudent'
import type { CreateStudentRequest, Gender, Student, StudentStatus } from '../types'

// ─── helpers ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  '#1E3A8A', '#065F46', '#92400E', '#7C3AED',
  '#0E7490', '#9F1239', '#166534', '#1D4ED8',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

const STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ALUMNI: 'Alumni',
  DEBARRED: 'Debarred',
  TC_ISSUED: 'TC Issued',
}

const STATUS_CLASSES: Record<StudentStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  ALUMNI: 'bg-blue-100 text-blue-700',
  DEBARRED: 'bg-rose-100 text-rose-700',
  TC_ISSUED: 'bg-amber-100 text-amber-700',
}

type Tab = 'ALL' | StudentStatus

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'ALUMNI', label: 'Alumni' },
  { key: 'DEBARRED', label: 'Debarred' },
  { key: 'TC_ISSUED', label: 'TC Issued' },
]

const GENDER_OPTIONS: Array<{ value: Gender | ''; label: string }> = [
  { value: '', label: 'All Genders' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

const STATUS_OPTIONS: Array<{ value: StudentStatus | ''; label: string }> = [
  { value: '', label: 'Select status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'DEBARRED', label: 'Debarred' },
  { value: 'TC_ISSUED', label: 'TC Issued' },
]

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

// ─── create modal ────────────────────────────────────────────────────────────

function CreateStudentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const createMutation = useCreateStudent()
  const [values, setValues] = useState<CreateStudentRequest>({
    admissionNo: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    email: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setValues({ admissionNo: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', email: '', phone: '' })
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await createMutation.mutateAsync({
        ...values,
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
      })
      if (!res.success) {
        setError(res.message || 'Unable to create student')
        return
      }
      showToast({ title: 'Student created', description: `${res.data.firstName} ${res.data.lastName} enrolled.`, tone: 'success' })
      handleClose()
    } catch (err) {
      const ae = err as AxiosError<ApiResponse<unknown>>
      setError(ae.response?.data?.message || 'Unable to create student')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Student" description="Enrol a new student into the school.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Admission No" value={values.admissionNo} onChange={(v) => setValues((p) => ({ ...p, admissionNo: v }))} placeholder="ADM-1001" required />
          <FormInput label="Date of Birth" type="date" value={values.dateOfBirth} onChange={(v) => setValues((p) => ({ ...p, dateOfBirth: v }))} required />
          <FormInput label="First Name" value={values.firstName} onChange={(v) => setValues((p) => ({ ...p, firstName: v }))} required />
          <FormInput label="Last Name" value={values.lastName} onChange={(v) => setValues((p) => ({ ...p, lastName: v }))} required />
          <FormSelect
            label="Gender"
            value={values.gender}
            onChange={(v) => setValues((p) => ({ ...p, gender: (v as Gender) || 'MALE' }))}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
            required
          />
          <FormInput label="Phone" value={values.phone ?? ''} onChange={(v) => setValues((p) => ({ ...p, phone: v }))} placeholder="+91-XXXXXXXXXX" />
          <div className="sm:col-span-2">
            <FormInput label="Email" type="email" value={values.email ?? ''} onChange={(v) => setValues((p) => ({ ...p, email: v }))} placeholder="student@example.com" />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={handleClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Enrolling...' : 'Enrol Student'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── edit modal ──────────────────────────────────────────────────────────────

function EditStudentModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const updateMutation = useUpdateStudent()
  const [values, setValues] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email ?? '',
    phone: student.phone ?? '',
    status: student.status,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateMutation.mutateAsync({
        id: student.id,
        payload: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email.trim() || null,
          phone: values.phone.trim() || null,
          status: values.status,
        },
      })
      showToast({ title: 'Student updated', description: `${values.firstName} ${values.lastName} has been updated.`, tone: 'success' })
      onClose()
    } catch (err) {
      const ae = err as AxiosError<ApiResponse<unknown>>
      setError(ae.response?.data?.message || 'Unable to update student')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Edit Student" description={`Editing ${student.firstName} ${student.lastName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="First Name" value={values.firstName} onChange={(v) => setValues((p) => ({ ...p, firstName: v }))} required />
          <FormInput label="Last Name" value={values.lastName} onChange={(v) => setValues((p) => ({ ...p, lastName: v }))} required />
          <FormInput label="Phone" value={values.phone} onChange={(v) => setValues((p) => ({ ...p, phone: v }))} placeholder="+91-XXXXXXXXXX" />
          <FormInput label="Email" type="email" value={values.email} onChange={(v) => setValues((p) => ({ ...p, email: v }))} placeholder="student@example.com" />
          <div className="sm:col-span-2">
            <FormSelect
              label="Status"
              value={values.status}
              onChange={(v) => setValues((p) => ({ ...p, status: (v as StudentStatus) || 'ACTIVE' }))}
              options={STATUS_OPTIONS.filter((o) => o.value !== '')}
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export function StudentsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'

  const [page, setPage] = useState(0)
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('ALL')
  const [genderFilter, setGenderFilter] = useState<Gender | ''>('')

  const [showCreate, setShowCreate] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingName, setDeletingName] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteMutation = useDeleteStudent()

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(rawSearch)
      setPage(0)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [rawSearch])

  // Reset page when filters change
  useEffect(() => { setPage(0) }, [activeTab, genderFilter])

  const statusParam = activeTab === 'ALL' ? undefined : activeTab

  const studentsQuery = useStudents({ page, size: 20, search: search || undefined, status: statusParam })
  const allStudents = studentsQuery.data?.data.content ?? []
  const pageInfo = studentsQuery.data?.data
  const activeCount = allStudents.filter((s) => s.status === 'ACTIVE').length
  const alumniCount = allStudents.filter((s) => s.status === 'ALUMNI').length

  // Client-side gender filter on loaded page
  const students = genderFilter ? allStudents.filter((s) => s.gender === genderFilter) : allStudents

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteMutation.mutateAsync(pendingDeleteId)
      showToast({ title: 'Student removed', description: `${deletingName} has been deleted.`, tone: 'success' })
    } catch {
      showToast({ title: 'Delete failed', description: 'Unable to delete the student. Try again.', tone: 'error' })
    } finally {
      setPendingDeleteId(null)
      setDeletingName('')
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Students" subtitle="Manage student enrolments, profiles, and academic status." />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Student Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{pageInfo?.totalElements ?? 0} student record(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Enrollment, profile updates, and lifecycle status are managed from this central student workspace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Visible" value={String(allStudents.length)} tone="text-sky-700" />
            <SnapshotStat label="Active" value={String(activeCount)} tone="text-emerald-700" />
            <SnapshotStat label="Alumni" value={String(alumniCount)} tone="text-violet-700" />
            <SnapshotStat label="Filter" value={activeTab} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Student Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Operational status for filters, pagination, and student profile lifecycle activity.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Gender" value={genderFilter || 'All'} tone="text-sky-700" />
            <SnapshotStat label="Page" value={String(page + 1)} tone="text-violet-700" />
            <SnapshotStat label="Search" value={search ? 'Applied' : 'Open'} tone="text-emerald-700" />
            <SnapshotStat label="Create" value={showCreate ? 'Open' : 'Ready'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      {/* Create modal */}
      <CreateStudentModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* Edit modal */}
      {editingStudent ? <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} /> : null}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete student?"
        description={`This will soft-delete ${deletingName}. The record will remain in audit logs.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
        onConfirm={() => { void handleDelete() }}
        onCancel={() => { setPendingDeleteId(null); setDeletingName('') }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search by name or admission no…"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              className="cc-input h-9 w-64 pl-9 text-sm"
            />
          </div>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as Gender | '')}
            className="cc-input h-9 text-sm"
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Student
          </button>
        ) : null}
      </div>

      {/* Card container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {pageInfo ? (
            <span className="ml-auto shrink-0 pb-2 text-xs text-slate-400">
              {pageInfo.totalElements} student{pageInfo.totalElements !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {studentsQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : studentsQuery.isError ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Failed to load students. Please try again.
            </div>
          ) : students.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-slate-600">No students found</p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Adm. No</th>
                  <th className="px-4 py-3">DOB</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin ? <th className="px-4 py-3 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => {
                  const fullName = `${student.firstName} ${student.lastName}`
                  const initials = `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase()
                  const bg = avatarColor(fullName)

                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: bg }}
                          >
                            {initials}
                          </div>
                          <Link
                            to={`/students/${student.id}`}
                            className="font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {fullName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.admissionNo}</td>
                      <td className="px-4 py-3 text-slate-600">{student.dateOfBirth}</td>
                      <td className="px-4 py-3 capitalize text-slate-600">{student.gender.toLowerCase()}</td>
                      <td className="px-4 py-3 text-slate-600">{student.phone ?? student.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[student.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[student.status] ?? student.status}
                        </span>
                      </td>
                      {isAdmin ? (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/students/${student.id}`}
                              className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEditingStudent(student)}
                              className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => { setPendingDeleteId(student.id); setDeletingName(fullName) }}
                              className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pageInfo && pageInfo.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {pageInfo.page + 1} of {pageInfo.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={pageInfo.page === 0}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={pageInfo.last}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
