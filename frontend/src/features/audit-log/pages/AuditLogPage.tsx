import { useState } from 'react'

import { PageHeader } from '../../../components/ui/PageHeader'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'LOGIN' | 'EXPORT'
type AuditModule = 'Students' | 'Teachers' | 'Fees' | 'Payroll' | 'Attendance' | 'Marks' | 'Admissions' | 'Settings' | 'Auth'

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorRole: string
  action: AuditAction
  module: AuditModule
  description: string
  ipAddress: string
}

const ACTION_STYLE: Record<AuditAction, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-sky-100 text-sky-700',
  DELETE: 'bg-rose-100 text-rose-700',
  APPROVE: 'bg-violet-100 text-violet-700',
  LOGIN: 'bg-slate-100 text-slate-600',
  EXPORT: 'bg-amber-100 text-amber-700',
}

const today = new Date().toISOString().slice(0, 10)
const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

const SAMPLE_LOGS: AuditEntry[] = [
  { id: '1', timestamp: `${now}`, actor: 'Admin User', actorRole: 'SCHOOL_ADMIN', action: 'APPROVE', module: 'Payroll', description: 'Approved payroll record for May 2026 – Ramesh Kumar', ipAddress: '192.168.1.10' },
  { id: '2', timestamp: `${today} 09:30`, actor: 'Admin User', actorRole: 'SCHOOL_ADMIN', action: 'CREATE', module: 'Students', description: 'Added new student: Aarav Mehta (Class 5A)', ipAddress: '192.168.1.10' },
  { id: '3', timestamp: `${today} 09:15`, actor: 'Teacher Priya', actorRole: 'TEACHER', action: 'UPDATE', module: 'Marks', description: 'Updated marks for Class 8B – Mathematics mid-term', ipAddress: '192.168.1.22' },
  { id: '4', timestamp: `${today} 08:55`, actor: 'Admin User', actorRole: 'SCHOOL_ADMIN', action: 'EXPORT', module: 'Fees', description: 'Exported fee collection report for April 2026', ipAddress: '192.168.1.10' },
  { id: '5', timestamp: `${today} 08:30`, actor: 'Admin User', actorRole: 'SCHOOL_ADMIN', action: 'LOGIN', module: 'Auth', description: 'Successful login from Chrome/Mac', ipAddress: '192.168.1.10' },
  { id: '6', timestamp: `${today} 08:10`, actor: 'Teacher Priya', actorRole: 'TEACHER', action: 'LOGIN', module: 'Auth', description: 'Successful login from Chrome/Android', ipAddress: '192.168.1.22' },
]

export function AuditLogPage() {
  const [logs] = useState<AuditEntry[]>(SAMPLE_LOGS)
  const [filterAction, setFilterAction] = useState<AuditAction | 'ALL'>('ALL')
  const [filterModule, setFilterModule] = useState<AuditModule | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const visible = logs.filter((l) => {
    const matchAction = filterAction === 'ALL' || l.action === filterAction
    const matchModule = filterModule === 'ALL' || l.module === filterModule
    const matchSearch = !search || l.actor.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())
    return matchAction && matchModule && matchSearch
  })

  const actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'LOGIN', 'EXPORT']
  const modules: AuditModule[] = ['Students', 'Teachers', 'Fees', 'Payroll', 'Attendance', 'Marks', 'Admissions', 'Settings', 'Auth']

  return (
    <section className="space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle="Track all sensitive actions — who changed what, when, and from where."
        badge={{ label: `${logs.length} Events`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((a) => {
          const count = logs.filter((l) => l.action === a).length
          return (
            <div key={a} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_STYLE[a]}`}>{a}</span>
                <p className="text-xl font-bold text-slate-900">{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <input type="text" placeholder="Search actor or description…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-48 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value as AuditAction | 'ALL')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
          <option value="ALL">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterModule} onChange={(e) => setFilterModule(e.target.value as AuditModule | 'ALL')} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
          <option value="ALL">All Modules</option>
          {modules.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No audit events match the current filters.</p>
          </div>
        ) : (
          visible.map((entry) => (
            <div key={entry.id} className={`flex items-start gap-4 rounded-2xl border bg-white px-5 py-4 shadow-sm ${entry.action === 'DELETE' ? 'border-rose-100' : 'border-slate-200'}`}>
              <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_STYLE[entry.action]}`}>{entry.action}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-950 text-sm">{entry.description}</p>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{entry.module}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{entry.actor} ({entry.actorRole}) · {entry.timestamp} · IP: {entry.ipAddress}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
