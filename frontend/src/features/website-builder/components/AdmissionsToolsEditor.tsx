import { useState } from 'react'
import type { AdmissionLead } from '../types'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctHint: string
}

interface WaitlistEntry {
  id: string
  parentName: string
  email: string
  phone: string
  applyingClass: string
  addedAt: string
  status: 'WAITING' | 'NOTIFIED' | 'ENROLLED'
  notes: string
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function loadArr<T>(k: string): T[] { try { return JSON.parse(localStorage.getItem(k) ?? '[]') } catch { return [] } }
function saveArr<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)) }

type Tab = 'calculator' | 'quiz' | 'waitlist' | 'export'

const CLASSES_AGE: { label: string; minAge: number; maxAge: number }[] = [
  { label: 'Nursery / Pre-KG', minAge: 3, maxAge: 4 },
  { label: 'LKG', minAge: 4, maxAge: 5 },
  { label: 'UKG', minAge: 5, maxAge: 6 },
  { label: 'Class 1', minAge: 6, maxAge: 7 },
  { label: 'Class 2', minAge: 7, maxAge: 8 },
  { label: 'Class 3', minAge: 8, maxAge: 9 },
  { label: 'Class 4', minAge: 9, maxAge: 10 },
  { label: 'Class 5', minAge: 10, maxAge: 11 },
  { label: 'Class 6', minAge: 11, maxAge: 12 },
  { label: 'Class 7', minAge: 12, maxAge: 13 },
  { label: 'Class 8', minAge: 13, maxAge: 14 },
  { label: 'Class 9', minAge: 14, maxAge: 15 },
  { label: 'Class 10', minAge: 15, maxAge: 16 },
]

const DEFAULT_QUIZ: QuizQuestion[] = [
  { id: '1', question: 'Which board of education does your child prefer?', options: ['CBSE', 'ICSE', 'State Board', 'IB'], correctHint: 'We are a CBSE school — perfect for you!' },
  { id: '2', question: 'What is most important to you in a school?', options: ['Academic excellence', 'Sports & extracurriculars', 'Character development', 'Affordable fees'], correctHint: 'Our school excels in all these areas!' },
  { id: '3', question: 'How far are you from our school?', options: ['Within 2 km', '2–5 km', '5–10 km', 'More than 10 km'], correctHint: 'We offer transport for all distances!' },
]

export function AdmissionsToolsEditor() {
  const [tab, setTab] = useState<Tab>('calculator')
  // Age calculator state
  const [dob, setDob] = useState('')
  const [calcResult, setCalcResult] = useState<{ eligible: { label: string; minAge: number; maxAge: number }[]; age: number } | null>(null)
  // Quiz state
  const [quiz] = useState<QuizQuestion[]>(() => loadArr('wb_quiz') as QuizQuestion[] || DEFAULT_QUIZ)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  // Waitlist state
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => loadArr('wb_waitlist'))
  const [addingWait, setAddingWait] = useState(false)
  const [waitForm, setWaitForm] = useState({ parentName: '', email: '', phone: '', applyingClass: 'Class 1', notes: '' })
  const [saved, setSaved] = useState(false)
  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  function calculateEligibility() {
    if (!dob) return
    const today = new Date()
    const birth = new Date(dob)
    const ageYears = (today.getTime() - birth.getTime()) / (365.25 * 24 * 3600 * 1000)
    const eligible = CLASSES_AGE.filter((c) => ageYears >= c.minAge && ageYears < c.maxAge + 1)
    setCalcResult({ eligible, age: Math.floor(ageYears) })
  }

  function addToWaitlist() {
    const entry: WaitlistEntry = { id: uid(), ...waitForm, addedAt: new Date().toISOString(), status: 'WAITING' }
    const updated = [...waitlist, entry]
    saveArr('wb_waitlist', updated); setWaitlist(updated); setAddingWait(false); flash()
  }

  function updateWaitStatus(id: string, status: WaitlistEntry['status']) {
    const updated = waitlist.map((w) => w.id === id ? { ...w, status } : w)
    saveArr('wb_waitlist', updated); setWaitlist(updated); flash()
  }

  function exportLeadsCSV() {
    const leads: AdmissionLead[] = loadArr('cms_leads')
    const headers = ['Parent Name', 'Email', 'Phone', 'Student Name', 'Class', 'Message', 'Status', 'Submitted']
    const rows = leads.map((l) => [l.parentName, l.parentEmail, l.parentPhone, l.studentName, l.applyingClass, l.message, l.status, l.submittedAt ?? ''])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `admission-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  function exportWaitlistCSV() {
    const headers = ['Parent Name', 'Email', 'Phone', 'Class', 'Status', 'Added', 'Notes']
    const rows = waitlist.map((w) => [w.parentName, w.email, w.phone, w.applyingClass, w.status, new Date(w.addedAt).toLocaleDateString('en-IN'), w.notes])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const TABS = [
    { key: 'calculator' as Tab, icon: '🧮', label: 'Age Calculator' },
    { key: 'quiz' as Tab, icon: '✅', label: 'Eligibility Quiz' },
    { key: 'waitlist' as Tab, icon: '📋', label: 'Waitlist', badge: waitlist.filter((w) => w.status === 'WAITING').length },
    { key: 'export' as Tab, icon: '📤', label: 'Bulk Export' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Admissions Tools
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">PRO</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Advanced tools to streamline your admissions process.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-100'}`}>
            {t.icon} {t.label}
            {(t as { badge?: number }).badge ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold">{(t as { badge?: number }).badge}</span> : null}
          </button>
        ))}
      </div>

      {/* Age Calculator */}
      {tab === 'calculator' && (
        <div className="max-w-md space-y-4">
          <p className="text-sm text-slate-500">Parents enter their child's date of birth to see which class they are eligible for. This tool appears on your Admissions page.</p>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">🧮 Class Eligibility Calculator <span className="text-xs text-slate-400 font-normal">Preview</span></h4>
            <div className="space-y-1">
              <label className="field-label">Child's Date of Birth</label>
              <input className="cc-input" type="date" value={dob} onChange={(e) => { setDob(e.target.value); setCalcResult(null) }} max={new Date().toISOString().slice(0, 10)} />
            </div>
            <button onClick={calculateEligibility} disabled={!dob} className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
              Check Eligibility
            </button>
            {calcResult && (
              <div className="space-y-3 pt-2">
                <p className="text-sm text-slate-600">Child's age: <strong>{calcResult.age} years</strong></p>
                {calcResult.eligible.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-700">Eligible for:</p>
                    {calcResult.eligible.map((c) => (
                      <div key={c.label} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span className="font-semibold text-emerald-800">{c.label}</span>
                        <span className="text-xs text-emerald-600 ml-auto">Age {c.minAge}–{c.maxAge + 1}</span>
                      </div>
                    ))}
                    <p className="text-xs text-slate-400">*Based on typical age-class norms. Final eligibility confirmed at time of admission.</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                    Your child's age ({calcResult.age} years) may not match our current class offerings. Please contact us directly for guidance.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 text-sm text-violet-700">
            <p className="font-semibold mb-1">How this works on your website</p>
            <p className="text-xs">Parents see this calculator on the Admissions section of your public website. They enter DOB → instantly see which class their child qualifies for → encouraged to fill the enquiry form.</p>
          </div>
        </div>
      )}

      {/* Eligibility Quiz */}
      {tab === 'quiz' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">A short quiz that qualifies prospective parents — shown on your Admissions page before the enquiry form.</p>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
            <h4 className="font-bold text-slate-800">Quiz Preview</h4>
            {!quizSubmitted ? (
              <div className="space-y-4">
                {quiz.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt) => (
                        <button key={opt} onClick={() => setQuizAnswers((p) => ({ ...p, [q.id]: opt }))}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${quizAnswers[q.id] === opt ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < quiz.length}
                  className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
                  See if my child qualifies →
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-3xl">🎉</div>
                <p className="font-bold text-slate-800 text-lg">Your child qualifies!</p>
                <p className="text-sm text-slate-500">Based on your answers, our school is a great fit. Fill the enquiry form to start the admission process.</p>
                <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}) }} className="text-xs text-slate-400 underline">Reset quiz</button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400">To customise quiz questions, edit the quiz configuration below the preview.</p>
        </div>
      )}

      {/* Waitlist */}
      {tab === 'waitlist' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-700">Waitlist Management</p>
              <p className="text-sm text-slate-400">{waitlist.filter((w) => w.status === 'WAITING').length} waiting · {waitlist.filter((w) => w.status === 'ENROLLED').length} enrolled</p>
            </div>
            <button onClick={() => setAddingWait(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add to Waitlist
            </button>
          </div>
          {waitlist.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-2">📋</span>
              <p className="font-semibold text-slate-600">No waitlist entries</p>
              <p className="text-sm text-slate-400 mt-1">When seats are full, add interested families to the waitlist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waitlist.map((w, i) => (
                <div key={w.id} className={`flex items-center gap-4 p-4 rounded-xl border ${w.status === 'WAITING' ? 'border-amber-200 bg-amber-50/30' : w.status === 'ENROLLED' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
                  <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{w.parentName}</p>
                    <p className="text-xs text-slate-400">{w.applyingClass} · {w.email} · {w.phone}</p>
                  </div>
                  <select value={w.status} onChange={(e) => updateWaitStatus(w.id, e.target.value as WaitlistEntry['status'])}
                    className={`text-xs px-2 py-1 rounded-lg border font-semibold appearance-none ${w.status === 'WAITING' ? 'border-amber-300 text-amber-700 bg-amber-50' : w.status === 'ENROLLED' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-sky-300 text-sky-700 bg-sky-50'}`}>
                    <option value="WAITING">Waiting</option>
                    <option value="NOTIFIED">Notified</option>
                    <option value="ENROLLED">Enrolled</option>
                  </select>
                  <button onClick={() => { const u = waitlist.filter((x) => x.id !== w.id); saveArr('wb_waitlist', u); setWaitlist(u) }} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">✕</button>
                </div>
              ))}
            </div>
          )}
          {addingWait && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800">Add to Waitlist</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[['parentName', 'Parent Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['applyingClass', 'Class', 'text']].map(([k, l, t]) => (
                    <div key={k} className="space-y-1">
                      <label className="field-label">{l}</label>
                      <input className="cc-input" type={t} value={(waitForm as Record<string, string>)[k]} onChange={(e) => setWaitForm((p) => ({ ...p, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="space-y-1 sm:col-span-2"><label className="field-label">Notes</label><input className="cc-input" value={waitForm.notes} onChange={(e) => setWaitForm((p) => ({ ...p, notes: e.target.value }))} /></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={addToWaitlist} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Add</button>
                  <button onClick={() => setAddingWait(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Export */}
      {tab === 'export' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Export your admission data as CSV files for analysis in Excel or Google Sheets.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Export Admission Leads', desc: 'All enquiries from the public website — parent info, class, status', icon: '👥', action: exportLeadsCSV, color: 'violet' },
              { title: 'Export Waitlist', desc: 'All families on the waitlist with their current status', icon: '📋', action: exportWaitlistCSV, color: 'amber' },
            ].map((item) => (
              <div key={item.title} className={`p-5 rounded-2xl border ${item.color === 'violet' ? 'border-violet-200 bg-violet-50' : 'border-amber-200 bg-amber-50'} space-y-3`}>
                <p className="text-3xl">{item.icon}</p>
                <p className="font-bold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
                <button onClick={item.action} className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold ${item.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  Download CSV
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2">What's included in each export</p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-500">
              <div><p className="font-medium text-slate-700 mb-1">Admission Leads CSV:</p><ul className="space-y-0.5 list-disc list-inside"><li>Parent name, email, phone</li><li>Student name, applying class</li><li>Enquiry message & status</li><li>Submission date & time</li></ul></div>
              <div><p className="font-medium text-slate-700 mb-1">Waitlist CSV:</p><ul className="space-y-0.5 list-disc list-inside"><li>Parent contact details</li><li>Applied class</li><li>Waitlist status</li><li>Date added & notes</li></ul></div>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm font-medium">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved!
        </div>
      )}
    </div>
  )
}
