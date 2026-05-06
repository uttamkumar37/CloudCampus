import { useState } from 'react'
import { useAdmissionLeads, useUpdateLeadStatus } from '../hooks/useWebsite'

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'CONVERTED', 'REJECTED'] as const
const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-yellow-50 text-yellow-700',
  CONVERTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-600',
}

export function AdmissionLeadsPanel() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { data, isLoading } = useAdmissionLeads(statusFilter || undefined)
  const updateStatus = useUpdateLeadStatus()

  const leads = data?.data ?? []

  if (isLoading) return <p className="text-slate-500 text-sm">Loading…</p>

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            statusFilter === ''
              ? 'bg-slate-700 text-white border-slate-700'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              statusFilter === s
                ? 'bg-slate-700 text-white border-slate-700'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {leads.length === 0 && (
        <p className="text-sm text-slate-400">No leads found{statusFilter ? ` for status "${statusFilter}"` : ''}.</p>
      )}

      <div className="divide-y divide-slate-100">
        {leads.map((lead) => (
          <div key={lead.id} className="py-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {lead.studentName}{' '}
                  {lead.applyingClass && (
                    <span className="text-slate-500 font-normal">— Class {lead.applyingClass}</span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  Parent: {lead.parentName} · {lead.parentPhone}
                  {lead.parentEmail && ` · ${lead.parentEmail}`}
                </p>
                {lead.message && (
                  <p className="text-xs text-slate-600 mt-1 italic">"{lead.message}"</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(lead.submittedAt!).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status]}`}
              >
                {lead.status}
              </span>
            </div>

            {/* Status actions */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.filter((s) => s !== lead.status).map((s) => (
                <button
                  key={s}
                  onClick={() => lead.id && updateStatus.mutate({ leadId: lead.id!, status: s })}
                  disabled={updateStatus.isPending}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
