import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT'
type NoticeRole = 'ALL' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

interface Notice {
  id: string
  title: string
  content: string
  targetRole: NoticeRole
  priority: NoticePriority
  postedOn: string
}

const PRIORITY_STYLE: Record<NoticePriority, string> = {
  NORMAL: 'bg-slate-100 text-slate-600',
  IMPORTANT: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-rose-100 text-rose-700',
}

const ROLE_STYLE: Record<NoticeRole, string> = {
  ALL: 'bg-emerald-100 text-emerald-700',
  SCHOOL_ADMIN: 'bg-violet-100 text-violet-700',
  TEACHER: 'bg-sky-100 text-sky-700',
  STUDENT: 'bg-blue-100 text-blue-700',
  PARENT: 'bg-orange-100 text-orange-700',
}

const today = new Date().toISOString().slice(0, 10)

const emptyForm = { title: '', content: '', targetRole: 'ALL' as NoticeRole, priority: 'NORMAL' as NoticePriority }

export function NoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [form, setForm] = useState(emptyForm)
  const [filterRole, setFilterRole] = useState<NoticeRole | 'ALL'>('ALL')

  const visible = filterRole === 'ALL' ? notices : notices.filter((n) => n.targetRole === filterRole || n.targetRole === 'ALL')

  const handlePost = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setNotices((prev) => [
      { id: crypto.randomUUID(), ...form, postedOn: today },
      ...prev,
    ])
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => setNotices((prev) => prev.filter((n) => n.id !== id))

  return (
    <section className="space-y-6">
      <PageHeader
        title="Notice Board"
        subtitle="Post and manage school-wide notices by role and priority."
        badge={{ label: `${notices.length} Notice${notices.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {(['ALL', 'TEACHER', 'STUDENT', 'PARENT'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setFilterRole(role)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${filterRole === role ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {role === 'ALL' ? 'All Notices' : role.charAt(0) + role.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-70">
              {role === 'ALL' ? notices.length : notices.filter((n) => n.targetRole === role || n.targetRole === 'ALL').length}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Post a Notice</h2>
        <form className="mt-4 space-y-3" onSubmit={handlePost}>
          <input
            type="text"
            placeholder="Notice title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <textarea
            placeholder="Notice content…"
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            required
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Target Audience</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm((p) => ({ ...p, targetRole: e.target.value as NoticeRole }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="ALL">Everyone</option>
                <option value="SCHOOL_ADMIN">Admin only</option>
                <option value="TEACHER">Teachers</option>
                <option value="STUDENT">Students</option>
                <option value="PARENT">Parents</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as NoticePriority }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <Button type="submit">Post Notice</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No notices yet. Post the first one above.</p>
          </div>
        ) : (
          visible.map((notice) => (
            <div key={notice.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${notice.priority === 'URGENT' ? 'border-rose-200' : notice.priority === 'IMPORTANT' ? 'border-amber-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{notice.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[notice.priority]}`}>{notice.priority}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLE[notice.targetRole]}`}>
                      {notice.targetRole === 'ALL' ? 'Everyone' : notice.targetRole.charAt(0) + notice.targetRole.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{notice.content}</p>
                  <p className="mt-2 text-xs text-slate-400">Posted {notice.postedOn}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(notice.id)}
                  className="shrink-0 text-xs text-slate-400 hover:text-rose-500 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
