import { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FormInput } from '../../../components/ui/FormInput'
import { FormSelect } from '../../../components/ui/FormSelect'
import { PageHeader } from '../../../components/ui/PageHeader'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useSchoolDirectory } from '../../academic/hooks/useSchoolDirectory'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'

import { useAttendanceByDate, useMarkAttendance } from '../hooks/useAttendance'
import type { AttendanceRecord, AttendanceStatus, MarkAttendanceRequest } from '../types'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'EXCUSED', label: 'Excused' },
]

const STATUS_BADGE: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  ABSENT: 'bg-rose-100 text-rose-700',
  LATE: 'bg-amber-100 text-amber-700',
  EXCUSED: 'bg-slate-100 text-slate-600',
}

const today = new Date().toISOString().slice(0, 10)

const emptyForm: MarkAttendanceRequest = {
  studentId: '',
  classId: '',
  sectionId: '',
  attendanceDate: today,
  status: 'PRESENT',
  remarks: null,
}

export function AttendanceHubPage() {
  const [filterDate, setFilterDate] = useState(today)
  const [form, setForm] = useState<MarkAttendanceRequest>(emptyForm)

  const directory = useSchoolDirectory()
  const attendanceQuery = useAttendanceByDate(filterDate)
  const markMutation = useMarkAttendance()

  const records = attendanceQuery.data?.data ?? []
  const sectionOptions = directory.getSectionsForClass(form.classId)

  useEffect(() => {
    if (form.sectionId && !directory.isSectionValidForClass(form.classId, form.sectionId)) {
      setForm((current) => ({ ...current, sectionId: '' }))
    }
  }, [directory, form.classId, form.sectionId])

  const studentLabelById = useMemo(
    () => Object.fromEntries(directory.students.map((student) => [student.id, `${student.firstName} ${student.lastName} (${student.admissionNo})`])),
    [directory.students],
  )
  const classLabelById = useMemo(
    () => Object.fromEntries(directory.classes.map((item) => [item.id, item.name])),
    [directory.classes],
  )
  const sectionLabelById = useMemo(
    () => Object.fromEntries(directory.sections.map((item) => [item.id, `Section ${item.name}`])),
    [directory.sections],
  )

  const presentCount = records.filter((record) => record.status === 'PRESENT').length
  const absentCount = records.filter((record) => record.status === 'ABSENT').length
  const lateCount = records.filter((record) => record.status === 'LATE').length
  const excusedCount = records.filter((record) => record.status === 'EXCUSED').length
  const attendanceReady = records.length > 0

  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      key: 'studentId',
      header: 'Student',
      cell: (r) => <span className="font-medium text-slate-900">{studentLabelById[r.studentId] ?? 'Unknown student'}</span>,
    },
    {
      key: 'classId',
      header: 'Class',
      cell: (r) => classLabelById[r.classId] ?? 'Unknown class',
    },
    {
      key: 'sectionId',
      header: 'Section',
      cell: (r) => sectionLabelById[r.sectionId] ?? 'Unknown section',
    },
    { key: 'date', header: 'Date', cell: (r) => r.attendanceDate },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    { key: 'remarks', header: 'Remarks', cell: (r) => r.remarks ?? '—' },
  ]

  const handleMark = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!directory.isSectionValidForClass(form.classId, form.sectionId)) {
      showToast({
        title: 'Invalid section',
        description: 'Select a section that belongs to the chosen class.',
        tone: 'error',
      })
      return
    }

    try {
      const res = await markMutation.mutateAsync({
        ...form,
        remarks: form.remarks?.trim() || null,
      })
      if (!res.success) {
        showToast({ title: 'Not recorded', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Attendance recorded', description: `Status: ${res.data.status}`, tone: 'success' })
      setForm(emptyForm)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({
        title: 'Not recorded',
        description: axiosError.response?.data?.message ?? 'Unable to mark attendance',
        tone: 'error',
      })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Attendance" subtitle="Record daily attendance and view reports by date." />

      <Card className="p-0">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Daily Attendance Snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">Quick operational view for the selected date so staff can spot absentees and late arrivals before closing the register.</p>
        </div>
        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryChip label="Records" value={records.length} tone="slate" />
          <SummaryChip label="Present" value={presentCount} tone="emerald" />
          <SummaryChip label="Absent" value={absentCount} tone="rose" />
          <SummaryChip label="Late" value={lateCount} tone="amber" />
          <SummaryChip label="Excused" value={excusedCount} tone="slate" />
        </div>
        <div className="px-6 pb-5">
          <div className={`rounded-xl border px-4 py-3 ${attendanceReady ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className={`text-sm font-semibold ${attendanceReady ? 'text-emerald-700' : 'text-amber-700'}`}>
              {attendanceReady ? 'Attendance register is populated for this date.' : 'No records logged yet for this date.'}
            </p>
            <p className="mt-1 text-sm text-slate-600">Use the form below to mark class-wise attendance and then refresh the date view for confirmation.</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Attendance Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Operational guardrails for capture coverage and form completion readiness.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryChip label="Date Scope" value={filterDate === today ? 'Today' : 'Past'} tone="slate" />
            <SummaryChip label="Class Chosen" value={form.classId ? 1 : 0} tone={form.classId ? 'emerald' : 'slate'} />
            <SummaryChip label="Student Chosen" value={form.studentId ? 1 : 0} tone={form.studentId ? 'emerald' : 'slate'} />
            <SummaryChip label="Form Status" value={markMutation.isPending ? 'Saving' : 'Ready'} tone="amber" />
          </div>
        </div>
      </Card>

      {/* Mark attendance form */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handleMark}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Mark Attendance</h2>
            <p className="mt-1 text-sm text-slate-500">Select the class, section, and student, then record the attendance status.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SearchableSelect
              label="Student"
              selectedValue={form.studentId}
              onSelect={(value) => setForm((current) => ({ ...current, studentId: value }))}
              options={directory.studentOptions}
              placeholder="Search by name or admission number"
              emptyMessage="No student matched that search."
              helperText="Search using the student's name or admission number."
              required
            />
            <FormSelect
              label="Class"
              value={form.classId}
              onChange={(v) => setForm((f) => ({ ...f, classId: v }))}
              options={[{ value: '', label: 'Select a class' }, ...directory.classOptions]}
              required
            />
            <FormSelect
              label="Section"
              value={form.sectionId}
              onChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}
              options={[
                { value: '', label: form.classId ? 'Select a section' : 'Select a class first' },
                ...sectionOptions,
              ]}
              required
            />
            <FormInput
              label="Date"
              type="date"
              value={form.attendanceDate}
              onChange={(v) => setForm((f) => ({ ...f, attendanceDate: v }))}
              required
            />
            <FormSelect
              label="Status"
              value={form.status}
              onChange={(v) => setForm((f) => ({ ...f, status: v as AttendanceStatus }))}
              options={STATUS_OPTIONS}
              required
            />
            <FormInput
              label="Remarks (optional)"
              value={form.remarks ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, remarks: v }))}
              placeholder="On time, medical leave, etc."
            />
          </div>
          {directory.hasError ? (
            <p className="text-sm text-rose-600">School directory data could not be loaded. Refresh and try again.</p>
          ) : null}
          <div>
            <Button type="submit" disabled={markMutation.isPending || directory.isLoading}>
              {markMutation.isPending ? 'Saving…' : 'Mark Attendance'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Attendance early-warning alerts */}
      {records.length > 0 && (absentCount > 0 || lateCount > 0) && (
        <Card className="p-0">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-sm text-rose-600">!</span>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Early Warning Alerts</h2>
                <p className="text-sm text-slate-500">Students marked absent or late today — flagged for follow-up.</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {records
              .filter((r) => r.status === 'ABSENT' || r.status === 'LATE')
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{studentLabelById[r.studentId] ?? 'Unknown student'}</p>
                    <p className="text-xs text-slate-400">{classLabelById[r.classId] ?? '—'} · {sectionLabelById[r.sectionId] ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.remarks && <span className="text-xs text-slate-500 italic">"{r.remarks}"</span>}
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                  </div>
                </div>
              ))}
          </div>
          <div className="border-t border-slate-100 px-6 py-3">
            <p className="text-xs text-slate-400">{absentCount + lateCount} student{absentCount + lateCount !== 1 ? 's' : ''} require follow-up for {filterDate === today ? "today" : filterDate}. Contact guardians or log a remark.</p>
          </div>
        </Card>
      )}

      {/* Attendance list filtered by date */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Attendance Records</h2>
            <p className="mt-1 text-sm text-slate-500">Filter by date to view all attendance entries.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {attendanceQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : attendanceQuery.isError ? (
          <EmptyState title="Unable to load records" description="Attendance records could not be fetched for this date." />
        ) : (
          <DataTable
            columns={columns}
            rows={records}
            rowKey={(r) => r.id}
            emptyText="No attendance records for this date."
          />
        )}
      </div>
    </section>
  )
}

// ── At-Risk Student Dashboard ──────────────────────────────────────────────

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW'

interface AtRiskStudent {
  id: string
  name: string
  className: string
  section: string
  absenceDays: number
  lateDays: number
  riskLevel: RiskLevel
  note: string
}

const RISK_STYLE: Record<RiskLevel, string> = {
  HIGH: 'bg-rose-100 text-rose-700 border-rose-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-sky-100 text-sky-700 border-sky-200',
}

const SAMPLE_AT_RISK: AtRiskStudent[] = [
  { id: '1', name: 'Aarav Sharma', className: 'Class 9', section: 'A', absenceDays: 12, lateDays: 5, riskLevel: 'HIGH', note: 'Parent notified twice. Follow up pending.' },
  { id: '2', name: 'Priya Mehta', className: 'Class 7', section: 'B', absenceDays: 7, lateDays: 8, riskLevel: 'MEDIUM', note: 'Health-related absences. Medical certificate received.' },
  { id: '3', name: 'Rohit Das', className: 'Class 10', section: 'A', absenceDays: 4, lateDays: 11, riskLevel: 'LOW', note: 'Frequently late on Mondays. Counselor meeting scheduled.' },
]

export function AtRiskDashboard() {
  const [students] = useState<AtRiskStudent[]>(SAMPLE_AT_RISK)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">At-Risk Student Dashboard</h2>
          <p className="text-sm text-slate-500">Students flagged for chronic absenteeism or repeated tardiness.</p>
        </div>
        <div className="flex gap-2 text-xs">
          {(['HIGH', 'MEDIUM', 'LOW'] as RiskLevel[]).map((r) => (
            <span key={r} className={`rounded-full border px-2 py-0.5 font-semibold ${RISK_STYLE[r]}`}>{r}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {students.map((s) => (
          <div key={s.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${s.riskLevel === 'HIGH' ? 'border-rose-200' : s.riskLevel === 'MEDIUM' ? 'border-amber-200' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{s.name}</p>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{s.className} · {s.section}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RISK_STYLE[s.riskLevel]}`}>{s.riskLevel} RISK</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                  <span>Absent: <strong>{s.absenceDays} days</strong></span>
                  <span>Late: <strong>{s.lateDays} times</strong></span>
                </div>
                {s.note && <p className="mt-1 text-xs text-slate-400 italic">{s.note}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryChip({ label, value, tone }: { label: string; value: string | number; tone: 'slate' | 'emerald' | 'rose' | 'amber' }) {
  const classes = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  }

  return (
    <div className={`rounded-xl border px-4 py-3 ${classes[tone]}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  )
}
