import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type HostelTab = 'rooms' | 'allocations' | 'mess'
type RoomStatus = 'AVAILABLE' | 'PARTIAL' | 'FULL' | 'MAINTENANCE'

interface Room {
  id: string
  roomNumber: string
  floor: string
  capacity: number
  occupants: number
  type: 'BOYS' | 'GIRLS'
  status: RoomStatus
}

interface Allocation {
  id: string
  studentName: string
  admissionNo: string
  className: string
  roomNumber: string
  bedNumber: string
  checkInDate: string
  checkOutDate: string
  active: boolean
  messPlan: string
}

interface MessRecord {
  id: string
  studentName: string
  plan: string
  monthlyFee: number
  month: string
  paid: boolean
}

const ROOM_STATUS_STYLE: Record<RoomStatus, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  PARTIAL: 'bg-sky-100 text-sky-700',
  FULL: 'bg-amber-100 text-amber-700',
  MAINTENANCE: 'bg-rose-100 text-rose-700',
}

const today = new Date().toISOString().slice(0, 10)
const currentMonth = today.slice(0, 7)

const MESS_PLANS = ['Veg - Full Board', 'Non-Veg - Full Board', 'Veg - Lunch & Dinner', 'Breakfast Only']

function roomStatus(r: Room): RoomStatus {
  if (r.status === 'MAINTENANCE') return 'MAINTENANCE'
  if (r.occupants === 0) return 'AVAILABLE'
  if (r.occupants >= r.capacity) return 'FULL'
  return 'PARTIAL'
}

export function HostelPage() {
  const [tab, setTab] = useState<HostelTab>('rooms')

  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', roomNumber: '101', floor: 'Ground', capacity: 3, occupants: 2, type: 'BOYS', status: 'PARTIAL' },
    { id: '2', roomNumber: '102', floor: 'Ground', capacity: 3, occupants: 3, type: 'BOYS', status: 'FULL' },
    { id: '3', roomNumber: '201', floor: 'First', capacity: 2, occupants: 0, type: 'GIRLS', status: 'AVAILABLE' },
    { id: '4', roomNumber: '202', floor: 'First', capacity: 4, occupants: 2, type: 'GIRLS', status: 'PARTIAL' },
  ])
  const [rForm, setRForm] = useState({ roomNumber: '', floor: '', capacity: 3, type: 'BOYS' as Room['type'] })
  const [showRForm, setShowRForm] = useState(false)

  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [aForm, setAForm] = useState({ studentName: '', admissionNo: '', className: '', roomNumber: '', bedNumber: '', checkInDate: today, checkOutDate: '', messPlan: MESS_PLANS[0] })
  const [showAForm, setShowAForm] = useState(false)

  const [messRecords, setMessRecords] = useState<MessRecord[]>([])
  const [mForm, setMForm] = useState({ studentName: '', plan: MESS_PLANS[0], monthlyFee: 3000, month: currentMonth })
  const [showMForm, setShowMForm] = useState(false)

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0)
  const totalOccupied = rooms.reduce((s, r) => s + r.occupants, 0)
  const available = rooms.filter((r) => roomStatus(r) === 'AVAILABLE').length

  const handleAddRoom = (e: FormEvent) => {
    e.preventDefault()
    if (!rForm.roomNumber.trim()) return
    setRooms((prev) => [{ id: crypto.randomUUID(), ...rForm, capacity: Number(rForm.capacity), occupants: 0, status: 'AVAILABLE' }, ...prev])
    setRForm({ roomNumber: '', floor: '', capacity: 3, type: 'BOYS' })
    setShowRForm(false)
  }

  const handleAllocate = (e: FormEvent) => {
    e.preventDefault()
    if (!aForm.studentName.trim() || !aForm.roomNumber.trim()) return
    setAllocations((prev) => [{ id: crypto.randomUUID(), ...aForm, active: true }, ...prev])
    setRooms((prev) => prev.map((r) => r.roomNumber === aForm.roomNumber ? { ...r, occupants: Math.min(r.capacity, r.occupants + 1), status: roomStatus({ ...r, occupants: r.occupants + 1 }) } : r))
    setAForm((p) => ({ ...p, studentName: '', admissionNo: '', className: '', bedNumber: '' }))
    setShowAForm(false)
  }

  const checkOut = (id: string) => {
    const alloc = allocations.find((a) => a.id === id)
    if (!alloc) return
    setAllocations((prev) => prev.map((a) => a.id === id ? { ...a, active: false, checkOutDate: today } : a))
    setRooms((prev) => prev.map((r) => r.roomNumber === alloc.roomNumber ? { ...r, occupants: Math.max(0, r.occupants - 1), status: roomStatus({ ...r, occupants: r.occupants - 1 }) } : r))
  }

  const handleAddMess = (e: FormEvent) => {
    e.preventDefault()
    if (!mForm.studentName.trim()) return
    setMessRecords((prev) => [{ id: crypto.randomUUID(), ...mForm, monthlyFee: Number(mForm.monthlyFee), paid: false }, ...prev])
    setMForm((p) => ({ ...p, studentName: '' }))
    setShowMForm(false)
  }

  const messRevenue = messRecords.filter((m) => m.paid).reduce((s, m) => s + m.monthlyFee, 0)
  const messPending = messRecords.filter((m) => !m.paid).length

  return (
    <section className="space-y-6">
      <PageHeader
        title="Hostel"
        subtitle="Manage hostel rooms, student allocations, and mess fee records."
        badge={{ label: `${totalOccupied}/${totalCapacity} Occupied`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Rooms</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{rooms.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Available</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{available}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Residents</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{allocations.filter((a) => a.active).length}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${messPending > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${messPending > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Mess Pending</p>
          <p className={`mt-1 text-2xl font-bold ${messPending > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{messPending}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['rooms', 'allocations', 'mess'] as HostelTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t === 'mess' ? 'Mess Fees' : t === 'allocations' ? 'Room Allocations' : 'Rooms'}
          </button>
        ))}
      </div>

      {tab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowRForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showRForm ? 'Cancel' : '+ Add Room'}
            </button>
          </div>
          {showRForm && (
            <Card>
              <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleAddRoom}>
                <input type="text" placeholder="Room no." value={rForm.roomNumber} onChange={(e) => setRForm((p) => ({ ...p, roomNumber: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="text" placeholder="Floor" value={rForm.floor} onChange={(e) => setRForm((p) => ({ ...p, floor: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="number" min={1} placeholder="Capacity" value={rForm.capacity} onChange={(e) => setRForm((p) => ({ ...p, capacity: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <select value={rForm.type} onChange={(e) => setRForm((p) => ({ ...p, type: e.target.value as Room['type'] }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="BOYS">Boys</option><option value="GIRLS">Girls</option>
                </select>
                <button type="submit" className="col-span-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add Room</button>
              </form>
            </Card>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => {
              const st = roomStatus(r)
              const pct = r.capacity > 0 ? Math.round((r.occupants / r.capacity) * 100) : 0
              return (
                <div key={r.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${st === 'FULL' ? 'border-amber-200' : st === 'MAINTENANCE' ? 'border-rose-200' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">Room {r.roomNumber}</p>
                      <p className="text-xs text-slate-500">{r.floor}{r.floor ? ' · ' : ''}{r.type === 'BOYS' ? 'Boys' : 'Girls'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROOM_STATUS_STYLE[st]}`}>{st}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{r.occupants} occupied</span><span>{r.capacity} beds</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setRooms((prev) => prev.map((x) => x.id === r.id && x.occupants < x.capacity ? { ...x, occupants: x.occupants + 1 } : x))} className="flex-1 rounded-lg bg-slate-100 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">+1</button>
                    <button type="button" onClick={() => setRooms((prev) => prev.map((x) => x.id === r.id && x.occupants > 0 ? { ...x, occupants: x.occupants - 1 } : x))} className="flex-1 rounded-lg bg-slate-100 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">-1</button>
                    <button type="button" onClick={() => setRooms((prev) => prev.map((x) => x.id === r.id ? { ...x, status: x.status === 'MAINTENANCE' ? roomStatus(x) : 'MAINTENANCE' } : x))} className="flex-1 rounded-lg bg-slate-100 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">🔧</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'allocations' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowAForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showAForm ? 'Cancel' : '+ Allocate Room'}
            </button>
          </div>
          {showAForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Room Allocation</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAllocate}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="text" placeholder="Student name" value={aForm.studentName} onChange={(e) => setAForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Admission no." value={aForm.admissionNo} onChange={(e) => setAForm((p) => ({ ...p, admissionNo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Class / Section" value={aForm.className} onChange={(e) => setAForm((p) => ({ ...p, className: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={aForm.roomNumber} onChange={(e) => setAForm((p) => ({ ...p, roomNumber: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="">Select room…</option>
                    {rooms.filter((r) => roomStatus(r) !== 'FULL' && roomStatus(r) !== 'MAINTENANCE').map((r) => <option key={r.id} value={r.roomNumber}>Room {r.roomNumber} ({r.type}) – {r.capacity - r.occupants} free</option>)}
                  </select>
                  <input type="text" placeholder="Bed no." value={aForm.bedNumber} onChange={(e) => setAForm((p) => ({ ...p, bedNumber: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={aForm.messPlan} onChange={(e) => setAForm((p) => ({ ...p, messPlan: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    {MESS_PLANS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Check-In</label>
                    <input type="date" value={aForm.checkInDate} onChange={(e) => setAForm((p) => ({ ...p, checkInDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Allocate</button>
              </form>
            </Card>
          )}
          {allocations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No allocations yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allocations.map((a) => (
                <div key={a.id} className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm ${a.active ? 'border-slate-200' : 'border-emerald-200 opacity-60'}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{a.studentName}</p>
                      {a.admissionNo && <span className="font-mono text-xs text-slate-400">{a.admissionNo}</span>}
                      {a.className && <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{a.className}</span>}
                      {!a.active && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">CHECKED OUT</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">Room {a.roomNumber}{a.bedNumber ? ` · Bed ${a.bedNumber}` : ''} · {a.messPlan} · In: {a.checkInDate}{a.checkOutDate ? ` · Out: ${a.checkOutDate}` : ''}</p>
                  </div>
                  {a.active && <button type="button" onClick={() => checkOut(a.id)} className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition">Check Out</button>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'mess' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Collected this month</p>
              <p className="mt-0.5 text-xl font-bold text-emerald-700">₹ {messRevenue.toLocaleString('en-IN')}</p>
            </div>
            <button type="button" onClick={() => setShowMForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showMForm ? 'Cancel' : '+ Add Mess Record'}
            </button>
          </div>
          {showMForm && (
            <Card>
              <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleAddMess}>
                <input type="text" placeholder="Student name" value={mForm.studentName} onChange={(e) => setMForm((p) => ({ ...p, studentName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <select value={mForm.plan} onChange={(e) => setMForm((p) => ({ ...p, plan: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  {MESS_PLANS.map((p) => <option key={p}>{p}</option>)}
                </select>
                <input type="number" min={0} placeholder="Monthly fee (₹)" value={mForm.monthlyFee || ''} onChange={(e) => setMForm((p) => ({ ...p, monthlyFee: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="month" value={mForm.month} onChange={(e) => setMForm((p) => ({ ...p, month: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <button type="submit" className="col-span-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add Record</button>
              </form>
            </Card>
          )}
          <div className="space-y-2">
            {messRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">No mess records yet.</p>
              </div>
            ) : messRecords.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{m.studentName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{m.plan}</span>
                    <span className="text-xs text-slate-400">{m.month}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">₹ {m.monthlyFee.toLocaleString('en-IN')}</p>
                </div>
                <button type="button" onClick={() => setMessRecords((prev) => prev.map((x) => x.id === m.id ? { ...x, paid: !x.paid } : x))} className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${m.paid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>
                  {m.paid ? 'Paid ✓' : 'Mark Paid'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
