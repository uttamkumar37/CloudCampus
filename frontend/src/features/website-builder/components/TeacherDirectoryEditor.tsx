import { useState } from 'react'
import type { TeacherProfile } from '../types'

const STORAGE_KEY = 'wb_teachers'

function load(): TeacherProfile[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function save(t: TeacherProfile[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const EMPTY: Omit<TeacherProfile, 'id'> = {
  name: '', designation: '', subject: '', qualification: '', experience: '',
  photoUrl: '', bio: '', email: '', linkedinUrl: '', displayOrder: 1,
  visible: true, featured: false,
}

const DESIGNATIONS = ['Principal', 'Vice Principal', 'Head of Department', 'Senior Teacher', 'Teacher', 'Assistant Teacher', 'Counsellor', 'Librarian', 'Sports Coach', 'Lab Technician']
const SUBJECTS = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music', 'EVS', 'Commerce', 'Economics', 'Other']

export function TeacherDirectoryEditor() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>(load)
  const [editing, setEditing] = useState<TeacherProfile | null>(null)
  const [form, setForm] = useState<Omit<TeacherProfile, 'id'>>(EMPTY)
  const [search, setSearch] = useState('')

  function openNew() { setForm({ ...EMPTY, displayOrder: teachers.length + 1 }); setEditing({ id: '', ...EMPTY }) }
  function openEdit(t: TeacherProfile) {
    setForm({ name: t.name, designation: t.designation, subject: t.subject, qualification: t.qualification, experience: t.experience, photoUrl: t.photoUrl, bio: t.bio, email: t.email, linkedinUrl: t.linkedinUrl, displayOrder: t.displayOrder, visible: t.visible, featured: t.featured })
    setEditing(t)
  }
  function handleSave() {
    if (!editing) return
    let updated: TeacherProfile[]
    if (editing.id) {
      updated = teachers.map((t) => t.id === editing.id ? { ...t, ...form } : t)
    } else {
      updated = [...teachers, { id: uid(), ...form }]
    }
    save(updated); setTeachers(updated); setEditing(null)
  }
  function handleDelete(id: string) {
    const updated = teachers.filter((t) => t.id !== id)
    save(updated); setTeachers(updated)
  }
  function toggleVisible(id: string) {
    const updated = teachers.map((t) => t.id === id ? { ...t, visible: !t.visible } : t)
    save(updated); setTeachers(updated)
  }
  function toggleFeatured(id: string) {
    const updated = teachers.map((t) => t.id === id ? { ...t, featured: !t.featured } : t)
    save(updated); setTeachers(updated)
  }

  const filtered = teachers
    .filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Teacher Directory
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">PRO</span>
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">{teachers.length} teachers · shown as profile cards on your website</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Teacher
        </button>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="cc-input pl-9 text-sm" placeholder="Search by name or subject…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Staff', value: teachers.length },
          { label: 'Featured', value: teachers.filter((t) => t.featured).length },
          { label: 'Visible', value: teachers.filter((t) => t.visible).length },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Teacher cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-semibold text-slate-600">No teachers added yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your staff profiles to showcase on the public website</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((teacher) => (
            <div key={teacher.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${teacher.visible ? 'bg-white border-slate-200 hover:border-violet-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              {teacher.photoUrl ? (
                <img src={teacher.photoUrl} alt={teacher.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-100"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=7c3aed&color=fff` }} />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-violet-100 shrink-0 flex items-center justify-center">
                  <span className="text-violet-600 font-bold text-lg">{teacher.name.charAt(0) || '?'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{teacher.name || 'Unnamed Teacher'}</p>
                  {teacher.featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Featured</span>}
                </div>
                <p className="text-xs text-violet-600 font-medium">{teacher.designation || '—'}</p>
                <p className="text-xs text-slate-400">{teacher.subject}{teacher.experience ? ` · ${teacher.experience} exp` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button onClick={() => toggleVisible(teacher.id)} title={teacher.visible ? 'Hide' : 'Show'}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${teacher.visible ? 'bg-violet-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${teacher.visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <div className="flex gap-1">
                  <button onClick={() => toggleFeatured(teacher.id)} title="Toggle featured" className={`text-xs px-2 py-1 rounded-lg font-medium ${teacher.featured ? 'bg-amber-100 text-amber-700' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>★</button>
                  <button onClick={() => openEdit(teacher)} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Edit</button>
                  <button onClick={() => handleDelete(teacher.id)} className="text-xs px-2 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editing.id ? 'Edit Teacher' : 'Add Teacher'}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Photo preview */}
              {form.photoUrl && (
                <div className="flex items-center gap-4 p-3 bg-violet-50 rounded-xl">
                  <img src={form.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white shadow"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=7c3aed&color=fff` }} />
                  <div>
                    <p className="font-semibold text-slate-700">{form.name || 'New Teacher'}</p>
                    <p className="text-xs text-violet-600">{form.designation || 'Designation'}</p>
                  </div>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Full Name</label>
                  <input className="cc-input" placeholder="e.g. Mrs. Priya Sharma" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Designation</label>
                  <select className="cc-input appearance-none" value={form.designation}
                    onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}>
                    <option value="">— Select —</option>
                    {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Subject</label>
                  <select className="cc-input appearance-none" value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}>
                    <option value="">— Select —</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Qualification</label>
                  <input className="cc-input" placeholder="e.g. M.Sc., B.Ed." value={form.qualification}
                    onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Experience</label>
                  <input className="cc-input" placeholder="e.g. 12 years" value={form.experience}
                    onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Photo URL</label>
                  <input className="cc-input" placeholder="https://…" value={form.photoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Email (optional)</label>
                  <input className="cc-input" type="email" placeholder="teacher@school.com" value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Display Order</label>
                  <input className="cc-input" type="number" min={1} max={100} value={form.displayOrder}
                    onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Bio (optional)</label>
                  <textarea className="cc-input resize-y" rows={3} placeholder="Short bio shown on hover or expanded card…" value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={form.visible}
                    onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} />
                  <span className="text-sm text-slate-700">Visible on website</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
                  <span className="text-sm text-slate-700">Featured (shown first)</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Save Teacher</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
