import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type ProcTab = 'requests' | 'vendors'
type PRStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED'

interface PurchaseRequest {
  id: string
  title: string
  category: string
  quantity: number
  estimatedCost: number
  requestedBy: string
  vendor: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: PRStatus
  submittedOn: string
  note: string
}

interface Vendor {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  category: string
  gstNumber: string
  address: string
  rating: number
  addedOn: string
}

const PR_STATUS_STYLE: Record<PRStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-sky-100 text-sky-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  ORDERED: 'bg-violet-100 text-violet-700',
}

const PRIORITY_STYLE: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-rose-100 text-rose-700',
}

const today = new Date().toISOString().slice(0, 10)

export function ProcurementPage() {
  const [tab, setTab] = useState<ProcTab>('requests')

  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [prForm, setPrForm] = useState({ title: '', category: '', quantity: 1, estimatedCost: 0, requestedBy: '', vendor: '', priority: 'MEDIUM' as PurchaseRequest['priority'], note: '' })
  const [showPrForm, setShowPrForm] = useState(false)

  const [vendors, setVendors] = useState<Vendor[]>([
    { id: '1', name: 'ABC Stationery Pvt Ltd', contact: 'Rajesh Shah', phone: '9876543210', email: 'rajesh@abcstationary.com', category: 'Stationery', gstNumber: '27AABCU9603R1ZP', address: 'Mumbai, Maharashtra', rating: 4, addedOn: '2025-01-10' },
    { id: '2', name: 'TechSupply India', contact: 'Anita Mehta', phone: '9876543211', email: 'anita@techsupply.in', category: 'Electronics', gstNumber: '27AABCT9604R1ZP', address: 'Pune, Maharashtra', rating: 5, addedOn: '2025-02-15' },
  ])
  const [vForm, setVForm] = useState({ name: '', contact: '', phone: '', email: '', category: '', gstNumber: '', address: '', rating: 4 })
  const [showVForm, setShowVForm] = useState(false)

  const pending = requests.filter((r) => r.status === 'PENDING').length
  const totalValue = requests.filter((r) => r.status !== 'REJECTED').reduce((s, r) => s + r.estimatedCost * r.quantity, 0)

  const handleAddPR = (e: FormEvent) => {
    e.preventDefault()
    if (!prForm.title.trim()) return
    setRequests((prev) => [{ id: crypto.randomUUID(), ...prForm, quantity: Number(prForm.quantity), estimatedCost: Number(prForm.estimatedCost), status: 'PENDING', submittedOn: today }, ...prev])
    setPrForm((p) => ({ ...p, title: '', category: '', vendor: '', note: '', quantity: 1, estimatedCost: 0 }))
    setShowPrForm(false)
  }

  const handleAddVendor = (e: FormEvent) => {
    e.preventDefault()
    if (!vForm.name.trim()) return
    setVendors((prev) => [{ id: crypto.randomUUID(), ...vForm, rating: Number(vForm.rating), addedOn: today }, ...prev])
    setVForm({ name: '', contact: '', phone: '', email: '', category: '', gstNumber: '', address: '', rating: 4 })
    setShowVForm(false)
  }

  const updatePRStatus = (id: string, status: PRStatus) =>
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))

  return (
    <section className="space-y-6">
      <PageHeader
        title="Procurement"
        subtitle="Manage purchase requests, vendor records, and procurement approvals."
        badge={{ label: pending > 0 ? `${pending} Pending` : `${requests.length} Requests`, tone: pending > 0 ? 'red' : 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Requests</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{requests.length}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${pending > 0 ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${pending > 0 ? 'text-sky-600' : 'text-slate-500'}`}>Pending Approval</p>
          <p className={`mt-1 text-2xl font-bold ${pending > 0 ? 'text-sky-700' : 'text-slate-900'}`}>{pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Estimated Value</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">₹ {totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['requests', 'vendors'] as ProcTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t === 'requests' ? 'Purchase Requests' : 'Vendors'}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowPrForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showPrForm ? 'Cancel' : '+ New Request'}
            </button>
          </div>
          {showPrForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Purchase Request</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddPR}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" placeholder="Item / service title" value={prForm.title} onChange={(e) => setPrForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Category (e.g. Stationery)" value={prForm.category} onChange={(e) => setPrForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="number" min={1} placeholder="Quantity" value={prForm.quantity || ''} onChange={(e) => setPrForm((p) => ({ ...p, quantity: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="number" min={0} placeholder="Estimated cost per unit (₹)" value={prForm.estimatedCost || ''} onChange={(e) => setPrForm((p) => ({ ...p, estimatedCost: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Requested by" value={prForm.requestedBy} onChange={(e) => setPrForm((p) => ({ ...p, requestedBy: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Preferred vendor (optional)" value={prForm.vendor} onChange={(e) => setPrForm((p) => ({ ...p, vendor: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={prForm.priority} onChange={(e) => setPrForm((p) => ({ ...p, priority: e.target.value as PurchaseRequest['priority'] }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                  <input type="text" placeholder="Note (optional)" value={prForm.note} onChange={(e) => setPrForm((p) => ({ ...p, note: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                </div>
                {prForm.quantity > 0 && prForm.estimatedCost > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                    <p className="text-sm text-emerald-700">Total Estimated: <strong>₹ {(prForm.quantity * prForm.estimatedCost).toLocaleString('en-IN')}</strong></p>
                  </div>
                )}
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Submit Request</button>
              </form>
            </Card>
          )}
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No purchase requests yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${r.status === 'REJECTED' ? 'border-rose-200' : r.priority === 'HIGH' ? 'border-amber-200' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{r.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[r.priority]}`}>{r.priority}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PR_STATUS_STYLE[r.status]}`}>{r.status}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">Qty: {r.quantity} · Est: ₹ {(r.quantity * r.estimatedCost).toLocaleString('en-IN')}{r.requestedBy ? ` · By: ${r.requestedBy}` : ''}{r.vendor ? ` · Vendor: ${r.vendor}` : ''}</p>
                      {r.note && <p className="mt-0.5 text-xs text-slate-400 italic">{r.note}</p>}
                      <p className="mt-0.5 text-[10px] text-slate-400">Submitted {r.submittedOn}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.status === 'PENDING' && (
                      <>
                        <button type="button" onClick={() => updatePRStatus(r.id, 'APPROVED')} className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200 transition">Approve</button>
                        <button type="button" onClick={() => updatePRStatus(r.id, 'REJECTED')} className="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-200 transition">Reject</button>
                      </>
                    )}
                    {r.status === 'APPROVED' && (
                      <button type="button" onClick={() => updatePRStatus(r.id, 'ORDERED')} className="rounded-lg bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700 hover:bg-violet-200 transition">Mark Ordered</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowVForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showVForm ? 'Cancel' : '+ Add Vendor'}
            </button>
          </div>
          {showVForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Add Vendor</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddVendor}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" placeholder="Vendor / company name" value={vForm.name} onChange={(e) => setVForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Contact person" value={vForm.contact} onChange={(e) => setVForm((p) => ({ ...p, contact: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="tel" placeholder="Phone" value={vForm.phone} onChange={(e) => setVForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="email" placeholder="Email" value={vForm.email} onChange={(e) => setVForm((p) => ({ ...p, email: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Category (e.g. Electronics)" value={vForm.category} onChange={(e) => setVForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="GST Number" value={vForm.gstNumber} onChange={(e) => setVForm((p) => ({ ...p, gstNumber: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Address" value={vForm.address} onChange={(e) => setVForm((p) => ({ ...p, address: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Rating (1–5)</label>
                    <input type="number" min={1} max={5} value={vForm.rating} onChange={(e) => setVForm((p) => ({ ...p, rating: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Vendor</button>
              </form>
            </Card>
          )}
          <div className="space-y-2">
            {vendors.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{v.name}</p>
                    {v.category && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{v.category}</span>}
                    <span className="text-[10px] text-amber-500">{'★'.repeat(v.rating)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{v.contact}{v.phone ? ` · ${v.phone}` : ''}{v.email ? ` · ${v.email}` : ''}</p>
                  {v.gstNumber && <p className="mt-0.5 text-xs text-slate-400 font-mono">GST: {v.gstNumber}</p>}
                </div>
                <button type="button" onClick={() => setVendors((prev) => prev.filter((x) => x.id !== v.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
