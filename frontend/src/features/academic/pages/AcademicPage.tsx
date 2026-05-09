import { AxiosError } from 'axios'
import { type FormEvent, useMemo, useState } from 'react'

import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'

import {
  AcademicClassForm,
  AcademicSectionForm,
  AcademicSubjectForm,
} from '../components/AcademicForms'
import {
  useAcademicClasses,
  useAcademicSections,
  useAcademicSubjects,
  useCreateAcademicClass,
  useCreateAcademicSection,
  useCreateAcademicSubject,
} from '../hooks/useAcademicData'
import type {
  AcademicClass,
  AcademicSection,
  AcademicSubject,
  CreateAcademicClassRequest,
  CreateAcademicSectionRequest,
  CreateAcademicSubjectRequest,
} from '../types'

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

type AcademicTab = 'classes' | 'subjects' | 'sections' | 'chapters' | 'lesson-plans' | 'curriculum'

interface CurriculumEntry {
  id: string
  subject: string
  term: string
  topic: string
  learningGoals: string
  weekNo: string
}

interface LessonPlan {
  id: string
  date: string
  className: string
  subject: string
  topic: string
  objectives: string
  activities: string
  resources: string
}

interface ChapterEntry {
  id: string
  subjectName: string
  chapterName: string
  completed: boolean
  addedOn: string
}

export function AcademicPage() {
  const [activeTab, setActiveTab] = useState<AcademicTab>('classes')
  const [chapters, setChapters] = useState<ChapterEntry[]>([])
  const [chapterForm, setChapterForm] = useState({ subjectName: '', chapterName: '' })
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [lessonForm, setLessonForm] = useState({ date: new Date().toISOString().slice(0, 10), className: '', subject: '', topic: '', objectives: '', activities: '', resources: '' })
  const [curriculumEntries, setCurriculumEntries] = useState<CurriculumEntry[]>([])
  const [curriculumForm, setCurriculumForm] = useState({ subject: '', term: 'Term 1', topic: '', learningGoals: '', weekNo: '' })
  const classesQuery = useAcademicClasses()
  const subjectsQuery = useAcademicSubjects()
  const sectionsQuery = useAcademicSections()
  const createClassMutation = useCreateAcademicClass()
  const createSubjectMutation = useCreateAcademicSubject()
  const createSectionMutation = useCreateAcademicSection()
  const classCount = classesQuery.data?.data.length ?? 0
  const subjectCount = subjectsQuery.data?.data.length ?? 0
  const sectionCount = sectionsQuery.data?.data.length ?? 0

  const classColumns: DataTableColumn<AcademicClass>[] = [
    { key: 'name', header: 'Class', cell: (row) => row.name },
    { key: 'code', header: 'Code', cell: (row) => row.code },
    { key: 'status', header: 'Status', cell: (row) => (row.active ? 'Active' : 'Inactive') },
  ]

  const subjectColumns: DataTableColumn<AcademicSubject>[] = [
    { key: 'name', header: 'Subject', cell: (row) => row.name },
    { key: 'code', header: 'Code', cell: (row) => row.code },
    { key: 'status', header: 'Status', cell: (row) => (row.active ? 'Active' : 'Inactive') },
  ]

  const sectionColumns: DataTableColumn<AcademicSection>[] = [
    { key: 'name', header: 'Section', cell: (row) => row.name },
    { key: 'className', header: 'Class', cell: (row) => row.className },
    { key: 'status', header: 'Status', cell: (row) => (row.active ? 'Active' : 'Inactive') },
  ]

  const tabs = useMemo(
    () => [
      { id: 'classes' as const, label: 'Classes' },
      { id: 'subjects' as const, label: 'Subjects' },
      { id: 'sections' as const, label: 'Sections' },
      { id: 'chapters' as const, label: 'Chapter Tracker' },
      { id: 'lesson-plans' as const, label: 'Lesson Plans' },
      { id: 'curriculum' as const, label: 'Curriculum Map' },
    ],
    [],
  )

  const completedChapters = chapters.filter((c) => c.completed).length

  const handleAddChapter = (e: FormEvent) => {
    e.preventDefault()
    if (!chapterForm.subjectName.trim() || !chapterForm.chapterName.trim()) return
    setChapters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        subjectName: chapterForm.subjectName.trim(),
        chapterName: chapterForm.chapterName.trim(),
        completed: false,
        addedOn: new Date().toISOString().slice(0, 10),
      },
    ])
    setChapterForm({ subjectName: '', chapterName: '' })
  }

  const toggleChapter = (id: string) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)))
  }

  const deleteChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }

  const handleClassCreate = async (payload: CreateAcademicClassRequest) => {
    try {
      const response = await createClassMutation.mutateAsync(payload)
      if (!response.success) {
        showToast({ title: 'Class not created', description: response.message, tone: 'error' })
        return false
      }
      showToast({ title: 'Class created', description: `${response.data.name} is ready to use.`, tone: 'success' })
      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Class not created', description: axiosError.response?.data?.message, tone: 'error' })
      return false
    }
  }

  const handleSubjectCreate = async (payload: CreateAcademicSubjectRequest) => {
    try {
      const response = await createSubjectMutation.mutateAsync(payload)
      if (!response.success) {
        showToast({ title: 'Subject not created', description: response.message, tone: 'error' })
        return false
      }
      showToast({ title: 'Subject created', description: `${response.data.name} has been added.`, tone: 'success' })
      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Subject not created', description: axiosError.response?.data?.message, tone: 'error' })
      return false
    }
  }

  const handleSectionCreate = async (payload: CreateAcademicSectionRequest) => {
    try {
      const response = await createSectionMutation.mutateAsync(payload)
      if (!response.success) {
        showToast({ title: 'Section not created', description: response.message, tone: 'error' })
        return false
      }
      showToast({ title: 'Section created', description: `${response.data.name} is now attached to ${response.data.className}.`, tone: 'success' })
      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Section not created', description: axiosError.response?.data?.message, tone: 'error' })
      return false
    }
  }

  const renderTable = () => {
    if (activeTab === 'classes') {
      if (classesQuery.isLoading) {
        return <Skeleton className="h-32" />
      }
      if (classesQuery.isError) {
        return <EmptyState title="Classes unavailable" description="Class records could not be loaded." />
      }
      return (
        <DataTable
          columns={classColumns}
          rows={classesQuery.data?.data ?? []}
          rowKey={(row) => row.id}
          emptyText="No classes created yet."
        />
      )
    }

    if (activeTab === 'subjects') {
      if (subjectsQuery.isLoading) {
        return <Skeleton className="h-32" />
      }
      if (subjectsQuery.isError) {
        return <EmptyState title="Subjects unavailable" description="Subject records could not be loaded." />
      }
      return (
        <DataTable
          columns={subjectColumns}
          rows={subjectsQuery.data?.data ?? []}
          rowKey={(row) => row.id}
          emptyText="No subjects created yet."
        />
      )
    }

    if (sectionsQuery.isLoading) {
      return <Skeleton className="h-32" />
    }
    if (sectionsQuery.isError) {
      return <EmptyState title="Sections unavailable" description="Section records could not be loaded." />
    }
    return (
      <DataTable
        columns={sectionColumns}
        rows={sectionsQuery.data?.data ?? []}
        rowKey={(row) => row.id}
        emptyText="No sections created yet."
      />
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Academic"
        subtitle="Manage classes, subjects, and sections through a segmented academic control center."
      />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">Academic Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{classCount} classes ready for use</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              The control center keeps class, subject, and section setup in one place for scheduling and student operations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Classes" value={String(classCount)} tone="text-slate-900" />
            <SnapshotStat label="Subjects" value={String(subjectCount)} tone="text-sky-700" />
            <SnapshotStat label="Sections" value={String(sectionCount)} tone="text-emerald-700" />
            <SnapshotStat label="Active Tab" value={tabs.find((tab) => tab.id === activeTab)?.label ?? 'Classes'} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Academic Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Operational readiness for active tab workflows and creation actions.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Tab" value={tabs.find((tab) => tab.id === activeTab)?.label ?? 'Classes'} tone="text-slate-700" />
            <SnapshotStat label="Class Create" value={createClassMutation.isPending ? 'Saving' : 'Ready'} tone="text-emerald-700" />
            <SnapshotStat label="Subject Create" value={createSubjectMutation.isPending ? 'Saving' : 'Ready'} tone="text-sky-700" />
            <SnapshotStat label="Section Create" value={createSectionMutation.isPending ? 'Saving' : 'Ready'} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.25)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-slate-950 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'classes' ? (
        <AcademicClassForm onSubmit={handleClassCreate} isSubmitting={createClassMutation.isPending} />
      ) : null}
      {activeTab === 'subjects' ? (
        <AcademicSubjectForm onSubmit={handleSubjectCreate} isSubmitting={createSubjectMutation.isPending} />
      ) : null}
      {activeTab === 'sections' ? (
        <AcademicSectionForm
          classes={classesQuery.data?.data ?? []}
          onSubmit={handleSectionCreate}
          isSubmitting={createSectionMutation.isPending}
        />
      ) : null}

      {activeTab === 'chapters' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Chapter Completion Tracker</h2>
            <p className="mt-1 text-sm text-slate-500">Track syllabus coverage by logging chapters per subject and marking them complete as teaching progresses.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Chapters</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{chapters.length}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Completed</p>
                <p className="mt-1 text-xl font-bold text-emerald-700">{completedChapters}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Remaining</p>
                <p className="mt-1 text-xl font-bold text-amber-700">{chapters.length - completedChapters}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddChapter} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Add Chapter</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Subject name"
                value={chapterForm.subjectName}
                onChange={(e) => setChapterForm((p) => ({ ...p, subjectName: e.target.value }))}
                required
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <input
                type="text"
                placeholder="Chapter name or topic"
                value={chapterForm.chapterName}
                onChange={(e) => setChapterForm((p) => ({ ...p, chapterName: e.target.value }))}
                required
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <button type="submit" className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Add Chapter
            </button>
          </form>

          {chapters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No chapters added yet. Add the first chapter above to start tracking syllabus coverage.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition ${chapter.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${chapter.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-emerald-400'}`}
                    >
                      {chapter.completed && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-semibold ${chapter.completed ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>{chapter.chapterName}</p>
                      <p className="text-xs text-slate-400">{chapter.subjectName} · Added {chapter.addedOn}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteChapter(chapter.id)}
                    className="text-xs text-slate-400 hover:text-rose-500 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'lesson-plans' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Lesson Plan Builder</h2>
            <p className="mt-1 text-sm text-slate-500">Create structured teaching plans with objectives, activities, and resources for each session.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Plans</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{lessonPlans.length}</p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">This Week</p>
                <p className="mt-1 text-xl font-bold text-sky-700">
                  {lessonPlans.filter((p) => {
                    const d = new Date(p.date), now = new Date()
                    const monday = new Date(now); monday.setDate(now.getDate() - now.getDay() + 1)
                    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
                    return d >= monday && d <= sunday
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">New Lesson Plan</h3>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                if (!lessonForm.className.trim() || !lessonForm.subject.trim() || !lessonForm.topic.trim()) return
                setLessonPlans((prev) => [{ id: crypto.randomUUID(), ...lessonForm }, ...prev])
                setLessonForm((p) => ({ ...p, className: '', subject: '', topic: '', objectives: '', activities: '', resources: '' }))
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <input type="date" value={lessonForm.date} onChange={(e) => setLessonForm((p) => ({ ...p, date: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="text" placeholder="Class (e.g. Class 9)" value={lessonForm.className} onChange={(e) => setLessonForm((p) => ({ ...p, className: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="text" placeholder="Subject" value={lessonForm.subject} onChange={(e) => setLessonForm((p) => ({ ...p, subject: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Topic / chapter title" value={lessonForm.topic} onChange={(e) => setLessonForm((p) => ({ ...p, topic: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <textarea placeholder="Learning objectives (what students will know or do by end of session)" value={lessonForm.objectives} onChange={(e) => setLessonForm((p) => ({ ...p, objectives: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
              <div className="grid gap-3 sm:grid-cols-2">
                <textarea placeholder="Classroom activities" value={lessonForm.activities} onChange={(e) => setLessonForm((p) => ({ ...p, activities: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
                <textarea placeholder="Resources / materials needed" value={lessonForm.resources} onChange={(e) => setLessonForm((p) => ({ ...p, resources: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
              </div>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Lesson Plan</button>
            </form>
          </div>

          {lessonPlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No lesson plans yet. Create the first plan above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-950">{plan.topic}</h3>
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">{plan.subject}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{plan.className}</span>
                        <span className="text-xs text-slate-400">{plan.date}</span>
                      </div>
                      {plan.objectives && <p className="mt-2 text-sm text-slate-600"><span className="font-medium text-slate-700">Objectives:</span> {plan.objectives}</p>}
                      {plan.activities && <p className="mt-1 text-sm text-slate-600"><span className="font-medium text-slate-700">Activities:</span> {plan.activities}</p>}
                      {plan.resources && <p className="mt-1 text-sm text-slate-500"><span className="font-medium text-slate-600">Resources:</span> {plan.resources}</p>}
                    </div>
                    <button type="button" onClick={() => setLessonPlans((prev) => prev.filter((p) => p.id !== plan.id))} className="text-xs text-slate-400 hover:text-rose-500 transition">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'curriculum' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Curriculum Mapping</h2>
            <p className="mt-1 text-sm text-slate-500">Map each subject's topics to terms and weeks so teachers and admins can track syllabus pacing across the academic year.</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {(['Term 1', 'Term 2', 'Term 3'] as const).map((term) => (
                <div key={term} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{term}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{curriculumEntries.filter((e) => e.term === term).length} topics</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Add Topic Mapping</h3>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                if (!curriculumForm.subject.trim() || !curriculumForm.topic.trim()) return
                setCurriculumEntries((prev) => [...prev, { id: crypto.randomUUID(), ...curriculumForm }])
                setCurriculumForm((p) => ({ ...p, subject: '', topic: '', learningGoals: '', weekNo: '' }))
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <input type="text" placeholder="Subject" value={curriculumForm.subject} onChange={(e) => setCurriculumForm((p) => ({ ...p, subject: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <select value={curriculumForm.term} onChange={(e) => setCurriculumForm((p) => ({ ...p, term: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                </select>
                <input type="text" placeholder="Week No. (e.g. W3)" value={curriculumForm.weekNo} onChange={(e) => setCurriculumForm((p) => ({ ...p, weekNo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Topic / chapter title" value={curriculumForm.topic} onChange={(e) => setCurriculumForm((p) => ({ ...p, topic: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Learning goals / outcomes" value={curriculumForm.learningGoals} onChange={(e) => setCurriculumForm((p) => ({ ...p, learningGoals: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add to Map</button>
            </form>
          </div>

          {curriculumEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No curriculum entries yet. Map the first subject topic above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {(['Term 1', 'Term 2', 'Term 3'] as const).map((term) => {
                const termEntries = curriculumEntries.filter((e) => e.term === term)
                if (termEntries.length === 0) return null
                return (
                  <div key={term} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-bold text-slate-900">{term}</p>
                    <div className="space-y-2">
                      {termEntries.map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">{entry.subject}{entry.weekNo ? ` · ${entry.weekNo}` : ''}</p>
                              <p className="mt-0.5 text-sm font-medium text-slate-900">{entry.topic}</p>
                              {entry.learningGoals && <p className="mt-0.5 text-xs text-slate-500">{entry.learningGoals}</p>}
                            </div>
                            <button type="button" onClick={() => setCurriculumEntries((prev) => prev.filter((e) => e.id !== entry.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}

      {activeTab !== 'chapters' && activeTab !== 'lesson-plans' && activeTab !== 'curriculum' && renderTable()}

      <GradeScalingPanel />
      <PromotionRulesPanel />
    </section>
  )
}

// ── Grade Scaling & Rubric Support ─────────────────────────────────────────

interface GradeScale {
  id: string
  grade: string
  minMark: number
  maxMark: number
  points: number
  descriptor: string
}

function GradeScalingPanel() {
  const [scales, setScales] = useState<GradeScale[]>([
    { id: '1', grade: 'A+', minMark: 91, maxMark: 100, points: 10, descriptor: 'Outstanding' },
    { id: '2', grade: 'A', minMark: 81, maxMark: 90, points: 9, descriptor: 'Excellent' },
    { id: '3', grade: 'B+', minMark: 71, maxMark: 80, points: 8, descriptor: 'Very Good' },
    { id: '4', grade: 'B', minMark: 61, maxMark: 70, points: 7, descriptor: 'Good' },
    { id: '5', grade: 'C', minMark: 50, maxMark: 60, points: 6, descriptor: 'Average' },
    { id: '6', grade: 'D', minMark: 33, maxMark: 49, points: 5, descriptor: 'Pass' },
    { id: '7', grade: 'F', minMark: 0, maxMark: 32, points: 0, descriptor: 'Fail' },
  ])
  const [form, setForm] = useState({ grade: '', minMark: 0, maxMark: 100, points: 0, descriptor: '' })
  const [showForm, setShowForm] = useState(false)
  const [testMark, setTestMark] = useState('')

  const lookup = testMark !== '' ? scales.find((s) => Number(testMark) >= s.minMark && Number(testMark) <= s.maxMark) : null

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.grade.trim()) return
    setScales((prev) => [...prev, { id: crypto.randomUUID(), ...form, minMark: Number(form.minMark), maxMark: Number(form.maxMark), points: Number(form.points) }].sort((a, b) => b.minMark - a.minMark))
    setForm({ grade: '', minMark: 0, maxMark: 100, points: 0, descriptor: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Grade Scaling & Rubrics</h2>
          <p className="text-sm text-slate-500">Define grading bands and descriptors used across all exams.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Grade'}
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Test a mark:</label>
        <input type="number" min={0} max={100} placeholder="Enter mark (0–100)" value={testMark} onChange={(e) => setTestMark(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
        {lookup && <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">{lookup.grade} – {lookup.descriptor} ({lookup.points} pts)</span>}
        {testMark !== '' && !lookup && <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">No grade match</span>}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-5" onSubmit={handleAdd}>
            <input type="text" placeholder="Grade (e.g. A+)" value={form.grade} onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="number" placeholder="Min mark" value={form.minMark} onChange={(e) => setForm((p) => ({ ...p, minMark: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="number" placeholder="Max mark" value={form.maxMark} onChange={(e) => setForm((p) => ({ ...p, maxMark: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="number" placeholder="Grade points" value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Descriptor (e.g. Excellent)" value={form.descriptor} onChange={(e) => setForm((p) => ({ ...p, descriptor: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="col-span-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Grade</button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-2 pr-6 text-xs font-semibold text-slate-500">Grade</th>
              <th className="pb-2 pr-6 text-xs font-semibold text-slate-500">Range</th>
              <th className="pb-2 pr-6 text-xs font-semibold text-slate-500">Points</th>
              <th className="pb-2 pr-6 text-xs font-semibold text-slate-500">Descriptor</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scales.map((s) => (
              <tr key={s.id}>
                <td className="py-2 pr-6 font-bold text-slate-950">{s.grade}</td>
                <td className="py-2 pr-6 text-slate-600">{s.minMark} – {s.maxMark}</td>
                <td className="py-2 pr-6 text-slate-600">{s.points}</td>
                <td className="py-2 pr-6 text-slate-500">{s.descriptor}</td>
                <td className="py-2"><button type="button" onClick={() => setScales((prev) => prev.filter((x) => x.id !== s.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Promotion & Retention Rules ────────────────────────────────────────────

interface PromotionRule {
  id: string
  fromClass: string
  toClass: string
  minAttendance: number
  minAvgMarks: number
  maxFailSubjects: number
  note: string
}

function PromotionRulesPanel() {
  const [rules, setRules] = useState<PromotionRule[]>([
    { id: '1', fromClass: 'Class 9', toClass: 'Class 10', minAttendance: 75, minAvgMarks: 33, maxFailSubjects: 2, note: 'Students with 3+ fails appear for compartment.' },
    { id: '2', fromClass: 'Class 10', toClass: 'Class 11', minAttendance: 75, minAvgMarks: 33, maxFailSubjects: 0, note: 'Board exam class — zero fails required for promotion.' },
  ])
  const [form, setForm] = useState({ fromClass: '', toClass: '', minAttendance: 75, minAvgMarks: 33, maxFailSubjects: 2, note: '' })
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.fromClass.trim()) return
    setRules((prev) => [...prev, { id: crypto.randomUUID(), ...form, minAttendance: Number(form.minAttendance), minAvgMarks: Number(form.minAvgMarks), maxFailSubjects: Number(form.maxFailSubjects) }])
    setForm((p) => ({ ...p, fromClass: '', toClass: '', note: '' }))
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Promotion & Retention Rules</h2>
          <p className="text-sm text-slate-500">Define class-wise pass/fail and promotion criteria.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Rule'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="From class (e.g. Class 8)" value={form.fromClass} onChange={(e) => setForm((p) => ({ ...p, fromClass: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="To class (e.g. Class 9)" value={form.toClass} onChange={(e) => setForm((p) => ({ ...p, toClass: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Min attendance %</label>
                <input type="number" min={0} max={100} value={form.minAttendance} onChange={(e) => setForm((p) => ({ ...p, minAttendance: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Min avg marks %</label>
                <input type="number" min={0} max={100} value={form.minAvgMarks} onChange={(e) => setForm((p) => ({ ...p, minAvgMarks: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Max fail subjects</label>
                <input type="number" min={0} value={form.maxFailSubjects} onChange={(e) => setForm((p) => ({ ...p, maxFailSubjects: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Note / special condition" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Rule</button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{r.fromClass}</p>
                <span className="text-slate-400">→</span>
                <p className="font-semibold text-slate-950">{r.toClass || '(promoted)'}</p>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                <span>Min attendance: <strong>{r.minAttendance}%</strong></span>
                <span>Min avg marks: <strong>{r.minAvgMarks}%</strong></span>
                <span>Max fails: <strong>{r.maxFailSubjects} subject{r.maxFailSubjects !== 1 ? 's' : ''}</strong></span>
              </div>
              {r.note && <p className="mt-1 text-xs text-slate-400 italic">{r.note}</p>}
            </div>
            <button type="button" onClick={() => setRules((prev) => prev.filter((x) => x.id !== r.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
