import { useState } from 'react'
import { useAddGalleryItem, useDeleteGalleryItem, useGallery } from '../hooks/useWebsite'

export function GalleryEditor() {
  const { data, isLoading } = useGallery()
  const addItem = useAddGalleryItem()
  const deleteItem = useDeleteGalleryItem()

  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')

  const items = data?.data ?? []

  async function handleAdd() {
    if (!imageUrl.trim()) return
    await addItem.mutateAsync({ imageUrl, caption, displayOrder: items.length, visible: true })
    setImageUrl('')
    setCaption('')
  }

  if (isLoading) return <p className="text-slate-500 text-sm">Loading…</p>

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="flex gap-3 items-end">
        <label className="flex-1 space-y-1">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Image URL</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        <label className="flex-1 space-y-1">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Caption</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Optional caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </label>
        <button
          onClick={handleAdd}
          disabled={addItem.isPending || !imageUrl.trim()}
          className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Grid */}
      {items.length === 0 && (
        <p className="text-sm text-slate-400">No gallery images yet. Add one above.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-200">
            <img
              src={item.imageUrl}
              alt={item.caption ?? ''}
              className="w-full h-32 object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://placehold.co/300x200?text=Image'
              }}
            />
            {item.caption && (
              <p className="text-xs px-2 py-1 text-slate-600 bg-white/80">{item.caption}</p>
            )}
            <button
              onClick={() => item.id && deleteItem.mutate(item.id)}
              className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
