import { useState } from 'react'

import { PageHeader } from '../../../components/ui/PageHeader'

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type ApprovalCategory = 'LEAVE' | 'EXPENSE' | 'PURCHASE' | 'PAYROLL' | 'ADMISSION' | 'DOCUMENT' | 'OTHER'

interface ApprovalRequest {
  id: string
  title: string
  category: ApprovalCategory
  requestedBy: string
  requestedOn: string
  amount?: number
  description: string
  status: ApprovalStatus
  reviewedBy: string
  reviewedOn: string
  remarks: string
}

const CATEGORY_STYLE: Record<ApprovalCategory, string> = {
  LEAVE: 'bg-sky-100 text-sky-700',
  EXPENSE: 'bg-amber-100 text-amber-700',
  PURCHASE: 'bg-violet-100 text-violet-700',
  PAYROLL: 'bg-emerald-100 text-emerald-700',
  ADMISSION: 'bg-pink-100 text-pink-700',
  DOCUMENT: 'bg-slate-100 text-slate-600',
  OTHER: 'bg-slate-100 text-slate-500',
}

const STATUS_STYLE: Record<ApprovalStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
}

const today = new Date().toISOString().slice(0, 10)

const SAMPLE_REQUESTS: ApprovalRequest[] = [
  { id: '1', title: 'Leave request – Priya Sharma (3 days)', category: 'LEAVE', requestedBy: 'Priya Sharma', requestedOn: today, description: 'Personal leave for family function on 12–14 May 2026.', status: 'PENDING', reviewedBy: '', reviewedOn: '', remarks: '' },
  { id: '2', title: 'Purchase – 10 Projectors for new classrooms', category: 'PURCHASE', requestedBy: 'IT Dept', requestedOn: today, amount: 380000, description: 'Procure 10 Epson HD projectors for newly built classroom block.', status: 'PENDING', reviewedBy: '', reviewedOn: '', remarks: '' },
  { id: '3', title: 'Expense reimbursement – Science Lab supplies', category: 'EXPENSE', requestedBy: 'Mrs. Iyer', requestedOn: today, amount: 12500, description: 'Chemicals and glassware for Grade 10 practical exams.', status: 'PENDING', reviewedBy: '', reviewedOn: '', remarks: '' },
]

export function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(SAMPLE_REQUESTS)
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'ALL'>('ALL')
  const [filterCategory, setFilterCategory] = useState<ApprovalCategory | 'ALL'>('ALL')
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({})

  const pending = requests.filter((r) => r.status === 'PENDING').length
  const approved = requests.filter((r) => r.status === 'APPROVED').length
  const rejected = requests.filter((r) => r.status === 'REJECTED').length

  const visible = requests.filter((r) => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
    const matchCat = filterCategory === 'ALL' || r.category === filterCategory
    return matchStatus && matchCat
  })

  const review = (id: string, status: ApprovalStatus) => {
    const remarks = remarksMap[id] ?? ''
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, reviewedBy: 'Admin', reviewedOn: today, remarks } : r))
  }

  const categories: ApprovalCategory[] = ['LEAVE', 'EXPENSE', 'PURCHASE', 'PAYROLL', 'ADMISSION', 'DOCUMENT', 'OTHER']

  return (
    <section className="space-y-6">
      <PageHeader
        title="Approval Workflows"
        subtitle="Review and approve admin task requests from staff across all modules."
        badge={{ label: pending > 0 ? `${pending} Pending` : 'All Clear', tone: pending > 0 ? 'red' : 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${pending > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${pending > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Pending</p>
          <p className={`mt-1 text-2xl font-bold ${pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Approved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{rejected}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{s}</button>
        ))}
        <div className="w-px bg-slate-200 mx-1" />
        {(['ALL', ...categories] as const).map((c) => (
          <button key={c} type="button" onClick={() => setFilterCategory(c as ApprovalCategory | 'ALL')} className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${filterCategory === c ? 'bg-slate-700 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No requests match the current filters.</p>
          </div>
        ) : (
          visible.map((req) => (
            <div key={req.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${req.status === 'PENDING' ? 'border-amber-200' : req.status === 'REJECTED' ? 'border-rose-100' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{req.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLE[req.category]}`}>{req.category}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[req.status]}`}>{req.status}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">By {req.requestedBy} · {req.requestedOn}{req.amount ? ` · ₹ ${req.amount.toLocaleString('en-IN')}` : ''}</p>
                  <p className="mt-1 text-sm text-slate-700">{req.description}</p>
                  {req.remarks && <p className="mt-1 text-xs text-slate-500 italic">Remarks: {req.remarks}</p>}
                  {req.reviewedBy && <p className="mt-0.5 text-[10px] text-slate-400">Reviewed by {req.reviewedBy} · {req.reviewedOn}</p>}
                </div>
              </div>
              {req.status === 'PENDING' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Remarks (optional)…"
                    value={remarksMap[req.id] ?? ''}
                    onChange={(e) => setRemarksMap((p) => ({ ...p, [req.id]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => review(req.id, 'APPROVED')} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition">Approve</button>
                    <button type="button" onClick={() => review(req.id, 'REJECTED')} className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition">Reject</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
