import { AxiosError } from 'axios'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { FormInput } from '../../../components/ui/FormInput'
import { FormSelect } from '../../../components/ui/FormSelect'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'

import { useStudentDetails } from '../hooks/useStudentDetails'
import { useUpdateStudent } from '../hooks/useUpdateStudent'
import type { StudentStatus } from '../types'

// ─── helpers ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  '#1E3A8A', '#065F46', '#92400E', '#7C3AED',
  '#0E7490', '#9F1239', '#166534', '#1D4ED8',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

const STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: 'Active', INACTIVE: 'Inactive', ALUMNI: 'Alumni', DEBARRED: 'Debarred', TC_ISSUED: 'TC Issued',
}
const STATUS_CLASSES: Record<StudentStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  ALUMNI: 'bg-blue-100 text-blue-700',
  DEBARRED: 'bg-rose-100 text-rose-700',
  TC_ISSUED: 'bg-amber-100 text-amber-700',
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700',
  A: 'bg-emerald-100 text-emerald-700',
  'A-': 'bg-emerald-100 text-emerald-700',
  'B+': 'bg-blue-100 text-blue-700',
  B: 'bg-blue-100 text-blue-700',
  'B-': 'bg-blue-100 text-blue-700',
  'C+': 'bg-amber-100 text-amber-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-rose-100 text-rose-700',
}

type ProfileTab = 'overview' | 'academics' | 'attendance' | 'fees' | 'parents' | 'documents' | 'settings'

const TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'academics', label: 'Academics' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'fees', label: 'Fees' },
  { key: 'parents', label: 'Parents' },
  { key: 'documents', label: 'Documents' },
  { key: 'settings', label: 'Settings' },
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'DEBARRED', label: 'Debarred' },
  { value: 'TC_ISSUED', label: 'TC Issued' },
]

// ─── sub-sections ────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{value ?? '—'}</span>
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export function StudentAdminProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useStudentDetails(id)
  const updateMutation = useUpdateStudent()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')

  const detail = data?.data

  // Settings tab state
  const [editValues, setEditValues] = useState<{
    firstName: string; lastName: string; email: string; phone: string; status: StudentStatus
  } | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const openSettings = () => {
    if (!detail) return
    setEditValues({
      firstName: detail.student.firstName,
      lastName: detail.student.lastName,
      email: detail.student.email ?? '',
      phone: detail.student.phone ?? '',
      status: detail.student.status,
    })
    setActiveTab('settings')
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !editValues) return
    setSettingsError(null)
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          firstName: editValues.firstName,
          lastName: editValues.lastName,
          email: editValues.email.trim() || null,
          phone: editValues.phone.trim() || null,
          status: editValues.status,
        },
      })
      showToast({ title: 'Profile updated', description: 'Student details saved.', tone: 'success' })
    } catch (err) {
      const ae = err as AxiosError<ApiResponse<unknown>>
      setSettingsError(ae.response?.data?.message || 'Unable to save changes')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !detail) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-sm font-medium text-rose-700">Student not found or failed to load.</p>
        <Link to="/students" className="mt-2 inline-block text-sm text-emerald-700 hover:underline">← Back to students</Link>
      </div>
    )
  }

  const { student, parents, fees, exams, attendance, homework } = detail
  const fullName = `${student.firstName} ${student.lastName}`
  const initials = `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase()
  const bg = avatarColor(fullName)

  // Infer class/section from most recent attendance record
  const latestAttendance = attendance[0]
  const currentClass = latestAttendance?.className ?? null
  const currentSection = latestAttendance?.sectionName ?? null

  // Attendance stats
  const totalAttendance = attendance.length
  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length
  const attendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : null

  // Fee stats
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
  const paidFees = fees.filter((f) => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0)
  const pendingFees = fees.filter((f) => f.status === 'PENDING' || f.status === 'PARTIALLY_PAID').reduce((sum, f) => sum + f.amount, 0)

  return (
    <section className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/students" className="hover:text-emerald-700">Students</Link>
        <span>/</span>
        <span className="text-slate-800">{fullName}</span>
      </div>

      {/* Hero card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Top strip */}
        <div className="h-16 rounded-t-xl bg-gradient-to-r from-slate-800 to-slate-700" />

        <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-5">
          <div className="flex items-end gap-4" style={{ marginTop: '-32px' }}>
            {/* Avatar */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white text-xl font-bold text-white shadow-md"
              style={{ backgroundColor: bg }}
            >
              {initials}
            </div>
            <div className="mb-1">
              <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-500">{student.admissionNo}</span>
                {currentClass ? (
                  <span className="text-xs text-slate-500">
                    Class {currentClass}{currentSection ? ` – ${currentSection}` : ''}
                  </span>
                ) : null}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[student.status]}`}>
                  {STATUS_LABELS[student.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 pb-1">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{fees.length}</p>
              <p className="text-xs text-slate-500">Fee Items</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{exams.length}</p>
              <p className="text-xs text-slate-500">Exams</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${attendancePct !== null && attendancePct < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                {attendancePct !== null ? `${attendancePct}%` : '—'}
              </p>
              <p className="text-xs text-slate-500">Attendance</p>
            </div>
            <button
              type="button"
              onClick={openSettings}
              className="self-end rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-t border-slate-100 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Personal Information">
            <InfoRow label="Full Name" value={fullName} />
            <InfoRow label="Date of Birth" value={student.dateOfBirth} />
            <InfoRow label="Gender" value={<span className="capitalize">{student.gender.toLowerCase()}</span>} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone} />
            <InfoRow label="Enrolled" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : null} />
          </SectionCard>

          <SectionCard title="Academic Snapshot">
            <InfoRow label="Class" value={currentClass} />
            <InfoRow label="Section" value={currentSection} />
            <InfoRow label="Admission No" value={<span className="font-mono text-xs">{student.admissionNo}</span>} />
            <InfoRow label="Status" value={
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[student.status]}`}>
                {STATUS_LABELS[student.status]}
              </span>
            } />
            <InfoRow label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : '—'} />
            <InfoRow label="Fee Balance" value={
              pendingFees > 0
                ? <span className="text-rose-600">₹{pendingFees.toLocaleString()} pending</span>
                : <span className="text-emerald-600">All clear</span>
            } />
          </SectionCard>

          {homework.length > 0 ? (
            <div className="lg:col-span-2">
              <SectionCard title="Recent Homework">
                <div className="divide-y divide-slate-50">
                  {homework.slice(0, 5).map((hw) => (
                    <div key={hw.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium text-slate-800">{hw.title}</span>
                      <div className="flex items-center gap-3 text-slate-500">
                        {hw.className ? <span className="text-xs">Class {hw.className}{hw.sectionName ? `-${hw.sectionName}` : ''}</span> : null}
                        {hw.dueDate ? <span className="text-xs">Due {hw.dueDate}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'academics' && (
        <div className="space-y-4">
          <SectionCard title="Exam Results">
            {exams.length === 0 ? (
              <p className="text-sm text-slate-400">No exam results recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                      <th className="pb-2 pr-4">Exam</th>
                      <th className="pb-2 pr-4">Subject</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Marks</th>
                      <th className="pb-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {exams.map((exam) => (
                      <tr key={exam.resultId}>
                        <td className="py-2.5 pr-4 font-medium text-slate-800">{exam.examTitle ?? '—'}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{exam.subject ?? '—'}</td>
                        <td className="py-2.5 pr-4 text-slate-500">{exam.examDate ?? '—'}</td>
                        <td className="py-2.5 pr-4 font-medium text-slate-800">{exam.marksObtained}</td>
                        <td className="py-2.5">
                          {exam.grade ? (
                            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${GRADE_COLORS[exam.grade] ?? 'bg-slate-100 text-slate-600'}`}>
                              {exam.grade}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Days', value: totalAttendance },
              { label: 'Present', value: presentCount, color: 'text-emerald-600' },
              { label: 'Absent', value: attendance.filter((a) => a.status === 'ABSENT').length, color: 'text-rose-600' },
              { label: 'Percentage', value: attendancePct !== null ? `${attendancePct}%` : '—', color: attendancePct !== null && attendancePct < 75 ? 'text-rose-600' : 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className={`text-2xl font-bold ${s.color ?? 'text-slate-900'}`}>{s.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <SectionCard title="Attendance Records">
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-400">No attendance records found.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {attendance.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${rec.status === 'PRESENT' ? 'bg-emerald-500' : rec.status === 'ABSENT' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                      <span className="font-medium text-slate-800">{rec.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      {rec.className ? <span className="text-xs">Class {rec.className}{rec.sectionName ? `-${rec.sectionName}` : ''}</span> : null}
                      <span className={`text-xs font-medium capitalize ${rec.status === 'PRESENT' ? 'text-emerald-600' : rec.status === 'ABSENT' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {rec.status.toLowerCase()}
                      </span>
                      {rec.remarks ? <span className="text-xs text-slate-400 italic">{rec.remarks}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Assigned', value: `₹${totalFees.toLocaleString()}` },
              { label: 'Paid', value: `₹${paidFees.toLocaleString()}`, color: 'text-emerald-600' },
              { label: 'Pending', value: `₹${pendingFees.toLocaleString()}`, color: pendingFees > 0 ? 'text-rose-600' : 'text-slate-900' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className={`text-xl font-bold ${s.color ?? 'text-slate-900'}`}>{s.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <SectionCard title="Fee Assignments">
            {fees.length === 0 ? (
              <p className="text-sm text-slate-400">No fee assignments found.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {fees.map((fee) => {
                  const isPaid = fee.status === 'PAID'
                  const isPending = fee.status === 'PENDING' || fee.status === 'PARTIALLY_PAID'
                  return (
                    <div key={fee.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{fee.title}</p>
                        {fee.dueDate ? <p className="text-xs text-slate-400">Due {fee.dueDate}</p> : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">₹{fee.amount.toLocaleString()}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isPaid ? 'bg-emerald-100 text-emerald-700' : isPending ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          {fee.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'parents' && (
        <SectionCard title="Parent / Guardian Contacts">
          {parents.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-slate-400">No parent links found.</p>
              <p className="mt-1 text-xs text-slate-400">Link parents via the Parent Links admin page.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {parents.map((parent) => (
                <div key={parent.parentUserId} className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                    {(parent.parentName ?? '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{parent.parentName ?? 'Unknown'}</p>
                    <div className="mt-0.5 flex gap-3 text-xs text-slate-500">
                      {parent.parentPhone ? <span>{parent.parentPhone}</span> : null}
                      {parent.parentEmail ? <span>{parent.parentEmail}</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === 'documents' && (
        <SectionCard title="Documents">
          <div className="py-8 text-center">
            <svg className="mx-auto mb-2 h-10 w-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">Document management coming soon</p>
            <p className="mt-1 text-xs text-slate-400">Upload ID proof, birth certificate, transfer certificate, and more.</p>
          </div>
        </SectionCard>
      )}

      {activeTab === 'settings' && (
        <SectionCard title="Edit Student Profile">
          {editValues ? (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="First Name" value={editValues.firstName} onChange={(v) => setEditValues((p) => p ? { ...p, firstName: v } : p)} required />
                <FormInput label="Last Name" value={editValues.lastName} onChange={(v) => setEditValues((p) => p ? { ...p, lastName: v } : p)} required />
                <FormInput label="Phone" value={editValues.phone} onChange={(v) => setEditValues((p) => p ? { ...p, phone: v } : p)} placeholder="+91-XXXXXXXXXX" />
                <FormInput label="Email" type="email" value={editValues.email} onChange={(v) => setEditValues((p) => p ? { ...p, email: v } : p)} placeholder="student@example.com" />
                <div className="sm:col-span-2">
                  <FormSelect
                    label="Status"
                    value={editValues.status}
                    onChange={(v) => setEditValues((p) => p ? { ...p, status: (v as StudentStatus) || 'ACTIVE' } : p)}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </div>

              {settingsError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{settingsError}</p>
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="py-4 text-center">
              <button type="button" onClick={openSettings} className="text-sm text-emerald-700 hover:underline">
                Load edit form
              </button>
            </div>
          )}

          {/* Danger zone */}
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <h4 className="text-sm font-semibold text-rose-700">Danger Zone</h4>
            <p className="mt-1 text-xs text-slate-500">Deleting a student is a soft-delete — the record is retained in audit logs.</p>
            <Link
              to="/students"
              className="mt-3 inline-block rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              ← Back to Students
            </Link>
          </div>
        </SectionCard>
      )}
    </section>
  )
}
