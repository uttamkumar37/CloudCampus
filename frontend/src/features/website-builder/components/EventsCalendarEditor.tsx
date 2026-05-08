import { useState } from 'react'
import type { SchoolEvent } from '../types'

const STORAGE_KEY = 'wb_events'
const EVENT_TYPES = ['Academic', 'Cultural', 'Sports', 'Exam', 'Holiday', 'Meeting', 'Other'] as const

function load(): SchoolEvent[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function save(events: SchoolEvent[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const EMPTY: Omit<SchoolEvent, 'id' | 'createdAt'> = {
  title: '', description: '', eventDate: '', endDate: '', location: '',
  eventType: 'Academic', rsvpEnabled: false, maxAttendees: null,
  imageUrl: '', registrationLink: '', visible: true,
}

const TYPE_COLORS: Record<string, string> = {
  Academic: 'bg-sky-100 text-sky-700',
  Cultural: 'bg-violet-100 text-violet-700',
  Sports: 'bg-emerald-100 text-emerald-700',
  Exam: 'bg-rose-100 text-rose-700',
  Holiday: 'bg-amber-100 text-amber-700',
  Meeting: 'bg-slate-100 text-slate-700',
  Other: 'bg-slate-100 text-slate-600',
}

const TYPE_ICONS: Record<string, string> = {
  Academic: '📚', Cultural: '🎭', Sports: '⚽', Exam: '📝', Holiday: '🎉', Meeting: '🤝', Other: '📅',
}

function isUpcoming(dateStr: string) {
  return dateStr ? new Date(dateStr) >= new Date() : false
}

export function EventsCalendarEditor() {
  const [events, setEvents] = useState<SchoolEvent[]>(load)
  const [editing, setEditing] = useState<SchoolEvent | null>(null)
  const [form, setForm] = useState<Omit<SchoolEvent, 'id' | 'createdAt'>>(EMPTY)
  const [filterType, setFilterType] = useState('')
  const [view, setView] = useState<'list' | 'upcoming'>('upcoming')

  function openNew() {
    setForm(EMPTY)
    setEditing({ id: '', createdAt: new Date().toISOString(), ...EMPTY })
  }
  function openEdit(e: SchoolEvent) {
    setForm({ title: e.title, description: e.description, eventDate: e.eventDate, endDate: e.endDate, location: e.location, eventType: e.eventType, rsvpEnabled: e.rsvpEnabled, maxAttendees: e.maxAttendees, imageUrl: e.imageUrl, registrationLink: e.registrationLink, visible: e.visible })
    setEditing(e)
  }
  function handleSave() {
    if (!editing) return
    let updated: SchoolEvent[]
    if (editing.id) {
      updated = events.map((e) => e.id === editing.id ? { ...e, ...form } : e)
    } else {
      updated = [{ id: uid(), createdAt: new Date().toISOString(), ...form }, ...events]
    }
    save(updated)
    setEvents(updated)
    setEditing(null)
  }
  function handleDelete(id: string) {
    const updated = events.filter((e) => e.id !== id)
    save(updated); setEvents(updated)
  }

  const filtered = events
    .filter((e) => !filterType || e.eventType === filterType)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())

  const upcoming = filtered.filter((e) => isUpcoming(e.eventDate))
  const past = filtered.filter((e) => !isUpcoming(e.eventDate))
  const displayed = view === 'upcoming' ? filtered : filtered

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Events Calendar
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Event
        </button>
      </div>

      {/* Filter + view toggle */}
      <div className="flex items-center gap-3">
        <select className="cc-input text-sm w-40 appearance-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All types</option>
          {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <button onClick={() => setView('upcoming')} className={`px-4 py-2 text-xs font-medium ${view === 'upcoming' ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50'}`}>Upcoming first</button>
          <button onClick={() => setView('list')} className={`px-4 py-2 text-xs font-medium border-l border-slate-200 ${view === 'list' ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50'}`}>All events</button>
        </div>
      </div>

      {/* Event type quick counts */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map((t) => {
          const count = events.filter((e) => e.eventType === t).length
          if (count === 0) return null
          return (
            <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterType === t ? TYPE_COLORS[t] + ' ring-2' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {TYPE_ICONS[t]} {t} <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Events list */}
      {displayed.length === 0 ? (
        <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <span className="text-4xl block mb-3">📅</span>
          <p className="font-semibold text-slate-600">No events yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your school events, sports days, exam dates, and holidays</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.length > 0 && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Upcoming Events</p>}
          {upcoming.map((event) => <EventCard key={event.id} event={event} onEdit={openEdit} onDelete={handleDelete} />)}
          {past.length > 0 && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mt-4">Past Events</p>}
          {past.map((event) => <EventCard key={event.id} event={event} onEdit={openEdit} onDelete={handleDelete} />)}
        </div>
      )}

      {/* Edit modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editing.id ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Event Title</label>
                  <input className="cc-input" placeholder="e.g. Annual Sports Day 2026" value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Event Type</label>
                  <select className="cc-input appearance-none" value={form.eventType}
                    onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value as SchoolEvent['eventType'] }))}>
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Location / Venue</label>
                  <input className="cc-input" placeholder="e.g. School Auditorium" value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Start Date & Time</label>
                  <input className="cc-input" type="datetime-local" value={form.eventDate}
                    onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">End Date & Time</label>
                  <input className="cc-input" type="datetime-local" value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Description</label>
                  <textarea className="cc-input resize-y" rows={3} placeholder="What will happen at this event?" value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Cover Image URL (optional)</label>
                  <input className="cc-input" placeholder="https://…" value={form.imageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Enable RSVP / Registration</p>
                      <p className="text-xs text-slate-400">Allow parents to register for this event</p>
                    </div>
                    <button onClick={() => setForm((p) => ({ ...p, rsvpEnabled: !p.rsvpEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.rsvpEnabled ? 'bg-sky-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.rsvpEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {form.rsvpEnabled && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="field-label">Registration Link</label>
                        <input className="cc-input" placeholder="https://forms.google.com/…" value={form.registrationLink}
                          onChange={(e) => setForm((p) => ({ ...p, registrationLink: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="field-label">Max Attendees (optional)</label>
                        <input className="cc-input" type="number" placeholder="e.g. 200" min={0} value={form.maxAttendees ?? ''}
                          onChange={(e) => setForm((p) => ({ ...p, maxAttendees: e.target.value ? Number(e.target.value) : null }))} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.visible}
                  onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} />
                <span className="text-sm text-slate-700">Show on public website</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">Save Event</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, onEdit, onDelete }: { event: SchoolEvent; onEdit: (e: SchoolEvent) => void; onDelete: (id: string) => void }) {
  const upcoming = event.eventDate ? new Date(event.eventDate) >= new Date() : false
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${upcoming ? 'bg-white border-slate-200 hover:border-sky-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${upcoming ? 'bg-sky-50' : 'bg-slate-100'}`}>
        {(TYPE_ICONS as Record<string, string>)[event.eventType] ?? '📅'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-semibold text-slate-800 truncate">{event.title}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${(TYPE_COLORS as Record<string, string>)[event.eventType]}`}>{event.eventType}</span>
          {event.rsvpEnabled && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">RSVP</span>}
        </div>
        <p className="text-xs text-slate-500">{dateStr}{event.location ? ` · ${event.location}` : ''}</p>
        {event.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{event.description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onEdit(event)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Edit</button>
        <button onClick={() => onDelete(event.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium">Delete</button>
      </div>
    </div>
  )
}
