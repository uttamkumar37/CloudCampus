import { useState } from 'react'
import {
  useDeleteWebsiteSection,
  useUpsertWebsiteSection,
  useWebsiteSections,
} from '../hooks/useWebsite'
import type { WebsiteSection } from '../types'

const SECTION_KEYS = [
  { key: 'hero', label: 'Hero Banner' },
  { key: 'about', label: 'About Us' },
  { key: 'vision', label: 'Vision & Mission' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'notices', label: 'Notice Board' },
  { key: 'gallery', label: 'Photo Gallery' },
  { key: 'contact', label: 'Contact Us' },
]

export function SectionsEditor() {
  const { data, isLoading } = useWebsiteSections()
  const upsert = useUpsertWebsiteSection()
  const remove = useDeleteWebsiteSection()

  const sections = data?.data ?? []
  const sectionMap = Object.fromEntries(sections.map((s) => [s.sectionKey, s]))

  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<WebsiteSection>>({})

  function startEdit(key: string) {
    const existing = sectionMap[key]
    setFormData(
      existing ?? {
        sectionKey: key,
        title: '',
        subtitle: '',
        bodyJson: {},
        displayOrder: SECTION_KEYS.findIndex((s) => s.key === key),
        visible: true,
      },
    )
    setEditing(key)
  }

  async function handleSave() {
    if (!editing) return
    await upsert.mutateAsync(formData as WebsiteSection)
    setEditing(null)
  }

  if (isLoading) return <p className="text-slate-500 text-sm">Loading…</p>

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Toggle sections visible/hidden, edit titles and content for each block.
      </p>

      <div className="divide-y divide-slate-100">
        {SECTION_KEYS.map(({ key, label }) => {
          const existing = sectionMap[key]
          return (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                {existing && (
                  <p className="text-xs text-slate-400">
                    {existing.visible ? 'Visible' : 'Hidden'} · Order {existing.displayOrder}
                  </p>
                )}
                {!existing && <p className="text-xs text-slate-400">Not configured</p>}
              </div>
              <div className="flex gap-2">
                {existing && (
                  <button
                    onClick={() =>
                      upsert.mutate({ ...existing, visible: !existing.visible })
                    }
                    className="text-xs px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {existing.visible ? 'Hide' : 'Show'}
                  </button>
                )}
                <button
                  onClick={() => startEdit(key)}
                  className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  {existing ? 'Edit' : 'Add'}
                </button>
                {existing && (
                  <button
                    onClick={() => remove.mutate(key)}
                    className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <h3 className="font-semibold text-slate-800">
              Edit {SECTION_KEYS.find((s) => s.key === editing)?.label}
            </h3>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Title</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={formData.title ?? ''}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Subtitle</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={formData.subtitle ?? ''}
                onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Display Order</span>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={formData.displayOrder ?? 0}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, displayOrder: Number(e.target.value) }))
                }
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visible ?? true}
                onChange={(e) => setFormData((p) => ({ ...p, visible: e.target.checked }))}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm text-slate-700">Visible on public site</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={upsert.isPending}
                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {upsert.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
