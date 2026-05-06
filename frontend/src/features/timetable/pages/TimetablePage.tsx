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

// Group slots by day for the weekly grid view
function groupByDay(slots: TimetableSlot[]) {
  return slots.reduce<Record<number, TimetableSlot[]>>((acc, slot) => {
    const day = slot.dayOfWeek
    if (!acc[day]) acc[day] = []
    acc[day].push(slot)
    return acc
  }, {})
}

export function TimetablePage() {
  const [form, setForm] = useState<CreateTimetableSlotRequest>(emptyForm)
  const [searchClassId, setSearchClassId] = useState('')
  const [searchSectionId, setSearchSectionId] = useState('')

  const directory = useSchoolDirectory()
  const createMutation = useCreateTimetableSlot()
  const timetableQuery = useTimetable(searchClassId, searchSectionId)

  const slots = timetableQuery.data?.data ?? []
  const grouped = groupByDay(slots)
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
      <PageHeader title="Timetable" subtitle="Manage weekly class schedules. Day 1 = Monday … 7 = Sunday." />

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
    </section>
  )
}
