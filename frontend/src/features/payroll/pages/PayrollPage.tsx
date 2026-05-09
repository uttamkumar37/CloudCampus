import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID'

interface PayrollRecord {
  id: string
  staffName: string
  designation: string
  month: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: PayrollStatus
  generatedOn: string
}

const STATUS_STYLE: Record<PayrollStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  APPROVED: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
}

const currentMonth = new Date().toISOString().slice(0, 7)

export function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [form, setForm] = useState({ staffName: '', designation: '', month: currentMonth, basicSalary: 0, allowances: 0, deductions: 0 })
  const [filterMonth, setFilterMonth] = useState(currentMonth)

  const net = Number(form.basicSalary) + Number(form.allowances) - Number(form.deductions)
  const visible = records.filter((r) => r.month === filterMonth)
  const totalNet = visible.reduce((s, r) => s + r.netSalary, 0)
  const paid = visible.filter((r) => r.status === 'PAID').length

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.staffName.trim() || !form.designation.trim()) return
    setRecords((prev) => [{
      id: crypto.randomUUID(), ...form,
      basicSalary: Number(form.basicSalary), allowances: Number(form.allowances), deductions: Number(form.deductions),
      netSalary: net, status: 'DRAFT' as PayrollStatus, generatedOn: new Date().toISOString().slice(0, 10),
    }, ...prev])
    setForm((p) => ({ ...p, staffName: '', designation: '', basicSalary: 0, allowances: 0, deductions: 0 }))
  }

  const updateStatus = (id: string, status: PayrollStatus) =>
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

  const printSlip = (rec: PayrollRecord) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>Salary Slip</title><style>body{font-family:sans-serif;padding:48px;max-width:680px;margin:auto}h1{font-size:20px;text-align:center}h2{font-size:13px;text-align:center;color:#64748b;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:13px}td:last-child{text-align:right;font-weight:600}.total{background:#f8fafc;font-size:15px}</style></head><body>
      <h1>Salary Slip</h1><h2>Month: ${rec.month}</h2>
      <table>
        <tr><td>Staff Name</td><td>${rec.staffName}</td></tr>
        <tr><td>Designation</td><td>${rec.designation}</td></tr>
        <tr><td>Basic Salary</td><td>₹ ${rec.basicSalary.toLocaleString('en-IN')}</td></tr>
        <tr><td>Allowances</td><td>₹ ${rec.allowances.toLocaleString('en-IN')}</td></tr>
        <tr><td>Deductions</td><td>- ₹ ${rec.deductions.toLocaleString('en-IN')}</td></tr>
        <tr class="total"><td><strong>Net Salary</strong></td><td>₹ ${rec.netSalary.toLocaleString('en-IN')}</td></tr>
      </table>
      <p style="margin-top:48px;font-size:11px;color:#94a3b8">Generated on ${rec.generatedOn} · CloudCampus Payroll</p>
      <script>window.print()</script></body></html>`)
    win.document.close()
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle="Generate monthly salary records, approve payroll, and download salary slips for staff."
        badge={{ label: `${records.length} Record${records.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Staff</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{visible.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Total Payout</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">₹ {totalNet.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Paid</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{paid}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{visible.length - paid}</p>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Generate Payroll Entry</h2>
        <form className="mt-4 space-y-3" onSubmit={handleGenerate}>
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="text" placeholder="Staff name" value={form.staffName} onChange={(e) => setForm((p) => ({ ...p, staffName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Designation" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="month" value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Basic Salary (₹)</label>
              <input type="number" min={0} value={form.basicSalary} onChange={(e) => setForm((p) => ({ ...p, basicSalary: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Allowances (₹)</label>
              <input type="number" min={0} value={form.allowances} onChange={(e) => setForm((p) => ({ ...p, allowances: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Deductions (₹)</label>
              <input type="number" min={0} value={form.deductions} onChange={(e) => setForm((p) => ({ ...p, deductions: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-700">Net Salary: <strong>₹ {Math.max(0, net).toLocaleString('en-IN')}</strong></p>
          </div>
          <Button type="submit">Generate Entry</Button>
        </form>
      </Card>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Filter month</label>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No payroll records for {filterMonth}. Generate entries above.</p>
          </div>
        ) : (
          visible.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{rec.staffName}</p>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{rec.designation}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[rec.status]}`}>{rec.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">Basic ₹{rec.basicSalary.toLocaleString('en-IN')} + Allow ₹{rec.allowances.toLocaleString('en-IN')} − Ded ₹{rec.deductions.toLocaleString('en-IN')} = <strong>₹{rec.netSalary.toLocaleString('en-IN')}</strong></p>
                <p className="mt-0.5 text-xs text-slate-400">Generated {rec.generatedOn}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button type="button" onClick={() => printSlip(rec)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition">Slip</button>
                {rec.status === 'DRAFT' && <button type="button" onClick={() => updateStatus(rec.id, 'APPROVED')} className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition">Approve</button>}
                {rec.status === 'APPROVED' && <button type="button" onClick={() => updateStatus(rec.id, 'PAID')} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition">Mark Paid</button>}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
