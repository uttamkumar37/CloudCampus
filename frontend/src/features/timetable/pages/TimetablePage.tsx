import { useState } from 'react'

import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import { PageHeader } from '../../../components/ui/PageHeader'
import type { ApiResponse } from '../../../types/api'

interface Slot {
  id: string
  classId: string
  sectionId: string
  subjectId: string
  teacherId: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  label: string | null
}

export function TimetablePage() {
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!classId.trim() || !sectionId.trim()) {
      setError('Enter class and section UUIDs.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get<ApiResponse<Slot[]>>(
        `${ENDPOINTS.timetable.base}/classes/${classId.trim()}/sections/${sectionId.trim()}`,
      )
      if (!data.success) {
        setError(data.message)
        setSlots([])
        return
      }
      setSlots(data.data ?? [])
    } catch {
      setError('Failed to load timetable.')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Timetable" subtitle="Weekly slots for a class section (day 1 = Monday … 7 = Sunday)." />
      <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-white p-4 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Class ID</span>
          <input
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Section ID</span>
          <input
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="self-end rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      <div className="space-y-2">
        {slots?.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
            <span className="font-semibold text-slate-900">Day {s.dayOfWeek}</span>{' '}
            <span className="text-slate-600">
              {s.startTime}–{s.endTime}
            </span>
            {s.label ? <span className="ml-2 text-slate-500">({s.label})</span> : null}
            <p className="mt-1 font-mono text-xs text-slate-500">subject {s.subjectId}</p>
          </div>
        ))}
        {slots && slots.length === 0 && !loading ? (
          <p className="text-sm text-slate-500">No slots yet. Admins/teachers can POST slots via API.</p>
        ) : null}
      </div>
    </section>
  )
}
