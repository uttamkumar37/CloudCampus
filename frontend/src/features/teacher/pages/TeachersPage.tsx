import { AxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
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

import { useCreateTeacher } from '../hooks/useCreateTeacher'
import { useDeleteTeacher } from '../hooks/useDeleteTeacher'
import { useTeachers } from '../hooks/useTeachers'
import { useUpdateTeacher } from '../hooks/useUpdateTeacher'
import type { CreateTeacherRequest, Teacher, TeacherStatus, UpdateTeacherRequest } from '../types'

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

const STATUS_LABELS: Record<TeacherStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  RESIGNED: 'Resigned',
  ON_LEAVE: 'On Leave',
}

const STATUS_CLASSES: Record<TeacherStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  RESIGNED: 'bg-rose-100 text-rose-700',
  ON_LEAVE: 'bg-amber-100 text-amber-700',
}

type Tab = 'ALL' | TeacherStatus

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'RESIGNED', label: 'Resigned' },
  { key: 'ON_LEAVE', label: 'On Leave' },
]

const STATUS_OPTIONS: Array<{ value: TeacherStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'RESIGNED', label: 'Resigned' },
  { value: 'ON_LEAVE', label: 'On Leave' },
]

// ─── create modal ────────────────────────────────────────────────────────────

function CreateTeacherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const createMutation = useCreateTeacher()
  const [values, setValues] = useState<CreateTeacherRequest>({
    employeeNo: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: null,
    hireDate: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setValues({ employeeNo: '', firstName: '', lastName: '', email: '', phone: null, hireDate: '' })
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await createMutation.mutateAsync({
        ...values,
        phone: values.phone?.trim() || null,
      })
      if (!res.success) {
        setError(res.message || 'Unable to create teacher')
        return
      }
      showToast({ title: 'Teacher created', description: `${res.data.firstName} ${res.data.lastName} added to the directory.`, tone: 'success' })
      handleClose()
    } catch (err) {
      const ae = err as AxiosError<ApiResponse<unknown>>
      setError(ae.response?.data?.message || 'Unable to create teacher')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Teacher" description="Register a new faculty member.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Employee No" value={values.employeeNo} onChange={(v) => setValues((p) => ({ ...p, employeeNo: v }))} placeholder="EMP-001" required />
          <FormInput label="Hire Date" type="date" value={values.hireDate} onChange={(v) => setValues((p) => ({ ...p, hireDate: v }))} required />
          <FormInput label="First Name" value={values.firstName} onChange={(v) => setValues((p) => ({ ...p, firstName: v }))} required />
          <FormInput label="Last Name" value={values.lastName} onChange={(v) => setValues((p) => ({ ...p, lastName: v }))} required />
          <FormInput label="Email" type="email" value={values.email} onChange={(v) => setValues((p) => ({ ...p, email: v }))} placeholder="teacher@school.edu" required />
          <FormInput label="Phone" value={values.phone ?? ''} onChange={(v) => setValues((p) => ({ ...p, phone: v }))} placeholder="+91-XXXXXXXXXX" />
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
            {createMutation.isPending ? 'Adding...' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── edit modal ──────────────────────────────────────────────────────────────

function EditTeacherModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const updateMutation = useUpdateTeacher()
  const [values, setValues] = useState<UpdateTeacherRequest>({
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    phone: teacher.phone ?? '',
    status: teacher.status,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateMutation.mutateAsync({
        id: teacher.id,
        payload: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: (values.phone as string)?.trim() || null,
          status: values.status,
        },
      })
      showToast({ title: 'Teacher updated', description: `${values.firstName} ${values.lastName} has been updated.`, tone: 'success' })
      onClose()
    } catch (err) {
      const ae = err as AxiosError<ApiResponse<unknown>>
      setError(ae.response?.data?.message || 'Unable to update teacher')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Edit Teacher" description={`Editing ${teacher.firstName} ${teacher.lastName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="First Name" value={values.firstName ?? ''} onChange={(v) => setValues((p) => ({ ...p, firstName: v }))} required />
          <FormInput label="Last Name" value={values.lastName ?? ''} onChange={(v) => setValues((p) => ({ ...p, lastName: v }))} required />
          <FormInput label="Email" type="email" value={values.email ?? ''} onChange={(v) => setValues((p) => ({ ...p, email: v }))} required />
          <FormInput label="Phone" value={(values.phone as string) ?? ''} onChange={(v) => setValues((p) => ({ ...p, phone: v }))} placeholder="+91-XXXXXXXXXX" />
          <div className="sm:col-span-2">
            <FormSelect
              label="Status"
              value={values.status ?? 'ACTIVE'}
              onChange={(v) => setValues((p) => ({ ...p, status: (v as TeacherStatus) || 'ACTIVE' }))}
              options={STATUS_OPTIONS}
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

export function TeachersPage() {
  const { role } = useAuth()
  const isAdmin = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'

  const [page, setPage] = useState(0)
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('ALL')

  const [showCreate, setShowCreate] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingName, setDeletingName] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteMutation = useDeleteTeacher()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(rawSearch)
      setPage(0)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [rawSearch])

  useEffect(() => { setPage(0) }, [activeTab])

  const statusParam = activeTab === 'ALL' ? undefined : activeTab

  const teachersQuery = useTeachers({ page, size: 20, search: search || undefined, status: statusParam })
  const teachers = teachersQuery.data?.data.content ?? []
  const pageInfo = teachersQuery.data?.data
  const activeCount = teachers.filter((teacher) => teacher.status === 'ACTIVE').length
  const onLeaveCount = teachers.filter((teacher) => teacher.status === 'ON_LEAVE').length
  const inactiveCount = teachers.filter((teacher) => teacher.status === 'INACTIVE' || teacher.status === 'RESIGNED').length
  const classTeacherCount = teachers.filter((teacher) => (teacher.classTeacherSections ?? []).length > 0).length

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteMutation.mutateAsync(pendingDeleteId)
      showToast({ title: 'Teacher removed', description: `${deletingName} has been deleted.`, tone: 'success' })
    } catch {
      showToast({ title: 'Delete failed', description: 'Unable to delete the teacher. Try again.', tone: 'error' })
    } finally {
      setPendingDeleteId(null)
      setDeletingName('')
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Teachers" subtitle="Manage faculty records, class assignments, and status." />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Faculty Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{pageInfo?.totalElements ?? teachers.length} teachers in the current view</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use the table below to review status, class-teacher assignments, and current hiring records at a glance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FacultyStat label="Active" value={String(activeCount)} tone="text-emerald-700" />
            <FacultyStat label="On Leave" value={String(onLeaveCount)} tone="text-amber-700" />
            <FacultyStat label="Inactive" value={String(inactiveCount)} tone="text-slate-700" />
            <FacultyStat label="Class Teachers" value={String(classTeacherCount)} tone="text-sky-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Faculty Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Quick operations indicators for filters, pagination state, and visible staffing spread.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FacultyStat label="Visible" value={String(teachers.length)} tone="text-slate-700" />
            <FacultyStat label="Page" value={String(page + 1)} tone="text-sky-700" />
            <FacultyStat label="Filter" value={activeTab} tone="text-emerald-700" />
            <FacultyStat label="Search" value={search ? 'Applied' : 'Open'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <CreateTeacherModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {editingTeacher ? <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} /> : null}

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete teacher?"
        description={`This will soft-delete ${deletingName}. The record will remain in audit logs.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
        onConfirm={() => { void handleDelete() }}
        onCancel={() => { setPendingDeleteId(null); setDeletingName('') }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, employee no or email…"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="cc-input h-9 w-72 pl-9 text-sm"
          />
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
            Add Teacher
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
              {pageInfo.totalElements} teacher{pageInfo.totalElements !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {teachersQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : teachersQuery.isError ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Failed to load teachers. Please try again.
            </div>
          ) : teachers.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-slate-600">No teachers found</p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Emp. No</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Hire Date</th>
                  <th className="px-4 py-3">Class Teacher</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin ? <th className="px-4 py-3 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teachers.map((teacher) => {
                  const fullName = `${teacher.firstName} ${teacher.lastName}`
                  const initials = `${teacher.firstName[0] ?? ''}${teacher.lastName[0] ?? ''}`.toUpperCase()
                  const bg = avatarColor(fullName)
                  const classSections = teacher.classTeacherSections ?? []

                  return (
                    <tr key={teacher.id} className="group hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: bg }}
                          >
                            {initials}
                          </div>
                          <Link
                            to={`/teachers/${teacher.id}`}
                            className="font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {fullName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{teacher.employeeNo}</td>
                      <td className="px-4 py-3 text-slate-600">{teacher.phone ?? teacher.email}</td>
                      <td className="px-4 py-3 text-slate-600">{teacher.hireDate}</td>
                      <td className="px-4 py-3">
                        {classSections.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {classSections.map((s) => (
                              <span key={s.sectionId} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                {s.className} – {s.sectionName}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[teacher.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[teacher.status] ?? teacher.status}
                        </span>
                      </td>
                      {isAdmin ? (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/teachers/${teacher.id}`}
                              className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEditingTeacher(teacher)}
                              className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => { setPendingDeleteId(teacher.id); setDeletingName(fullName) }}
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

      <StaffLeavePanel />
    </section>
  )
}

type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type LeaveType = 'SICK' | 'CASUAL' | 'EARNED' | 'EMERGENCY'

interface LeaveRequest {
  id: string
  teacherName: string
  leaveType: LeaveType
  fromDate: string
  toDate: string
  reason: string
  status: LeaveStatus
  appliedOn: string
}

const LEAVE_STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
}

export function StaffLeavePanel() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [form, setForm] = useState({ teacherName: '', leaveType: 'CASUAL' as LeaveType, fromDate: '', toDate: '', reason: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.teacherName.trim() || !form.fromDate || !form.toDate || !form.reason.trim()) return
    setRequests((prev) => [
      { id: crypto.randomUUID(), ...form, status: 'PENDING' as LeaveStatus, appliedOn: new Date().toISOString().slice(0, 10) },
      ...prev,
    ])
    setForm((p) => ({ ...p, teacherName: '', fromDate: '', toDate: '', reason: '' }))
  }

  const updateStatus = (id: string, status: LeaveStatus) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

  const pending = requests.filter((r) => r.status === 'PENDING').length
  const approved = requests.filter((r) => r.status === 'APPROVED').length

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Staff Leave Management</h2>
        <p className="mt-1 text-sm text-slate-500">Submit and review leave requests for teaching and non-teaching staff.</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{requests.length}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Pending</p>
            <p className="mt-1 text-xl font-bold text-amber-700">{pending}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Approved</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{approved}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">New Leave Request</h3>
        <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Staff member name" value={form.teacherName} onChange={(e) => setForm((p) => ({ ...p, teacherName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <select value={form.leaveType} onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value as LeaveType }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="EARNED">Earned Leave</option>
              <option value="EMERGENCY">Emergency Leave</option>
            </select>
            <input type="date" placeholder="From" value={form.fromDate} onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="date" placeholder="To" value={form.toDate} onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <input type="text" placeholder="Reason for leave" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Submit Request</button>
        </form>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No leave requests yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{req.teacherName}</p>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{req.leaveType}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEAVE_STATUS_STYLE[req.status]}`}>{req.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{req.fromDate} → {req.toDate} · {req.reason}</p>
                <p className="mt-0.5 text-xs text-slate-400">Applied {req.appliedOn}</p>
              </div>
              {req.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateStatus(req.id, 'APPROVED')} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition">Approve</button>
                  <button type="button" onClick={() => updateStatus(req.id, 'REJECTED')} className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FacultyStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

// ── Department-wise Staff Structure ────────────────────────────────────────

interface Department {
  id: string
  name: string
  head: string
  members: string[]
  description: string
}

export function DepartmentStructurePanel() {
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Science', head: 'Dr. Sharma', members: ['Mrs. Patel', 'Mr. Iyer', 'Ms. Reddy'], description: 'Physics, Chemistry, Biology' },
    { id: '2', name: 'Mathematics', head: 'Mr. Gupta', members: ['Mrs. Singh', 'Mr. Kumar'], description: 'Pure and Applied Mathematics' },
    { id: '3', name: 'Humanities', head: 'Ms. Verma', members: ['Mr. Das', 'Mrs. Nair'], description: 'History, Geography, Civics' },
  ])
  const [form, setForm] = useState({ name: '', head: '', description: '', membersRaw: '' })
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setDepartments((prev) => [{
      id: crypto.randomUUID(),
      name: form.name,
      head: form.head,
      description: form.description,
      members: form.membersRaw.split(',').map((s) => s.trim()).filter(Boolean),
    }, ...prev])
    setForm({ name: '', head: '', description: '', membersRaw: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Department Structure</h2>
          <p className="text-sm text-slate-500">Organize staff by academic and administrative departments.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Department name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Department head (name)" value={form.head} onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <input type="text" placeholder="Description / subjects covered" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Members (comma-separated names)" value={form.membersRaw} onChange={(e) => setForm((p) => ({ ...p, membersRaw: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Department</button>
          </form>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div key={dept.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-950">{dept.name}</p>
                {dept.head && <p className="text-xs text-slate-500 mt-0.5">Head: {dept.head}</p>}
                {dept.description && <p className="text-xs text-slate-400 mt-0.5 italic">{dept.description}</p>}
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{dept.members.length} staff</span>
            </div>
            {dept.members.length > 0 && (
              <div className="mt-3">
                <button type="button" onClick={() => setExpandedId(expandedId === dept.id ? null : dept.id)} className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 transition">
                  {expandedId === dept.id ? 'Hide members ▲' : 'Show members ▼'}
                </button>
                {expandedId === dept.id && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dept.members.map((m) => <span key={m} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{m}</span>)}
                  </div>
                )}
              </div>
            )}
            <button type="button" onClick={() => setDepartments((prev) => prev.filter((d) => d.id !== dept.id))} className="mt-3 text-[10px] text-slate-300 hover:text-rose-500 transition">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Staff Document Storage ─────────────────────────────────────────────────

interface StaffDocument {
  id: string
  staffName: string
  docType: string
  fileName: string
  uploadedOn: string
  expiryDate: string
  note: string
}

const DOC_TYPES = ['Contract', 'PAN Card', 'Aadhaar Card', 'Degree Certificate', 'Experience Letter', 'Appointment Letter', 'Other']

export function StaffDocumentPanel() {
  const [docs, setDocs] = useState<StaffDocument[]>([])
  const [form, setForm] = useState({ staffName: '', docType: 'Contract', fileName: '', uploadedOn: new Date().toISOString().slice(0, 10), expiryDate: '', note: '' })
  const [showForm, setShowForm] = useState(false)
  const [filterStaff, setFilterStaff] = useState('ALL')

  const staffNames = ['ALL', ...Array.from(new Set(docs.map((d) => d.staffName))).filter(Boolean)]
  const visible = filterStaff === 'ALL' ? docs : docs.filter((d) => d.staffName === filterStaff)
  const todayStr = new Date().toISOString().slice(0, 10)
  const expiringSoon = docs.filter((d) => d.expiryDate && d.expiryDate <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) && d.expiryDate >= todayStr)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.staffName.trim() || !form.fileName.trim()) return
    setDocs((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev])
    setForm((p) => ({ ...p, staffName: '', fileName: '', expiryDate: '', note: '' }))
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Staff Document Storage</h2>
          <p className="text-sm text-slate-500">Store contracts, certificates, and HR records for staff.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {expiringSoon.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-700">{expiringSoon.length} document{expiringSoon.length !== 1 ? 's' : ''} expiring within 30 days</p>
          <p className="text-xs text-amber-600 mt-0.5">{expiringSoon.map((d) => `${d.staffName} – ${d.docType}`).join(' · ')}</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Staff name" value={form.staffName} onChange={(e) => setForm((p) => ({ ...p, staffName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <select value={form.docType} onChange={(e) => setForm((p) => ({ ...p, docType: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input type="text" placeholder="File name / reference" value={form.fileName} onChange={(e) => setForm((p) => ({ ...p, fileName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Upload Date</label>
                <input type="date" value={form.uploadedOn} onChange={(e) => setForm((p) => ({ ...p, uploadedOn: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Expiry Date (optional)</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Document</button>
          </form>
        </div>
      )}

      {docs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {staffNames.map((n) => (
            <button key={n} type="button" onClick={() => setFilterStaff(n)} className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${filterStaff === n ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{n}</button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No documents stored yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((doc) => {
            const expired = doc.expiryDate && doc.expiryDate < todayStr
            const expiring = !expired && expiringSoon.some((d) => d.id === doc.id)
            return (
              <div key={doc.id} className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm ${expired ? 'border-rose-200' : expiring ? 'border-amber-200' : 'border-slate-200'}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{doc.staffName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{doc.docType}</span>
                    {expired && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">EXPIRED</span>}
                    {expiring && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">EXPIRING SOON</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{doc.fileName} · Uploaded {doc.uploadedOn}{doc.expiryDate ? ` · Expires ${doc.expiryDate}` : ''}</p>
                  {doc.note && <p className="mt-0.5 text-xs text-slate-400 italic">{doc.note}</p>}
                </div>
                <button type="button" onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Staff Appraisal Notes ──────────────────────────────────────────────────

interface AppraisalNote {
  id: string
  staffName: string
  period: string
  rating: number
  strengths: string
  improvements: string
  goals: string
  reviewedBy: string
  reviewDate: string
}

export function StaffAppraisalPanel() {
  const [notes, setNotes] = useState<AppraisalNote[]>([])
  const [form, setForm] = useState({ staffName: '', period: new Date().toISOString().slice(0, 7), rating: 4, strengths: '', improvements: '', goals: '', reviewedBy: '', reviewDate: new Date().toISOString().slice(0, 10) })
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.staffName.trim()) return
    setNotes((prev) => [{ id: crypto.randomUUID(), ...form, rating: Number(form.rating) }, ...prev])
    setForm((p) => ({ ...p, staffName: '', strengths: '', improvements: '', goals: '', reviewedBy: '' }))
    setShowForm(false)
  }

  const RATING_LABEL = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Staff Appraisal Notes</h2>
          <p className="text-sm text-slate-500">Maintain periodic performance reviews and development goals.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Appraisal'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Staff name" value={form.staffName} onChange={(e) => setForm((p) => ({ ...p, staffName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="month" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Rating: {RATING_LABEL[form.rating]}</label>
                <input type="range" min={1} max={5} value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))} className="w-full" />
              </div>
            </div>
            <textarea placeholder="Key strengths…" value={form.strengths} onChange={(e) => setForm((p) => ({ ...p, strengths: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
            <textarea placeholder="Areas for improvement…" value={form.improvements} onChange={(e) => setForm((p) => ({ ...p, improvements: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
            <input type="text" placeholder="Goals for next period" value={form.goals} onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Reviewed by" value={form.reviewedBy} onChange={(e) => setForm((p) => ({ ...p, reviewedBy: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="date" value={form.reviewDate} onChange={(e) => setForm((p) => ({ ...p, reviewDate: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Appraisal</button>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No appraisal records yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{n.staffName}</p>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{n.period}</span>
                    <span className="text-[10px] text-amber-500">{'★'.repeat(n.rating)}{'☆'.repeat(5 - n.rating)}</span>
                    <span className="text-[10px] text-slate-400">{RATING_LABEL[n.rating]}</span>
                  </div>
                  {n.strengths && <p className="mt-1 text-xs text-emerald-700"><span className="font-medium">Strengths:</span> {n.strengths}</p>}
                  {n.improvements && <p className="mt-0.5 text-xs text-amber-700"><span className="font-medium">Improve:</span> {n.improvements}</p>}
                  {n.goals && <p className="mt-0.5 text-xs text-sky-700"><span className="font-medium">Goals:</span> {n.goals}</p>}
                  <p className="mt-1 text-[10px] text-slate-400">{n.reviewedBy ? `Reviewed by ${n.reviewedBy} · ` : ''}{n.reviewDate}</p>
                </div>
                <button type="button" onClick={() => setNotes((prev) => prev.filter((x) => x.id !== n.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
