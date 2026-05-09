import { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FormInput } from '../../../components/ui/FormInput'
import { FormSelect } from '../../../components/ui/FormSelect'
import { PageHeader } from '../../../components/ui/PageHeader'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useSchoolDirectory } from '../../academic/hooks/useSchoolDirectory'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'

import { useCreateTimetableSlot, useTimetable } from '../hooks/useTimetable'
import type { CreateTimetableSlotRequest, TimetableSlot } from '../types'

const DAY_NAMES: Record<number, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday',
}

const DAY_OPTIONS = Object.entries(DAY_NAMES).map(([value, label]) => ({ value, label }))

const emptyForm: CreateTimetableSlotRequest = {
  classId: '',
  sectionId: '',
  subjectId: '',
  teacherId: null,
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '09:00',
  label: null,
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':')
  const hour = Number(hours)
  const period = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minutes} ${period}`
}

// Group slots by day for the weekly grid view
function groupByDay(slots: TimetableSlot[]) {
  return slots.reduce<Record<number, TimetableSlot[]>>((acc, slot) => {
    const day = slot.dayOfWeek
    if (!acc[day]) acc[day] = []
    acc[day].push(slot)
    return acc
  }, {})
}

function getNextSlot(slots: TimetableSlot[]) {
  return [...slots].sort((left, right) => {
    const dayDifference = left.dayOfWeek - right.dayOfWeek
    return dayDifference !== 0 ? dayDifference : left.startTime.localeCompare(right.startTime)
  })[0] ?? null
}

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

type TimetableView = 'weekly' | 'calendar'

type CalendarEventType = 'TERM' | 'HOLIDAY' | 'EXAM' | 'EVENT'

interface CalendarEvent {
  id: string
  name: string
  startDate: string
  endDate: string
  type: CalendarEventType
  description: string
}

const EVENT_TYPE_STYLE: Record<CalendarEventType, string> = {
  TERM: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  HOLIDAY: 'border-amber-200 bg-amber-50 text-amber-700',
  EXAM: 'border-rose-200 bg-rose-50 text-rose-700',
  EVENT: 'border-sky-200 bg-sky-50 text-sky-700',
}

export function TimetablePage() {
  const [view, setView] = useState<TimetableView>('weekly')
  const [form, setForm] = useState<CreateTimetableSlotRequest>(emptyForm)
  const [searchClassId, setSearchClassId] = useState('')
  const [searchSectionId, setSearchSectionId] = useState('')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calForm, setCalForm] = useState({ name: '', startDate: '', endDate: '', type: 'TERM' as CalendarEventType, description: '' })

  const directory = useSchoolDirectory()
  const createMutation = useCreateTimetableSlot()
  const timetableQuery = useTimetable(searchClassId, searchSectionId)

  const slots = timetableQuery.data?.data ?? []
  const grouped = groupByDay(slots)
  const nextSlot = getNextSlot(slots)
  const uniqueDays = new Set(slots.map((slot) => slot.dayOfWeek)).size
  const formSectionOptions = directory.getSectionsForClass(form.classId)
  const lookupSectionOptions = directory.getSectionsForClass(searchClassId)
  const subjectLabelById = useMemo(
    () => Object.fromEntries(directory.subjects.map((item) => [item.id, item.name])),
    [directory.subjects],
  )
  const teacherLabelById = useMemo(
    () => Object.fromEntries(directory.teachers.map((item) => [item.id, `${item.firstName} ${item.lastName}`])),
    [directory.teachers],
  )

  useEffect(() => {
    if (form.sectionId && !directory.isSectionValidForClass(form.classId, form.sectionId)) {
      setForm((current) => ({ ...current, sectionId: '' }))
    }
  }, [directory, form.classId, form.sectionId])

  useEffect(() => {
    if (searchSectionId && !directory.isSectionValidForClass(searchClassId, searchSectionId)) {
      setSearchSectionId('')
    }
  }, [directory, searchClassId, searchSectionId])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.sectionId || !directory.isSectionValidForClass(form.classId, form.sectionId)) {
      showToast({ title: 'Invalid section', description: 'Select a section that belongs to the chosen class.', tone: 'error' })
      return
    }

    try {
      const res = await createMutation.mutateAsync({
        ...form,
        sectionId: form.sectionId.trim(),
        subjectId: form.subjectId.trim(),
        teacherId: form.teacherId?.trim() || null,
        label: form.label?.trim() || null,
      })
      if (!res.success) {
        showToast({ title: 'Slot not created', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Slot created', description: `${DAY_NAMES[res.data.dayOfWeek]} ${res.data.startTime}–${res.data.endTime}`, tone: 'success' })
      setForm(emptyForm)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Slot not created', description: axiosError.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Timetable" subtitle="Manage weekly class schedules and the academic calendar." />

      <div className="flex gap-2">
        {(['weekly', 'calendar'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${view === v ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {v === 'weekly' ? 'Weekly Schedule' : 'Academic Calendar'}
          </button>
        ))}
      </div>

      {view === 'calendar' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Academic Calendar</h2>
            <p className="mt-1 text-sm text-slate-500">Define terms, holidays, exam windows, and school events for the academic year.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['TERM', 'EXAM', 'HOLIDAY', 'EVENT'] as const).map((type) => (
                <div key={type} className={`rounded-xl border px-4 py-3 ${EVENT_TYPE_STYLE[type]}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{type}</p>
                  <p className="mt-1 text-xl font-bold">{calendarEvents.filter((e) => e.type === type).length}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Add Calendar Event</h3>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                if (!calForm.name.trim() || !calForm.startDate || !calForm.endDate) return
                setCalendarEvents((prev) => [...prev, { id: crypto.randomUUID(), ...calForm }].sort((a, b) => a.startDate.localeCompare(b.startDate)))
                setCalForm((p) => ({ ...p, name: '', startDate: '', endDate: '', description: '' }))
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="text" placeholder="Event name (e.g. Term 1, Diwali Break)" value={calForm.name} onChange={(e) => setCalForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <select value={calForm.type} onChange={(e) => setCalForm((p) => ({ ...p, type: e.target.value as CalendarEventType }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="TERM">Term</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAM">Exam</option>
                  <option value="EVENT">School Event</option>
                </select>
                <input type="date" value={calForm.startDate} onChange={(e) => setCalForm((p) => ({ ...p, startDate: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="date" value={calForm.endDate} onChange={(e) => setCalForm((p) => ({ ...p, endDate: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Description (optional)" value={calForm.description} onChange={(e) => setCalForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add Event</button>
            </form>
          </div>

          {calendarEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No calendar events yet. Add terms, holidays, and exam windows above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${EVENT_TYPE_STYLE[ev.type]}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{ev.name}</p>
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold opacity-80">{ev.type}</span>
                    </div>
                    <p className="mt-0.5 text-xs opacity-70">{ev.startDate} → {ev.endDate}{ev.description ? ` · ${ev.description}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => setCalendarEvents((prev) => prev.filter((e) => e.id !== ev.id))} className="text-xs opacity-50 hover:opacity-100 transition">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'weekly' && (

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Timetable Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{slots.length} loaded slot(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {nextSlot ? (
                <>
                  Next class: {DAY_NAMES[nextSlot.dayOfWeek]} · {formatTime(nextSlot.startTime)} – {formatTime(nextSlot.endTime)}
                  {nextSlot.label ? ` · ${nextSlot.label}` : ''}
                </>
              ) : (
                'Select a class and section to load the weekly schedule.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Slots" value={String(slots.length)} tone="text-sky-700" />
            <SnapshotStat label="Days" value={String(uniqueDays)} tone="text-emerald-700" />
            <SnapshotStat label="Search Class" value={searchClassId ? 'Set' : 'Open'} tone="text-amber-700" />
            <SnapshotStat label="Search Section" value={searchSectionId ? 'Set' : 'Open'} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Schedule Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Readiness indicators for slot creation and current lookup filter state.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Class" value={form.classId ? 'Set' : 'Open'} tone="text-sky-700" />
            <SnapshotStat label="Section" value={form.sectionId ? 'Set' : 'Open'} tone="text-violet-700" />
            <SnapshotStat label="Teacher" value={form.teacherId ? 'Set' : 'Optional'} tone="text-emerald-700" />
            <SnapshotStat label="Create" value={createMutation.isPending ? 'Saving' : 'Ready'} tone="text-amber-700" />
          </div>
        </div>
      </Card>

      {/* Create slot form */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handleCreate}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Add Timetable Slot</h2>
            <p className="mt-1 text-sm text-slate-500">Define a period in the weekly schedule for a class.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Class"
              value={form.classId}
              onChange={(v) => setForm((f) => ({ ...f, classId: v }))}
              options={[{ value: '', label: 'Select a class' }, ...directory.classOptions]}
              required
            />
            <FormSelect
              label="Section"
              value={form.sectionId ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}
              options={[
                { value: '', label: form.classId ? 'Select a section' : 'Select a class first' },
                ...formSectionOptions,
              ]}
              required
            />
            <SearchableSelect
              label="Subject"
              selectedValue={form.subjectId ?? ''}
              onSelect={(value) => setForm((current) => ({ ...current, subjectId: value }))}
              options={directory.subjectOptions}
              placeholder="Search subject"
              emptyMessage="No subject matched that search."
            />
            <SearchableSelect
              label="Teacher"
              selectedValue={form.teacherId ?? ''}
              onSelect={(value) => setForm((current) => ({ ...current, teacherId: value || null }))}
              options={directory.teacherOptions}
              placeholder="Search teacher"
              emptyMessage="No teacher matched that search."
            />
            <FormSelect
              label="Day of Week"
              value={String(form.dayOfWeek)}
              onChange={(v) => setForm((f) => ({ ...f, dayOfWeek: Number(v) }))}
              options={DAY_OPTIONS}
              required
            />
            <FormInput
              label="Start Time (HH:mm)"
              type="time"
              value={form.startTime}
              onChange={(v) => setForm((f) => ({ ...f, startTime: v }))}
              required
            />
            <FormInput
              label="End Time (HH:mm)"
              type="time"
              value={form.endTime}
              onChange={(v) => setForm((f) => ({ ...f, endTime: v }))}
              required
            />
            <div className="md:col-span-2">
              <FormInput
                label="Label (optional)"
                value={form.label ?? ''}
                onChange={(v) => setForm((f) => ({ ...f, label: v }))}
                placeholder="Mathematics - Period 1"
              />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={createMutation.isPending || directory.isLoading}>
              {createMutation.isPending ? 'Saving…' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Weekly grid view */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-950">Weekly View</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a class and section to load the schedule.</p>
          </div>
          <div className="grid w-full gap-4 md:max-w-3xl md:grid-cols-2">
            <FormSelect
              label="Class"
              value={searchClassId}
              onChange={setSearchClassId}
              options={[{ value: '', label: 'Select a class' }, ...directory.classOptions]}
            />
            <FormSelect
              label="Section"
              value={searchSectionId}
              onChange={setSearchSectionId}
              options={[
                { value: '', label: searchClassId ? 'Select a section' : 'Select a class first' },
                ...lookupSectionOptions,
              ]}
            />
          </div>
        </div>

        {timetableQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : timetableQuery.isError ? (
          <EmptyState title="Unable to load timetable" description="Could not fetch the schedule for this class and section." />
        ) : slots.length === 0 ? (
          <EmptyState
            title={searchClassId ? 'No slots found' : 'Select a class and section to load the timetable'}
            description={searchClassId ? 'No timetable slots have been created yet.' : ''}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((day) => (
              <div key={day} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-900">{DAY_NAMES[day]}</p>
                {grouped[day] ? (
                  <div className="space-y-2">
                    {grouped[day]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div key={slot.id} className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-xs font-medium text-slate-700">
                            {slot.startTime}–{slot.endTime}
                          </p>
                          {slot.subjectId ? <p className="mt-0.5 text-xs text-slate-600">{subjectLabelById[slot.subjectId] ?? 'Unknown subject'}</p> : null}
                          {slot.teacherId ? <p className="mt-0.5 text-xs text-slate-500">{teacherLabelById[slot.teacherId] ?? 'Unknown teacher'}</p> : null}
                          {slot.label ? <p className="text-xs text-slate-500 mt-0.5">{slot.label}</p> : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No periods</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      <SubstituteTeacherPanel />
    </section>
  )
}

// ── Substitute Teacher Assignment Panel ────────────────────────────────────

interface SubAssignment {
  id: string
  date: string
  absentTeacher: string
  className: string
  period: string
  substituteTeacher: string
  subject: string
  note: string
}

const todayDate = new Date().toISOString().slice(0, 10)

function SubstituteTeacherPanel() {
  const [assignments, setAssignments] = useState<SubAssignment[]>([])
  const [form, setForm] = useState({ date: todayDate, absentTeacher: '', className: '', period: '', substituteTeacher: '', subject: '', note: '' })
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.absentTeacher.trim() || !form.substituteTeacher.trim()) return
    setAssignments((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev])
    setForm((p) => ({ ...p, absentTeacher: '', className: '', period: '', substituteTeacher: '', subject: '', note: '' }))
    setShowForm(false)
  }

  const todayCount = assignments.filter((a) => a.date === todayDate).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Substitute Teacher Assignments</h2>
          <p className="text-sm text-slate-500">Assign substitute teachers when staff are absent. {todayCount > 0 && <span className="font-semibold text-amber-600">{todayCount} today</span>}</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Assign Substitute'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Absent teacher name" value={form.absentTeacher} onChange={(e) => setForm((p) => ({ ...p, absentTeacher: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Substitute teacher name" value={form.substituteTeacher} onChange={(e) => setForm((p) => ({ ...p, substituteTeacher: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Class / Section" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Period (e.g. 3rd, 10:00–11:00)" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <input type="text" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Assignment</button>
          </form>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No substitute assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{a.substituteTeacher}</p>
                  <span className="text-xs text-slate-400">→ covering for</span>
                  <p className="font-medium text-slate-700">{a.absentTeacher}</p>
                  {a.date === todayDate && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">TODAY</span>}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{a.date}{a.className ? ` · ${a.className}` : ''}{a.period ? ` · ${a.period}` : ''}{a.subject ? ` · ${a.subject}` : ''}</p>
                {a.note && <p className="mt-0.5 text-xs text-slate-400 italic">{a.note}</p>}
              </div>
              <button type="button" onClick={() => setAssignments((prev) => prev.filter((x) => x.id !== a.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
