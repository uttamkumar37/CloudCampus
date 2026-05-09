import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Skeleton } from '../../../components/ui/Skeleton'
import { showToast } from '../../../utils/toast'
import { assignClassTeacher, removeClassTeacher } from '../../academic/api/academicApi'
import { useAcademicSections } from '../../academic/hooks/useAcademicData'

import { useTeacherDetails } from '../hooks/useTeacherDetails'
import type { HomeworkItem, TeacherStatus, TimetableItem } from '../types'

// ─── helpers ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  '#1E3A8A', '#065F46', '#92400E', '#7C3AED',
  '#0E7490', '#9F1239', '#166534', '#1D4ED8',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

const STATUS_LABELS: Record<TeacherStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  RESIGNED: 'Resigned',
  ON_LEAVE: 'On Leave',
}

const STATUS_CLASSES: Record<TeacherStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  RESIGNED: 'bg-rose-100 text-rose-700',
  ON_LEAVE: 'bg-amber-100 text-amber-700',
}

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type ProfileTab = 'overview' | 'timetable' | 'homework' | 'assignments'

const TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'homework', label: 'Recent Homework' },
  { key: 'assignments', label: 'Class Assignments' },
]

function formatTime(time: string) {
  const [hours, minutes] = time.split(':')
  const hour = Number(hours)
  const period = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minutes} ${period}`
}

function getNextSlot(slots: TimetableItem[]) {
  return [...slots].sort((left, right) => {
    const dayDifference = left.dayOfWeek - right.dayOfWeek
    return dayDifference !== 0 ? dayDifference : left.startTime.localeCompare(right.startTime)
  })[0] ?? null
}

function LoadStat({
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

// ─── Class Assignments tab ────────────────────────────────────────────────────

function ClassAssignmentsTab({ teacherId }: { teacherId: string }) {
  const queryClient = useQueryClient()
  const sectionsQuery = useAcademicSections()
  const sections = sectionsQuery.data?.data ?? []
  const [selectedSectionId, setSelectedSectionId] = useState('')

  const assignMutation = useMutation({
    mutationFn: (sectionId: string) => assignClassTeacher(sectionId, teacherId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['academic', 'sections'] })
      void queryClient.invalidateQueries({ queryKey: ['teachers'] })
      showToast({ title: 'Class teacher assigned', tone: 'success' })
      setSelectedSectionId('')
    },
    onError: () => {
      showToast({ title: 'Failed to assign', description: 'Could not assign class teacher. Try again.', tone: 'error' })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeClassTeacher,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['academic', 'sections'] })
      void queryClient.invalidateQueries({ queryKey: ['teachers'] })
      showToast({ title: 'Class teacher removed', tone: 'success' })
    },
    onError: () => {
      showToast({ title: 'Failed to remove', description: 'Could not remove class teacher. Try again.', tone: 'error' })
    },
  })

  const myAssignments = sections.filter((s) => s.classTeacherId === teacherId)
  const unassignedSections = sections.filter((s) => !s.classTeacherId)

  if (sectionsQuery.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current assignments */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Currently Assigned As Class Teacher</h3>
        {myAssignments.length === 0 ? (
          <p className="text-sm text-slate-400">Not assigned as class teacher to any section.</p>
        ) : (
          <div className="space-y-2">
            {myAssignments.map((section) => (
              <div key={section.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <span className="font-medium text-slate-800">{section.className}</span>
                  <span className="mx-1.5 text-slate-400">—</span>
                  <span className="text-slate-700">{section.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(section.id)}
                  disabled={removeMutation.isPending}
                  className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign new section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Assign as Class Teacher</h3>
        {unassignedSections.length === 0 ? (
          <p className="text-sm text-slate-400">All sections already have a class teacher assigned.</p>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="cc-input h-9 flex-1 text-sm"
            >
              <option value="">Select a section…</option>
              {unassignedSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} — {s.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { if (selectedSectionId) assignMutation.mutate(selectedSectionId) }}
              disabled={!selectedSectionId || assignMutation.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export function TeacherAdminProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')

  const detailsQuery = useTeacherDetails(id!)

  if (detailsQuery.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (detailsQuery.isError || !detailsQuery.data?.data) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-500">
        Teacher not found or failed to load.
      </div>
    )
  }

  const { teacher, totalAssignedClasses, timetable, homework } = detailsQuery.data.data
  const fullName = `${teacher.firstName} ${teacher.lastName}`
  const initials = `${teacher.firstName[0] ?? ''}${teacher.lastName[0] ?? ''}`.toUpperCase()
  const bg = avatarColor(fullName)
  const nextSlot = getNextSlot(timetable)
  const openHomeworkCount = homework.filter((item: HomeworkItem) => !item.dueDate || new Date(item.dueDate) >= new Date()).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/teachers" className="hover:text-emerald-700">Teachers</Link>
        <span>/</span>
        <span className="text-slate-800">{fullName}</span>
      </nav>

      {/* Profile header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: bg }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[teacher.status]}`}>
                {STATUS_LABELS[teacher.status]}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-sm text-slate-500">{teacher.employeeNo}</p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>{teacher.email}</span>
              {teacher.phone ? <span>{teacher.phone}</span> : null}
              <span>Joined {teacher.hireDate}</span>
            </div>

            {teacher.classTeacherSections.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teacher.classTeacherSections.map((s) => (
                  <span key={s.sectionId} className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Class Teacher — {s.className} {s.sectionName}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Stats */}
          <div className="flex shrink-0 gap-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{totalAssignedClasses}</p>
              <p className="text-xs text-slate-500">Sections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{timetable.length}</p>
              <p className="text-xs text-slate-500">Slots</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Teacher Load Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{totalAssignedClasses} assigned section(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {nextSlot ? (
                <>
                  Next class: {nextSlot.subject ?? 'Subject'} · {nextSlot.className ?? 'Class'}{nextSlot.sectionName ? ` — ${nextSlot.sectionName}` : ''} · {formatTime(nextSlot.startTime)} – {formatTime(nextSlot.endTime)}
                </>
              ) : (
                'No timetable slots are assigned yet.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <LoadStat label="Sections" value={String(totalAssignedClasses)} tone="text-sky-700" />
            <LoadStat label="Slots" value={String(timetable.length)} tone="text-emerald-700" />
            <LoadStat label="Homework" value={String(homework.length)} tone="text-amber-700" />
            <LoadStat label="Open" value={String(openHomeworkCount)} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Teacher Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Monitor assignment load, timetable readiness, and open classroom obligations.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <LoadStat label="Class Teacher" value={teacher.classTeacherSections.length > 0 ? 'Assigned' : 'Open'} tone="text-sky-700" />
            <LoadStat label="Next Slot" value={nextSlot ? 'Scheduled' : 'None'} tone="text-emerald-700" />
            <LoadStat label="Homework" value={homework.length > 0 ? 'Live' : 'Quiet'} tone="text-violet-700" />
            <LoadStat label="Open Tasks" value={String(openHomeworkCount)} tone="text-amber-700" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Full Name</p>
                <p className="text-sm font-medium text-slate-800">{fullName}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Employee No</p>
                <p className="font-mono text-sm text-slate-800">{teacher.employeeNo}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                <p className="text-sm text-slate-800">{teacher.email}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                <p className="text-sm text-slate-800">{teacher.phone ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Hire Date</p>
                <p className="text-sm text-slate-800">{teacher.hireDate}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[teacher.status]}`}>
                  {STATUS_LABELS[teacher.status]}
                </span>
              </div>
            </div>
          )}

          {/* Timetable */}
          {activeTab === 'timetable' && (
            timetable.length === 0 ? (
              <p className="text-sm text-slate-400">No timetable slots assigned to this teacher.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="pb-2 pr-4">Day</th>
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Class</th>
                      <th className="pb-2 pr-4">Section</th>
                      <th className="pb-2">Subject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {timetable.map((slot) => (
                      <tr key={slot.slotId}>
                        <td className="py-2.5 pr-4 font-medium text-slate-700">{DAY_NAMES[slot.dayOfWeek] ?? slot.dayOfWeek}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-slate-600">{slot.startTime} – {slot.endTime}</td>
                        <td className="py-2.5 pr-4 text-slate-700">{slot.className ?? '—'}</td>
                        <td className="py-2.5 pr-4 text-slate-700">{slot.sectionName ?? '—'}</td>
                        <td className="py-2.5 text-slate-700">{slot.subject ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Recent Homework */}
          {activeTab === 'homework' && (
            homework.length === 0 ? (
              <p className="text-sm text-slate-400">No homework assigned by this teacher yet.</p>
            ) : (
              <div className="space-y-2">
                {homework.map((hw) => (
                  <div key={hw.id} className="flex items-start justify-between rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="font-medium text-slate-800">{hw.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {hw.className ?? '—'}
                        {hw.sectionName ? ` — ${hw.sectionName}` : ''}
                        {hw.dueDate ? ` · Due ${hw.dueDate}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {new Date(hw.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Class Assignments */}
          {activeTab === 'assignments' && (
            <ClassAssignmentsTab teacherId={teacher.id} />
          )}
        </div>
      </div>
    </div>
  )
}
