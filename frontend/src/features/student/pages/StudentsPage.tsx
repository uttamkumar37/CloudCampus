import { AxiosError } from 'axios'
import { useState } from 'react'

import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { PageHeader } from '../../../components/ui/PageHeader'
import type { ApiResponse } from '../../../types/api'

import { StudentForm } from '../components/StudentForm'
import { useCreateStudent } from '../hooks/useCreateStudent'
import { useStudents } from '../hooks/useStudents'
import type { CreateStudentRequest, Student } from '../types'

export function StudentsPage() {
  const [page, setPage] = useState(0)
  const size = 20

  const studentsQuery = useStudents({ page, size })
  const createStudentMutation = useCreateStudent()
  const [submitError, setSubmitError] = useState<string | null>(null)

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
  ]

  const handleCreateStudent = async (payload: CreateStudentRequest) => {
    setSubmitError(null)

    try {
      const response = await createStudentMutation.mutateAsync(payload)
      if (!response.success) {
        setSubmitError(response.message || 'Unable to create student')
        return false
      }

      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      setSubmitError(axiosError.response?.data?.message || 'Unable to create student')
      return false
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage tenant students with secure list and create operations."
      />

      <StudentForm onSubmit={handleCreateStudent} isSubmitting={createStudentMutation.isPending} />

      {submitError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Loading students...
          </div>
        ) : null}

        {studentsQuery.isError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to fetch students.
          </div>
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
            <button
              type="button"
              onClick={() => setPage((previous) => Math.max(0, previous - 1))}
              disabled={pageInfo.page === 0}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {pageInfo.page + 1} of {Math.max(1, pageInfo.totalPages)}
            </span>
            <button
              type="button"
              onClick={() => setPage((previous) => previous + 1)}
              disabled={pageInfo.last}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
