import { Link } from 'react-router-dom'

import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import type {
  AssignedClassInfo,
  ExamSummaryTeacher,
  HomeworkSummaryTeacher,
  TimetableSlotSummaryTeacher,
} from '../types'

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getNextTeachingSlot(slots: TimetableSlotSummaryTeacher[]) {
  return [...slots].sort((left, right) => left.startTime.localeCompare(right.startTime))[0] ?? null
}

export function TeacherDashboardPage() {
  const { data, isLoading, isError } = useTeacherDashboard()

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
  const { profile, assignedClasses, recentHomework, recentExams, todayTimetable } = d
  const nextTeachingSlot = getNextTeachingSlot(todayTimetable)
  const timetableCoverage = assignedClasses.length > 0 ? Math.round((todayTimetable.length / assignedClasses.length) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile.firstName} ${profile.lastName}`}
        subtitle={`Employee No: ${profile.employeeNo} · ${profile.email}`}
      />

      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">Teacher Workspace</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Teaching Snapshot</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {nextTeachingSlot ? (
                <>
                  Next period: {nextTeachingSlot.subjectName} · {nextTeachingSlot.className} – {nextTeachingSlot.sectionName}
                  {nextTeachingSlot.label ? ` · ${nextTeachingSlot.label}` : ''} · {formatTime(nextTeachingSlot.startTime)} – {formatTime(nextTeachingSlot.endTime)}
                </>
              ) : (
                'No periods are scheduled for today. You can still review homework and exam updates from this dashboard.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Classes Today" value={String(todayTimetable.length)} tone="text-indigo-700" />
            <SnapshotStat label="Assigned Sections" value={String(assignedClasses.length)} tone="text-sky-700" />
            <SnapshotStat label="Homework" value={String(recentHomework.length)} tone="text-amber-700" />
            <SnapshotStat label="Exams" value={String(recentExams.length)} tone="text-emerald-700" />
          </div>
        </div>
      </Card>

      <Card className="border-slate-200 bg-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Teaching Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Keep daily execution visible with quick indicators for section coverage and delivery momentum.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Coverage" value={`${timetableCoverage}%`} tone="text-indigo-700" />
            <SnapshotStat label="Sections" value={String(assignedClasses.length)} tone="text-sky-700" />
            <SnapshotStat label="Homeworks" value={String(recentHomework.length)} tone="text-amber-700" />
            <SnapshotStat label="Exams" value={String(recentExams.length)} tone="text-emerald-700" />
          </div>
        </div>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Assigned Classes" value={String(assignedClasses.length)} sub="class-section pairs" color="text-indigo-600" />
        <KpiCard label="Today's Periods" value={String(todayTimetable.length)} sub="scheduled today" color="text-sky-600" />
        <KpiCard label="Recent Homework" value={String(recentHomework.length)} sub="assignments set" color="text-amber-600" />
        <KpiCard label="Upcoming Exams" value={String(recentExams.length)} sub="recent exams" color="text-emerald-600" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { to: '/attendance', title: 'Mark Attendance', description: 'Jump straight into class attendance.' },
          { to: '/marks', title: 'Grade Students', description: 'Schedule exams and publish marks.' },
          { to: '/homework', title: 'Manage Homework', description: 'Assign work by class and section.' },
          { to: '/timetable', title: 'Manage Timetable', description: 'Assign periods with teacher search.' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's timetable */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Today's Schedule</h2>
          {todayTimetable.length === 0 ? (
            <p className="text-sm text-slate-500">No periods scheduled for today.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayTimetable.map((slot: TimetableSlotSummaryTeacher, i: number) => (
                <li key={i} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{slot.subjectName}</p>
                      <p className="text-xs text-slate-500">
                        {slot.className} – {slot.sectionName}
                        {slot.label ? ` · ${slot.label}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Assigned classes */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Assigned Classes</h2>
          {assignedClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No classes assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedClasses.map((cls: AssignedClassInfo) => (
                <span
                  key={`${cls.classId}-${cls.sectionId}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                >
                  {cls.className} – {cls.sectionName}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Recent homework */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Recent Homework Set</h2>
          {recentHomework.length === 0 ? (
            <p className="text-sm text-slate-500">No homework assigned recently.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentHomework.map((hw: HomeworkSummaryTeacher) => (
                <li key={hw.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{hw.title}</p>
                    <p className="text-xs text-slate-500">{hw.className}</p>
                  </div>
                  {hw.dueDate && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Due {formatDate(hw.dueDate)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent exams */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Recent Exams</h2>
          {recentExams.length === 0 ? (
            <p className="text-sm text-slate-500">No exams for your classes yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentExams.map((exam: ExamSummaryTeacher) => (
                <li key={exam.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{exam.title}</p>
                    <p className="text-xs text-slate-500">{exam.className}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {formatDate(exam.examDate)}
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

function SnapshotStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}
