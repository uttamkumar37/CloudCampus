import { useState } from 'react'
import type { FeeItem, BookingConfig, ActivityItem } from '../types'

const FEE_KEY = 'wb_fee_structure'
const BOOKING_KEY = 'wb_booking_config'

function loadFees(): FeeItem[] {
  try { return JSON.parse(localStorage.getItem(FEE_KEY) ?? '[]') } catch { return [] }
}
function loadBooking(): BookingConfig {
  const EMPTY: BookingConfig = {
    ptmEnabled: false, ptmCalendarLink: '', ptmDescription: '',
    openDayEnabled: false, openDayDate: '', openDayDescription: '', openDayRegistrationLink: '',
    virtualTourEnabled: false, virtualTourUrl: '', virtualTourDescription: '',
    campusVisitEnabled: false, campusVisitContact: '', campusVisitNote: '',
    activityRegistrationEnabled: false, activities: [],
  }
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(BOOKING_KEY) ?? '{}') } } catch { return EMPTY }
}
function saveFees(v: FeeItem[]) { localStorage.setItem(FEE_KEY, JSON.stringify(v)) }
function saveBooking(v: BookingConfig) { localStorage.setItem(BOOKING_KEY, JSON.stringify(v)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const CLASSES = ['Pre-KG / Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']

interface Props { mode?: 'fees' | 'bookings' }

export function FeeServicesEditor({ mode = 'fees' }: Props) {
  const [tab, setTab] = useState<'fees' | 'calculator' | 'bookings' | 'activities'>(mode === 'bookings' ? 'bookings' : 'fees')
  const [fees, setFees] = useState<FeeItem[]>(loadFees)
  const [booking, setBooking] = useState<BookingConfig>(loadBooking)
  const [editingFee, setEditingFee] = useState<FeeItem | null>(null)
  const [feeForm, setFeeForm] = useState<Omit<FeeItem, 'id'>>({ className: '', admissionFee: 0, tuitionFeeMonthly: 0, annualCharges: 0, examFee: 0, sportsFee: 0, libraryFee: 0, transportFee: 0, hostelFee: 0, notes: '', displayOrder: 1 })
  const [saved, setSaved] = useState(false)
  const [calcClass, setCalcClass] = useState('')
  const [calcTransport, setCalcTransport] = useState(false)
  const [calcHostel, setCalcHostel] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null)
  const [actForm, setActForm] = useState<Omit<ActivityItem, 'id'>>({ name: '', description: '', fee: 0, schedule: '', ageGroup: '', maxStudents: null, registrationLink: '', visible: true })

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  function openNewFee() { setFeeForm({ className: '', admissionFee: 0, tuitionFeeMonthly: 0, annualCharges: 0, examFee: 0, sportsFee: 0, libraryFee: 0, transportFee: 0, hostelFee: 0, notes: '', displayOrder: fees.length + 1 }); setEditingFee({ id: '', className: '', admissionFee: 0, tuitionFeeMonthly: 0, annualCharges: 0, examFee: 0, sportsFee: 0, libraryFee: 0, transportFee: 0, hostelFee: 0, notes: '', displayOrder: fees.length + 1 }) }
  function openEditFee(f: FeeItem) { setFeeForm({ className: f.className, admissionFee: f.admissionFee, tuitionFeeMonthly: f.tuitionFeeMonthly, annualCharges: f.annualCharges, examFee: f.examFee, sportsFee: f.sportsFee, libraryFee: f.libraryFee, transportFee: f.transportFee, hostelFee: f.hostelFee, notes: f.notes, displayOrder: f.displayOrder }); setEditingFee(f) }
  function handleSaveFee() {
    if (!editingFee) return
    const updated = editingFee.id ? fees.map((f) => f.id === editingFee.id ? { ...f, ...feeForm } : f) : [...fees, { id: uid(), ...feeForm }]
    saveFees(updated); setFees(updated); setEditingFee(null); flash()
  }

  function setBookingField<K extends keyof BookingConfig>(key: K, val: BookingConfig[K]) {
    setBooking((p) => ({ ...p, [key]: val }))
  }
  function saveBookingNow() { saveBooking(booking); flash() }

  function calcTotal() {
    const fee = fees.find((f) => f.className === calcClass)
    if (!fee) return null
    const annual = fee.admissionFee + fee.annualCharges + fee.examFee + fee.sportsFee + fee.libraryFee + (fee.tuitionFeeMonthly * 12)
    const transport = calcTransport ? fee.transportFee * 12 : 0
    const hostel = calcHostel ? fee.hostelFee * 12 : 0
    return { fee, annual, transport, hostel, total: annual + transport + hostel }
  }

  const calc = calcClass ? calcTotal() : null

  function openNewActivity() { setActForm({ name: '', description: '', fee: 0, schedule: '', ageGroup: '', maxStudents: null, registrationLink: '', visible: true }); setEditingActivity({ id: '', name: '', description: '', fee: 0, schedule: '', ageGroup: '', maxStudents: null, registrationLink: '', visible: true }) }
  function openEditActivity(a: ActivityItem) { setActForm({ name: a.name, description: a.description, fee: a.fee, schedule: a.schedule, ageGroup: a.ageGroup, maxStudents: a.maxStudents, registrationLink: a.registrationLink, visible: a.visible }); setEditingActivity(a) }
  function handleSaveActivity() {
    if (!editingActivity) return
    const updated = editingActivity.id
      ? booking.activities.map((a) => a.id === editingActivity.id ? { ...a, ...actForm } : a)
      : [...booking.activities, { id: uid(), ...actForm }]
    const newBooking = { ...booking, activities: updated }
    setBooking(newBooking); saveBooking(newBooking); setEditingActivity(null); flash()
  }

  const TABS = [
    { key: 'fees', label: 'Fee Structure', icon: '💰' },
    { key: 'calculator', label: 'Calculator', icon: '🧮' },
    { key: 'bookings', label: 'Bookings', icon: '📅' },
    { key: 'activities', label: 'Activities', icon: '🎯' },
  ] as const

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          {mode === 'bookings' ? 'Bookings & Services' : 'Fee Structure & Services'}
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">PRO</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Publish fee structures, parent bookings, and activity registrations.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-100'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Fee Structure Table */}
      {tab === 'fees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{fees.length} class fee entries</p>
            <button onClick={openNewFee} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Class
            </button>
          </div>
          {fees.length === 0 ? (
            <EmptyState icon="💰" title="No fee structure added" desc="Add per-class fee breakdowns to show on your school website" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Class', 'Admission', 'Tuition/mo', 'Annual', 'Exam', 'Total (Annual)', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee, i) => {
                    const total = fee.admissionFee + fee.annualCharges + fee.examFee + fee.sportsFee + fee.libraryFee + (fee.tuitionFeeMonthly * 12)
                    return (
                      <tr key={fee.id} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-3 font-semibold text-slate-700">{fee.className}</td>
                        <td className="px-4 py-3 text-slate-600">₹{fee.admissionFee.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-slate-600">₹{fee.tuitionFeeMonthly.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-slate-600">₹{fee.annualCharges.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-slate-600">₹{fee.examFee.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-bold text-violet-700">₹{total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEditFee(fee)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                            <button onClick={() => { const u = fees.filter((f) => f.id !== fee.id); saveFees(u); setFees(u) }} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">✕</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fee Calculator */}
      {tab === 'calculator' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Parents can use this calculator on your website to estimate total fees.</p>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 max-w-lg">
            <h4 className="font-bold text-slate-800">Fee Estimator Preview</h4>
            <div className="space-y-1">
              <label className="field-label">Select Class</label>
              <select className="cc-input appearance-none" value={calcClass} onChange={(e) => setCalcClass(e.target.value)}>
                <option value="">— Choose class —</option>
                {fees.map((f) => <option key={f.id} value={f.className}>{f.className}</option>)}
              </select>
            </div>
            {calcClass && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={calcTransport} onChange={(e) => setCalcTransport(e.target.checked)} />
                  Include school transport
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={calcHostel} onChange={(e) => setCalcHostel(e.target.checked)} />
                  Include hostel / boarding
                </label>
              </div>
            )}
            {calc && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Annual Fee Breakdown</p>
                {[
                  { label: 'Admission Fee', value: calc.fee.admissionFee },
                  { label: 'Tuition (×12 months)', value: calc.fee.tuitionFeeMonthly * 12 },
                  { label: 'Annual Charges', value: calc.fee.annualCharges },
                  { label: 'Exam Fee', value: calc.fee.examFee },
                  { label: 'Sports & Activities', value: calc.fee.sportsFee },
                  { label: 'Library Fee', value: calc.fee.libraryFee },
                  ...(calcTransport ? [{ label: 'Transport (×12)', value: calc.transport }] : []),
                  ...(calcHostel ? [{ label: 'Hostel (×12)', value: calc.hostel }] : []),
                ].filter((r) => r.value > 0).map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-medium text-slate-800">₹{row.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-800">Total Annual Fees</span>
                  <span className="font-bold text-violet-700 text-lg">₹{calc.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
            {!fees.length && <p className="text-sm text-slate-400 text-center py-4">Add fee structure entries to use the calculator</p>}
          </div>
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <BookingToggle title="Parent-Teacher Meetings (PTM)" desc="Let parents book PTM slots directly from your website." enabled={booking.ptmEnabled} onToggle={() => setBookingField('ptmEnabled', !booking.ptmEnabled)}>
              {booking.ptmEnabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <label className="field-label">Calendar Booking Link</label>
                    <input className="cc-input" placeholder="Calendly or Google Calendar link" value={booking.ptmCalendarLink} onChange={(e) => setBookingField('ptmCalendarLink', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="field-label">Description</label>
                    <input className="cc-input" placeholder="Book your 15-min slot with the class teacher" value={booking.ptmDescription} onChange={(e) => setBookingField('ptmDescription', e.target.value)} />
                  </div>
                </div>
              )}
            </BookingToggle>

            <BookingToggle title="Open Day / School Visit" desc="Invite prospective parents to visit your school." enabled={booking.openDayEnabled} onToggle={() => setBookingField('openDayEnabled', !booking.openDayEnabled)}>
              {booking.openDayEnabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <label className="field-label">Open Day Date</label>
                    <input className="cc-input" type="date" value={booking.openDayDate} onChange={(e) => setBookingField('openDayDate', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="field-label">Registration Link</label>
                    <input className="cc-input" placeholder="Google Forms or Calendly link" value={booking.openDayRegistrationLink} onChange={(e) => setBookingField('openDayRegistrationLink', e.target.value)} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="field-label">Description</label>
                    <textarea className="cc-input resize-y" rows={2} placeholder="Join us for our Open Day on…" value={booking.openDayDescription} onChange={(e) => setBookingField('openDayDescription', e.target.value)} />
                  </div>
                </div>
              )}
            </BookingToggle>

            <BookingToggle title="Virtual School Tour" desc="Embed a 360° or YouTube virtual tour of your campus." enabled={booking.virtualTourEnabled} onToggle={() => setBookingField('virtualTourEnabled', !booking.virtualTourEnabled)}>
              {booking.virtualTourEnabled && (
                <div className="space-y-1 mt-3">
                  <label className="field-label">Tour URL (YouTube / 360° embed)</label>
                  <input className="cc-input" placeholder="https://youtube.com/watch?v=…" value={booking.virtualTourUrl} onChange={(e) => setBookingField('virtualTourUrl', e.target.value)} />
                </div>
              )}
            </BookingToggle>

            <BookingToggle title="Campus Visit Booking" desc="Parents can request an in-person campus tour." enabled={booking.campusVisitEnabled} onToggle={() => setBookingField('campusVisitEnabled', !booking.campusVisitEnabled)}>
              {booking.campusVisitEnabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <label className="field-label">Contact Number / Email</label>
                    <input className="cc-input" placeholder="+91 98765 43210 or admissions@school.com" value={booking.campusVisitContact} onChange={(e) => setBookingField('campusVisitContact', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="field-label">Visit Note</label>
                    <input className="cc-input" placeholder="Mon–Sat, 9am–1pm. Bring ID." value={booking.campusVisitNote} onChange={(e) => setBookingField('campusVisitNote', e.target.value)} />
                  </div>
                </div>
              )}
            </BookingToggle>
          </div>
          <button onClick={saveBookingNow} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Save Booking Settings
          </button>
        </div>
      )}

      {/* Activities */}
      {tab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{booking.activities.length} activities</p>
            <button onClick={openNewActivity} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Activity
            </button>
          </div>
          {booking.activities.length === 0 ? (
            <EmptyState icon="🎯" title="No activities added" desc="Add sports, arts, music, and after-school activities for registration" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {booking.activities.map((act) => (
                <div key={act.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800">{act.name}</p>
                    <span className="text-xs font-bold text-violet-700">₹{act.fee.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <p className="text-xs text-slate-500">{act.schedule}{act.ageGroup ? ` · ${act.ageGroup}` : ''}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEditActivity(act)} className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                    <button onClick={() => { const newBooking = { ...booking, activities: booking.activities.filter((a) => a.id !== act.id) }; setBooking(newBooking); saveBooking(newBooking) }} className="text-xs px-2 py-1 rounded border border-red-100 text-red-500 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fee modal */}
      {editingFee !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editingFee.id ? 'Edit Fee Entry' : 'Add Fee Entry'}</h3>
              <button onClick={() => setEditingFee(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="field-label">Class</label>
                <select className="cc-input appearance-none" value={feeForm.className} onChange={(e) => setFeeForm((p) => ({ ...p, className: e.target.value }))}>
                  <option value="">— Select Class —</option>
                  {CLASSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'admissionFee', label: 'Admission Fee (₹)' },
                  { key: 'tuitionFeeMonthly', label: 'Tuition Fee/Month (₹)' },
                  { key: 'annualCharges', label: 'Annual Charges (₹)' },
                  { key: 'examFee', label: 'Exam Fee (₹)' },
                  { key: 'sportsFee', label: 'Sports Fee (₹)' },
                  { key: 'libraryFee', label: 'Library Fee (₹)' },
                  { key: 'transportFee', label: 'Transport/Month (₹)' },
                  { key: 'hostelFee', label: 'Hostel/Month (₹)' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="field-label">{label}</label>
                    <input className="cc-input" type="number" min={0} value={(feeForm as Record<string, unknown>)[key] as number}
                      onChange={(e) => setFeeForm((p) => ({ ...p, [key]: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <label className="field-label">Notes (optional)</label>
                <input className="cc-input" placeholder="e.g. GST excluded, payable in April" value={feeForm.notes}
                  onChange={(e) => setFeeForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={handleSaveFee} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Save</button>
              <button onClick={() => setEditingFee(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity modal */}
      {editingActivity !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editingActivity.id ? 'Edit Activity' : 'Add Activity'}</h3>
              <button onClick={() => setEditingActivity(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2"><label className="field-label">Activity Name</label><input className="cc-input" placeholder="e.g. Chess Club, Cricket, Dance" value={actForm.name} onChange={(e) => setActForm((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-1"><label className="field-label">Monthly Fee (₹)</label><input className="cc-input" type="number" min={0} value={actForm.fee} onChange={(e) => setActForm((p) => ({ ...p, fee: Number(e.target.value) }))} /></div>
                <div className="space-y-1"><label className="field-label">Schedule</label><input className="cc-input" placeholder="Mon/Wed/Fri, 3–5pm" value={actForm.schedule} onChange={(e) => setActForm((p) => ({ ...p, schedule: e.target.value }))} /></div>
                <div className="space-y-1"><label className="field-label">Age Group</label><input className="cc-input" placeholder="Class 5–8" value={actForm.ageGroup} onChange={(e) => setActForm((p) => ({ ...p, ageGroup: e.target.value }))} /></div>
                <div className="space-y-1"><label className="field-label">Max Students</label><input className="cc-input" type="number" placeholder="e.g. 20" value={actForm.maxStudents ?? ''} onChange={(e) => setActForm((p) => ({ ...p, maxStudents: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1 sm:col-span-2"><label className="field-label">Registration Link</label><input className="cc-input" placeholder="Google Form link…" value={actForm.registrationLink} onChange={(e) => setActForm((p) => ({ ...p, registrationLink: e.target.value }))} /></div>
                <div className="space-y-1 sm:col-span-2"><label className="field-label">Description</label><textarea className="cc-input resize-y" rows={2} value={actForm.description} onChange={(e) => setActForm((p) => ({ ...p, description: e.target.value }))} /></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={handleSaveActivity} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Save Activity</button>
              <button onClick={() => setEditingActivity(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
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

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <span className="text-4xl block mb-2">{icon}</span>
      <p className="font-semibold text-slate-600">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  )
}

function BookingToggle({ title, desc, enabled, onToggle, children }: { title: string; desc: string; enabled: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${enabled ? 'border-violet-200 bg-violet-50/40' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-700">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${enabled ? 'bg-violet-500' : 'bg-slate-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {children}
    </div>
  )
}
