import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type TicketCategory = 'FEE' | 'ACADEMIC' | 'TECHNICAL' | 'GENERAL' | 'COMPLAINT'
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface SupportTicket {
  id: string
  ticketNo: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  raisedBy: string
  status: TicketStatus
  createdOn: string
  resolvedNote: string
}

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: 'bg-sky-100 text-sky-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-500',
}

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-sky-100 text-sky-600',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-rose-100 text-rose-700',
}

let ticketCounter = 1000

const today = new Date().toISOString().slice(0, 10)

export function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [form, setForm] = useState({ title: '', description: '', category: 'GENERAL' as TicketCategory, priority: 'MEDIUM' as TicketPriority, raisedBy: '' })
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL')
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({})

  const visible = filterStatus === 'ALL' ? tickets : tickets.filter((t) => t.status === filterStatus)

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.raisedBy.trim()) return
    ticketCounter++
    setTickets((prev) => [
      {
        id: crypto.randomUUID(),
        ticketNo: `TKT-${ticketCounter}`,
        ...form,
        status: 'OPEN' as TicketStatus,
        createdOn: today,
        resolvedNote: '',
      },
      ...prev,
    ])
    setForm((p) => ({ ...p, title: '', description: '', raisedBy: '' }))
  }

  const updateStatus = (id: string, status: TicketStatus) =>
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, resolvedNote: status === 'RESOLVED' ? (resolveNote[id] ?? '') : t.resolvedNote } : t,
      ),
    )

  const open = tickets.filter((t) => t.status === 'OPEN').length
  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolved = tickets.filter((t) => t.status === 'RESOLVED').length

  return (
    <section className="space-y-6">
      <PageHeader
        title="Support & Complaints"
        subtitle="Raise and track service requests, complaints, and issues from staff and parents."
        badge={{ label: `${tickets.length} Ticket${tickets.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Open</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{open}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{inProgress}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{resolved}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{tickets.length}</p>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Raise a Ticket</h2>
        <form className="mt-4 space-y-3" onSubmit={handleCreate}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Your name / department" value={form.raisedBy} onChange={(e) => setForm((p) => ({ ...p, raisedBy: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Issue title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TicketCategory }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="GENERAL">General Enquiry</option>
              <option value="FEE">Fee Related</option>
              <option value="ACADEMIC">Academic</option>
              <option value="TECHNICAL">Technical Issue</option>
              <option value="COMPLAINT">Complaint</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TicketPriority }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <textarea placeholder="Describe the issue in detail…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
          <Button type="submit">Submit Ticket</Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No tickets yet. Raise the first one above.</p>
          </div>
        ) : (
          visible.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{ticket.ticketNo}</span>
                    <h3 className="font-semibold text-slate-950">{ticket.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[ticket.priority]}`}>{ticket.priority}</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{ticket.category}</span>
                  </div>
                  {ticket.description && <p className="mt-1 text-sm text-slate-600">{ticket.description}</p>}
                  <p className="mt-1 text-xs text-slate-400">Raised by {ticket.raisedBy} · {ticket.createdOn}</p>
                  {ticket.resolvedNote && <p className="mt-1 text-xs text-emerald-700 font-medium">Resolution: {ticket.resolvedNote}</p>}
                </div>
              </div>
              {ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {ticket.status === 'OPEN' && (
                    <button type="button" onClick={() => updateStatus(ticket.id, 'IN_PROGRESS')} className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition">Mark In Progress</button>
                  )}
                  <input
                    type="text"
                    placeholder="Resolution note (optional)"
                    value={resolveNote[ticket.id] ?? ''}
                    onChange={(e) => setResolveNote((p) => ({ ...p, [ticket.id]: e.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                  <button type="button" onClick={() => updateStatus(ticket.id, 'RESOLVED')} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition">Resolve</button>
                  <button type="button" onClick={() => updateStatus(ticket.id, 'CLOSED')} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition">Close</button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
