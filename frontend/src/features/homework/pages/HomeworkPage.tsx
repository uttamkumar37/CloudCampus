import { useState } from 'react'

import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import { PageHeader } from '../../../components/ui/PageHeader'
import type { ApiResponse } from '../../../types/api'

interface HomeworkItem {
  id: string
  title: string
  instructions: string | null
  classId: string
  sectionId: string | null
  assignedByUserId: string
  dueDate: string | null
  createdAt: string
}

export function HomeworkPage() {
  const [classId, setClassId] = useState('')
  const [items, setItems] = useState<HomeworkItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!classId.trim()) {
      setError('Enter a class UUID (from Academic → Classes).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get<ApiResponse<HomeworkItem[]>>(
        `${ENDPOINTS.homework.base}/classes/${classId.trim()}`,
      )
      if (!data.success) {
        setError(data.message)
        setItems([])
        return
      }
      setItems(data.data ?? [])
    } catch {
      setError('Failed to load homework.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Homework"
        subtitle="List assignments for a class. Teachers and admins can create via API or future UI form."
      />
      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          <span className="mb-1 block font-medium text-slate-700">Class ID (UUID)</span>
          <input
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="00000000-0000-0000-0000-000000000000"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      <div className="space-y-3">
        {items?.map((h) => (
          <div key={h.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-semibold text-slate-900">{h.title}</p>
            {h.instructions ? <p className="mt-2 text-sm text-slate-600">{h.instructions}</p> : null}
            <p className="mt-2 text-xs text-slate-500">
              Due {h.dueDate ?? '—'} · Assigned by {h.assignedByUserId}
            </p>
          </div>
        ))}
        {items && items.length === 0 && !loading ? (
          <p className="text-sm text-slate-500">No homework for this class yet.</p>
        ) : null}
      </div>
    </section>
  )
}
