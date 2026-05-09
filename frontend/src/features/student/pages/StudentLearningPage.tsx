import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'

import { useStudentDashboard } from '../../dashboard/hooks/useStudentDashboard'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value: string) {
  const [h, m] = value.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export function StudentLearningPage() {
  const dashboardQuery = useStudentDashboard()

  if (dashboardQuery.isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader title="My Learning" subtitle="Loading your personal learning workspace." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 cc-skeleton-shimmer" />
          <Skeleton className="h-28 cc-skeleton-shimmer" />
          <Skeleton className="h-28 cc-skeleton-shimmer" />
          <Skeleton className="h-28 cc-skeleton-shimmer" />
        </div>
      </section>
    )
  }

  if (dashboardQuery.isError || !dashboardQuery.data?.data) {
    return (
      <section className="space-y-6">
        <PageHeader title="My Learning" subtitle="Your personal academic summary could not be loaded." />
        <EmptyState
          title="Unable to load learning data"
          description="Please refresh the page and try again."
        />
      </section>
    )
  }

  const d = dashboardQuery.data.data
  const nextClass = d.todayTimetable[0] ?? null
  const overdueHomework = d.recentHomework.filter((homework) => homework.overdue).length

  return (
    <section className="space-y-5 sm:space-y-6">
      <PageHeader
        title="My Learning"
        subtitle="Personal dashboard for your classes, homework, attendance, and exam results."
      />

      <div className="cc-fade-up overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Learning Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{d.todayTimetable.length} class(es) today</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {nextClass ? (
                <>Next class: {nextClass.subjectName}{nextClass.label ? ` · ${nextClass.label}` : ''} · {formatTime(nextClass.startTime)} – {formatTime(nextClass.endTime)}</>
              ) : (
                'No classes are scheduled for today. Use this space to review recent marks and homework.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Attendance" value={`${d.attendance.presentPercent.toFixed(1)}%`} tone="text-emerald-700" />
            <SnapshotStat label="Homework" value={String(d.recentHomework.length)} tone="text-amber-700" />
            <SnapshotStat label="Overdue" value={String(overdueHomework)} tone="text-rose-700" />
            <SnapshotStat label="Fees" value={d.fees.pendingAmount > 0 ? 'Pending' : 'Clear'} tone="text-sky-700" />
          </div>
        </div>
      </div>

      <div className="cc-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Learning Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Real-time readiness checks for classes, homework risk, and fee posture.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Class Day" value={d.todayTimetable.length > 0 ? 'Scheduled' : 'Free'} tone="text-sky-700" />
            <SnapshotStat label="Homework Risk" value={overdueHomework > 0 ? 'Watch' : 'Low'} tone="text-rose-700" />
            <SnapshotStat label="Results" value={String(d.recentResults.length)} tone="text-violet-700" />
            <SnapshotStat label="Fees" value={d.fees.pendingAmount > 0 ? 'Pending' : 'Clear'} tone="text-emerald-700" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="cc-fade-up cc-delay-1 space-y-1 rounded-[24px] border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Attendance</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{d.attendance.presentPercent.toFixed(1)}%</p>
          <p className="text-xs text-slate-500">{d.attendance.presentDays} of {d.attendance.totalDays} days present</p>
        </Card>

        <Card className="cc-fade-up cc-delay-2 space-y-1 rounded-[24px] border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Homework</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{d.recentHomework.length}</p>
          <p className="text-xs text-slate-500">Recent homework items</p>
        </Card>

        <Card className="cc-fade-up cc-delay-3 space-y-1 rounded-[24px] border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Today Classes</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{d.todayTimetable.length}</p>
          <p className="text-xs text-slate-500">Scheduled periods today</p>
        </Card>

        <Card className="cc-fade-up cc-delay-4 space-y-1 rounded-[24px] border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending Fees</p>
          <p className={`text-xl sm:text-2xl font-bold ${d.fees.pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            Rs. {d.fees.pendingAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">{d.fees.pendingAssignments} pending assignment(s)</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card className="cc-fade-up cc-delay-1 rounded-[24px] border-slate-200 bg-white shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Today's Timetable</h2>
          {d.todayTimetable.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No classes scheduled for today.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {d.todayTimetable.map((slot, index) => (
                <li key={`${slot.subjectName}-${slot.startTime}-${index}`} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 leading-5">{slot.subjectName}</p>
                    <span className="rounded-full bg-slate-100 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-slate-700 whitespace-nowrap">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                  {slot.label ? <p className="mt-1 text-xs text-slate-500">{slot.label}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="cc-fade-up cc-delay-2 rounded-[24px] border-slate-200 bg-white shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Recent Homework</h2>
          {d.recentHomework.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No homework has been assigned recently.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {d.recentHomework.map((homework) => (
                <li key={homework.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">{homework.title}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${homework.overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {homework.dueDate ? (homework.overdue ? `Overdue ${formatDate(homework.dueDate)}` : `Due ${formatDate(homework.dueDate)}`) : 'No due date'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="cc-fade-up cc-delay-3 rounded-[24px] border-slate-200 bg-white shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Recent Exam Results</h2>
        {d.recentResults.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No exam results available yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {d.recentResults.map((result, index) => (
              <div key={`${result.examTitle}-${result.examDate}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{result.examTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(result.examDate)}</p>
                <p className="mt-2 text-sm text-slate-700">
                  Marks: <span className="font-semibold">{result.marksObtained} / {result.maxMarks}</span>
                </p>
                <p className="mt-1 text-xs text-slate-600">Grade: {result.grade ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  )
}
