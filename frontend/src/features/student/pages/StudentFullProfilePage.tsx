import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyStudentDetails } from '../hooks/useMyStudentDetails'
import { Spinner } from '../../../components/ui/Spinner'
import type {
  StudentAttendanceItem,
  StudentExamItem,
  StudentFeeItem,
  StudentFullDetail,
  StudentHomeworkItem,
  StudentParentContact,
} from '../types'

type Tab = 'overview' | 'parents' | 'exams' | 'attendance' | 'fees' | 'homework'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'parents', label: 'Parents' },
  { id: 'exams', label: 'Exams & Results' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'fees', label: 'Fee Statement' },
  { id: 'homework', label: 'Homework' },
]

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-amber-100 text-amber-700',
  EXCUSED: 'bg-sky-100 text-sky-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIALLY_PAID: 'bg-sky-100 text-sky-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function Badge({ label, color }: { label: string; color?: string }) {
  const cls = color ?? STATUS_COLORS[label] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-400">
      {text}
    </div>
  )
}

function OverviewTab({ detail }: { detail: StudentFullDetail }) {
  const { student, attendance } = detail
  const currentClass = attendance[0]
  const presentDays = attendance.filter((a) => a.status === 'PRESENT').length
  const pct = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0
  const totalFees = detail.fees.reduce((s, f) => s + f.amount, 0)
  const overdueFees = detail.fees.filter((f) => f.status === 'OVERDUE').length

  return (
    <div className="space-y-5">
      {/* Identity grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Admission No', value: student.admissionNo },
          { label: 'Full Name', value: `${student.firstName} ${student.lastName}` },
          { label: 'Date of Birth', value: fmtDate(student.dateOfBirth) },
          { label: 'Gender', value: student.gender ?? '—' },
          { label: 'Email', value: student.email ?? '—' },
          { label: 'Phone', value: student.phone ?? '—' },
          { label: 'Current Class', value: currentClass ? `${currentClass.className ?? '—'} – ${currentClass.sectionName ?? '—'}` : '—' },
          { label: 'Enrolled On', value: fmtDate(student.createdAt) },
          { label: 'Status', value: student.active ? 'Active' : 'Inactive' },
        ].map((row) => (
          <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 break-all">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Records" value={String(attendance.length)} color="text-slate-700" />
        <StatCard label="Attendance" value={`${pct}%`} color={pct >= 75 ? 'text-emerald-600' : 'text-red-600'} />
        <StatCard label="Total Fees" value={fmtCurrency(totalFees)} color="text-slate-700" />
        <StatCard label="Overdue" value={String(overdueFees)} color={overdueFees > 0 ? 'text-red-600' : 'text-emerald-600'} />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function ParentsTab({ parents }: { parents: StudentParentContact[] }) {
  if (parents.length === 0) return <EmptyState text="No parent contacts linked to this student." />
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {parents.map((p) => (
        <div key={p.parentUserId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {(p.parentName ?? 'P').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{p.parentName ?? 'Unknown'}</p>
              <p className="text-xs text-slate-400">Parent / Guardian</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {p.parentEmail && (
              <div className="flex items-center gap-2 text-slate-600">
                <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {p.parentEmail}
              </div>
            )}
            {p.parentPhone && (
              <div className="flex items-center gap-2 text-slate-600">
                <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {p.parentPhone}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExamsTab({ exams }: { exams: StudentExamItem[] }) {
  if (exams.length === 0) return <EmptyState text="No exam results published yet." />
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Exam</th>
            <th className="px-4 py-3 text-left">Subject</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Marks</th>
            <th className="px-4 py-3 text-center">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {exams.map((e) => (
            <tr key={e.resultId} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{e.examTitle ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600">{e.subject ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500">{fmtDate(e.examDate)}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">{e.marksObtained}</td>
              <td className="px-4 py-3 text-center">
                {e.grade ? <Badge label={e.grade} color="bg-emerald-100 text-emerald-700" /> : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AttendanceTab({ attendance }: { attendance: StudentAttendanceItem[] }) {
  if (attendance.length === 0) return <EmptyState text="No attendance records found." />
  const presentDays = attendance.filter((a) => a.status === 'PRESENT').length
  const absentDays = attendance.filter((a) => a.status === 'ABSENT').length
  const lateDays = attendance.filter((a) => a.status === 'LATE').length
  const pct = Math.round((presentDays / attendance.length) * 100)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Days" value={String(attendance.length)} color="text-slate-700" />
        <StatCard label="Present" value={String(presentDays)} color="text-emerald-600" />
        <StatCard label="Absent" value={String(absentDays)} color="text-red-600" />
        <StatCard label="Late" value={String(lateDays)} color="text-amber-600" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-semibold text-slate-700">{pct}%</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {attendance.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{fmtDate(a.date)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {a.className ?? '—'}{a.sectionName ? ` · ${a.sectionName}` : ''}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge label={a.status} />
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.remarks ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FeesTab({ fees }: { fees: StudentFeeItem[] }) {
  if (fees.length === 0) return <EmptyState text="No fee records found." />
  const total = fees.reduce((s, f) => s + f.amount, 0)
  const paid = fees.filter((f) => f.status === 'PAID').length
  const overdue = fees.filter((f) => f.status === 'OVERDUE').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Fees" value={fmtCurrency(total)} color="text-slate-700" />
        <StatCard label="Paid" value={String(paid)} color="text-emerald-600" />
        <StatCard label="Overdue" value={String(overdue)} color={overdue > 0 ? 'text-red-600' : 'text-emerald-600'} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {fees.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{f.title}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmtCurrency(f.amount)}</td>
                <td className="px-4 py-3 text-slate-500">{fmtDate(f.dueDate)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge label={f.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HomeworkTab({ homework }: { homework: StudentHomeworkItem[] }) {
  if (homework.length === 0) return <EmptyState text="No homework records found." />
  return (
    <div className="space-y-3">
      {homework.map((hw) => {
        const isOverdue = hw.dueDate ? new Date(hw.dueDate) < new Date() : false
        return (
          <div key={hw.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold text-slate-800">{hw.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {hw.className ?? '—'}{hw.sectionName ? ` · ${hw.sectionName}` : ''} · Assigned {fmtDate(hw.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {hw.dueDate ? (isOverdue ? `Overdue · ${fmtDate(hw.dueDate)}` : `Due ${fmtDate(hw.dueDate)}`) : 'No due date'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function StudentFullProfilePage() {
  const [tab, setTab] = useState<Tab>('overview')
  const { data, isLoading, isError } = useMyStudentDetails()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading your profile…" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        Failed to load profile. Please refresh or try again.
      </div>
    )
  }

  const detail = data.data
  const { student } = detail
  const initials = `${student.firstName.slice(0, 1)}${student.lastName.slice(0, 1)}`.toUpperCase()
  const currentClass = detail.attendance[0]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/student/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Hero card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-2xl font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{student.firstName} {student.lastName}</h1>
            <p className="text-sm text-slate-500">Admission No: <span className="font-semibold text-slate-700">{student.admissionNo}</span></p>
            {currentClass && (
              <p className="text-sm text-slate-500">
                Class: <span className="font-semibold text-slate-700">{currentClass.className ?? '—'}</span>
                {currentClass.sectionName && <> · Section: <span className="font-semibold text-slate-700">{currentClass.sectionName}</span></>}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {student.email && (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {student.email}
                </span>
              )}
              {student.phone && (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {student.phone}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {student.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white shadow-sm text-sky-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'overview' && <OverviewTab detail={detail} />}
        {tab === 'parents' && <ParentsTab parents={detail.parents} />}
        {tab === 'exams' && <ExamsTab exams={detail.exams} />}
        {tab === 'attendance' && <AttendanceTab attendance={detail.attendance} />}
        {tab === 'fees' && <FeesTab fees={detail.fees} />}
        {tab === 'homework' && <HomeworkTab homework={detail.homework} />}
      </div>
    </div>
  )
}
