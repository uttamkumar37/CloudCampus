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
    </section>
  )
}
