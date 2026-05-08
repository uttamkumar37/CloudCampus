import { useState } from 'react'
import type { Testimonial, AwardBadge, FaqItem } from '../types'

const T_KEY = 'wb_testimonials'
const A_KEY = 'wb_awards'
const F_KEY = 'wb_faqs'

function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}
function saveArr<T>(key: string, val: T[]) { localStorage.setItem(key, JSON.stringify(val)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

type Tab = 'testimonials' | 'awards' | 'faq'

const ROLES = ['Parent', 'Alumni', 'Student', 'Staff'] as const

export function SocialProofEditor() {
  const [tab, setTab] = useState<Tab>('testimonials')
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => loadArr(T_KEY))
  const [awards, setAwards] = useState<AwardBadge[]>(() => loadArr(A_KEY))
  const [faqs, setFaqs] = useState<FaqItem[]>(() => loadArr(F_KEY))
  const [saved, setSaved] = useState(false)

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const TABS = [
    { key: 'testimonials' as Tab, label: 'Testimonials', icon: '💬', count: testimonials.length },
    { key: 'awards' as Tab, label: 'Awards & Badges', icon: '🏆', count: awards.length },
    { key: 'faq' as Tab, label: 'FAQ', icon: '❓', count: faqs.length },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Social Proof
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Build trust with parent testimonials, awards, and an FAQ section.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tab === t.key ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            <span>{t.icon}</span> {t.label}
            {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === t.key ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'testimonials' && (
        <TestimonialsPanel items={testimonials} onUpdate={(v) => { setTestimonials(v); saveArr(T_KEY, v); flash() }} />
      )}
      {tab === 'awards' && (
        <AwardsPanel items={awards} onUpdate={(v) => { setAwards(v); saveArr(A_KEY, v); flash() }} />
      )}
      {tab === 'faq' && (
        <FaqPanel items={faqs} onUpdate={(v) => { setFaqs(v); saveArr(F_KEY, v); flash() }} />
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm font-medium">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Saved!
        </div>
      )}
    </div>
  )
}

// ── Testimonials ──
function TestimonialsPanel({ items, onUpdate }: { items: Testimonial[]; onUpdate: (v: Testimonial[]) => void }) {
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const EMPTY: Omit<Testimonial, 'id'> = { authorName: '', authorRole: 'Parent', photoUrl: '', quote: '', rating: 5, visible: true, featured: false, displayOrder: items.length + 1, yearOfAssociation: '' }
  const [form, setForm] = useState<Omit<Testimonial, 'id'>>(EMPTY)

  function openNew() { setForm({ ...EMPTY, displayOrder: items.length + 1 }); setEditing({ id: '', ...EMPTY }) }
  function openEdit(t: Testimonial) { setForm({ authorName: t.authorName, authorRole: t.authorRole, photoUrl: t.photoUrl, quote: t.quote, rating: t.rating, visible: t.visible, featured: t.featured, displayOrder: t.displayOrder, yearOfAssociation: t.yearOfAssociation }); setEditing(t) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [{ id: uid(), ...form }, ...items]
    onUpdate(updated); setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} testimonials</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="💬" title="No testimonials yet" desc="Add parent and alumni reviews to build trust with prospective parents" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((t) => (
            <div key={t.id} className={`p-4 rounded-xl border space-y-3 ${t.visible ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex items-start gap-3">
                {t.photoUrl ? (
                  <img src={t.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.authorName)}&background=f59e0b&color=fff` }} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 font-bold">{t.authorName.charAt(0) || '?'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{t.authorName}</p>
                  <p className="text-xs text-slate-400">{t.authorRole}{t.yearOfAssociation ? ` · ${t.yearOfAssociation}` : ''}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-3 h-3 ${i < t.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ))}
                  </div>
                </div>
                {t.featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Featured</span>}
              </div>
              <p className="text-xs text-slate-500 italic line-clamp-3">"{t.quote}"</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Edit</button>
                <button onClick={() => onUpdate(items.filter((i) => i.id !== t.id))} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <Modal title={editing.id ? 'Edit Testimonial' : 'Add Testimonial'} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Name"><input className="cc-input" placeholder="Mrs. Anjali Kapoor" value={form.authorName} onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))} /></F>
              <F label="Role"><select className="cc-input appearance-none" value={form.authorRole} onChange={(e) => setForm((p) => ({ ...p, authorRole: e.target.value as Testimonial['authorRole'] }))}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></F>
              <F label="Photo URL"><input className="cc-input" placeholder="https://…" value={form.photoUrl} onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))} /></F>
              <F label="Year"><input className="cc-input" placeholder="e.g. 2024" value={form.yearOfAssociation} onChange={(e) => setForm((p) => ({ ...p, yearOfAssociation: e.target.value }))} /></F>
            </div>
            <F label="Quote / Review">
              <textarea className="cc-input resize-y" rows={3} placeholder="What parents say about your school…" value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))} />
            </F>
            <F label="Rating">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setForm((p) => ({ ...p, rating: n }))}
                    className={`w-8 h-8 rounded-full text-lg ${form.rating >= n ? 'text-amber-400' : 'text-slate-200'} hover:text-amber-400 transition-colors`}>★</button>
                ))}
              </div>
            </F>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"><input type="checkbox" className="w-4 h-4 rounded" checked={form.visible} onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} /> Visible</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"><input type="checkbox" className="w-4 h-4 rounded" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} /> Featured</label>
            </div>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save Testimonial" />
        </Modal>
      )}
    </div>
  )
}

// ── Awards ──
function AwardsPanel({ items, onUpdate }: { items: AwardBadge[]; onUpdate: (v: AwardBadge[]) => void }) {
  const [editing, setEditing] = useState<AwardBadge | null>(null)
  const EMPTY: Omit<AwardBadge, 'id'> = { title: '', issuedBy: '', year: '', logoUrl: '', description: '', displayOrder: items.length + 1, visible: true }
  const [form, setForm] = useState<Omit<AwardBadge, 'id'>>(EMPTY)

  function openNew() { setForm({ ...EMPTY, displayOrder: items.length + 1 }); setEditing({ id: '', ...EMPTY }) }
  function openEdit(a: AwardBadge) { setForm({ title: a.title, issuedBy: a.issuedBy, year: a.year, logoUrl: a.logoUrl, description: a.description, displayOrder: a.displayOrder, visible: a.visible }); setEditing(a) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [{ id: uid(), ...form }, ...items]
    onUpdate(updated); setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} awards & badges</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Award
        </button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon="🏆" title="No awards added" desc="Showcase your school's rankings, certifications, and recognition" />
      ) : (
        <div className="grid sm:grid-cols-3 gap-3">
          {items.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50 space-y-2">
              {a.logoUrl && <img src={a.logoUrl} alt="" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
              <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
              <p className="text-xs text-slate-500">{a.issuedBy}{a.year ? ` · ${a.year}` : ''}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-white font-medium">Edit</button>
                <button onClick={() => onUpdate(items.filter((i) => i.id !== a.id))} className="text-xs px-2 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-white font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Award' : 'Add Award'} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Award Title"><input className="cc-input" placeholder="Best School of the Year" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></F>
              <F label="Issued By"><input className="cc-input" placeholder="Education Excellence Council" value={form.issuedBy} onChange={(e) => setForm((p) => ({ ...p, issuedBy: e.target.value }))} /></F>
              <F label="Year"><input className="cc-input" placeholder="2025" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} /></F>
              <F label="Badge Logo URL"><input className="cc-input" placeholder="https://…" value={form.logoUrl} onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))} /></F>
            </div>
            <F label="Description"><textarea className="cc-input resize-y" rows={2} placeholder="Brief description of this award…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></F>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save Award" />
        </Modal>
      )}
    </div>
  )
}

// ── FAQ ──
function FaqPanel({ items, onUpdate }: { items: FaqItem[]; onUpdate: (v: FaqItem[]) => void }) {
  const [editing, setEditing] = useState<FaqItem | null>(null)
  const EMPTY: Omit<FaqItem, 'id'> = { question: '', answer: '', category: 'General', displayOrder: items.length + 1, visible: true }
  const [form, setForm] = useState<Omit<FaqItem, 'id'>>(EMPTY)
  const CATS = ['General', 'Admissions', 'Fees', 'Academics', 'Infrastructure', 'Transport', 'Other']

  function openNew() { setForm({ ...EMPTY }); setEditing({ id: '', ...EMPTY }) }
  function openEdit(f: FaqItem) { setForm({ question: f.question, answer: f.answer, category: f.category, displayOrder: f.displayOrder, visible: f.visible }); setEditing(f) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [{ id: uid(), ...form }, ...items]
    onUpdate(updated); setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} FAQ items</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add FAQ
        </button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon="❓" title="No FAQs yet" desc="Add common questions parents ask to reduce repetitive enquiries" />
      ) : (
        <div className="space-y-2">
          {items.map((faq, idx) => (
            <div key={faq.id} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{faq.category}</span>
                    <span className="text-xs text-slate-300">#{idx + 1}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{faq.question}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(faq)} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Edit</button>
                  <button onClick={() => onUpdate(items.filter((i) => i.id !== faq.id))} className="text-xs px-2 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit FAQ' : 'Add FAQ'} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <F label="Category">
              <select className="cc-input appearance-none" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </F>
            <F label="Question"><input className="cc-input" placeholder="What is the admission process?" value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} /></F>
            <F label="Answer"><textarea className="cc-input resize-y" rows={4} placeholder="Detailed answer to the question…" value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} /></F>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save FAQ" />
        </Modal>
      )}
    </div>
  )
}

// ── Shared helpers ──
function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <span className="text-4xl block mb-2">{icon}</span>
      <p className="font-semibold text-slate-600">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function ModalFooter({ onSave, onCancel, label }: { onSave: () => void; onCancel: () => void; label: string }) {
  return (
    <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
      <button onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">{label}</button>
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="field-label">{label}</label>{children}</div>
}
