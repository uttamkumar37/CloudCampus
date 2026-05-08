import { useState } from 'react'

interface AlumniProfile {
  id: string
  name: string
  batchYear: string
  currentRole: string
  company: string
  photoUrl: string
  quote: string
  linkedinUrl: string
  achievement: string
  visible: boolean
  featured: boolean
}

interface StudentPortfolioItem {
  id: string
  studentName: string
  className: string
  title: string
  description: string
  imageUrl: string
  category: 'Art' | 'Science' | 'Literature' | 'Sports' | 'Technology' | 'Other'
  award: string
  year: string
  visible: boolean
}

interface BoardTopper {
  id: string
  name: string
  className: string
  board: string
  percentage: number
  subject: string
  photoUrl: string
  year: string
  rank: string
  visible: boolean
}

interface PressItem {
  id: string
  headline: string
  publication: string
  date: string
  url: string
  logoUrl: string
  excerpt: string
  visible: boolean
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function load<T>(k: string): T[] { try { return JSON.parse(localStorage.getItem(k) ?? '[]') } catch { return [] } }
function save<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)) }

type Tab = 'alumni' | 'portfolio' | 'results' | 'press'

const PORT_CATS = ['Art', 'Science', 'Literature', 'Sports', 'Technology', 'Other'] as const

export function AlumniPortfolioEditor() {
  const [tab, setTab] = useState<Tab>('alumni')
  const [alumni, setAlumni] = useState<AlumniProfile[]>(() => load('wb_alumni'))
  const [portfolio, setPortfolio] = useState<StudentPortfolioItem[]>(() => load('wb_portfolio'))
  const [toppers, setToppers] = useState<BoardTopper[]>(() => load('wb_toppers'))
  const [press, setPress] = useState<PressItem[]>(() => load('wb_press'))
  const [saved, setSaved] = useState(false)
  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const TABS = [
    { key: 'alumni' as Tab, icon: '🎓', label: 'Alumni Network', count: alumni.length },
    { key: 'portfolio' as Tab, icon: '🎨', label: 'Student Portfolio', count: portfolio.length },
    { key: 'results' as Tab, icon: '🏆', label: 'Board Toppers', count: toppers.length },
    { key: 'press' as Tab, icon: '📰', label: 'Press & Media', count: press.length },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Alumni, Portfolio & Press
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Showcase your school's success stories to attract more admissions.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {t.icon} {t.label}
            {t.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-amber-100' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'alumni' && <AlumniPanel items={alumni} onUpdate={(v) => { setAlumni(v); save('wb_alumni', v); flash() }} />}
      {tab === 'portfolio' && <PortfolioPanel items={portfolio} onUpdate={(v) => { setPortfolio(v); save('wb_portfolio', v); flash() }} />}
      {tab === 'results' && <ToppersPanel items={toppers} onUpdate={(v) => { setToppers(v); save('wb_toppers', v); flash() }} />}
      {tab === 'press' && <PressPanel items={press} onUpdate={(v) => { setPress(v); save('wb_press', v); flash() }} />}

      {saved && <Toast />}
    </div>
  )
}

// ── Alumni Panel ───────────────────────────────────────────────────────────────
function AlumniPanel({ items, onUpdate }: { items: AlumniProfile[]; onUpdate: (v: AlumniProfile[]) => void }) {
  const EMPTY: Omit<AlumniProfile, 'id'> = { name: '', batchYear: '', currentRole: '', company: '', photoUrl: '', quote: '', linkedinUrl: '', achievement: '', visible: true, featured: false }
  const [editing, setEditing] = useState<AlumniProfile | null>(null)
  const [form, setForm] = useState<Omit<AlumniProfile, 'id'>>(EMPTY)

  function openNew() { setForm(EMPTY); setEditing({ id: '', ...EMPTY }) }
  function openEdit(a: AlumniProfile) { setForm({ name: a.name, batchYear: a.batchYear, currentRole: a.currentRole, company: a.company, photoUrl: a.photoUrl, quote: a.quote, linkedinUrl: a.linkedinUrl, achievement: a.achievement, visible: a.visible, featured: a.featured }); setEditing(a) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [...items, { id: uid(), ...form }]
    onUpdate(updated); setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} alumni profiles</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Alumni
        </button>
      </div>
      {items.length === 0 ? <Empty icon="🎓" title="No alumni added" desc="Add successful alumni to inspire prospective students and parents" /> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-2">
              <div className="flex items-center gap-3">
                {a.photoUrl ? <img src={a.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=f59e0b&color=fff` }} /> : <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700 text-lg">{a.name.charAt(0) || '?'}</div>}
                <div>
                  <p className="font-semibold text-slate-800">{a.name}</p>
                  <p className="text-xs text-amber-700">{a.currentRole}{a.company ? ` @ ${a.company}` : ''}</p>
                  <p className="text-[10px] text-slate-400">Batch {a.batchYear}</p>
                </div>
                {a.featured && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold">Featured</span>}
              </div>
              {a.achievement && <p className="text-xs text-slate-500 italic">"{a.achievement}"</p>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-white">Edit</button>
                <button onClick={() => onUpdate(items.filter((i) => i.id !== a.id))} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-white">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Alumni' : 'Add Alumni'} onClose={() => setEditing(null)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Full Name" className="sm:col-span-2"><input className="cc-input" placeholder="Rahul Sharma" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></F>
            <F label="Batch Year"><input className="cc-input" placeholder="2015" value={form.batchYear} onChange={(e) => setForm((p) => ({ ...p, batchYear: e.target.value }))} /></F>
            <F label="Current Role"><input className="cc-input" placeholder="Software Engineer" value={form.currentRole} onChange={(e) => setForm((p) => ({ ...p, currentRole: e.target.value }))} /></F>
            <F label="Company/Institution"><input className="cc-input" placeholder="Google" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} /></F>
            <F label="Photo URL"><input className="cc-input" placeholder="https://…" value={form.photoUrl} onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))} /></F>
            <F label="Achievement / Quote" className="sm:col-span-2"><textarea className="cc-input resize-y" rows={2} placeholder="IIT rank 42, now at Google…" value={form.achievement} onChange={(e) => setForm((p) => ({ ...p, achievement: e.target.value }))} /></F>
            <F label="LinkedIn URL" className="sm:col-span-2"><input className="cc-input" placeholder="https://linkedin.com/in/…" value={form.linkedinUrl} onChange={(e) => setForm((p) => ({ ...p, linkedinUrl: e.target.value }))} /></F>
          </div>
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} /> Featured</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded" checked={form.visible} onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} /> Visible</label>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save Alumni" color="amber" />
        </Modal>
      )}
    </div>
  )
}

// ── Portfolio Panel ────────────────────────────────────────────────────────────
function PortfolioPanel({ items, onUpdate }: { items: StudentPortfolioItem[]; onUpdate: (v: StudentPortfolioItem[]) => void }) {
  const EMPTY: Omit<StudentPortfolioItem, 'id'> = { studentName: '', className: '', title: '', description: '', imageUrl: '', category: 'Art', award: '', year: new Date().getFullYear().toString(), visible: true }
  const [editing, setEditing] = useState<StudentPortfolioItem | null>(null)
  const [form, setForm] = useState<Omit<StudentPortfolioItem, 'id'>>(EMPTY)

  function openNew() { setForm(EMPTY); setEditing({ id: '', ...EMPTY }) }
  function openEdit(p: StudentPortfolioItem) { setForm({ studentName: p.studentName, className: p.className, title: p.title, description: p.description, imageUrl: p.imageUrl, category: p.category, award: p.award, year: p.year, visible: p.visible }); setEditing(p) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [...items, { id: uid(), ...form }]
    onUpdate(updated); setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} portfolio items</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Work
        </button>
      </div>
      {items.length === 0 ? <Empty icon="🎨" title="No portfolio items" desc="Showcase student artwork, projects, and achievements" /> : (
        <div className="grid sm:grid-cols-3 gap-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-28 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="w-full h-28 bg-slate-100 flex items-center justify-center text-3xl">{p.category === 'Art' ? '🎨' : p.category === 'Science' ? '🔬' : p.category === 'Sports' ? '⚽' : '📂'}</div>}
              <div className="p-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{p.category}</span>
                <p className="font-semibold text-slate-800 text-sm mt-1 truncate">{p.title}</p>
                <p className="text-xs text-slate-400">{p.studentName} · {p.className}</p>
                {p.award && <p className="text-xs text-amber-600 font-medium mt-1">🏆 {p.award}</p>}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => onUpdate(items.filter((i) => i.id !== p.id))} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Portfolio Item' : 'Add Portfolio Item'} onClose={() => setEditing(null)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Title" className="sm:col-span-2"><input className="cc-input" placeholder="Science Fair Project: Solar Purifier" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></F>
            <F label="Student Name"><input className="cc-input" placeholder="Aanya Patel" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} /></F>
            <F label="Class"><input className="cc-input" placeholder="Class 9" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} /></F>
            <F label="Category"><select className="cc-input appearance-none" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as StudentPortfolioItem['category'] }))}>{PORT_CATS.map((c) => <option key={c}>{c}</option>)}</select></F>
            <F label="Year"><input className="cc-input" placeholder="2025" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} /></F>
            <F label="Image URL" className="sm:col-span-2"><input className="cc-input" placeholder="https://…" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} /></F>
            <F label="Award / Recognition" className="sm:col-span-2"><input className="cc-input" placeholder="1st Place District Science Fair" value={form.award} onChange={(e) => setForm((p) => ({ ...p, award: e.target.value }))} /></F>
            <F label="Description" className="sm:col-span-2"><textarea className="cc-input resize-y" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></F>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save Item" color="amber" />
        </Modal>
      )}
    </div>
  )
}

// ── Toppers Panel ──────────────────────────────────────────────────────────────
function ToppersPanel({ items, onUpdate }: { items: BoardTopper[]; onUpdate: (v: BoardTopper[]) => void }) {
  const EMPTY: Omit<BoardTopper, 'id'> = { name: '', className: 'Class 10', board: 'CBSE', percentage: 95, subject: '', photoUrl: '', year: new Date().getFullYear().toString(), rank: '', visible: true }
  const [editing, setEditing] = useState<BoardTopper | null>(null)
  const [form, setForm] = useState<Omit<BoardTopper, 'id'>>(EMPTY)
  const [filterYear, setFilterYear] = useState('')

  function openNew() { setForm(EMPTY); setEditing({ id: '', ...EMPTY }) }
  function openEdit(t: BoardTopper) { setForm({ name: t.name, className: t.className, board: t.board, percentage: t.percentage, subject: t.subject, photoUrl: t.photoUrl, year: t.year, rank: t.rank, visible: t.visible }); setEditing(t) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [...items, { id: uid(), ...form }]
    onUpdate(updated); setEditing(null)
  }

  const years = [...new Set(items.map((t) => t.year))].sort().reverse()
  const filtered = items.filter((t) => !filterYear || t.year === filterYear).sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select className="cc-input text-sm w-32 appearance-none" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All years</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <span className="text-sm text-slate-400">{filtered.length} toppers</span>
        <button onClick={openNew} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Topper
        </button>
      </div>
      {filtered.length === 0 ? <Empty icon="🏆" title="No toppers added" desc="Showcase board exam results to attract parents" /> : (
        <div className="grid sm:grid-cols-3 gap-3">
          {filtered.map((t, i) => (
            <div key={t.id} className={`p-4 rounded-xl border text-center ${i === 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
              {t.photoUrl ? <img src={t.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white shadow" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=f59e0b&color=fff` }} /> : <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl mx-auto mb-2">{t.name.charAt(0)}</div>}
              <p className="font-bold text-slate-800">{t.name}</p>
              <p className="text-3xl font-black text-amber-600 my-1">{t.percentage}%</p>
              <p className="text-xs text-slate-500">{t.className} · {t.board} · {t.year}</p>
              {t.rank && <p className="text-xs text-amber-700 font-semibold mt-1">🥇 {t.rank}</p>}
              <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => openEdit(t)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                <button onClick={() => onUpdate(items.filter((i) => i.id !== t.id))} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Topper' : 'Add Topper'} onClose={() => setEditing(null)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Student Name" className="sm:col-span-2"><input className="cc-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></F>
            <F label="Class"><select className="cc-input appearance-none" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}><option>Class 10</option><option>Class 12</option></select></F>
            <F label="Board"><select className="cc-input appearance-none" value={form.board} onChange={(e) => setForm((p) => ({ ...p, board: e.target.value }))}><option>CBSE</option><option>ICSE</option><option>State Board</option><option>IB</option></select></F>
            <F label="Percentage / Score"><input className="cc-input" type="number" min={0} max={100} step={0.1} value={form.percentage} onChange={(e) => setForm((p) => ({ ...p, percentage: Number(e.target.value) }))} /></F>
            <F label="Year"><input className="cc-input" placeholder="2025" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} /></F>
            <F label="Rank / Distinction" className="sm:col-span-2"><input className="cc-input" placeholder="School Topper, District Rank 3…" value={form.rank} onChange={(e) => setForm((p) => ({ ...p, rank: e.target.value }))} /></F>
            <F label="Photo URL" className="sm:col-span-2"><input className="cc-input" placeholder="https://…" value={form.photoUrl} onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))} /></F>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save Topper" color="amber" />
        </Modal>
      )}
    </div>
  )
}

// ── Press Panel ────────────────────────────────────────────────────────────────
function PressPanel({ items, onUpdate }: { items: PressItem[]; onUpdate: (v: PressItem[]) => void }) {
  const EMPTY: Omit<PressItem, 'id'> = { headline: '', publication: '', date: '', url: '', logoUrl: '', excerpt: '', visible: true }
  const [editing, setEditing] = useState<PressItem | null>(null)
  const [form, setForm] = useState<Omit<PressItem, 'id'>>(EMPTY)

  function openNew() { setForm(EMPTY); setEditing({ id: '', ...EMPTY }) }
  function openEdit(p: PressItem) { setForm({ headline: p.headline, publication: p.publication, date: p.date, url: p.url, logoUrl: p.logoUrl, excerpt: p.excerpt, visible: p.visible }); setEditing(p) }
  function handleSave() {
    if (!editing) return
    const updated = editing.id ? items.map((i) => i.id === editing.id ? { ...i, ...form } : i) : [...items, { id: uid(), ...form }]
    onUpdate(updated); setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} press mentions</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Mention
        </button>
      </div>
      {items.length === 0 ? <Empty icon="📰" title="No press mentions" desc="Add newspaper, TV, or digital media coverage of your school" /> : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-200">
              {p.logoUrl ? <img src={p.logoUrl} alt="" className="w-12 h-10 object-contain shrink-0 border border-slate-100 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="w-12 h-10 rounded bg-slate-100 flex items-center justify-center text-xl shrink-0">📰</div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{p.headline}</p>
                <p className="text-xs text-slate-400">{p.publication}{p.date ? ` · ${new Date(p.date).toLocaleDateString('en-IN')}` : ''}</p>
                {p.excerpt && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.excerpt}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                <button onClick={() => onUpdate(items.filter((i) => i.id !== p.id))} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Press Mention' : 'Add Press Mention'} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <F label="Headline"><input className="cc-input" placeholder="Springfield Academy wins National Science Award" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} /></F>
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Publication"><input className="cc-input" placeholder="Times of India" value={form.publication} onChange={(e) => setForm((p) => ({ ...p, publication: e.target.value }))} /></F>
              <F label="Date"><input className="cc-input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></F>
              <F label="Article URL"><input className="cc-input" placeholder="https://…" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} /></F>
              <F label="Publication Logo URL"><input className="cc-input" placeholder="https://…" value={form.logoUrl} onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))} /></F>
            </div>
            <F label="Excerpt"><textarea className="cc-input resize-y" rows={2} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} /></F>
          </div>
          <ModalFooter onSave={handleSave} onCancel={() => setEditing(null)} label="Save Mention" color="amber" />
        </Modal>
      )}
    </div>
  )
}

// ── Shared ─────────────────────────────────────────────────────────────────────
function Empty({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><span className="text-4xl block mb-2">{icon}</span><p className="font-semibold text-slate-600">{title}</p><p className="text-sm text-slate-400 mt-1">{desc}</p></div>
}
function Toast() {
  return <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm font-medium"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved!</div>
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4"><div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-slate-800">{title}</h3><button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{children}</div></div></div>
}
function ModalFooter({ onSave, onCancel, label, color = 'emerald' }: { onSave: () => void; onCancel: () => void; label: string; color?: string }) {
  const cls: Record<string, string> = { sky: 'bg-sky-600 hover:bg-sky-700', emerald: 'bg-emerald-600 hover:bg-emerald-700', violet: 'bg-violet-600 hover:bg-violet-700', amber: 'bg-amber-600 hover:bg-amber-700' }
  return <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100"><button onClick={onSave} className={`flex-1 py-2.5 rounded-xl ${cls[color] ?? cls.emerald} text-white text-sm font-semibold`}>{label}</button><button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button></div>
}
function F({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1 ${className}`}><label className="field-label">{label}</label>{children}</div>
}
