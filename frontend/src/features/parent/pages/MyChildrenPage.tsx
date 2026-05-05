import { Link } from 'react-router-dom'

import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'

import { useFeeAssignments } from '../../fees/hooks/useFees'
import type { FeeStatus } from '../../fees/types'
import { useAttendanceByDate } from '../../attendance/hooks/useAttendance'
import { useMyChildren } from '../hooks/useMyChildren'
import type { Child } from '../types'

const today = new Date().toISOString().slice(0, 10)

const FEE_STATUS_BADGE: Record<FeeStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700',
}

function ChildCard({ child }: { child: Child }) {
  const feeQuery = useFeeAssignments(child.studentId)
  const attendanceQuery = useAttendanceByDate(today)

  const feeAssignments = feeQuery.data?.data ?? []
  const todayRecord = attendanceQuery.data?.data?.find((r) => r.studentId === child.studentId)

  const overdueFees = feeAssignments.filter((f) => f.status === 'OVERDUE').length
  const pendingFees = feeAssignments.filter((f) => f.status === 'PENDING' || f.status === 'PARTIALLY_PAID').length
  const notifications = [
    overdueFees > 0 ? `${overdueFees} overdue fee item(s)` : null,
    pendingFees > 0 ? `${pendingFees} fee item(s) still pending` : null,
    !todayRecord ? 'Attendance has not been marked today yet.' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Child header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {child.firstName} {child.lastName}
          </p>
          <p className="text-sm text-slate-500">Admission No: {child.admissionNo}</p>
        </div>
        {todayRecord ? (
          <span
            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              todayRecord.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
              todayRecord.status === 'LATE' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}
          >
            {todayRecord.status}
          </span>
        ) : (
          <span className="inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-500">
            No attendance today
          </span>
        )}
      </div>

      {/* Fee summary */}
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Fee Status</p>
        {feeQuery.isLoading ? (
          <p className="text-xs text-slate-400">Loading…</p>
        ) : feeAssignments.length === 0 ? (
          <p className="text-xs text-slate-500">No fee records.</p>
        ) : (
          <div className="space-y-1.5">
            {overdueFees > 0 && (
              <p className="text-xs font-medium text-rose-700">{overdueFees} fee(s) overdue</p>
            )}
            {pendingFees > 0 && (
              <p className="text-xs font-medium text-amber-700">{pendingFees} fee(s) pending</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {feeAssignments.slice(0, 4).map((f) => (
                <span key={f.id} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${FEE_STATUS_BADGE[f.status]}`}>
                  {f.feeTitle}
                </span>
              ))}
              {feeAssignments.length > 4 && (
                <span className="text-xs text-slate-400">+{feeAssignments.length - 4} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Notifications</p>
        {notifications.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-600">Everything looks on track today.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {notifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/my-children" className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800">
          Child Overview
        </Link>
        <Link to="/fees" className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-200">
          Fees
        </Link>
        <Link to="/profile" className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-200">
          Profile
        </Link>
      </div>
    </div>
  )
}

export function MyChildrenPage() {
  const childrenQuery = useMyChildren()

  const children = childrenQuery.data?.data ?? []

  return (
    <section className="space-y-6">
      <PageHeader
        title="Parent Learning Center"
        subtitle="Track linked students with daily attendance and fee alerts in one secure place."
      />

      {childrenQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : childrenQuery.isError ? (
        <EmptyState
          title="Unable to load children"
          description="Ensure your account has PARENT role and children are linked in the system."
        />
      ) : children.length === 0 ? (
        <EmptyState
          title="No linked students"
          description="Contact your school administrator to link students to your parent account."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <ChildCard key={child.studentId} child={child} />
          ))}
        </div>
      )}
    </section>
  )
}
