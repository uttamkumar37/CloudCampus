import { AxiosError } from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FormInput } from '../../../components/ui/FormInput'
import { FormSelect } from '../../../components/ui/FormSelect'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'
import { useSchoolDirectory } from '../../academic/hooks/useSchoolDirectory'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'

import { useCreateHomework, useHomeworkByClass } from '../hooks/useHomework'
import type { CreateHomeworkRequest } from '../types'

const today = new Date().toISOString().slice(0, 10)

const emptyForm: CreateHomeworkRequest = {
  title: '',
  description: null,
  classId: '',
  sectionId: null,
  dueDate: null,
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getNextDue(items: Array<{ dueDate: string | null; classId: string; sectionId: string | null }>) {
  return [...items]
    .filter((item) => item.dueDate !== null)
    .sort((left, right) => String(left.dueDate).localeCompare(String(right.dueDate)))[0] ?? null
}

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

interface DiaryEntry {
  id: string
  date: string
  className: string
  subject: string
  topicCovered: string
}

export function HomeworkPage() {
  const [form, setForm] = useState<CreateHomeworkRequest>(emptyForm)
  const [searchClassId, setSearchClassId] = useState('')
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [diaryForm, setDiaryForm] = useState({ date: today, className: '', subject: '', topicCovered: '' })
  const diaryRef = useRef<HTMLDivElement>(null)

  const directory = useSchoolDirectory()
  const createMutation = useCreateHomework()
  const homeworkQuery = useHomeworkByClass(searchClassId)

  const items = homeworkQuery.data?.data ?? []
  const overdueCount = items.filter((item) => item.dueDate !== null && item.dueDate < today).length
  const nextDue = getNextDue(items)
  const sectionOptions = directory.getSectionsForClass(form.classId)
  const classLabelById = useMemo(
    () => Object.fromEntries(directory.classes.map((item) => [item.id, item.name])),
    [directory.classes],
  )
  const sectionLabelById = useMemo(
    () => Object.fromEntries(directory.sections.map((item) => [item.id, `Section ${item.name}`])),
    [directory.sections],
  )

  useEffect(() => {
    if (form.sectionId && !directory.isSectionValidForClass(form.classId, form.sectionId)) {
      setForm((current) => ({ ...current, sectionId: null }))
    }
  }, [directory, form.classId, form.sectionId])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.sectionId && !directory.isSectionValidForClass(form.classId, form.sectionId)) {
      showToast({ title: 'Invalid section', description: 'Select a section that belongs to the chosen class.', tone: 'error' })
      return
    }

    try {
      const res = await createMutation.mutateAsync({
        ...form,
        description: form.description?.trim() || null,
        sectionId: form.sectionId?.trim() || null,
        dueDate: form.dueDate?.trim() || null,
      })
      if (!res.success) {
        showToast({ title: 'Not created', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Homework assigned', description: res.data.title, tone: 'success' })
      setForm(emptyForm)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Not created', description: axiosError.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  const isOverdue = (dueDate: string | null) =>
    dueDate !== null && dueDate < today

  return (
    <section className="space-y-6">
      <PageHeader title="Homework" subtitle="Assign homework per class and view pending tasks." />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Homework Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{items.length} active assignment(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {nextDue ? (
                <>
                  Next due: {classLabelById[nextDue.classId] ?? 'Unknown class'}{nextDue.sectionId ? ` · ${sectionLabelById[nextDue.sectionId] ?? 'Unknown section'}` : ''} · {formatDate(nextDue.dueDate as string)}
                </>
              ) : (
                'Create a homework task to populate the active assignment summary.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Assignments" value={String(items.length)} tone="text-amber-700" />
            <SnapshotStat label="Overdue" value={String(overdueCount)} tone="text-rose-700" />
            <SnapshotStat label="Class Filter" value={searchClassId ? 'Set' : 'Open'} tone="text-sky-700" />
            <SnapshotStat label="Due Date" value={nextDue?.dueDate ? 'Set' : 'Open'} tone="text-emerald-700" />
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assignment Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Operational status for form completion and class lookup state in the homework desk.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Class" value={form.classId ? 'Set' : 'Open'} tone="text-sky-700" />
            <SnapshotStat label="Section" value={form.sectionId ? 'Specific' : 'All'} tone="text-emerald-700" />
            <SnapshotStat label="Create" value={createMutation.isPending ? 'Saving' : 'Ready'} tone="text-amber-700" />
            <SnapshotStat label="Browse" value={searchClassId ? 'Filtered' : 'Open'} tone="text-slate-700" />
          </div>
        </div>
      </Card>

      {/* Create homework form */}
      <Card className="p-0">
        <form className="grid gap-5 p-6" onSubmit={handleCreate}>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Assign Homework</h2>
            <p className="mt-1 text-sm text-slate-500">Create a homework task for a class (and optionally a section).</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="Title"
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder="Chapter 5 Exercises"
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
              value={form.sectionId ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}
              options={[
                { value: '', label: form.classId ? 'All sections' : 'Select a class first' },
                ...sectionOptions,
              ]}
            />
            <FormInput
              label="Due Date (optional)"
              type="date"
              value={form.dueDate ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
            />
            <div className="md:col-span-2">
              <FormInput
                label="Description (optional)"
                value={form.description ?? ''}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Complete problems 1–20 on page 87"
              />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={createMutation.isPending || directory.isLoading}>
              {createMutation.isPending ? 'Assigning…' : 'Assign Homework'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Daily class diary */}
      <div ref={diaryRef} className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Daily Class Diary</h2>
          <p className="mt-1 text-sm text-slate-500">Log what was taught in each session so there is a permanent record of syllabus coverage.</p>
        </div>

        <Card>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!diaryForm.className.trim() || !diaryForm.subject.trim() || !diaryForm.topicCovered.trim()) return
              setDiaryEntries((prev) => [
                { id: crypto.randomUUID(), ...diaryForm },
                ...prev,
              ])
              setDiaryForm({ date: today, className: '', subject: '', topicCovered: '' })
            }}
          >
            <input
              type="date"
              value={diaryForm.date}
              onChange={(e) => setDiaryForm((p) => ({ ...p, date: e.target.value }))}
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <input
              type="text"
              placeholder="Class (e.g. Class 8)"
              value={diaryForm.className}
              onChange={(e) => setDiaryForm((p) => ({ ...p, className: e.target.value }))}
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <input
              type="text"
              placeholder="Subject"
              value={diaryForm.subject}
              onChange={(e) => setDiaryForm((p) => ({ ...p, subject: e.target.value }))}
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <input
              type="text"
              placeholder="Topic / chapter covered"
              value={diaryForm.topicCovered}
              onChange={(e) => setDiaryForm((p) => ({ ...p, topicCovered: e.target.value }))}
              required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="sm:col-span-2">
              <Button type="submit">Log Session</Button>
            </div>
          </form>
        </Card>

        {diaryEntries.length > 0 && (
          <div className="space-y-2">
            {diaryEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{new Date(entry.date).toLocaleDateString('en', { month: 'short' })}</p>
                    <p className="text-lg font-bold text-slate-900">{new Date(entry.date).getDate()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{entry.topicCovered}</p>
                    <p className="text-xs text-slate-500">{entry.className} · {entry.subject}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDiaryEntries((prev) => prev.filter((d) => d.id !== entry.id))}
                  className="text-xs text-slate-400 hover:text-rose-500 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {diaryEntries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">No diary entries yet. Log the first session above.</p>
          </div>
        )}
      </div>

      {/* Homework list by class */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-950">Homework by Class</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a class to browse assignments.</p>
          </div>
          <div className="w-full max-w-xs">
            <FormSelect
              label="Class"
              value={searchClassId}
              onChange={setSearchClassId}
              options={[{ value: '', label: 'Select a class to browse homework' }, ...directory.classOptions]}
            />
          </div>
        </div>

        {homeworkQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : homeworkQuery.isError ? (
          <EmptyState title="Unable to load homework" description="Could not fetch homework for this class." />
        ) : items.length === 0 ? (
          <EmptyState
            title={searchClassId ? 'No homework found' : 'Select a class to load homework'}
            description={searchClassId ? 'No assignments have been created for this class yet.' : ''}
          />
        ) : (
          <div className="grid gap-3">
            {items.map((h) => (
              <div key={h.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{h.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {classLabelById[h.classId] ?? 'Unknown class'}
                      {h.sectionId ? ` · ${sectionLabelById[h.sectionId] ?? 'Unknown section'}` : ' · All sections'}
                    </p>
                  </div>
                  {h.dueDate ? (
                    <span
                      className={`shrink-0 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isOverdue(h.dueDate) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Due {h.dueDate}
                    </span>
                  ) : null}
                </div>
                {h.description ? <p className="mt-2 text-sm text-slate-600">{h.description}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
