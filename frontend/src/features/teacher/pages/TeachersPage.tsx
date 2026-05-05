import { AxiosError } from 'axios'
import { useState } from 'react'

import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'
import { useAuth } from '../../auth/hooks/useAuth'

import { TeacherForm } from '../components/TeacherForm'
import { useCreateTeacher } from '../hooks/useCreateTeacher'
import { useDeleteTeacher } from '../hooks/useDeleteTeacher'
import { useTeachers } from '../hooks/useTeachers'
import type { CreateTeacherRequest, Teacher } from '../types'

export function TeachersPage() {
  const [page, setPage] = useState(0)
  const size = 20
  const { role } = useAuth()
  const canCreate = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'
  const canDelete = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'

  const teachersQuery = useTeachers({ page, size })
  const createTeacherMutation = useCreateTeacher()
  const deleteTeacherMutation = useDeleteTeacher()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingTeacherName, setDeletingTeacherName] = useState('')

  const teachers = teachersQuery.data?.data.content ?? []
  const pageInfo = teachersQuery.data?.data

  const columns: DataTableColumn<Teacher>[] = [
    {
      key: 'employeeNo',
      header: 'Employee No',
      cell: (teacher) => <span className="font-medium text-slate-900">{teacher.employeeNo}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (teacher) => `${teacher.firstName} ${teacher.lastName}`,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (teacher) => teacher.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (teacher) => teacher.phone || '-',
    },
    {
      key: 'hireDate',
      header: 'Hire Date',
      cell: (teacher) => teacher.hireDate,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (teacher) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            teacher.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {teacher.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canDelete
      ? ([
          {
            key: 'actions',
            header: '',
            cell: (teacher) => (
              <button
                type="button"
                onClick={() => {
                  setPendingDeleteId(teacher.id)
                  setDeletingTeacherName(`${teacher.firstName} ${teacher.lastName}`)
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            ),
          },
        ] as DataTableColumn<Teacher>[])
      : []),
  ]

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteTeacherMutation.mutateAsync(pendingDeleteId)
      showToast({ title: 'Teacher deleted', description: `${deletingTeacherName} has been removed.`, tone: 'success' })
    } catch {
      showToast({ title: 'Delete failed', description: 'Unable to delete the teacher. Try again.', tone: 'error' })
    } finally {
      setPendingDeleteId(null)
      setDeletingTeacherName('')
    }
  }

  const handleCreateTeacher = async (payload: CreateTeacherRequest) => {
    try {
      const response = await createTeacherMutation.mutateAsync(payload)

      if (!response.success) {
        showToast({ title: 'Teacher not created', description: response.message, tone: 'error' })
        return false
      }

      showToast({
        title: 'Teacher created',
        description: `${response.data.firstName} ${response.data.lastName} is now available in the directory.`,
        tone: 'success',
      })
      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({
        title: 'Teacher not created',
        description: axiosError.response?.data?.message ?? 'Unable to create teacher',
        tone: 'error',
      })
      return false
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Teachers"
        subtitle="View faculty records. Create and delete actions are limited to school administrators."
      />

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete teacher?"
        description={`This will soft-delete ${deletingTeacherName}. The record remains in audit logs but will no longer be active.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteTeacherMutation.isPending}
        onConfirm={() => { void handleDelete() }}
        onCancel={() => { setPendingDeleteId(null); setDeletingTeacherName('') }}
      />

      {canCreate ? (
        <TeacherForm onSubmit={handleCreateTeacher} isSubmitting={createTeacherMutation.isPending} />
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You have read-only access to the teacher directory.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Teacher Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pageInfo ? `${pageInfo.totalElements} teachers available in this tenant` : 'Loading directory'}
            </p>
          </div>
        </div>

        {teachersQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : null}

        {teachersQuery.isError ? (
          <EmptyState
            title="Unable to load teachers"
            description="The teacher directory could not be fetched. Try again in a moment."
          />
        ) : null}

        {!teachersQuery.isLoading && !teachersQuery.isError ? (
          <DataTable
            columns={columns}
            rows={teachers}
            rowKey={(teacher) => teacher.id}
            emptyText="No teachers found for this tenant."
          />
        ) : null}

        {pageInfo ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={pageInfo.page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {pageInfo.page + 1} of {Math.max(pageInfo.totalPages, 1)}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((current) => current + 1)}
              disabled={pageInfo.last}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
