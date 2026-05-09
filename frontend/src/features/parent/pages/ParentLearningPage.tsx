import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'

import { useAttendanceByDate } from '../../attendance/hooks/useAttendance'
import type { AttendanceRecord } from '../../attendance/types'
import { useFeeAssignments } from '../../fees/hooks/useFees'
import { useMyChildren } from '../hooks/useMyChildren'
import type { Child } from '../types'

const today = new Date().toISOString().slice(0, 10)

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

function ChildLearningCard({ child, attendanceRecords, index }: { child: Child; attendanceRecords: AttendanceRecord[]; index: number }) {
  const feesQuery = useFeeAssignments(child.studentId)

  const attendance = attendanceRecords.find((item) => item.studentId === child.studentId)
  const fees = feesQuery.data?.data ?? []
  const overdueCount = fees.filter((item) => item.status === 'OVERDUE').length
  const pendingCount = fees.filter((item) => item.status === 'PENDING' || item.status === 'PARTIALLY_PAID').length

  return (
    <Card className="cc-fade-up rounded-[24px] border-slate-200 bg-white shadow-sm" style={{ animationDelay: `${Math.min(index * 70, 280)}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base sm:text-lg font-semibold text-slate-900">{child.firstName} {child.lastName}</p>
          <p className="text-xs text-slate-500">Admission No: {child.admissionNo}</p>
        </div>
        <span className={`rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
          !attendance
            ? 'bg-slate-100 text-slate-600'
            : attendance.status === 'PRESENT'
              ? 'bg-emerald-100 text-emerald-700'
              : attendance.status === 'LATE'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700'
        }`}>
          {attendance ? attendance.status : 'No attendance today'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Fee Items</p>
          <p className="mt-1 text-base sm:text-lg font-semibold text-slate-900">{fees.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-amber-50 p-3">
          <p className="text-xs uppercase tracking-wide text-amber-700">Pending</p>
          <p className="mt-1 text-base sm:text-lg font-semibold text-amber-800">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-rose-50 p-3">
          <p className="text-xs uppercase tracking-wide text-rose-700">Overdue</p>
          <p className="mt-1 text-base sm:text-lg font-semibold text-rose-800">{overdueCount}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-600">
        {overdueCount > 0
          ? `${overdueCount} overdue fee item(s) need attention.`
          : pendingCount > 0
            ? `${pendingCount} pending fee item(s) are in progress.`
            : 'No urgent alerts for this child.'}
      </div>
    </Card>
  )
}

export function ParentLearningPage() {
  const childrenQuery = useMyChildren()
  const attendanceQuery = useAttendanceByDate(today)
  const children = childrenQuery.data?.data ?? []
  const attendanceRecords = attendanceQuery.data?.data ?? []
  const attendanceCoverage = children.length > 0 ? Math.round((attendanceRecords.length / children.length) * 100) : 0

  return (
    <section className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Family Learning Center"
        subtitle="Parent view with child learning status, attendance, and fee alerts."
      />

      <div className="cc-fade-up overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-4 sm:p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Family Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{children.length} linked child(ren)</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Follow linked students with attendance and fee alerts in a clean, read-only family workspace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Children" value={String(children.length)} tone="text-amber-700" />
            <SnapshotStat label="Attendance" value={String(attendanceRecords.length)} tone="text-sky-700" />
            <SnapshotStat label="Coverage" value={`${attendanceCoverage}%`} tone="text-emerald-700" />
            <SnapshotStat label="Today" value={today} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <div className="cc-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Family Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Operational watchpoints for link coverage, attendance visibility, and child status.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Linked" value={String(children.length)} tone="text-amber-700" />
            <SnapshotStat label="Coverage" value={`${attendanceCoverage}%`} tone="text-sky-700" />
            <SnapshotStat label="Date" value={today} tone="text-violet-700" />
            <SnapshotStat label="Mode" value={attendanceCoverage < 100 ? 'Watch' : 'Stable'} tone="text-emerald-700" />
          </div>
        </div>
      </div>

      {childrenQuery.isLoading || attendanceQuery.isLoading ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <Skeleton className="h-40 cc-skeleton-shimmer" />
          <Skeleton className="h-40 cc-skeleton-shimmer" />
        </div>
      ) : childrenQuery.isError || attendanceQuery.isError ? (
        <EmptyState
          title="Unable to load child data"
          description="Please refresh and try again."
        />
      ) : children.length === 0 ? (
        <EmptyState
          title="No linked students"
          description="Ask your school administrator to link students with this parent account."
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {children.map((child, index) => (
            <ChildLearningCard key={child.studentId} child={child} attendanceRecords={attendanceRecords} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
