import { Link } from 'react-router-dom'

import { useStudentDashboard } from '../hooks/useStudentDashboard'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import type {
  AttendanceDay,
  ExamResultSummary,
  HomeworkSummaryStudent,
  TimetableSlotSummaryStudent,
} from '../types'

const STATUS_COLOR: Record<string, string> = {
  PRESENT: 'bg-emerald-500',
  LATE: 'bg-amber-400',
  EXCUSED: 'bg-sky-400',
  ABSENT: 'bg-red-500',
  NO_RECORD: 'bg-slate-200',
}

function AttendanceBar({ days }: { days: AttendanceDay[] }) {
  return (
    <div className="flex items-end gap-1">
      {days.map((d) => (
        <div key={d.date} className="flex flex-col items-center gap-1">
          <div className={`h-8 w-5 rounded ${STATUS_COLOR[d.status] ?? 'bg-slate-200'}`} title={`${d.date}: ${d.status}`} />
          <span className="text-[10px] text-slate-400">
            {new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 1)}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function StudentDashboardPage() {
  const { data, isLoading, isError } = useStudentDashboard()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading your dashboard…" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        Failed to load dashboard. Please refresh or try again.
      </div>
    )
  }

  const d = data.data
  const { profile, attendance, fees, recentResults, recentHomework, todayTimetable } = d

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile.firstName}!`}
        subtitle={`Admission No: ${profile.admissionNo} · ${profile.email}`}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Attendance" value={`${attendance.presentPercent}%`} sub={`${attendance.presentDays} / ${attendance.totalDays} days`} color="text-emerald-600" />
        <KpiCard label="Total Fees" value={`₹${fees.totalAmount.toLocaleString()}`} sub={`${fees.pendingAssignments} pending`} color="text-slate-700" />
        <KpiCard label="Fees Paid" value={`₹${fees.paidAmount.toLocaleString()}`} sub="collected so far" color="text-sky-600" />
        <KpiCard label="Pending Fees" value={`₹${fees.pendingAmount.toLocaleString()}`} sub={`${fees.pendingAssignments} item(s)`} color={fees.pendingAmount > 0 ? 'text-red-600' : 'text-emerald-600'} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { to: '/student/learning', title: 'Open Timetable', description: 'See today\'s classes in your personal dashboard.' },
          { to: '/student/learning', title: 'Review Homework', description: 'Check recent assigned work for your account.' },
          { to: '/student/learning', title: 'View Attendance', description: 'Track your attendance trend and status.' },
          { to: '/fees', title: 'Check Fees', description: 'See pending and paid items.' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance last 7 days */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Last 7-Day Attendance</h2>
          {attendance.lastSevenDays.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance records yet.</p>
          ) : (
            <>
              <AttendanceBar days={attendance.lastSevenDays} />
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                {Object.entries(STATUS_COLOR).map(([status, cls]) => (
                  <span key={status} className="flex items-center gap-1">
                    <span className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
                    {status.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Today's timetable */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Today's Classes</h2>
          {todayTimetable.length === 0 ? (
            <p className="text-sm text-slate-500">No classes scheduled for today.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayTimetable.map((slot: TimetableSlotSummaryStudent, i: number) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{slot.subjectName}</p>
                    {slot.label && <p className="text-xs text-slate-500">{slot.label}</p>}
                  </div>
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent exam results */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Recent Exam Results</h2>
          {recentResults.length === 0 ? (
            <p className="text-sm text-slate-500">No exam results published yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentResults.map((r: ExamResultSummary, i: number) => {
                const pct = r.maxMarks > 0 ? Math.round((r.marksObtained / r.maxMarks) * 100) : 0
                return (
                  <li key={i} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{r.examTitle}</p>
                        <p className="text-xs text-slate-500">{formatDate(r.examDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          {r.marksObtained} / {r.maxMarks}
                        </p>
                        {r.grade && (
                          <span className="text-xs font-medium text-emerald-600">Grade: {r.grade}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Recent homework */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Recent Homework</h2>
          {recentHomework.length === 0 ? (
            <p className="text-sm text-slate-500">No homework assigned recently.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentHomework.map((hw: HomeworkSummaryStudent) => (
                <li key={hw.id} className="flex items-center justify-between py-3">
                  <p className="text-sm font-medium text-slate-800">{hw.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      hw.overdue
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {hw.dueDate ? (hw.overdue ? `Overdue · ${formatDate(hw.dueDate)}` : `Due ${formatDate(hw.dueDate)}`) : 'No due date'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </Card>
  )
}
