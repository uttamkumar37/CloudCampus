import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type AdmissionStatus = 'ENQUIRY' | 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'ENROLLED' | 'REJECTED'
type AdmissionTab = 'applications' | 'seats' | 'id-cards' | 'kyc' | 'fees'

interface AdmissionApplication {
  id: string
  studentName: string
  parentName: string
  phone: string
  applyingForClass: string
  dob: string
  submittedOn: string
  status: AdmissionStatus
  documents: string[]
  note: string
}

interface SeatConfig {
  id: string
  className: string
  totalSeats: number
  enrolledSeats: number
}

const STATUS_STYLE: Record<AdmissionStatus, string> = {
  ENQUIRY: 'bg-slate-100 text-slate-600',
  APPLIED: 'bg-sky-100 text-sky-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  ENROLLED: 'bg-violet-100 text-violet-700',
  REJECTED: 'bg-rose-100 text-rose-700',
}

const PIPELINE_ORDER: AdmissionStatus[] = ['ENQUIRY', 'APPLIED', 'UNDER_REVIEW', 'APPROVED', 'ENROLLED', 'REJECTED']

const today = new Date().toISOString().slice(0, 10)

const DOCUMENT_TYPES = ['Birth Certificate', 'Transfer Certificate', 'Aadhaar Card', 'Previous Marksheet', 'Passport Photo', 'Address Proof']

export function AdmissionsPage() {
  const [tab, setTab] = useState<AdmissionTab>('applications')
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [seats, setSeats] = useState<SeatConfig[]>([
    { id: '1', className: 'Class 1', totalSeats: 40, enrolledSeats: 32 },
    { id: '2', className: 'Class 2', totalSeats: 40, enrolledSeats: 38 },
    { id: '3', className: 'Class 3', totalSeats: 35, enrolledSeats: 25 },
    { id: '4', className: 'Class 4', totalSeats: 35, enrolledSeats: 35 },
    { id: '5', className: 'Class 5', totalSeats: 40, enrolledSeats: 20 },
  ])
  const [form, setForm] = useState({ studentName: '', parentName: '', phone: '', applyingForClass: '', dob: '', note: '', documents: [] as string[] })
  const [filterStatus, setFilterStatus] = useState<AdmissionStatus | 'ALL'>('ALL')
  const [showForm, setShowForm] = useState(false)

  const visible = filterStatus === 'ALL' ? applications : applications.filter((a) => a.status === filterStatus)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.applyingForClass.trim()) return
    setApplications((prev) => [{ id: crypto.randomUUID(), ...form, submittedOn: today, status: 'APPLIED' }, ...prev])
    setForm({ studentName: '', parentName: '', phone: '', applyingForClass: '', dob: '', note: '', documents: [] })
    setShowForm(false)
  }

  const moveStatus = (id: string, status: AdmissionStatus) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))

  const printConfirmationLetter = (app: AdmissionApplication) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>Admission Confirmation</title><style>body{font-family:sans-serif;padding:48px;max-width:680px;margin:auto}h1{font-size:20px;text-align:center}h2{font-size:13px;text-align:center;color:#64748b;margin-bottom:24px}p{font-size:13px;line-height:1.8;margin-bottom:8px}.label{font-weight:600}.footer{margin-top:64px;font-size:11px;color:#94a3b8}</style></head><body>
      <h1>Admission Confirmation Letter</h1><h2>CloudCampus School</h2>
      <p>Date: <span class="label">${today}</span></p>
      <p>Dear Parent / Guardian of <span class="label">${app.studentName}</span>,</p>
      <p>We are pleased to confirm that your ward has been <strong>${app.status}</strong> for admission to <strong>${app.applyingForClass}</strong> at our institution.</p>
      <p><span class="label">Student Name:</span> ${app.studentName}</p>
      <p><span class="label">Parent / Guardian:</span> ${app.parentName || '—'}</p>
      <p><span class="label">Class Applied For:</span> ${app.applyingForClass}</p>
      <p><span class="label">Application Date:</span> ${app.submittedOn}</p>
      <p>Please report to the school office within 7 days with all required original documents to complete the admission formalities.</p>
      <p>We look forward to welcoming ${app.studentName} to our school family.</p>
      <div class="footer"><p>Authorised Signatory</p><p>CloudCampus School</p></div>
      <script>window.print()</script></body></html>`)
    win.document.close()
  }

  const toggleDoc = (doc: string) => {
    setForm((p) => ({
      ...p,
      documents: p.documents.includes(doc) ? p.documents.filter((d) => d !== doc) : [...p.documents, doc],
    }))
  }

  const enquiries = applications.filter((a) => a.status === 'ENQUIRY').length
  const applied = applications.filter((a) => ['APPLIED', 'UNDER_REVIEW'].includes(a.status)).length
  const approved = applications.filter((a) => a.status === 'APPROVED').length
  const enrolled = applications.filter((a) => a.status === 'ENROLLED').length

  return (
    <section className="space-y-6">
      <PageHeader
        title="Admissions"
        subtitle="Manage applications, track the admission pipeline, and monitor seat availability."
        badge={{ label: `${applications.length} Application${applications.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Enquiries</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{enquiries}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">In Review</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{applied}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Approved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{approved}</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Enrolled</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">{enrolled}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([['applications', 'Applications'], ['seats', 'Seat Availability'], ['id-cards', 'ID Cards'], ['kyc', 'KYC Verification'], ['fees', 'Admission Fees']] as [AdmissionTab, string][]).map(([t, label]) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {(['ALL', ...PIPELINE_ORDER] as const).map((s) => (
                <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {s === 'ALL' ? `All (${applications.length})` : s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showForm ? 'Cancel' : '+ New Application'}
            </button>
          </div>

          {showForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">New Admission Application</h2>
              <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Parent / Guardian name" value={form.parentName} onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Applying for class" value={form.applyingForClass} onChange={(e) => setForm((p) => ({ ...p, applyingForClass: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Date of Birth</label>
                    <input type="date" value={form.dob} onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <input type="text" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-600">Documents Submitted</p>
                  <div className="flex flex-wrap gap-2">
                    {DOCUMENT_TYPES.map((doc) => (
                      <button key={doc} type="button" onClick={() => toggleDoc(doc)} className={`rounded-xl border px-3 py-1 text-xs font-semibold transition ${form.documents.includes(doc) ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                        {doc}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit">Submit Application</Button>
              </form>
            </Card>
          )}

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No applications yet. Add the first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((app) => (
                <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{app.studentName}</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{app.applyingForClass}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[app.status]}`}>{app.status.replace('_', ' ')}</span>
                      </div>
                      {app.parentName && <p className="mt-1 text-xs text-slate-500">Parent: {app.parentName}{app.phone ? ` · ${app.phone}` : ''}</p>}
                      {app.documents.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {app.documents.map((d) => <span key={d} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓ {d}</span>)}
                        </div>
                      )}
                      <p className="mt-1 text-[10px] text-slate-400">Applied {app.submittedOn}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {app.status === 'ENQUIRY' && <button type="button" onClick={() => moveStatus(app.id, 'APPLIED')} className="rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-semibold text-sky-700 hover:bg-sky-200 transition">Mark Applied</button>}
                    {app.status === 'APPLIED' && <button type="button" onClick={() => moveStatus(app.id, 'UNDER_REVIEW')} className="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-200 transition">Under Review</button>}
                    {app.status === 'UNDER_REVIEW' && (
                      <>
                        <button type="button" onClick={() => moveStatus(app.id, 'APPROVED')} className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200 transition">Approve</button>
                        <button type="button" onClick={() => moveStatus(app.id, 'REJECTED')} className="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-200 transition">Reject</button>
                      </>
                    )}
                    {app.status === 'APPROVED' && <button type="button" onClick={() => moveStatus(app.id, 'ENROLLED')} className="rounded-lg bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700 hover:bg-violet-200 transition">Mark Enrolled</button>}
                    {(app.status === 'APPROVED' || app.status === 'ENROLLED') && (
                      <button type="button" onClick={() => printConfirmationLetter(app)} className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-700 transition">Print Letter</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'seats' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seats.map((s) => {
              const available = s.totalSeats - s.enrolledSeats
              const pct = Math.round((s.enrolledSeats / s.totalSeats) * 100)
              const isFull = available === 0
              return (
                <div key={s.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${isFull ? 'border-rose-200' : available <= 5 ? 'border-amber-200' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-950">{s.className}</p>
                    {isFull
                      ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">FULL</span>
                      : available <= 5
                        ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">ALMOST FULL</span>
                        : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{available} seats</span>}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{s.enrolledSeats} enrolled</span>
                      <span>{s.totalSeats} total</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full transition-all ${isFull ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-right text-xs text-slate-400">{pct}% filled</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setSeats((prev) => prev.map((x) => x.id === s.id && x.enrolledSeats < x.totalSeats ? { ...x, enrolledSeats: x.enrolledSeats + 1 } : x))} className="flex-1 rounded-lg bg-slate-100 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">+1 Enrolled</button>
                    <button type="button" onClick={() => setSeats((prev) => prev.map((x) => x.id === s.id && x.enrolledSeats > 0 ? { ...x, enrolledSeats: x.enrolledSeats - 1 } : x))} className="flex-1 rounded-lg bg-slate-100 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">-1 Enrolled</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                const cls = prompt('Class name (e.g. Class 6)')
                const total = Number(prompt('Total seats'))
                if (cls && total > 0) setSeats((prev) => [...prev, { id: crypto.randomUUID(), className: cls, totalSeats: total, enrolledSeats: 0 }])
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              + Add Class
            </button>
          </div>
        </div>
      )}
      {tab === 'id-cards' && <IDCardPanel applications={applications} />}
      {tab === 'kyc' && <KYCPanel applications={applications} />}
      {tab === 'fees' && <AdmissionFeePanel applications={applications} />}
    </section>
  )
}

// ── Student ID Card Generator ──────────────────────────────────────────────

function IDCardPanel({ applications }: { applications: AdmissionApplication[] }) {
  const enrolled = applications.filter((a) => a.status === 'ENROLLED' || a.status === 'APPROVED')

  const printCard = (app: AdmissionApplication, qr: boolean) => {
    const admNo = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>Student ID Card</title><style>
      body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f1f5f9}
      .card{width:340px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15)}
      .header{background:linear-gradient(135deg,#1e293b,#334155);padding:20px;color:white;text-align:center}
      .header h1{font-size:15px;margin:0 0 4px}
      .header p{font-size:11px;margin:0;color:#94a3b8}
      .body{background:white;padding:20px}
      .photo{width:72px;height:72px;border-radius:50%;background:#e2e8f0;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#64748b}
      .name{font-size:16px;font-weight:700;color:#0f172a;text-align:center}
      .class{font-size:12px;color:#64748b;text-align:center;margin-top:2px}
      .info{margin-top:12px;border-top:1px solid #f1f5f9;padding-top:12px}
      .row{display:flex;justify-content:space-between;font-size:11px;padding:2px 0}
      .row .label{color:#94a3b8}
      .row .value{font-weight:600;color:#1e293b}
      .qr{text-align:center;margin-top:12px;font-size:10px;color:#64748b;padding:8px;background:#f8fafc;border-radius:8px}
      .footer{background:#1e293b;padding:10px;text-align:center;color:#94a3b8;font-size:10px}
    </style></head><body>
      <div class="card">
        <div class="header"><h1>CloudCampus School</h1><p>Student Identity Card · ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p></div>
        <div class="body">
          <div class="photo">👤</div>
          <div class="name">${app.studentName}</div>
          <div class="class">${app.applyingForClass}</div>
          <div class="info">
            <div class="row"><span class="label">Admission No.</span><span class="value">${admNo}</span></div>
            <div class="row"><span class="label">Date of Birth</span><span class="value">${app.dob || '—'}</span></div>
            <div class="row"><span class="label">Parent / Guardian</span><span class="value">${app.parentName || '—'}</span></div>
            <div class="row"><span class="label">Contact</span><span class="value">${app.phone || '—'}</span></div>
          </div>
          ${qr ? `<div class="qr">▦ QR Code: ${admNo}<br/>Scan to verify attendance &amp; identity</div>` : ''}
        </div>
        <div class="footer">If found, please return to the school office.</div>
      </div>
      <script>window.print()</script></body></html>`)
    win.document.close()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Generate printable ID cards for approved or enrolled students. QR-coded cards include a unique code for attendance scanning.</p>
      {enrolled.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No approved or enrolled students yet. Move applications to Approved or Enrolled status first.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enrolled.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div>
                <p className="font-semibold text-slate-900">{app.studentName}</p>
                <p className="text-xs text-slate-500">{app.applyingForClass} · {app.parentName}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => printCard(app, false)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">Print ID Card</button>
                <button type="button" onClick={() => printCard(app, true)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition">Print QR Card</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Parent / KYC Verification ──────────────────────────────────────────────

type KYCStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'

interface KYCRecord {
  id: string
  studentName: string
  parentName: string
  aadhaar: string
  pan: string
  phone: string
  status: KYCStatus
  note: string
}

const KYC_STYLE: Record<KYCStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
}

function KYCPanel({ applications }: { applications: AdmissionApplication[] }) {
  const [records, setRecords] = useState<KYCRecord[]>(
    applications.map((a) => ({ id: a.id, studentName: a.studentName, parentName: a.parentName, aadhaar: '', pan: '', phone: a.phone, status: 'PENDING' as KYCStatus, note: '' }))
  )
  const [editing, setEditing] = useState<string | null>(null)

  const updateField = (id: string, field: keyof KYCRecord, value: string) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const moveKYC = (id: string, status: KYCStatus) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">No applications found. Add applications first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Verify parent/guardian identity and contact details for each applicant.</p>
      {records.map((r) => (
        <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-950">{r.studentName}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${KYC_STYLE[r.status]}`}>{r.status}</span>
              </div>
              <p className="text-xs text-slate-500">Parent: {r.parentName || '—'}</p>
            </div>
            <button type="button" onClick={() => setEditing(editing === r.id ? null : r.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
              {editing === r.id ? 'Close' : 'Edit'}
            </button>
          </div>
          {editing === r.id && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <input type="text" placeholder="Aadhaar number" value={r.aadhaar} onChange={(e) => updateField(r.id, 'aadhaar', e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="text" placeholder="PAN number" value={r.pan} onChange={(e) => updateField(r.id, 'pan', e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="tel" placeholder="Phone" value={r.phone} onChange={(e) => updateField(r.id, 'phone', e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <input type="text" placeholder="Verification note" value={r.note} onChange={(e) => updateField(r.id, 'note', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <div className="flex gap-2">
                {r.status !== 'SUBMITTED' && <button type="button" onClick={() => moveKYC(r.id, 'SUBMITTED')} className="rounded-lg bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-200 transition">Mark Submitted</button>}
                {r.status === 'SUBMITTED' && <button type="button" onClick={() => moveKYC(r.id, 'VERIFIED')} className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200 transition">Verify</button>}
                {r.status === 'SUBMITTED' && <button type="button" onClick={() => moveKYC(r.id, 'REJECTED')} className="rounded-lg bg-rose-100 px-3 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-200 transition">Reject</button>}
                {r.status === 'REJECTED' && <button type="button" onClick={() => moveKYC(r.id, 'PENDING')} className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">Reset</button>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Admission Fee Collection ───────────────────────────────────────────────

interface AdmissionFee {
  id: string
  studentName: string
  applyingForClass: string
  feeAmount: string
  paidOn: string
  mode: 'CASH' | 'ONLINE' | 'CHEQUE'
  receiptNo: string
  paid: boolean
}

function AdmissionFeePanel({ applications }: { applications: AdmissionApplication[] }) {
  const [fees, setFees] = useState<AdmissionFee[]>(
    applications
      .filter((a) => a.status === 'APPROVED' || a.status === 'ENROLLED')
      .map((a) => ({ id: a.id, studentName: a.studentName, applyingForClass: a.applyingForClass, feeAmount: '5000', paidOn: '', mode: 'CASH' as const, receiptNo: `REC-${Math.floor(1000 + Math.random() * 9000)}`, paid: false }))
  )

  const totalCollected = fees.filter((f) => f.paid).reduce((sum, f) => sum + Number(f.feeAmount), 0)
  const totalPending = fees.filter((f) => !f.paid).reduce((sum, f) => sum + Number(f.feeAmount), 0)

  const update = (id: string, field: keyof AdmissionFee, value: string | boolean) => {
    setFees((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const markPaid = (id: string) => {
    setFees((prev) => prev.map((f) => (f.id === id ? { ...f, paid: true, paidOn: new Date().toISOString().slice(0, 10) } : f)))
  }

  const printReceipt = (f: AdmissionFee) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>Fee Receipt</title><style>body{font-family:sans-serif;padding:48px;max-width:580px;margin:auto}h1{font-size:18px;text-align:center}h2{font-size:13px;text-align:center;color:#64748b;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:13px}td{padding:8px 4px;border-bottom:1px solid #f1f5f9}.label{color:#94a3b8}.total{font-weight:700;font-size:16px;text-align:right}</style></head><body>
      <h1>Admission Fee Receipt</h1><h2>CloudCampus School</h2>
      <table>
        <tr><td class="label">Receipt No.</td><td>${f.receiptNo}</td></tr>
        <tr><td class="label">Student Name</td><td>${f.studentName}</td></tr>
        <tr><td class="label">Class</td><td>${f.applyingForClass}</td></tr>
        <tr><td class="label">Payment Mode</td><td>${f.mode}</td></tr>
        <tr><td class="label">Date</td><td>${f.paidOn || new Date().toISOString().slice(0, 10)}</td></tr>
        <tr><td class="label">Amount</td><td class="total">₹${Number(f.feeAmount).toLocaleString('en-IN')}</td></tr>
      </table>
      <p style="margin-top:32px;font-size:11px;color:#94a3b8">This is a computer-generated receipt. No signature required.</p>
      <script>window.print()</script></body></html>`)
    win.document.close()
  }

  if (fees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">No approved or enrolled students. Approve applications first to collect fees.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Collected</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <div className="space-y-3">
        {fees.map((f) => (
          <div key={f.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${f.paid ? 'border-emerald-200' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-950">{f.studentName}</p>
                  <span className="text-xs text-slate-500">{f.applyingForClass}</span>
                  {f.paid && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">PAID</span>}
                </div>
                <p className="text-xs text-slate-400">Receipt: {f.receiptNo}</p>
              </div>
              <p className="font-bold text-slate-900">₹{Number(f.feeAmount).toLocaleString('en-IN')}</p>
            </div>
            {!f.paid && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <input type="number" placeholder="Amount" value={f.feeAmount} onChange={(e) => update(f.id, 'feeAmount', e.target.value)} className="w-28 rounded-xl border border-slate-200 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <select value={f.mode} onChange={(e) => update(f.id, 'mode', e.target.value as AdmissionFee['mode'])} className="rounded-xl border border-slate-200 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
                <button type="button" onClick={() => markPaid(f.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition">Mark Paid</button>
              </div>
            )}
            {f.paid && (
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <p className="text-xs text-slate-500">Paid on {f.paidOn} via {f.mode}</p>
                <button type="button" onClick={() => printReceipt(f)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition">Print Receipt</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
