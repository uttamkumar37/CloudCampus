import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'
import { Button } from '../../../components/ui/Button'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'
import { useStudents } from '../../student/hooks/useStudents'
import { getUsers } from '../../super-admin/api/usersApi'

import { useLinkParent, useParentLinks, useUnlinkParent } from '../hooks/useParentLinks'
import type { ParentStudentLink } from '../types'

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export function ParentLinksAdminPage() {
  const [parentUserId, setParentUserId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const linksQuery = useParentLinks()
  const studentsQuery = useStudents({ page: 0, size: 200 })
  const usersQuery = useQuery({
    queryKey: ['users', 0, 200],
    queryFn: () => getUsers({ page: 0, size: 200 }),
  })

  const linkParentMutation = useLinkParent()
  const unlinkParentMutation = useUnlinkParent()

  const parentUsers = useMemo(() => {
    return (usersQuery.data?.data.content ?? []).filter((user) => user.role === 'PARENT')
  }, [usersQuery.data])

  const students = studentsQuery.data?.data.content ?? []
  const links = linksQuery.data?.data ?? []
  const selectedCount = Number(Boolean(parentUserId)) + Number(Boolean(studentId))

  const columns: DataTableColumn<ParentStudentLink>[] = [
    {
      key: 'parent',
      header: 'Parent',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.parentFullName}</p>
          <p className="text-xs text-slate-500">{row.parentEmail}</p>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.studentFirstName} {row.studentLastName}</p>
          <p className="text-xs text-slate-500">{row.admissionNo}</p>
        </div>
      ),
    },
    {
      key: 'linkedAt',
      header: 'Linked At',
      cell: (row) => new Date(row.linkedAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            void handleUnlink(row.linkId)
          }}
          disabled={unlinkParentMutation.isPending}
          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Unlink
        </button>
      ),
    },
  ]

  const handleLink = async () => {
    setSubmitError(null)
    if (!parentUserId || !studentId) {
      setSubmitError('Select both parent and student before linking.')
      return
    }

    try {
      const response = await linkParentMutation.mutateAsync({ parentUserId, studentId })
      if (!response.success) {
        const message = response.message || 'Unable to link parent and student.'
        setSubmitError(message)
        showToast({ title: 'Link failed', description: message, tone: 'error' })
        return
      }

      showToast({ title: 'Link created', description: 'Parent linked to student successfully.', tone: 'success' })
      setParentUserId('')
      setStudentId('')
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      const message = axiosError.response?.data?.message || 'Unable to link parent and student.'
      setSubmitError(message)
      showToast({ title: 'Link failed', description: message, tone: 'error' })
    }
  }

  const handleUnlink = async (linkId: string) => {
    try {
      await unlinkParentMutation.mutateAsync(linkId)
      showToast({ title: 'Link removed', description: 'Parent-student link removed.', tone: 'success' })
    } catch {
      showToast({ title: 'Unlink failed', description: 'Unable to remove this link right now.', tone: 'error' })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Parent Links"
        subtitle="School admin tools to link or unlink parent accounts with students."
      />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Parent Links Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{links.length} linked family record(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Keep parent-to-student access tidy by linking existing parent accounts to the correct learner record.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Links" value={String(links.length)} tone="text-sky-700" />
            <SnapshotStat label="Parents" value={String(parentUsers.length)} tone="text-emerald-700" />
            <SnapshotStat label="Students" value={String(students.length)} tone="text-amber-700" />
            <SnapshotStat label="Selected" value={selectedCount > 0 ? String(selectedCount) : 'None'} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Linking Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Readiness checks for parent-student assignment and unlink lifecycle operations.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Parent Pick" value={parentUserId ? 'Set' : 'Open'} tone="text-sky-700" />
            <SnapshotStat label="Student Pick" value={studentId ? 'Set' : 'Open'} tone="text-emerald-700" />
            <SnapshotStat label="Create Link" value={linkParentMutation.isPending ? 'Saving' : 'Ready'} tone="text-violet-700" />
            <SnapshotStat label="Unlink" value={unlinkParentMutation.isPending ? 'Running' : 'Idle'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Create Link</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Parent User</span>
            <select
              value={parentUserId}
              onChange={(event) => setParentUserId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select parent</option>
              {parentUsers.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.username} ({parent.email})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Student</span>
            <select
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.admissionNo} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {submitError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <div>
          <Button
            onClick={() => { void handleLink() }}
            disabled={linkParentMutation.isPending || usersQuery.isLoading || studentsQuery.isLoading}
          >
            {linkParentMutation.isPending ? 'Linking...' : 'Link Parent to Student'}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Existing Links</h2>

        {(linksQuery.isLoading || usersQuery.isLoading || studentsQuery.isLoading) ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : null}

        {linksQuery.isError ? (
          <EmptyState title="Links unavailable" description="Failed to fetch parent-student links for this tenant." />
        ) : null}

        {!linksQuery.isLoading && !linksQuery.isError ? (
          <DataTable
            columns={columns}
            rows={links}
            rowKey={(row) => row.linkId}
            emptyText="No parent-student links found."
          />
        ) : null}
      </div>
    </section>
  )
}
