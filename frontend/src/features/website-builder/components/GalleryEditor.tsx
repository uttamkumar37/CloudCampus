import { useState } from 'react'
import { useAddGalleryItem, useDeleteGalleryItem, useGallery } from '../hooks/useWebsite'

const SAMPLE_IMAGES = [
  { label: 'Classroom', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80' },
  { label: 'Library', url: 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=400&q=80' },
  { label: 'Sports', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { label: 'Science Lab', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80' },
  { label: 'Auditorium', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80' },
  { label: 'Garden', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80' },
]

export function GalleryEditor() {
  const { data, isLoading } = useGallery()
  const addItem = useAddGalleryItem()
  const deleteItem = useDeleteGalleryItem()

  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showSamples, setShowSamples] = useState(false)

  const items = data?.data ?? []
  const hasUrl = imageUrl.trim().length > 0

  async function handleAdd() {
    if (!imageUrl.trim()) return
    await addItem.mutateAsync({
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
      displayOrder: items.length,
      visible: true,
    })
    setImageUrl('')
    setCaption('')
    setPreviewError(false)
  }

  function useSample(url: string, label: string) {
    setImageUrl(url)
    setCaption(label)
    setPreviewError(false)
    setShowSamples(false)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-100 cc-skeleton-shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add panel */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Add New Photo</h3>
          <button
            onClick={() => setShowSamples((v) => !v)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {showSamples ? 'Hide samples' : 'Use a sample image ↓'}
          </button>
        </div>

        {/* Sample images */}
        {showSamples && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SAMPLE_IMAGES.map((s) => (
              <button
                key={s.url}
                onClick={() => useSample(s.url, s.label)}
                className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-400 transition-all"
              >
                <img src={s.url} alt={s.label} className="w-full h-14 object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="field-label">Image URL <span className="text-red-400">*</span></label>
            <input
              className="cc-input"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setPreviewError(false) }}
            />
          </div>
          <div className="space-y-1">
            <label className="field-label">Caption <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              className="cc-input"
              placeholder="e.g. Annual Science Fair 2025"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>

        {/* Preview + Add row */}
        <div className="flex gap-4 items-start">
          {/* Live preview */}
          <div className={`relative shrink-0 w-28 h-20 rounded-xl border-2 overflow-hidden transition-all ${
            hasUrl && !previewError
              ? 'border-emerald-300 shadow-sm'
              : 'border-dashed border-slate-200 bg-white'
          }`}>
            {hasUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-1">Preview</span>
              </div>
            )}
            {previewError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs mt-0.5">Bad URL</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-end gap-2">
            {previewError && (
              <p className="text-xs text-red-500">The image URL doesn't seem to load. Check the link and try again.</p>
            )}
            <button
              onClick={handleAdd}
              disabled={addItem.isPending || !hasUrl || previewError}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {addItem.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Adding…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Gallery
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          Gallery Photos{' '}
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
            {items.length}
          </span>
        </p>
        {items.length > 0 && (
          <p className="text-xs text-slate-400">Hover a photo to remove it</p>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-slate-500">No photos yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first photo using the form above</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white"
          >
            <img
              src={item.imageUrl}
              alt={item.caption ?? ''}
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Image'
              }}
            />
            {/* Caption overlay */}
            {item.caption && (
              <div className="px-2 py-1.5 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-600 truncate">{item.caption}</p>
              </div>
            )}
            {/* Delete overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => setConfirmDelete(item.id ?? '')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 space-y-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Remove this photo?</h3>
              <p className="text-sm text-slate-500 mt-1">It will be removed from your public gallery immediately.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { deleteItem.mutate(confirmDelete); setConfirmDelete(null) }}
                disabled={deleteItem.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
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
