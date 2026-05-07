import { useState } from 'react'
import {
  useDeleteWebsiteSection,
  useUpsertWebsiteSection,
  useWebsiteSections,
} from '../hooks/useWebsite'
import type { WebsiteSection } from '../types'

const SECTION_DEFS: { key: string; label: string; desc: string; icon: string }[] = [
  {
    key: 'hero',
    label: 'Hero Banner',
    desc: 'Full-width headline at the top of your site',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
  {
    key: 'about',
    label: 'About Us',
    desc: 'School history, values, and overview',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'vision',
    label: 'Vision & Mission',
    desc: 'Two-column vision and mission cards',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
  {
    key: 'admissions',
    label: 'Admissions',
    desc: 'Enquiry form and admission info',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    key: 'gallery',
    label: 'Photo Gallery',
    desc: 'Grid of school photos',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    key: 'notices',
    label: 'Notice Board',
    desc: 'Announcements and upcoming events',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  {
    key: 'contact',
    label: 'Contact Us',
    desc: 'Address, phone, email, and social links',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
]

const ORDER_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

export function SectionsEditor() {
  const { data, isLoading } = useWebsiteSections()
  const upsert = useUpsertWebsiteSection()
  const remove = useDeleteWebsiteSection()

  const sections = data?.data ?? []
  const sectionMap = Object.fromEntries(sections.map((s) => [s.sectionKey, s]))

  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<WebsiteSection>>({})
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  function startEdit(key: string) {
    const existing = sectionMap[key]
    setFormData(
      existing ?? {
        sectionKey: key,
        title: '',
        subtitle: '',
        bodyJson: {},
        displayOrder: SECTION_DEFS.findIndex((s) => s.key === key) + 1,
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

  async function handleToggleVisible(s: WebsiteSection) {
    await upsert.mutateAsync({ ...s, visible: !s.visible })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 cc-skeleton-shimmer" />
        ))}
      </div>
    )
  }

  const editingDef = SECTION_DEFS.find((s) => s.key === editing)

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Manage which sections appear on your public website, customise their headings, and control the order.
      </p>

      {SECTION_DEFS.map(({ key, label, desc, icon }) => {
        const existing = sectionMap[key]
        const isConfigured = !!existing
        const isVisible = existing?.visible ?? false

        return (
          <div
            key={key}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              isConfigured
                ? isVisible
                  ? 'border-emerald-100 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50'
                : 'border-dashed border-slate-200 bg-white'
            }`}
          >
            {/* Icon */}
            <div
              className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${
                isConfigured && isVisible
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                {isConfigured && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isVisible
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isVisible ? 'Visible' : 'Hidden'}
                  </span>
                )}
                {!isConfigured && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                    Not set up
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {existing?.title ? `"${existing.title}"` : desc}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle visible */}
              {isConfigured && (
                <button
                  onClick={() => handleToggleVisible(existing)}
                  disabled={upsert.isPending}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                    isVisible ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  title={isVisible ? 'Click to hide' : 'Click to show'}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      isVisible ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              )}

              <button
                onClick={() => startEdit(key)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                {isConfigured ? 'Edit' : 'Set Up'}
              </button>

              {isConfigured && (
                <button
                  onClick={() => setConfirmRemove(key)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-red-100 text-red-500 hover:bg-red-50 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={editingDef?.icon ?? ''} />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{editingDef?.label}</h3>
                <p className="text-xs text-slate-400">{editingDef?.desc}</p>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <label className="field-label">Section Heading</label>
                <input
                  className="cc-input"
                  placeholder={`e.g. ${editingDef?.label}`}
                  value={formData.title ?? ''}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="field-label">Sub-heading / Tagline</label>
                <input
                  className="cc-input"
                  placeholder="Optional short description under the heading"
                  value={formData.subtitle ?? ''}
                  onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="field-label">Display Order</label>
                <select
                  className="cc-input appearance-none"
                  value={formData.displayOrder ?? 1}
                  onChange={(e) => setFormData((p) => ({ ...p, displayOrder: Number(e.target.value) }))}
                >
                  {ORDER_OPTIONS.map((n) => (
                    <option key={n} value={n}>Position {n}{n === 1 ? ' (top)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-sm text-slate-700">Show on public website</span>
                <button
                  onClick={() => setFormData((p) => ({ ...p, visible: !p.visible }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.visible ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      formData.visible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleSave}
                disabled={upsert.isPending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {upsert.isPending ? 'Saving…' : 'Save Section'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm remove dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-800">Remove section?</h3>
              <p className="text-sm text-slate-500 mt-1">
                This will remove <strong>{SECTION_DEFS.find((s) => s.key === confirmRemove)?.label}</strong> from your public website. You can re-add it anytime.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { remove.mutate(confirmRemove); setConfirmRemove(null) }}
                disabled={remove.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {remove.isPending ? 'Removing…' : 'Remove'}
              </button>
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
