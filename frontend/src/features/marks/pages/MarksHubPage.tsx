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

import { useCreateExam, useCreateExamResult, useExamResults, useExamsByClass } from '../hooks/useExams'
import type { CreateExamRequest, CreateExamResultRequest, Exam, ExamResult } from '../types'

const emptyExamForm: CreateExamRequest = {
  title: '',
  examDate: '',
  classId: '',
  sectionId: '',
  subjectId: '',
  maxMarks: 100,
}

const emptyResultForm: CreateExamResultRequest = {
  examId: '',
  studentId: '',
  marksObtained: 0,
  grade: null,
  remarks: null,
  published: false,
}

type ActiveTab = 'exams' | 'results'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export function MarksHubPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams')
  const [examForm, setExamForm] = useState<CreateExamRequest>(emptyExamForm)
  const [resultForm, setResultForm] = useState<CreateExamResultRequest>(emptyResultForm)
  const [searchClassId, setSearchClassId] = useState('')
  const [searchExamId, setSearchExamId] = useState('')

  const directory = useSchoolDirectory()
  const createExamMutation = useCreateExam()
  const createResultMutation = useCreateExamResult()
  const examsQuery = useExamsByClass(searchClassId)
  const resultsQuery = useExamResults(searchExamId)

  const exams = examsQuery.data?.data ?? []
  const results = resultsQuery.data?.data ?? []
  const publishedResults = results.filter((result) => result.published).length
  const nextExam = [...exams].sort((left, right) => left.examDate.localeCompare(right.examDate))[0] ?? null
  const examSectionOptions = directory.getSectionsForClass(examForm.classId)
  const lookupExamOptions = useMemo(
    () => exams.map((exam) => ({ value: exam.id, label: `${exam.title} - ${exam.examDate}` })),
    [exams],
  )
  const classLabelById = useMemo(
    () => Object.fromEntries(directory.classes.map((item) => [item.id, item.name])),
    [directory.classes],
  )
  const sectionLabelById = useMemo(
    () => Object.fromEntries(directory.sections.map((item) => [item.id, `Section ${item.name}`])),
    [directory.sections],
  )
  const subjectLabelById = useMemo(
    () => Object.fromEntries(directory.subjects.map((item) => [item.id, item.name])),
    [directory.subjects],
  )
  const studentLabelById = useMemo(
    () => Object.fromEntries(directory.students.map((student) => [student.id, `${student.firstName} ${student.lastName} (${student.admissionNo})`])),
    [directory.students],
  )

  useEffect(() => {
    if (examForm.sectionId && !directory.isSectionValidForClass(examForm.classId, examForm.sectionId)) {
      setExamForm((current) => ({ ...current, sectionId: '' }))
    }
  }, [directory, examForm.classId, examForm.sectionId])

  useEffect(() => {
    if (resultForm.examId && !exams.some((exam) => exam.id === resultForm.examId)) {
      setResultForm((current) => ({ ...current, examId: '' }))
    }
    if (searchExamId && !exams.some((exam) => exam.id === searchExamId)) {
      setSearchExamId('')
    }
  }, [exams, resultForm.examId, searchExamId])

  const examColumns: DataTableColumn<Exam>[] = [
    { key: 'title', header: 'Title', cell: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
    { key: 'date', header: 'Date', cell: (r) => r.examDate },
    { key: 'classId', header: 'Class', cell: (r) => classLabelById[r.classId] ?? 'Unknown class' },
    { key: 'sectionId', header: 'Section', cell: (r) => sectionLabelById[r.sectionId] ?? 'Unknown section' },
    { key: 'subjectId', header: 'Subject', cell: (r) => subjectLabelById[r.subjectId] ?? 'Unknown subject' },
    { key: 'maxMarks', header: 'Max Marks', cell: (r) => r.maxMarks },
  ]

  const resultColumns: DataTableColumn<ExamResult>[] = [
    {
      key: 'studentId',
      header: 'Student',
      cell: (r) => <span className="font-medium text-slate-900">{studentLabelById[r.studentId] ?? 'Unknown student'}</span>,
    },
    { key: 'marks', header: 'Marks', cell: (r) => r.marksObtained },
    { key: 'grade', header: 'Grade', cell: (r) => r.grade ?? '—' },
    { key: 'remarks', header: 'Remarks', cell: (r) => r.remarks ?? '—' },
    {
      key: 'published',
      header: 'Published',
      cell: (r) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${r.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {r.published ? 'Yes' : 'No'}
        </span>
      ),
    },
  ]

  const handleCreateExam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!directory.isSectionValidForClass(examForm.classId, examForm.sectionId)) {
      showToast({ title: 'Invalid section', description: 'Select a section that belongs to the chosen class.', tone: 'error' })
      return
    }

    try {
      const res = await createExamMutation.mutateAsync({ ...examForm, maxMarks: Number(examForm.maxMarks) })
      if (!res.success) {
        showToast({ title: 'Exam not scheduled', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Exam scheduled', description: res.data.title, tone: 'success' })
      setExamForm(emptyExamForm)
      setSearchClassId((current) => current || res.data.classId)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Exam not scheduled', description: axiosError.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  const handleCreateResult = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const res = await createResultMutation.mutateAsync({
        ...resultForm,
        marksObtained: Number(resultForm.marksObtained),
        grade: resultForm.grade?.trim() || null,
        remarks: resultForm.remarks?.trim() || null,
      })
      if (!res.success) {
        showToast({ title: 'Result not saved', description: res.message, tone: 'error' })
        return
      }
      showToast({ title: 'Result saved', description: `Marks: ${res.data.marksObtained}`, tone: 'success' })
      setResultForm(emptyResultForm)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({ title: 'Result not saved', description: axiosError.response?.data?.message ?? 'Error', tone: 'error' })
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Marks & Exams" subtitle="Schedule exams and record student results." />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-700">Exam Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{exams.length} scheduled exam(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {nextExam ? (
                <>Next exam: {nextExam.title} · {formatDate(nextExam.examDate)} · Max marks {nextExam.maxMarks}</>
              ) : (
                'Create an exam to populate the marks workspace with schedule and publishing controls.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Exams" value={String(exams.length)} tone="text-violet-700" />
            <SnapshotStat label="Results" value={String(results.length)} tone="text-sky-700" />
            <SnapshotStat label="Published" value={String(publishedResults)} tone="text-emerald-700" />
            <SnapshotStat label="Class Filter" value={searchClassId ? 'Set' : 'Open'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Exam Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Keep scheduling and publication flow visible while moving between exam and result tabs.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Tab" value={activeTab === 'exams' ? 'Exams' : 'Results'} tone="text-slate-700" />
            <SnapshotStat label="Exam Save" value={createExamMutation.isPending ? 'Saving' : 'Ready'} tone="text-violet-700" />
            <SnapshotStat label="Result Save" value={createResultMutation.isPending ? 'Saving' : 'Ready'} tone="text-emerald-700" />
            <SnapshotStat label="Exam Filter" value={searchExamId ? 'Set' : 'Open'} tone="text-amber-700" />
          </div>
        </div>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {(['exams', 'results'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-5 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'exams' ? 'Exams' : 'Results'}
          </button>
        ))}
      </div>

      {activeTab === 'exams' && (
        <>
          {/* Create exam form */}
          <Card className="p-0">
            <form className="grid gap-5 p-6" onSubmit={handleCreateExam}>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Schedule Exam</h2>
                <p className="mt-1 text-sm text-slate-500">Define exam details tied to a class, section, and subject.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Exam Title"
                  value={examForm.title}
                  onChange={(v) => setExamForm((f) => ({ ...f, title: v }))}
                  placeholder="Mid-Term Mathematics"
                  required
                />
                <FormInput
                  label="Exam Date"
                  type="date"
                  value={examForm.examDate}
                  onChange={(v) => setExamForm((f) => ({ ...f, examDate: v }))}
                  required
                />
                <FormSelect
                  label="Class"
                  value={examForm.classId}
                  onChange={(v) => setExamForm((f) => ({ ...f, classId: v }))}
                  options={[{ value: '', label: 'Select a class' }, ...directory.classOptions]}
                  required
                />
                <FormSelect
                  label="Section"
                  value={examForm.sectionId}
                  onChange={(v) => setExamForm((f) => ({ ...f, sectionId: v }))}
                  options={[
                    { value: '', label: examForm.classId ? 'Select a section' : 'Select a class first' },
                    ...examSectionOptions,
                  ]}
                  required
                />
                <SearchableSelect
                  label="Subject"
                  selectedValue={examForm.subjectId}
                  onSelect={(value) => setExamForm((current) => ({ ...current, subjectId: value }))}
                  options={directory.subjectOptions}
                  placeholder="Search subject"
                  emptyMessage="No subject matched that search."
                  required
                />
                <FormInput
                  label="Max Marks"
                  type="number"
                  value={String(examForm.maxMarks)}
                  onChange={(v) => setExamForm((f) => ({ ...f, maxMarks: Number(v) }))}
                  required
                />
              </div>
              <div>
                <Button type="submit" disabled={createExamMutation.isPending || directory.isLoading}>
                  {createExamMutation.isPending ? 'Scheduling…' : 'Schedule Exam'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Exams by class lookup */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-950">Exams by Class</h2>
              </div>
              <div className="w-full max-w-xs">
                <FormSelect
                  label="Class"
                  value={searchClassId}
                  onChange={setSearchClassId}
                  options={[{ value: '', label: 'Select a class to browse exams' }, ...directory.classOptions]}
                />
              </div>
            </div>
            {examsQuery.isLoading ? <Skeleton className="h-24" /> : examsQuery.isError ? (
              <EmptyState title="Unable to load exams" description="Could not fetch exams for this class." />
            ) : (
              <DataTable columns={examColumns} rows={exams} rowKey={(r) => r.id} emptyText={searchClassId ? 'No exams for this class.' : 'Select a class to load exams.'} />
            )}
          </div>
        </>
      )}

      {activeTab === 'results' && (
        <>
          {/* Enter result form */}
          <Card className="p-0">
            <form className="grid gap-5 p-6" onSubmit={handleCreateResult}>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Enter Result</h2>
                <p className="mt-1 text-sm text-slate-500">Record a student's marks for a specific exam.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SearchableSelect
                  label="Exam"
                  selectedValue={resultForm.examId}
                  onSelect={(value) => setResultForm((current) => ({ ...current, examId: value }))}
                  options={lookupExamOptions}
                  placeholder={searchClassId ? 'Search exam title' : 'Select a class first'}
                  emptyMessage="No exam matched that search."
                  helperText="Choose a class above to load the exam list."
                  disabled={!searchClassId}
                  required
                />
                <SearchableSelect
                  label="Student"
                  selectedValue={resultForm.studentId}
                  onSelect={(value) => setResultForm((current) => ({ ...current, studentId: value }))}
                  options={directory.studentOptions}
                  placeholder="Search by name or admission number"
                  emptyMessage="No student matched that search."
                  required
                />
                <FormInput
                  label="Marks Obtained"
                  type="number"
                  value={String(resultForm.marksObtained || '')}
                  onChange={(v) => setResultForm((f) => ({ ...f, marksObtained: Number(v) }))}
                  required
                />
                <FormInput
                  label="Grade"
                  value={resultForm.grade ?? ''}
                  onChange={(v) => setResultForm((f) => ({ ...f, grade: v }))}
                  placeholder="A / B+ / C"
                />
                <FormInput
                  label="Remarks"
                  value={resultForm.remarks ?? ''}
                  onChange={(v) => setResultForm((f) => ({ ...f, remarks: v }))}
                  placeholder="Optional remarks"
                />
              </div>
              <div>
                <Button type="submit" disabled={createResultMutation.isPending || directory.isLoading}>
                  {createResultMutation.isPending ? 'Saving…' : 'Save Result'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Results by exam lookup */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-950">Results by Exam</h2>
              </div>
              <div className="grid w-full gap-4 md:max-w-3xl md:grid-cols-2">
                <FormSelect
                  label="Class"
                  value={searchClassId}
                  onChange={setSearchClassId}
                  options={[{ value: '', label: 'Select a class' }, ...directory.classOptions]}
                />
                <SearchableSelect
                  label="Exam"
                  selectedValue={searchExamId}
                  onSelect={setSearchExamId}
                  options={lookupExamOptions}
                  placeholder={searchClassId ? 'Search exam title' : 'Select a class first'}
                  emptyMessage="No exam matched that search."
                  disabled={!searchClassId}
                />
              </div>
            </div>
            {resultsQuery.isLoading ? <Skeleton className="h-24" /> : resultsQuery.isError ? (
              <EmptyState title="Unable to load results" description="Could not fetch results for this exam." />
            ) : (
              <DataTable columns={resultColumns} rows={results} rowKey={(r) => r.id} emptyText={searchExamId ? 'No results for this exam.' : 'Choose an exam to load results.'} />
            )}
          </div>
        </>
      )}
    </section>
  )
}
