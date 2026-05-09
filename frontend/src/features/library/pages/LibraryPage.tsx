import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type BookStatus = 'AVAILABLE' | 'ISSUED' | 'LOST'
type LibraryTab = 'catalog' | 'circulation'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  totalCopies: number
  availableCopies: number
  status: BookStatus
  addedOn: string
}

interface IssueRecord {
  id: string
  bookId: string
  bookTitle: string
  memberName: string
  memberType: 'STUDENT' | 'TEACHER' | 'STAFF'
  memberClass: string
  issueDate: string
  dueDate: string
  returnDate: string
  fine: number
  returned: boolean
}

const CATEGORY_STYLE: Record<string, string> = {
  Science: 'bg-sky-100 text-sky-700',
  Mathematics: 'bg-indigo-100 text-indigo-700',
  Literature: 'bg-pink-100 text-pink-700',
  History: 'bg-amber-100 text-amber-700',
  Reference: 'bg-slate-100 text-slate-600',
  Fiction: 'bg-violet-100 text-violet-700',
  Other: 'bg-slate-100 text-slate-500',
}

const today = new Date().toISOString().slice(0, 10)

function addDays(date: string, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function LibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('catalog')
  const [books, setBooks] = useState<Book[]>([])
  const [records, setRecords] = useState<IssueRecord[]>([])
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', category: 'Other', totalCopies: 1 })
  const [issueForm, setIssueForm] = useState({ bookId: '', memberName: '', memberType: 'STUDENT' as IssueRecord['memberType'], memberClass: '', issueDate: today, dueDate: addDays(today, 14) })
  const [showBookForm, setShowBookForm] = useState(false)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [search, setSearch] = useState('')

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.includes(search),
  )

  const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0)
  const totalIssued = records.filter((r) => !r.returned).length
  const overdueCount = records.filter((r) => !r.returned && r.dueDate < today).length

  const handleAddBook = (e: FormEvent) => {
    e.preventDefault()
    if (!bookForm.title.trim()) return
    setBooks((prev) => [{
      id: crypto.randomUUID(),
      ...bookForm,
      totalCopies: Number(bookForm.totalCopies),
      availableCopies: Number(bookForm.totalCopies),
      status: 'AVAILABLE',
      addedOn: today,
    }, ...prev])
    setBookForm({ title: '', author: '', isbn: '', category: 'Other', totalCopies: 1 })
    setShowBookForm(false)
  }

  const handleIssue = (e: FormEvent) => {
    e.preventDefault()
    const book = books.find((b) => b.id === issueForm.bookId)
    if (!book || book.availableCopies < 1 || !issueForm.memberName.trim()) return
    setBooks((prev) => prev.map((b) =>
      b.id === issueForm.bookId
        ? { ...b, availableCopies: b.availableCopies - 1, status: b.availableCopies - 1 === 0 ? 'ISSUED' : 'AVAILABLE' }
        : b,
    ))
    setRecords((prev) => [{
      id: crypto.randomUUID(),
      bookId: issueForm.bookId,
      bookTitle: book.title,
      ...issueForm,
      returnDate: '',
      fine: 0,
      returned: false,
    }, ...prev])
    setIssueForm((p) => ({ ...p, bookId: '', memberName: '', memberClass: '' }))
    setShowIssueForm(false)
  }

  const handleReturn = (recordId: string) => {
    const rec = records.find((r) => r.id === recordId)
    if (!rec) return
    const fine = rec.dueDate < today ? Math.max(0, Math.ceil((new Date(today).getTime() - new Date(rec.dueDate).getTime()) / 86400000)) * 2 : 0
    setRecords((prev) => prev.map((r) => r.id === recordId ? { ...r, returned: true, returnDate: today, fine } : r))
    setBooks((prev) => prev.map((b) => b.id === rec.bookId ? { ...b, availableCopies: b.availableCopies + 1, status: 'AVAILABLE' } : b))
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Library"
        subtitle="Manage the school library catalog, track book issues and returns."
        badge={{ label: `${books.length} Book${books.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Copies</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalBooks}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Titles</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{books.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Issued</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{totalIssued}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${overdueCount > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Overdue</p>
          <p className={`mt-1 text-2xl font-bold ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{overdueCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['catalog', 'circulation'] as LibraryTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <input type="text" placeholder="Search by title, author or ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="button" onClick={() => setShowBookForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition whitespace-nowrap">
              {showBookForm ? 'Cancel' : '+ Add Book'}
            </button>
          </div>

          {showBookForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Add Book to Catalog</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddBook}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" placeholder="Book title" value={bookForm.title} onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm((p) => ({ ...p, author: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="ISBN (optional)" value={bookForm.isbn} onChange={(e) => setBookForm((p) => ({ ...p, isbn: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={bookForm.category} onChange={(e) => setBookForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    {Object.keys(CATEGORY_STYLE).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Total Copies</label>
                    <input type="number" min={1} value={bookForm.totalCopies} onChange={(e) => setBookForm((p) => ({ ...p, totalCopies: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
                <Button type="submit">Add to Catalog</Button>
              </form>
            </Card>
          )}

          {filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">{books.length === 0 ? 'No books yet. Add the first one above.' : 'No books match your search.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{book.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLE[book.category] ?? CATEGORY_STYLE.Other}`}>{book.category}</span>
                      {book.availableCopies === 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">ALL ISSUED</span>}
                    </div>
                    {book.author && <p className="mt-0.5 text-xs text-slate-500">by {book.author}{book.isbn ? ` · ISBN: ${book.isbn}` : ''}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{book.availableCopies}/{book.totalCopies}</p>
                    <p className="text-[10px] text-slate-400">available</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'circulation' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowIssueForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showIssueForm ? 'Cancel' : '+ Issue Book'}
            </button>
          </div>

          {showIssueForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Issue Book</h2>
              <form className="mt-3 space-y-3" onSubmit={handleIssue}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={issueForm.bookId} onChange={(e) => setIssueForm((p) => ({ ...p, bookId: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="">Select book…</option>
                    {books.filter((b) => b.availableCopies > 0).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} left)</option>)}
                  </select>
                  <input type="text" placeholder="Member name" value={issueForm.memberName} onChange={(e) => setIssueForm((p) => ({ ...p, memberName: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <select value={issueForm.memberType} onChange={(e) => setIssueForm((p) => ({ ...p, memberType: e.target.value as IssueRecord['memberType'] }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="STAFF">Staff</option>
                  </select>
                  <input type="text" placeholder="Class / Section (if student)" value={issueForm.memberClass} onChange={(e) => setIssueForm((p) => ({ ...p, memberClass: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Issue Date</label>
                    <input type="date" value={issueForm.issueDate} onChange={(e) => setIssueForm((p) => ({ ...p, issueDate: e.target.value, dueDate: addDays(e.target.value, 14) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Due Date</label>
                    <input type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm((p) => ({ ...p, dueDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
                <Button type="submit">Issue Book</Button>
              </form>
            </Card>
          )}

          {records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No circulation records. Issue a book above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((rec) => {
                const overdue = !rec.returned && rec.dueDate < today
                return (
                  <div key={rec.id} className={`rounded-2xl border bg-white px-5 py-4 shadow-sm ${overdue ? 'border-rose-200' : rec.returned ? 'border-emerald-200' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950">{rec.bookTitle}</p>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{rec.memberType}</span>
                          {rec.returned && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">RETURNED</span>}
                          {overdue && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">OVERDUE</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{rec.memberName}{rec.memberClass ? ` · ${rec.memberClass}` : ''} · Issued {rec.issueDate} · Due {rec.dueDate}</p>
                        {rec.returned && <p className="mt-0.5 text-xs text-emerald-600">Returned {rec.returnDate}{rec.fine > 0 ? ` · Fine: ₹${rec.fine}` : ''}</p>}
                      </div>
                      {!rec.returned && (
                        <button type="button" onClick={() => handleReturn(rec.id)} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition whitespace-nowrap">Return</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
