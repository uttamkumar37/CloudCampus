import { useState } from 'react'
import type { BlogPost } from '../types'

const STORAGE_KEY = 'wb_blog_posts'
const CATEGORIES = ['Academic', 'Achievement', 'Event', 'Sports', 'News', 'Other'] as const

function load(): BlogPost[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function save(posts: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function slugify(s: string) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') }

const EMPTY: Omit<BlogPost, 'id' | 'createdAt'> = {
  title: '', slug: '', excerpt: '', content: '', coverImageUrl: '',
  author: '', category: 'News', tags: '', publishedAt: '',
  visible: true, featured: false,
}

const CATEGORY_COLORS: Record<string, string> = {
  Academic: 'bg-sky-100 text-sky-700', Achievement: 'bg-amber-100 text-amber-700',
  Event: 'bg-violet-100 text-violet-700', Sports: 'bg-emerald-100 text-emerald-700',
  News: 'bg-rose-100 text-rose-700', Other: 'bg-slate-100 text-slate-600',
}

export function BlogNewsEditor() {
  const [posts, setPosts] = useState<BlogPost[]>(load)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<Omit<BlogPost, 'id' | 'createdAt'>>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  function openNew() {
    setForm(EMPTY)
    setEditing({ id: '', createdAt: new Date().toISOString(), ...EMPTY })
  }

  function openEdit(p: BlogPost) {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, coverImageUrl: p.coverImageUrl, author: p.author, category: p.category, tags: p.tags, publishedAt: p.publishedAt, visible: p.visible, featured: p.featured })
    setEditing(p)
  }

  function handleSave() {
    if (!editing) return
    const now = new Date().toISOString()
    let updated: BlogPost[]
    if (editing.id) {
      updated = posts.map((p) => p.id === editing.id ? { ...p, ...form } : p)
    } else {
      updated = [{ id: uid(), createdAt: now, ...form, slug: form.slug || slugify(form.title) }, ...posts]
    }
    save(updated)
    setPosts(updated)
    setEditing(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete(id: string) {
    const updated = posts.filter((p) => p.id !== id)
    save(updated)
    setPosts(updated)
  }

  function toggleVisible(id: string) {
    const updated = posts.map((p) => p.id === id ? { ...p, visible: !p.visible } : p)
    save(updated)
    setPosts(updated)
  }

  const filtered = posts.filter((p) =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || p.category === filterCat)
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Blog & News
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Publish news, achievements, events, and updates on your school website. {posts.length} posts total.
          </p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Post
        </button>
      </div>

      {/* Search & filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="cc-input pl-9 text-sm" placeholder="Search posts…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="cc-input text-sm w-36 appearance-none" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Posts', value: posts.length },
          { label: 'Published', value: posts.filter((p) => p.visible).length },
          { label: 'Featured', value: posts.filter((p) => p.featured).length },
          { label: 'Drafts', value: posts.filter((p) => !p.visible).length },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
          </svg>
          <p className="font-semibold text-slate-600">No posts yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "New Post" to publish your first article</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-200 transition-all">
              {post.coverImageUrl ? (
                <img src={post.coverImageUrl} alt="" className="w-16 h-14 rounded-lg object-cover shrink-0 border border-slate-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              ) : (
                <div className="w-16 h-14 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CATEGORY_COLORS[post.category]}`}>{post.category}</span>
                  {post.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Featured</span>}
                  {!post.visible && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Draft</span>}
                </div>
                <p className="font-semibold text-slate-800 truncate">{post.title || 'Untitled Post'}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{post.excerpt || 'No excerpt'}</p>
                <p className="text-xs text-slate-300 mt-1">By {post.author || 'Unknown'} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN') : 'Not scheduled'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleVisible(post.id)} title={post.visible ? 'Hide post' : 'Publish post'}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${post.visible ? 'bg-sky-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${post.visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => openEdit(post)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Edit</button>
                <button onClick={() => handleDelete(post.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editing.id ? 'Edit Post' : 'New Blog Post'}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Post Title</label>
                  <input className="cc-input" placeholder="e.g. Students Win District Science Fair" value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Category</label>
                  <select className="cc-input appearance-none" value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as BlogPost['category'] }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Author Name</label>
                  <input className="cc-input" placeholder="e.g. Principal Sharma" value={form.author}
                    onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Cover Image URL</label>
                  <input className="cc-input" placeholder="https://images.unsplash.com/..." value={form.coverImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, coverImageUrl: e.target.value }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Excerpt / Summary</label>
                  <textarea className="cc-input resize-y" rows={2} placeholder="Short summary shown in the post listing…" value={form.excerpt}
                    onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Full Content</label>
                  <textarea className="cc-input resize-y font-mono text-xs" rows={8} placeholder="Write the full blog post content here…" value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Tags (comma-separated)</label>
                  <input className="cc-input" placeholder="CBSE, Science, Award" value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Publish Date</label>
                  <input className="cc-input" type="date" value={form.publishedAt?.slice(0, 10) ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={form.visible}
                    onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} />
                  <span className="text-sm text-slate-700">Published (visible on website)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
                  <span className="text-sm text-slate-700">Featured post</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">
                {editing.id ? 'Save Changes' : 'Publish Post'}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm font-medium">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Post saved!
        </div>
      )}
    </div>
  )
}
