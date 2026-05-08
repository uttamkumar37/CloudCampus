import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseItem {
  id: string
  className: string
  subject: string
  description: string
  textbooks: string
  periodsPerWeek: number
  teacher: string
  visible: boolean
  displayOrder: number
}

interface TimetableSlot {
  id: string
  className: string
  day: string
  period: number
  subject: string
  teacher: string
  startTime: string
  endTime: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]
const CLASSES = ['Pre-KG', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11 (Sci)', 'Class 11 (Com)', 'Class 12 (Sci)', 'Class 12 (Com)']
const SUBJECTS = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'History', 'Geography', 'Computer Science', 'Physical Education', 'Art & Craft', 'Music', 'EVS', 'Commerce', 'Economics', 'Accountancy', 'Business Studies', 'French', 'Sanskrit', 'Other']

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function load<T>(key: string): T[] { try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] } }
function save<T>(key: string, v: T[]) { localStorage.setItem(key, JSON.stringify(v)) }

type Tab = 'catalog' | 'timetable'

export function CourseCatalogEditor() {
  const [tab, setTab] = useState<Tab>('catalog')
  const [courses, setCourses] = useState<CourseItem[]>(() => load('wb_courses'))
  const [slots, setSlots] = useState<TimetableSlot[]>(() => load('wb_timetable'))
  const [editing, setEditing] = useState<CourseItem | null>(null)
  const [form, setForm] = useState<Omit<CourseItem, 'id'>>({ className: '', subject: '', description: '', textbooks: '', periodsPerWeek: 5, teacher: '', visible: true, displayOrder: 1 })
  const [filterClass, setFilterClass] = useState('')
  const [ttClass, setTtClass] = useState(CLASSES[5])
  const [editSlot, setEditSlot] = useState<TimetableSlot | null>(null)
  const [slotForm, setSlotForm] = useState<Omit<TimetableSlot, 'id'>>({ className: ttClass, day: 'Monday', period: 1, subject: '', teacher: '', startTime: '08:00', endTime: '08:45' })
  const [saved, setSaved] = useState(false)

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  // Course CRUD
  function openNew() { setForm({ className: '', subject: '', description: '', textbooks: '', periodsPerWeek: 5, teacher: '', visible: true, displayOrder: courses.length + 1 }); setEditing({ id: '', className: '', subject: '', description: '', textbooks: '', periodsPerWeek: 5, teacher: '', visible: true, displayOrder: courses.length + 1 }) }
  function openEdit(c: CourseItem) { setForm({ className: c.className, subject: c.subject, description: c.description, textbooks: c.textbooks, periodsPerWeek: c.periodsPerWeek, teacher: c.teacher, visible: c.visible, displayOrder: c.displayOrder }); setEditing(c) }
  function saveCourse() {
    if (!editing) return
    const updated = editing.id ? courses.map((c) => c.id === editing.id ? { ...c, ...form } : c) : [...courses, { id: uid(), ...form }]
    save('wb_courses', updated); setCourses(updated); setEditing(null); flash()
  }

  // Timetable CRUD
  function openNewSlot(day: string, period: number) {
    const sf = { className: ttClass, day, period, subject: '', teacher: '', startTime: `0${7 + period}:00`.slice(-5), endTime: `0${7 + period}:45`.slice(-5) }
    setSlotForm(sf); setEditSlot({ id: '', ...sf })
  }
  function saveSlot() {
    if (!editSlot) return
    const updated = editSlot.id ? slots.map((s) => s.id === editSlot.id ? { ...s, ...slotForm } : s) : [...slots, { id: uid(), ...slotForm }]
    save('wb_timetable', updated); setSlots(updated); setEditSlot(null); flash()
  }
  function deleteSlot(id: string) {
    const updated = slots.filter((s) => s.id !== id)
    save('wb_timetable', updated); setSlots(updated)
  }

  const filtered = courses.filter((c) => !filterClass || c.className === filterClass)
  const ttSlots = slots.filter((s) => s.className === ttClass)
  const slotAt = (day: string, period: number) => ttSlots.find((s) => s.day === day && s.period === period)

  const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: 'bg-blue-100 text-blue-700', Science: 'bg-green-100 text-green-700',
    Physics: 'bg-cyan-100 text-cyan-700', Chemistry: 'bg-orange-100 text-orange-700',
    Biology: 'bg-emerald-100 text-emerald-700', English: 'bg-violet-100 text-violet-700',
    Hindi: 'bg-amber-100 text-amber-700', 'Computer Science': 'bg-slate-100 text-slate-700',
    'Physical Education': 'bg-rose-100 text-rose-700',
  }
  function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? 'bg-slate-100 text-slate-600' }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Course Catalog & Timetable
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Publish your curriculum and class timetables on the school website.</p>
      </div>

      <div className="flex gap-2">
        {[{ key: 'catalog' as Tab, label: 'Course Catalog', icon: '📚' }, { key: 'timetable' as Tab, label: 'Timetable', icon: '🗓️' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-100'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Course Catalog */}
      {tab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select className="cc-input text-sm w-44 appearance-none" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All classes</option>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <span className="text-sm text-slate-400">{filtered.length} subjects</span>
            <button onClick={openNew} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Subject
            </button>
          </div>

          {filtered.length === 0 ? (
            <Empty icon="📚" title="No courses added" desc="Add subjects per class to publish your curriculum on the website" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Class', 'Subject', 'Teacher', 'Periods/Week', 'Textbooks', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{c.className}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${subjectColor(c.subject)}`}>{c.subject}</span></td>
                      <td className="px-4 py-3 text-slate-500">{c.teacher || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-center">{c.periodsPerWeek}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate">{c.textbooks || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                          <button onClick={() => { const u = courses.filter((x) => x.id !== c.id); save('wb_courses', u); setCourses(u) }} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Timetable */}
      {tab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <select className="cc-input text-sm w-44 appearance-none" value={ttClass} onChange={(e) => setTtClass(e.target.value)}>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <span className="text-sm text-slate-400">{ttSlots.length} slots filled</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries({ 'Maths': 'bg-blue-100', 'Science': 'bg-green-100', 'English': 'bg-violet-100', 'PE': 'bg-rose-100' }).map(([s, c]) => (
                  <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full ${c}`}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left text-slate-500 font-semibold w-24">Period</th>
                  {DAYS.map((d) => <th key={d} className="border border-slate-200 px-3 py-2 text-center text-slate-600 font-semibold">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p) => (
                  <tr key={p}>
                    <td className="border border-slate-200 px-3 py-2 bg-slate-50 text-center font-semibold text-slate-500">P{p}</td>
                    {DAYS.map((d) => {
                      const slot = slotAt(d, p)
                      return (
                        <td key={d} className="border border-slate-200 p-0 min-w-[100px]">
                          {slot ? (
                            <div className={`p-2 h-full cursor-pointer group relative ${subjectColor(slot.subject)}`}
                              onClick={() => { setSlotForm({ className: slot.className, day: slot.day, period: slot.period, subject: slot.subject, teacher: slot.teacher, startTime: slot.startTime, endTime: slot.endTime }); setEditSlot(slot) }}>
                              <p className="font-semibold leading-tight">{slot.subject}</p>
                              {slot.teacher && <p className="opacity-70 text-[10px]">{slot.teacher}</p>}
                              <button onClick={(e) => { e.stopPropagation(); deleteSlot(slot.id) }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => openNewSlot(d, p)} className="w-full h-full p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-400 transition-colors text-lg">+</button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">Click any cell to add a subject. Click an existing slot to edit. Hover and click ✕ to delete.</p>
        </div>
      )}

      {/* Course modal */}
      {editing !== null && (
        <Modal title={editing.id ? 'Edit Subject' : 'Add Subject'} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Class"><select className="cc-input appearance-none" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}><option value="">— Select —</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select></F>
              <F label="Subject"><select className="cc-input appearance-none" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}><option value="">— Select —</option>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></F>
              <F label="Teacher Name"><input className="cc-input" placeholder="Mr. Kumar" value={form.teacher} onChange={(e) => setForm((p) => ({ ...p, teacher: e.target.value }))} /></F>
              <F label="Periods per Week"><input className="cc-input" type="number" min={1} max={20} value={form.periodsPerWeek} onChange={(e) => setForm((p) => ({ ...p, periodsPerWeek: Number(e.target.value) }))} /></F>
              <F label="Textbooks / Materials" className="sm:col-span-2"><input className="cc-input" placeholder="e.g. NCERT Maths Class 8, R.D. Sharma" value={form.textbooks} onChange={(e) => setForm((p) => ({ ...p, textbooks: e.target.value }))} /></F>
              <F label="Course Description" className="sm:col-span-2"><textarea className="cc-input resize-y" rows={2} placeholder="Brief overview of what students learn…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></F>
            </div>
          </div>
          <ModalFooter onSave={saveCourse} onCancel={() => setEditing(null)} label="Save Subject" color="sky" />
        </Modal>
      )}

      {/* Slot modal */}
      {editSlot !== null && (
        <Modal title={editSlot.id ? 'Edit Slot' : 'Add Timetable Slot'} onClose={() => setEditSlot(null)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Day"><select className="cc-input appearance-none" value={slotForm.day} onChange={(e) => setSlotForm((p) => ({ ...p, day: e.target.value }))}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select></F>
            <F label="Period"><select className="cc-input appearance-none" value={slotForm.period} onChange={(e) => setSlotForm((p) => ({ ...p, period: Number(e.target.value) }))}>{PERIODS.map((n) => <option key={n} value={n}>Period {n}</option>)}</select></F>
            <F label="Subject"><select className="cc-input appearance-none" value={slotForm.subject} onChange={(e) => setSlotForm((p) => ({ ...p, subject: e.target.value }))}><option value="">— Select —</option>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></F>
            <F label="Teacher"><input className="cc-input" placeholder="Teacher name" value={slotForm.teacher} onChange={(e) => setSlotForm((p) => ({ ...p, teacher: e.target.value }))} /></F>
            <F label="Start Time"><input className="cc-input" type="time" value={slotForm.startTime} onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))} /></F>
            <F label="End Time"><input className="cc-input" type="time" value={slotForm.endTime} onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))} /></F>
          </div>
          <ModalFooter onSave={saveSlot} onCancel={() => setEditSlot(null)} label="Save Slot" color="sky" />
        </Modal>
      )}

      {saved && <Toast />}
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Empty({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <span className="text-4xl block mb-2">{icon}</span>
      <p className="font-semibold text-slate-600">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  )
}
function Toast() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm font-medium">
      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved!
    </div>
  )
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
function ModalFooter({ onSave, onCancel, label, color = 'emerald' }: { onSave: () => void; onCancel: () => void; label: string; color?: string }) {
  const cls: Record<string, string> = { sky: 'bg-sky-600 hover:bg-sky-700', emerald: 'bg-emerald-600 hover:bg-emerald-700', violet: 'bg-violet-600 hover:bg-violet-700', amber: 'bg-amber-600 hover:bg-amber-700' }
  return (
    <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
      <button onClick={onSave} className={`flex-1 py-2.5 rounded-xl ${cls[color] ?? cls.emerald} text-white text-sm font-semibold`}>{label}</button>
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
    </div>
  )
}
function F({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1 ${className}`}><label className="field-label">{label}</label>{children}</div>
}
