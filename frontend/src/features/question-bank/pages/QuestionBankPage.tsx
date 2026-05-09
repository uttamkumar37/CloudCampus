import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
type QuestionType = 'MCQ' | 'SHORT' | 'LONG' | 'TRUE_FALSE'
type QBTab = 'questions' | 'blueprints'

interface Question {
  id: string
  subject: string
  topic: string
  difficulty: Difficulty
  type: QuestionType
  marks: number
  text: string
  options: string[]
  answer: string
  addedOn: string
}

interface BlueprintSection {
  questionType: QuestionType
  count: number
  marksEach: number
}

interface ExamBlueprint {
  id: string
  title: string
  subject: string
  className: string
  totalMarks: number
  duration: number
  sections: BlueprintSection[]
  createdOn: string
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-rose-100 text-rose-700',
}

const TYPE_LABEL: Record<QuestionType, string> = {
  MCQ: 'MCQ',
  SHORT: 'Short Answer',
  LONG: 'Long Answer',
  TRUE_FALSE: 'True/False',
}

const today = new Date().toISOString().slice(0, 10)

export function QuestionBankPage() {
  const [tab, setTab] = useState<QBTab>('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [qForm, setQForm] = useState({ subject: '', topic: '', difficulty: 'MEDIUM' as Difficulty, type: 'MCQ' as QuestionType, marks: 1, text: '', options: ['', '', '', ''], answer: '' })
  const [showQForm, setShowQForm] = useState(false)
  const [filterSubject, setFilterSubject] = useState('ALL')
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'ALL'>('ALL')

  const [blueprints, setBlueprints] = useState<ExamBlueprint[]>([])
  const [bpForm, setBpForm] = useState({ title: '', subject: '', className: '', duration: 60, sections: [{ questionType: 'MCQ' as QuestionType, count: 10, marksEach: 1 }] })
  const [showBpForm, setShowBpForm] = useState(false)

  const subjects = ['ALL', ...Array.from(new Set(questions.map((q) => q.subject))).filter(Boolean)]

  const visible = questions.filter((q) => {
    const matchS = filterSubject === 'ALL' || q.subject === filterSubject
    const matchD = filterDiff === 'ALL' || q.difficulty === filterDiff
    return matchS && matchD
  })

  const handleAddQuestion = (e: FormEvent) => {
    e.preventDefault()
    if (!qForm.text.trim()) return
    setQuestions((prev) => [{ id: crypto.randomUUID(), ...qForm, marks: Number(qForm.marks), options: qForm.type === 'MCQ' ? qForm.options.filter(Boolean) : [], addedOn: today }, ...prev])
    setQForm((p) => ({ ...p, subject: '', topic: '', text: '', options: ['', '', '', ''], answer: '' }))
    setShowQForm(false)
  }

  const handleAddBlueprint = (e: FormEvent) => {
    e.preventDefault()
    if (!bpForm.title.trim()) return
    const totalMarks = bpForm.sections.reduce((s, sec) => s + sec.count * sec.marksEach, 0)
    setBlueprints((prev) => [{ id: crypto.randomUUID(), ...bpForm, duration: Number(bpForm.duration), totalMarks, sections: bpForm.sections.map((s) => ({ ...s, count: Number(s.count), marksEach: Number(s.marksEach) })), createdOn: today }, ...prev])
    setBpForm({ title: '', subject: '', className: '', duration: 60, sections: [{ questionType: 'MCQ', count: 10, marksEach: 1 }] })
    setShowBpForm(false)
  }

  const addSection = () => setBpForm((p) => ({ ...p, sections: [...p.sections, { questionType: 'SHORT', count: 5, marksEach: 2 }] }))
  const removeSection = (i: number) => setBpForm((p) => ({ ...p, sections: p.sections.filter((_, idx) => idx !== i) }))

  return (
    <section className="space-y-6">
      <PageHeader
        title="Question Bank"
        subtitle="Store reusable exam questions by subject and topic. Build exam blueprints."
        badge={{ label: `${questions.length} Question${questions.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Questions</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{questions.length}</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Blueprints</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">{blueprints.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Subjects</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{subjects.length - 1}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['questions', 'blueprints'] as QBTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t === 'blueprints' ? 'Exam Blueprints' : 'Questions'}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value as Difficulty | 'ALL')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <div className="flex-1" />
            <button type="button" onClick={() => setShowQForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showQForm ? 'Cancel' : '+ Add Question'}
            </button>
          </div>

          {showQForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Add Question</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddQuestion}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="text" placeholder="Subject" value={qForm.subject} onChange={(e) => setQForm((p) => ({ ...p, subject: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Topic / chapter" value={qForm.topic} onChange={(e) => setQForm((p) => ({ ...p, topic: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={qForm.difficulty} onChange={(e) => setQForm((p) => ({ ...p, difficulty: e.target.value as Difficulty }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                  </select>
                  <select value={qForm.type} onChange={(e) => setQForm((p) => ({ ...p, type: e.target.value as QuestionType }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="MCQ">MCQ</option><option value="SHORT">Short Answer</option><option value="LONG">Long Answer</option><option value="TRUE_FALSE">True/False</option>
                  </select>
                  <input type="number" min={1} placeholder="Marks" value={qForm.marks} onChange={(e) => setQForm((p) => ({ ...p, marks: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                </div>
                <textarea placeholder="Question text…" value={qForm.text} onChange={(e) => setQForm((p) => ({ ...p, text: e.target.value }))} required rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
                {qForm.type === 'MCQ' && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {qForm.options.map((opt, i) => (
                      <input key={i} type="text" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => setQForm((p) => { const o = [...p.options]; o[i] = e.target.value; return { ...p, options: o } })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                    ))}
                  </div>
                )}
                <input type="text" placeholder="Correct answer / key" value={qForm.answer} onChange={(e) => setQForm((p) => ({ ...p, answer: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Question</button>
              </form>
            </Card>
          )}

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">{questions.length === 0 ? 'No questions yet. Add the first one above.' : 'No questions match your filters.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((q) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_STYLE[q.difficulty]}`}>{q.difficulty}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{TYPE_LABEL[q.type]}</span>
                        {q.subject && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">{q.subject}</span>}
                        {q.topic && <span className="text-[10px] text-slate-400">{q.topic}</span>}
                        <span className="text-[10px] text-slate-400">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-800">{q.text}</p>
                      {q.options.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {q.options.map((o, i) => <span key={i} className={`rounded-lg px-2 py-0.5 text-xs ${o === q.answer ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-slate-50 text-slate-600'}`}>{String.fromCharCode(65 + i)}. {o}</span>)}
                        </div>
                      )}
                      {q.answer && q.type !== 'MCQ' && <p className="mt-1 text-xs text-emerald-600"><span className="font-medium">Answer:</span> {q.answer}</p>}
                    </div>
                    <button type="button" onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'blueprints' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowBpForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showBpForm ? 'Cancel' : '+ New Blueprint'}
            </button>
          </div>
          {showBpForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Exam Blueprint</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddBlueprint}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="text" placeholder="Exam title" value={bpForm.title} onChange={(e) => setBpForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Subject" value={bpForm.subject} onChange={(e) => setBpForm((p) => ({ ...p, subject: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Class / Section" value={bpForm.className} onChange={(e) => setBpForm((p) => ({ ...p, className: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Duration (minutes)</label>
                    <input type="number" min={10} value={bpForm.duration} onChange={(e) => setBpForm((p) => ({ ...p, duration: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Sections</p>
                  {bpForm.sections.map((sec, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <select value={sec.questionType} onChange={(e) => setBpForm((p) => { const s = [...p.sections]; s[i] = { ...s[i], questionType: e.target.value as QuestionType }; return { ...p, sections: s } })} className="rounded-lg border border-slate-200 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                        <option value="MCQ">MCQ</option><option value="SHORT">Short</option><option value="LONG">Long</option><option value="TRUE_FALSE">True/False</option>
                      </select>
                      <input type="number" min={1} value={sec.count} onChange={(e) => setBpForm((p) => { const s = [...p.sections]; s[i] = { ...s[i], count: Number(e.target.value) }; return { ...p, sections: s } })} className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder="Qty" />
                      <span className="text-xs text-slate-400">×</span>
                      <input type="number" min={1} value={sec.marksEach} onChange={(e) => setBpForm((p) => { const s = [...p.sections]; s[i] = { ...s[i], marksEach: Number(e.target.value) }; return { ...p, sections: s } })} className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder="Marks" />
                      <span className="text-xs text-slate-500">= {sec.count * sec.marksEach} marks</span>
                      {bpForm.sections.length > 1 && <button type="button" onClick={() => removeSection(i)} className="ml-auto text-xs text-slate-300 hover:text-rose-500 transition">✕</button>}
                    </div>
                  ))}
                  <button type="button" onClick={addSection} className="rounded-lg border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition">+ Add Section</button>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                  Total: <strong>{bpForm.sections.reduce((s, sec) => s + Number(sec.count) * Number(sec.marksEach), 0)} marks</strong> · {bpForm.duration} min
                </div>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Blueprint</button>
              </form>
            </Card>
          )}
          {blueprints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No blueprints yet. Create the first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blueprints.map((bp) => (
                <div key={bp.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{bp.title}</p>
                        {bp.subject && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">{bp.subject}</span>}
                        {bp.className && <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{bp.className}</span>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">Total: <strong>{bp.totalMarks} marks</strong> · Duration: {bp.duration} min</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {bp.sections.map((sec, i) => (
                          <span key={i} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">{sec.count}× {TYPE_LABEL[sec.questionType]} ({sec.marksEach}m each)</span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => setBlueprints((prev) => prev.filter((x) => x.id !== bp.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
