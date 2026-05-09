import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type LetterType = 'ADMISSION' | 'TC' | 'BONAFIDE' | 'GENERAL' | 'NOTICE' | 'WARNING'

interface LetterTemplate {
  id: string
  name: string
  letterType: LetterType
  subject: string
  body: string
  createdOn: string
}

const TYPE_STYLE: Record<LetterType, string> = {
  ADMISSION: 'bg-emerald-100 text-emerald-700',
  TC: 'bg-amber-100 text-amber-700',
  BONAFIDE: 'bg-sky-100 text-sky-700',
  GENERAL: 'bg-slate-100 text-slate-600',
  NOTICE: 'bg-violet-100 text-violet-700',
  WARNING: 'bg-rose-100 text-rose-700',
}

const PLACEHOLDERS = ['{{student_name}}', '{{class}}', '{{admission_no}}', '{{date}}', '{{school_name}}', '{{principal_name}}']

const today = new Date().toISOString().slice(0, 10)

export function LetterTemplatesPage() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([])
  const [form, setForm] = useState({ name: '', letterType: 'GENERAL' as LetterType, subject: '', body: '' })
  const [preview, setPreview] = useState<LetterTemplate | null>(null)

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return
    setTemplates((prev) => [{ id: crypto.randomUUID(), ...form, createdOn: today }, ...prev])
    setForm((p) => ({ ...p, name: '', subject: '', body: '' }))
  }

  const handlePrint = (template: LetterTemplate) => {
    const sampleValues: Record<string, string> = {
      '{{student_name}}': 'Ravi Kumar',
      '{{class}}': 'Class 10 - A',
      '{{admission_no}}': 'ADM-2024-001',
      '{{date}}': new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      '{{school_name}}': 'Sunrise Public School',
      '{{principal_name}}': 'Dr. A. Sharma',
    }
    const filled = PLACEHOLDERS.reduce((text, ph) => text.replaceAll(ph, sampleValues[ph] ?? ph), template.body)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>${template.name}</title><style>body{font-family:Georgia,serif;padding:60px;max-width:720px;margin:auto;line-height:1.8}h1{font-size:18px;text-align:center;margin-bottom:4px}h2{font-size:14px;text-align:center;color:#64748b;margin-bottom:32px}p{white-space:pre-wrap}hr{margin:32px 0}.footer{margin-top:64px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}</style></head><body><h1>Sunrise Public School</h1><h2>${template.subject}</h2><hr/><p>${filled}</p><div class="footer">This document was generated from the letter template: <strong>${template.name}</strong> on ${sampleValues['{{date}}']}.</div><script>window.print()</script></body></html>`)
    win.document.close()
  }

  const insertPlaceholder = (ph: string) => {
    setForm((p) => ({ ...p, body: p.body + ph }))
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Letter Templates"
        subtitle="Design reusable school letters with placeholders for student data, dates, and school details."
        badge={{ label: `${templates.length} Template${templates.length !== 1 ? 's' : ''}`, tone: 'green' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Templates</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{templates.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Categories Used</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{new Set(templates.map((t) => t.letterType)).size}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Available Placeholders</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{PLACEHOLDERS.length}</p>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Create Template</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLACEHOLDERS.map((ph) => (
            <button key={ph} type="button" onClick={() => insertPlaceholder(ph)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono text-slate-600 hover:bg-slate-100 transition">
              {ph}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-400">Click a placeholder to insert it into the letter body.</p>

        <form className="mt-4 space-y-3" onSubmit={handleSave}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Template name (e.g. TC Handoff Letter)" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <select value={form.letterType} onChange={(e) => setForm((p) => ({ ...p, letterType: e.target.value as LetterType }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="GENERAL">General</option>
              <option value="ADMISSION">Admission</option>
              <option value="TC">Transfer Certificate</option>
              <option value="BONAFIDE">Bonafide</option>
              <option value="NOTICE">Notice</option>
              <option value="WARNING">Warning Letter</option>
            </select>
          </div>
          <input type="text" placeholder="Letter subject line" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <textarea
            placeholder="Letter body — use the placeholders above for dynamic values e.g. Dear {{student_name}}, ..."
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            required
            rows={8}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-y"
          />
          <Button type="submit">Save Template</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No templates yet. Create the first letter template above.</p>
          </div>
        ) : (
          templates.map((tmpl) => (
            <div key={tmpl.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${preview?.id === tmpl.id ? 'border-slate-400' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{tmpl.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_STYLE[tmpl.letterType]}`}>{tmpl.letterType}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{tmpl.subject}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Created {tmpl.createdOn}</p>
                  {preview?.id === tmpl.id && (
                    <pre className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 whitespace-pre-wrap font-mono">{tmpl.body}</pre>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => setPreview((p) => p?.id === tmpl.id ? null : tmpl)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                    {preview?.id === tmpl.id ? 'Hide' : 'Preview'}
                  </button>
                  <button type="button" onClick={() => handlePrint(tmpl)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition">Print</button>
                  <button type="button" onClick={() => setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id))} className="text-xs text-slate-400 hover:text-rose-500 transition text-center">Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AutoFillFormsPanel />
    </section>
  )
}

// ── Auto-Filled Student Forms ──────────────────────────────────────────────

interface StudentProfile {
  name: string
  admissionNo: string
  className: string
  dob: string
  parentName: string
  address: string
}

function AutoFillFormsPanel() {
  const [profile, setProfile] = useState<StudentProfile>({ name: '', admissionNo: '', className: '', dob: '', parentName: '', address: '' })
  const [selectedForm, setSelectedForm] = useState('leave_application')

  const FORM_TEMPLATES: Record<string, { label: string; generate: (p: StudentProfile) => string }> = {
    leave_application: {
      label: 'Leave Application',
      generate: (p) => `To,\nThe Class Teacher,\n\nSubject: Leave Application for ${p.name}\n\nRespected Sir/Madam,\n\nI, ${p.parentName || '[Parent Name]'}, parent/guardian of ${p.name || '[Student Name]'} (Admission No: ${p.admissionNo || '[Adm. No]'}), studying in ${p.className || '[Class]'}, request you to kindly grant leave for my ward from ________ to ________ due to ________.\n\nThank you.\n\nYours faithfully,\n${p.parentName || '[Parent Name]'}\nDate: ${new Date().toISOString().slice(0, 10)}`,
    },
    fee_waiver: {
      label: 'Fee Waiver Request',
      generate: (p) => `To,\nThe Principal,\n\nSubject: Fee Waiver / Concession Request\n\nRespected Sir/Madam,\n\nI humbly request a fee waiver for my ward ${p.name || '[Student Name]'} (Adm. No: ${p.admissionNo || '[Adm. No]'}), Class ${p.className || '[Class]'}. Due to financial hardship, I am unable to pay the full fees at this time. Kindly consider this request.\n\nAddress: ${p.address || '[Address]'}\n\nYours sincerely,\n${p.parentName || '[Parent Name]'}`,
    },
    tc_request: {
      label: 'Transfer Certificate Request',
      generate: (p) => `To,\nThe Principal,\n\nSubject: Request for Transfer Certificate\n\nRespected Sir/Madam,\n\nI request the issuance of a Transfer Certificate for ${p.name || '[Student Name]'} (DOB: ${p.dob || '[DOB]'}), Admission No: ${p.admissionNo || '[Adm. No]'}, currently studying in ${p.className || '[Class]'}. The student will be relocating to another city.\n\nKindly process the TC at the earliest.\n\nYours faithfully,\n${p.parentName || '[Parent Name]'}`,
    },
    character_certificate: {
      label: 'Character Certificate',
      generate: (p) => `CHARACTER CERTIFICATE\n\nThis is to certify that ${p.name || '[Student Name]'} (DOB: ${p.dob || '[DOB]'}), son/daughter of ${p.parentName || '[Parent Name]'}, bearing Admission No. ${p.admissionNo || '[Adm. No]'}, has been a student of this institution in ${p.className || '[Class]'}.\n\nTo the best of our knowledge, the student is of good character and conduct. We wish them success in future endeavors.\n\nDate: ${new Date().toISOString().slice(0, 10)}\nPrincipal's Signature: ___________`,
    },
  }

  const printForm = () => {
    const tmpl = FORM_TEMPLATES[selectedForm]
    if (!tmpl) return
    const content = tmpl.generate(profile)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>${tmpl.label}</title><style>body{font-family:sans-serif;padding:48px;max-width:640px;margin:auto;white-space:pre-wrap;font-size:13px;line-height:1.8}</style></head><body>${content.replace(/\n/g, '<br/>')}<script>window.print()</script></body></html>`)
    win.document.close()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Auto-Filled Student Forms</h2>
        <p className="text-sm text-slate-500">Fill in student details once — generate pre-filled standard forms instantly.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-slate-700">Student Profile</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {([['name', 'Student name'], ['admissionNo', 'Admission no.'], ['className', 'Class / Section'], ['dob', 'Date of birth'], ['parentName', 'Parent / Guardian name'], ['address', 'Address']] as const).map(([field, label]) => (
              <input key={field} type={field === 'dob' ? 'date' : 'text'} placeholder={label} value={profile[field]} onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-slate-700">Select Form Type</p>
          <div className="space-y-2">
            {Object.entries(FORM_TEMPLATES).map(([key, tmpl]) => (
              <button key={key} type="button" onClick={() => setSelectedForm(key)} className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${selectedForm === key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {tmpl.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={printForm} className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
            Generate & Print
          </button>
        </div>
      </div>
    </div>
  )
}
