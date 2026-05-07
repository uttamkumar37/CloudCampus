import { useState } from 'react'
import { useAdmissionLeads, useUpdateLeadStatus } from '../hooks/useWebsite'

type Status = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'REJECTED'

const STATUS_OPTIONS: Status[] = ['NEW', 'CONTACTED', 'CONVERTED', 'REJECTED']

const STATUS_META: Record<Status, { label: string; badge: string; dot: string; next: Status[] }> = {
  NEW: {
    label: 'New',
    badge: 'bg-blue-50 text-blue-700 border border-blue-100',
    dot: 'bg-blue-500',
    next: ['CONTACTED', 'CONVERTED', 'REJECTED'],
  },
  CONTACTED: {
    label: 'Contacted',
    badge: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: 'bg-amber-500',
    next: ['CONVERTED', 'REJECTED'],
  },
  CONVERTED: {
    label: 'Converted',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    dot: 'bg-emerald-500',
    next: ['CONTACTED', 'REJECTED'],
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'bg-red-50 text-red-600 border border-red-100',
    dot: 'bg-red-500',
    next: ['CONTACTED', 'CONVERTED'],
  },
}

export function AdmissionLeadsPanel() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // Always fetch all leads; filter client-side so stat counts are always accurate
  const { data, isLoading } = useAdmissionLeads(undefined)
  const updateStatus = useUpdateLeadStatus()

  const allLeads = data?.data ?? []
  const leads = statusFilter ? allLeads.filter((l) => l.status === statusFilter) : allLeads

  const stats = STATUS_OPTIONS.map((s) => ({
    status: s,
    count: allLeads.filter((l) => l.status === s).length,
  }))

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 cc-skeleton-shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ status, count }) => {
          const meta = STATUS_META[status]
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`text-left p-3 rounded-xl border transition-all ${
                statusFilter === status
                  ? 'border-slate-400 bg-slate-700 text-white shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${statusFilter === status ? 'bg-white' : meta.dot}`} />
                <span className={`text-xs font-medium ${statusFilter === status ? 'text-white/80' : 'text-slate-500'}`}>
                  {meta.label}
                </span>
              </div>
              <p className={`text-2xl font-bold ${statusFilter === status ? 'text-white' : 'text-slate-800'}`}>
                {count}
              </p>
            </button>
          )
        })}
      </div>

      {/* Filter + count row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
            {statusFilter ? ` · ${STATUS_META[statusFilter as Status]?.label}` : ' · All statuses'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 shrink-0">Filter by:</label>
          <select
            className="cc-input py-1.5 text-sm appearance-none pr-8 min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Leads</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {leads.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-medium text-slate-500">
            {statusFilter ? `No ${STATUS_META[statusFilter as Status]?.label} leads` : 'No admission enquiries yet'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter ? 'Try a different filter' : 'Leads submitted via your public website will appear here'}
          </p>
        </div>
      )}

      {/* Lead cards */}
      <div className="space-y-3">
        {leads.map((lead) => {
          const meta = STATUS_META[lead.status]
          const isExpanded = expandedId === lead.id
          return (
            <div
              key={lead.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              {/* Card header — always visible */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : (lead.id ?? ''))}
              >
                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm uppercase">
                  {lead.studentName?.charAt(0) ?? '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">{lead.studentName}</p>
                    {lead.applyingClass && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Class {lead.applyingClass}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Parent: {lead.parentName} · {lead.parentPhone}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${meta.badge}`}>
                    {meta.label}
                  </span>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    {new Date(lead.submittedAt!).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 space-y-4 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Student" value={lead.studentName} />
                    <InfoRow label="Class" value={lead.applyingClass || '—'} />
                    <InfoRow label="Parent / Guardian" value={lead.parentName} />
                    <InfoRow label="Phone" value={lead.parentPhone} />
                    {lead.parentEmail && <InfoRow label="Email" value={lead.parentEmail} />}
                    <InfoRow
                      label="Submitted"
                      value={new Date(lead.submittedAt!).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    />
                  </div>

                  {lead.message && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Message</p>
                      <p className="text-sm text-slate-700 italic">"{lead.message}"</p>
                    </div>
                  )}

                  {/* Status change row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide shrink-0">Move to:</p>
                    <div className="flex gap-2 flex-wrap">
                      {meta.next.map((s) => (
                        <button
                          key={s}
                          onClick={() => lead.id && updateStatus.mutate({ leadId: lead.id!, status: s })}
                          disabled={updateStatus.isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                            s === 'CONVERTED'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : s === 'REJECTED'
                              ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'
                              : 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-700 mt-0.5">{value}</p>
    </div>
  )
}
