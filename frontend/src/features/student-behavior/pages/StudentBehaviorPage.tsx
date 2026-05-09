import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type IncidentSeverity = 'MINOR' | 'MODERATE' | 'SERIOUS'
type IncidentStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'
type BehaviorCategory = 'DISCIPLINE' | 'ATTENDANCE' | 'ACADEMIC' | 'PEER' | 'POSITIVE'

interface BehaviorEntry {
  id: string
  studentName: string
  admissionNo: string
  className: string
  category: BehaviorCategory
  severity: IncidentSeverity
  description: string
  actionTaken: string
  reportedBy: string
  date: string
  status: IncidentStatus
}

const SEVERITY_STYLE: Record<IncidentSeverity, string> = {
  MINOR: 'bg-amber-100 text-amber-700',
  MODERATE: 'bg-orange-100 text-orange-700',
  SERIOUS: 'bg-rose-100 text-rose-700',
}

const STATUS_STYLE: Record<IncidentStatus, string> = {
  OPEN: 'bg-sky-100 text-sky-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
}

const CATEGORY_STYLE: Record<BehaviorCategory, string> = {
  DISCIPLINE: 'bg-rose-50 text-rose-600',
  ATTENDANCE: 'bg-amber-50 text-amber-600',
  ACADEMIC: 'bg-sky-50 text-sky-600',
  PEER: 'bg-violet-50 text-violet-600',
  POSITIVE: 'bg-emerald-50 text-emerald-600',
}

const today = new Date().toISOString().slice(0, 10)

export function StudentBehaviorPage() {
  const [entries, setEntries] = useState<BehaviorEntry[]>([])
  const [form, setForm] = useState({
    studentName: '', admissionNo: '', className: '',
    category: 'DISCIPLINE' as BehaviorCategory,
    severity: 'MINOR' as IncidentSeverity,
    description: '', actionTaken: '', reportedBy: '', date: today,
  })
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'ALL'>('ALL')

  const visible = filterStatus === 'ALL' ? entries : entries.filter((e) => e.status === filterStatus)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.description.trim() || !form.reportedBy.trim()) return
    setEntries((prev) => [{ id: crypto.randomUUID(), ...form, status: 'OPEN' as IncidentStatus }, ...prev])
    setForm((p) => ({ ...p, studentName: '', admissionNo: '', className: '', description: '', actionTaken: '', reportedBy: '', date: today }))
  }

  const updateStatus = (id: string, status: IncidentStatus) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))

  const open = entries.filter((e) => e.status === 'OPEN').length
  const serious = entries.filter((e) => e.severity === 'SERIOUS').length
  const resolved = entries.filter((e) => e.status === 'RESOLVED').length

  return (
    <section className="space-y-6">
      <PageHeader
        title="Student Behavior"
        subtitle="Log conduct incidents, track discipline follow-ups, and record positive behavior for all students."
        badge={{ label: `${entries.length} Record${entries.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{entries.length}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Open</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{open}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">Serious</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{serious}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{resolved}</p>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Log Incident</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Admission No." value={form.admissionNo} onChange={(e) => setForm((p) => ({ ...p, admissionNo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Class / Section" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as BehaviorCategory }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="DISCIPLINE">Discipline</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="ACADEMIC">Academic</option>
              <option value="PEER">Peer Conflict</option>
              <option value="POSITIVE">Positive Behavior</option>
            </select>
            <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value as IncidentSeverity }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="MINOR">Minor</option>
              <option value="MODERATE">Moderate</option>
              <option value="SERIOUS">Serious</option>
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <textarea placeholder="Describe the incident or behavior in detail…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Action taken / counseling note" value={form.actionTaken} onChange={(e) => setForm((p) => ({ ...p, actionTaken: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Reported by (teacher / admin name)" value={form.reportedBy} onChange={(e) => setForm((p) => ({ ...p, reportedBy: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <Button type="submit">Log Incident</Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {s === 'ALL' ? `All (${entries.length})` : `${s.replace('_', ' ')} (${entries.filter((e) => e.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No behavior records yet. Log the first incident above.</p>
          </div>
        ) : (
          visible.map((entry) => (
            <div key={entry.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${entry.severity === 'SERIOUS' ? 'border-rose-200' : entry.severity === 'MODERATE' ? 'border-orange-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{entry.studentName}</p>
                    {entry.admissionNo && <span className="text-xs text-slate-400 font-mono">{entry.admissionNo}</span>}
                    {entry.className && <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{entry.className}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLE[entry.category]}`}>{entry.category}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_STYLE[entry.severity]}`}>{entry.severity}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[entry.status]}`}>{entry.status.replace('_', ' ')}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                  {entry.actionTaken && <p className="mt-1 text-xs text-slate-500"><span className="font-medium">Action:</span> {entry.actionTaken}</p>}
                  <p className="mt-1 text-xs text-slate-400">Reported by {entry.reportedBy} · {entry.date}</p>
                </div>
              </div>
              {(entry.status === 'OPEN' || entry.status === 'UNDER_REVIEW') && (
                <div className="mt-3 flex gap-2">
                  {entry.status === 'OPEN' && <button type="button" onClick={() => updateStatus(entry.id, 'UNDER_REVIEW')} className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition">Under Review</button>}
                  <button type="button" onClick={() => updateStatus(entry.id, 'RESOLVED')} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition">Resolve</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CounselingPanel />
    </section>
  )
}

// ── Counseling Follow-up Notes ─────────────────────────────────────────────

interface CounselingNote {
  id: string
  studentName: string
  counselorName: string
  sessionDate: string
  topic: string
  notes: string
  nextSessionDate: string
  followUpAction: string
}

function CounselingPanel() {
  const [notes, setNotes] = useState<CounselingNote[]>([])
  const [form, setForm] = useState({ studentName: '', counselorName: '', sessionDate: today, topic: '', notes: '', nextSessionDate: '', followUpAction: '' })
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.notes.trim()) return
    setNotes((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev])
    setForm((p) => ({ ...p, studentName: '', counselorName: '', topic: '', notes: '', nextSessionDate: '', followUpAction: '' }))
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Counseling Follow-up Notes</h2>
          <p className="text-sm text-slate-500">Track student counseling sessions and follow-up actions.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Log Session'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Counselor name" value={form.counselorName} onChange={(e) => setForm((p) => ({ ...p, counselorName: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="date" value={form.sessionDate} onChange={(e) => setForm((p) => ({ ...p, sessionDate: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <input type="text" placeholder="Session topic / issue" value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <textarea placeholder="Session notes and observations…" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} required rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Follow-up action required" value={form.followUpAction} onChange={(e) => setForm((p) => ({ ...p, followUpAction: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Next Session Date</label>
                <input type="date" value={form.nextSessionDate} onChange={(e) => setForm((p) => ({ ...p, nextSessionDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Session</button>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No counseling sessions logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{n.studentName}</p>
                {n.topic && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">{n.topic}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-700">{n.notes}</p>
              {n.followUpAction && <p className="mt-1 text-xs text-slate-500"><span className="font-medium">Follow-up:</span> {n.followUpAction}</p>}
              <p className="mt-1 text-[10px] text-slate-400">{n.counselorName ? `${n.counselorName} · ` : ''}{n.sessionDate}{n.nextSessionDate ? ` · Next: ${n.nextSessionDate}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Intervention Task Assignments ──────────────────────────────────────────

type InterventionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'

interface InterventionTask {
  id: string
  studentName: string
  assignedTo: string
  action: string
  dueDate: string
  status: InterventionStatus
  note: string
  createdOn: string
}

const INT_STATUS_STYLE: Record<InterventionStatus, string> = {
  OPEN: 'bg-sky-100 text-sky-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
}

export function InterventionTaskPanel() {
  const [tasks, setTasks] = useState<InterventionTask[]>([])
  const [form, setForm] = useState({ studentName: '', assignedTo: '', action: '', dueDate: today, note: '' })
  const [showForm, setShowForm] = useState(false)

  const open = tasks.filter((t) => t.status === 'OPEN').length
  const overdue = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate < today).length

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.action.trim()) return
    setTasks((prev) => [{ id: crypto.randomUUID(), ...form, status: 'OPEN', createdOn: today }, ...prev])
    setForm((p) => ({ ...p, studentName: '', assignedTo: '', action: '', note: '' }))
    setShowForm(false)
  }

  const updateStatus = (id: string, status: InterventionStatus) =>
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Intervention Tasks</h2>
          <p className="text-sm text-slate-500">
            Assign corrective actions to staff.
            {open > 0 && <span className="ml-1 font-semibold text-sky-600">{open} open</span>}
            {overdue > 0 && <span className="ml-1 font-semibold text-rose-600">· {overdue} overdue</span>}
          </p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Assign Task'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input type="text" placeholder="Assigned to (staff name)" value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <input type="text" placeholder="Action required (e.g. Parent meeting, Counseling session)" value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Assign Task</button>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No intervention tasks assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => {
            const isOverdue = t.status !== 'COMPLETED' && t.dueDate < today
            return (
              <div key={t.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${isOverdue ? 'border-rose-200' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{t.studentName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${INT_STATUS_STYLE[t.status]}`}>{t.status.replace('_', ' ')}</span>
                      {isOverdue && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">OVERDUE</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-700">{t.action}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{t.assignedTo ? `→ ${t.assignedTo} · ` : ''}Due {t.dueDate}</p>
                    {t.note && <p className="mt-0.5 text-xs text-slate-400 italic">{t.note}</p>}
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {t.status === 'OPEN' && <button type="button" onClick={() => updateStatus(t.id, 'IN_PROGRESS')} className="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-200 transition">In Progress</button>}
                  {t.status !== 'COMPLETED' && <button type="button" onClick={() => updateStatus(t.id, 'COMPLETED')} className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200 transition">Complete ✓</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
