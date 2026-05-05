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

  return (
    <section className="space-y-5 sm:space-y-6">
      <PageHeader
        title="My Learning"
        subtitle="Personal dashboard for your classes, homework, attendance, and exam results."
      />

      <div className="cc-fade-up overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Student Workspace</p>
        <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Focused, personal, and private</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This page shows only your own learning data, including attendance, homework, timetable, results, and fee status.
        </p>
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
