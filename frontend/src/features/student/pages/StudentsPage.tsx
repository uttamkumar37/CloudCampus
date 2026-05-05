import { AxiosError } from 'axios'
import { useState } from 'react'

import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'
import { useAuth } from '../../auth/hooks/useAuth'

import { StudentForm } from '../components/StudentForm'
import { useCreateStudent } from '../hooks/useCreateStudent'
import { useDeleteStudent } from '../hooks/useDeleteStudent'
import { useStudents } from '../hooks/useStudents'
import type { CreateStudentRequest, Student } from '../types'

export function StudentsPage() {
  const [page, setPage] = useState(0)
  const size = 20

  const { role } = useAuth()
  const canCreate = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'
  const canDelete = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'

  const studentsQuery = useStudents({ page, size })
  const createStudentMutation = useCreateStudent()
  const deleteStudentMutation = useDeleteStudent()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingStudentName, setDeletingStudentName] = useState('')

  const students = studentsQuery.data?.data.content ?? []
  const pageInfo = studentsQuery.data?.data

  const columns: DataTableColumn<Student>[] = [
    {
      key: 'admissionNo',
      header: 'Admission No',
      cell: (student) => <span className="font-medium text-slate-900">{student.admissionNo}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (student) => `${student.firstName} ${student.lastName}`,
    },
    {
      key: 'dateOfBirth',
      header: 'DOB',
      cell: (student) => student.dateOfBirth,
    },
    {
      key: 'gender',
      header: 'Gender',
      cell: (student) => student.gender,
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (student) => student.email || student.phone || '-',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (student) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${student.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
        >
          {student.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canDelete
      ? ([
          {
            key: 'actions',
            header: '',
            cell: (student) => (
              <button
                type="button"
                onClick={() => {
                  setPendingDeleteId(student.id)
                  setDeletingStudentName(`${student.firstName} ${student.lastName}`)
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            ),
          },
        ] as DataTableColumn<Student>[])
      : []),
  ]

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteStudentMutation.mutateAsync(pendingDeleteId)
      showToast({ title: 'Student deleted', description: `${deletingStudentName} has been removed.`, tone: 'success' })
    } catch {
      showToast({ title: 'Delete failed', description: 'Unable to delete the student. Try again.', tone: 'error' })
    } finally {
      setPendingDeleteId(null)
      setDeletingStudentName('')
    }
  }

  const handleCreateStudent = async (payload: CreateStudentRequest) => {
    setSubmitError(null)

    try {
      const response = await createStudentMutation.mutateAsync(payload)
      if (!response.success) {
        setSubmitError(response.message || 'Unable to create student')
        showToast({
          title: 'Student not created',
          description: response.message || 'Unable to create student',
          tone: 'error',
        })
        return false
      }

      showToast({
        title: 'Student created',
        description: `${response.data.firstName} ${response.data.lastName} has been enrolled.`,
        tone: 'success',
      })
      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      setSubmitError(axiosError.response?.data?.message || 'Unable to create student')
      showToast({
        title: 'Student not created',
        description: axiosError.response?.data?.message || 'Unable to create student',
        tone: 'error',
      })
      return false
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="View tenant students. Create and delete actions are limited to school administrators."
      />

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete student?"
        description={`This will soft-delete ${deletingStudentName}. The record remains in audit logs but will no longer be active.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteStudentMutation.isPending}
        onConfirm={() => { void handleDelete() }}
        onCancel={() => { setPendingDeleteId(null); setDeletingStudentName('') }}
      />

      {canCreate ? (
        <>
          <StudentForm onSubmit={handleCreateStudent} isSubmitting={createStudentMutation.isPending} />

          {submitError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You have read-only access to the student directory.
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Student Directory</h2>
          {pageInfo ? (
            <p className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-700">{pageInfo.totalElements}</span>
            </p>
          ) : null}
        </div>

        {studentsQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : null}

        {studentsQuery.isError ? (
          <EmptyState title="Students unavailable" description="Failed to fetch students for this tenant." />
        ) : null}

        {!studentsQuery.isLoading && !studentsQuery.isError ? (
          <DataTable
            columns={columns}
            rows={students}
            rowKey={(student) => student.id}
            emptyText="No students found for this tenant."
          />
        ) : null}

        {pageInfo ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((previous) => Math.max(0, previous - 1))}
              disabled={pageInfo.page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {pageInfo.page + 1} of {Math.max(1, pageInfo.totalPages)}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((previous) => previous + 1)}
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
