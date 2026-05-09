import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type TransportTab = 'vehicles' | 'routes'
type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED'

interface Vehicle {
  id: string
  regNumber: string
  type: string
  capacity: number
  driverName: string
  driverPhone: string
  status: VehicleStatus
  lastService: string
}

interface BusStop {
  name: string
  time: string
  students: number
}

interface BusRoute {
  id: string
  routeName: string
  vehicleReg: string
  driverName: string
  stops: BusStop[]
  totalStudents: number
}

const VEHICLE_STATUS_STYLE: Record<VehicleStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  RETIRED: 'bg-slate-100 text-slate-500',
}

const today = new Date().toISOString().slice(0, 10)

export function TransportPage() {
  const [tab, setTab] = useState<TransportTab>('vehicles')

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', regNumber: 'MH-12-AB-1234', type: 'Bus', capacity: 40, driverName: 'Ramesh Kumar', driverPhone: '9876543210', status: 'ACTIVE', lastService: '2026-04-10' },
    { id: '2', regNumber: 'MH-12-CD-5678', type: 'Bus', capacity: 35, driverName: 'Suresh Patil', driverPhone: '9876543211', status: 'MAINTENANCE', lastService: '2026-03-01' },
    { id: '3', regNumber: 'MH-12-EF-9012', type: 'Van', capacity: 12, driverName: 'Mohan Das', driverPhone: '9876543212', status: 'ACTIVE', lastService: '2026-04-20' },
  ])
  const [vForm, setVForm] = useState({ regNumber: '', type: 'Bus', capacity: 40, driverName: '', driverPhone: '', lastService: today })
  const [showVForm, setShowVForm] = useState(false)

  const [routes, setRoutes] = useState<BusRoute[]>([
    {
      id: '1', routeName: 'Route A – North Zone', vehicleReg: 'MH-12-AB-1234', driverName: 'Ramesh Kumar', totalStudents: 32,
      stops: [
        { name: 'Patel Nagar', time: '07:00', students: 8 },
        { name: 'Andheri Station', time: '07:15', students: 12 },
        { name: 'Jogeshwari', time: '07:30', students: 12 },
      ],
    },
    {
      id: '2', routeName: 'Route B – South Zone', vehicleReg: 'MH-12-EF-9012', driverName: 'Mohan Das', totalStudents: 10,
      stops: [
        { name: 'Dadar', time: '07:10', students: 5 },
        { name: 'Mahim', time: '07:25', students: 5 },
      ],
    },
  ])
  const [rForm, setRForm] = useState({ routeName: '', vehicleReg: '', driverName: '', stopsRaw: '' })
  const [showRForm, setShowRForm] = useState(false)
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

  const activeVehicles = vehicles.filter((v) => v.status === 'ACTIVE').length
  const totalCapacity = vehicles.filter((v) => v.status === 'ACTIVE').reduce((s, v) => s + v.capacity, 0)
  const totalRouteStudents = routes.reduce((s, r) => s + r.totalStudents, 0)

  const handleAddVehicle = (e: FormEvent) => {
    e.preventDefault()
    if (!vForm.regNumber.trim()) return
    setVehicles((prev) => [{ id: crypto.randomUUID(), ...vForm, capacity: Number(vForm.capacity), status: 'ACTIVE' }, ...prev])
    setVForm({ regNumber: '', type: 'Bus', capacity: 40, driverName: '', driverPhone: '', lastService: today })
    setShowVForm(false)
  }

  const handleAddRoute = (e: FormEvent) => {
    e.preventDefault()
    if (!rForm.routeName.trim()) return
    const stops: BusStop[] = rForm.stopsRaw.split(',').map((s, i) => ({ name: s.trim(), time: `07:${(i * 10).toString().padStart(2, '0')}`, students: 0 })).filter((s) => s.name)
    setRoutes((prev) => [{ id: crypto.randomUUID(), ...rForm, stops, totalStudents: 0 }, ...prev])
    setRForm({ routeName: '', vehicleReg: '', driverName: '', stopsRaw: '' })
    setShowRForm(false)
  }

  const cycleStatus = (id: string) =>
    setVehicles((prev) => prev.map((v) => {
      if (v.id !== id) return v
      const next: VehicleStatus = v.status === 'ACTIVE' ? 'MAINTENANCE' : v.status === 'MAINTENANCE' ? 'RETIRED' : 'ACTIVE'
      return { ...v, status: next }
    }))

  return (
    <section className="space-y-6">
      <PageHeader
        title="Transport"
        subtitle="Manage school vehicles, bus routes, and student pickup allocations."
        badge={{ label: `${vehicles.length} Vehicle${vehicles.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Vehicles</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{vehicles.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{activeVehicles}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Capacity</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{totalCapacity}</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Students on Bus</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">{totalRouteStudents}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['vehicles', 'routes'] as TransportTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t === 'routes' ? 'Bus Routes' : 'Vehicles'}
          </button>
        ))}
      </div>

      {tab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowVForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showVForm ? 'Cancel' : '+ Add Vehicle'}
            </button>
          </div>
          {showVForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Add Vehicle</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddVehicle}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="text" placeholder="Registration number" value={vForm.regNumber} onChange={(e) => setVForm((p) => ({ ...p, regNumber: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={vForm.type} onChange={(e) => setVForm((p) => ({ ...p, type: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option>Bus</option><option>Van</option><option>Mini Bus</option><option>Auto</option>
                  </select>
                  <input type="number" min={1} placeholder="Capacity" value={vForm.capacity} onChange={(e) => setVForm((p) => ({ ...p, capacity: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Driver name" value={vForm.driverName} onChange={(e) => setVForm((p) => ({ ...p, driverName: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="tel" placeholder="Driver phone" value={vForm.driverPhone} onChange={(e) => setVForm((p) => ({ ...p, driverPhone: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Last Service Date</label>
                    <input type="date" value={vForm.lastService} onChange={(e) => setVForm((p) => ({ ...p, lastService: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add Vehicle</button>
              </form>
            </Card>
          )}
          <div className="space-y-2">
            {vehicles.map((v) => (
              <div key={v.id} className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm ${v.status === 'MAINTENANCE' ? 'border-amber-200' : v.status === 'RETIRED' ? 'border-slate-100' : 'border-slate-200'}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{v.regNumber}</p>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{v.type}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${VEHICLE_STATUS_STYLE[v.status]}`}>{v.status}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{v.driverName}{v.driverPhone ? ` · ${v.driverPhone}` : ''} · Capacity: {v.capacity} · Last service: {v.lastService}</p>
                </div>
                <button type="button" onClick={() => cycleStatus(v.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Change Status
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'routes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowRForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showRForm ? 'Cancel' : '+ Add Route'}
            </button>
          </div>
          {showRForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Add Bus Route</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddRoute}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" placeholder="Route name (e.g. Route C – East Zone)" value={rForm.routeName} onChange={(e) => setRForm((p) => ({ ...p, routeName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Vehicle registration" value={rForm.vehicleReg} onChange={(e) => setRForm((p) => ({ ...p, vehicleReg: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Driver name" value={rForm.driverName} onChange={(e) => setRForm((p) => ({ ...p, driverName: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Stops (comma-separated, e.g. Stop A, Stop B)" value={rForm.stopsRaw} onChange={(e) => setRForm((p) => ({ ...p, stopsRaw: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                </div>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Route</button>
              </form>
            </Card>
          )}
          <div className="space-y-3">
            {routes.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{r.routeName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{r.vehicleReg}{r.driverName ? ` · ${r.driverName}` : ''} · {r.totalStudents} students</p>
                  </div>
                  <button type="button" onClick={() => setExpandedRoute(expandedRoute === r.id ? null : r.id)} className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 transition">
                    {expandedRoute === r.id ? 'Hide stops ▲' : 'View stops ▼'}
                  </button>
                </div>
                {expandedRoute === r.id && r.stops.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {r.stops.map((stop, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">{i + 1}</span>
                        <span className="flex-1 text-sm text-slate-700">{stop.name}</span>
                        <span className="text-xs text-slate-400">{stop.time}</span>
                        {stop.students > 0 && <span className="text-xs text-slate-500">{stop.students} students</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <StopwisePickupList routes={routes} />
    </section>
  )
}

// ── Stop-wise Student Pickup List ──────────────────────────────────────────

interface PickupStudent {
  id: string
  name: string
  className: string
  stop: string
  routeName: string
  guardian: string
  phone: string
}

function StopwisePickupList({ routes }: { routes: { id: string; routeName: string; stops: { name: string; time: string; students: number }[] }[] }) {
  const [students, setStudents] = useState<PickupStudent[]>([
    { id: '1', name: 'Aarav Mehta', className: 'Class 7A', stop: 'Andheri Station', routeName: 'Route A – North Zone', guardian: 'Rakesh Mehta', phone: '9876543210' },
    { id: '2', name: 'Priya Sharma', className: 'Class 5B', stop: 'Patel Nagar', routeName: 'Route A – North Zone', guardian: 'Suresh Sharma', phone: '9876543211' },
    { id: '3', name: 'Rohit Das', className: 'Class 9A', stop: 'Dadar', routeName: 'Route B – South Zone', guardian: 'Mohan Das', phone: '9876543212' },
  ])
  const [form, setForm] = useState({ name: '', className: '', stop: '', routeName: routes[0]?.routeName ?? '', guardian: '', phone: '' })
  const [showForm, setShowForm] = useState(false)

  const byStop = students.reduce<Record<string, PickupStudent[]>>((acc, s) => {
    acc[s.stop] = acc[s.stop] ? [...acc[s.stop], s] : [s]
    return acc
  }, {})

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.stop.trim()) return
    setStudents((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev])
    setForm((p) => ({ ...p, name: '', className: '', guardian: '', phone: '' }))
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Stop-wise Pickup List</h2>
          <p className="text-sm text-slate-500">View students grouped by their assigned pickup stop.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={handleAdd}>
            <input type="text" placeholder="Student name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Class / Section" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Pickup stop name" value={form.stop} onChange={(e) => setForm((p) => ({ ...p, stop: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <select value={form.routeName} onChange={(e) => setForm((p) => ({ ...p, routeName: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              {routes.map((r) => <option key={r.id} value={r.routeName}>{r.routeName}</option>)}
            </select>
            <input type="text" placeholder="Guardian name" value={form.guardian} onChange={(e) => setForm((p) => ({ ...p, guardian: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="tel" placeholder="Guardian phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="col-span-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add to Pickup List</button>
          </form>
        </div>
      )}

      {Object.keys(byStop).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No students in pickup list yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byStop).map(([stop, studs]) => (
            <div key={stop} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">📍</span>
                  <p className="font-semibold text-slate-950">{stop}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{studs.length} student{studs.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {studs.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{s.name}</span>
                      {s.className && <span className="ml-2 text-xs text-slate-400">{s.className}</span>}
                    </div>
                    <div className="text-right">
                      {s.guardian && <p className="text-[10px] text-slate-500">{s.guardian}{s.phone ? ` · ${s.phone}` : ''}</p>}
                      <p className="text-[10px] text-slate-400">{s.routeName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
