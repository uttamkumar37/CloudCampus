import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type CommTab = 'inbox' | 'broadcast'
type MessageStatus = 'UNREAD' | 'READ' | 'REPLIED'
type BroadcastPriority = 'NORMAL' | 'URGENT' | 'EMERGENCY'

interface Message {
  id: string
  from: string
  role: 'PARENT' | 'TEACHER' | 'STUDENT'
  subject: string
  body: string
  receivedOn: string
  status: MessageStatus
  reply: string
}

interface Broadcast {
  id: string
  title: string
  body: string
  targetRole: 'ALL' | 'PARENT' | 'TEACHER' | 'STUDENT'
  priority: BroadcastPriority
  sentOn: string
}

const MSG_STATUS_STYLE: Record<MessageStatus, string> = {
  UNREAD: 'bg-sky-100 text-sky-700',
  READ: 'bg-slate-100 text-slate-600',
  REPLIED: 'bg-emerald-100 text-emerald-700',
}

const BROADCAST_STYLE: Record<BroadcastPriority, string> = {
  NORMAL: 'border-slate-200 bg-white',
  URGENT: 'border-amber-200 bg-amber-50',
  EMERGENCY: 'border-rose-200 bg-rose-50',
}

const PRIORITY_BADGE: Record<BroadcastPriority, string> = {
  NORMAL: 'bg-slate-100 text-slate-600',
  URGENT: 'bg-amber-100 text-amber-700',
  EMERGENCY: 'bg-rose-100 text-rose-700',
}

const today = new Date().toISOString().slice(0, 10)

const SAMPLE_MESSAGES: Message[] = [
  { id: '1', from: 'Ramesh Sharma (Parent)', role: 'PARENT', subject: 'Regarding leave application', body: 'My daughter Aarti will be absent for 3 days due to a family function. Please approve the leave.', receivedOn: today, status: 'UNREAD', reply: '' },
  { id: '2', from: 'Mrs. Priya (Teacher)', role: 'TEACHER', subject: 'Class 8B test postponed', body: 'I wanted to inform the admin that the Math test for 8B has been moved to next Friday.', receivedOn: today, status: 'READ', reply: '' },
]

export function CommunicationPage() {
  const [tab, setTab] = useState<CommTab>('inbox')
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', targetRole: 'ALL' as Broadcast['targetRole'], priority: 'NORMAL' as BroadcastPriority })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const unread = messages.filter((m) => m.status === 'UNREAD').length

  const handleBroadcast = (e: FormEvent) => {
    e.preventDefault()
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) return
    setBroadcasts((prev) => [{ id: crypto.randomUUID(), ...broadcastForm, sentOn: today }, ...prev])
    setBroadcastForm((p) => ({ ...p, title: '', body: '' }))
  }

  const handleReply = (id: string) => {
    if (!replyText.trim()) return
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: 'REPLIED', reply: replyText } : m))
    setReplyingTo(null)
    setReplyText('')
  }

  const markRead = (id: string) =>
    setMessages((prev) => prev.map((m) => m.id === id && m.status === 'UNREAD' ? { ...m, status: 'READ' } : m))

  return (
    <section className="space-y-6">
      <PageHeader
        title="Communication"
        subtitle="Manage parent and teacher messages, and send emergency broadcasts to stakeholders."
        badge={{ label: unread > 0 ? `${unread} Unread` : 'Inbox', tone: unread > 0 ? 'red' : 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Messages</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{messages.length}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${unread > 0 ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${unread > 0 ? 'text-sky-600' : 'text-slate-500'}`}>Unread</p>
          <p className={`mt-1 text-2xl font-bold ${unread > 0 ? 'text-sky-700' : 'text-slate-900'}`}>{unread}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Broadcasts Sent</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{broadcasts.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['inbox', 'broadcast'] as CommTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t === 'inbox' ? `Inbox${unread > 0 ? ` (${unread})` : ''}` : 'Emergency Broadcast'}
          </button>
        ))}
      </div>

      {tab === 'inbox' && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No messages in inbox.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${msg.status === 'UNREAD' ? 'border-sky-200' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{msg.subject}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${MSG_STATUS_STYLE[msg.status]}`}>{msg.status}</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{msg.role}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{msg.from} · {msg.receivedOn}</p>
                    <p className="mt-2 text-sm text-slate-700">{msg.body}</p>
                    {msg.reply && <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700"><span className="font-semibold">Your reply: </span>{msg.reply}</div>}
                    {replyingTo === msg.id && (
                      <div className="mt-3 flex gap-2">
                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} placeholder="Type reply…" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
                        <div className="flex flex-col gap-1">
                          <button type="button" onClick={() => handleReply(msg.id)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition">Send</button>
                          <button type="button" onClick={() => setReplyingTo(null)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {msg.status === 'UNREAD' && <button type="button" onClick={() => markRead(msg.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition">Mark Read</button>}
                  {msg.status !== 'REPLIED' && replyingTo !== msg.id && <button type="button" onClick={() => { setReplyingTo(msg.id); markRead(msg.id) }} className="rounded-lg bg-sky-100 px-3 py-1 text-[10px] font-semibold text-sky-700 hover:bg-sky-200 transition">Reply</button>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">Send Emergency Broadcast</h2>
            <p className="text-sm text-slate-500 mt-0.5">Push critical alerts to all or selected stakeholders immediately.</p>
            <form className="mt-4 space-y-3" onSubmit={handleBroadcast}>
              <div className="grid gap-3 sm:grid-cols-3">
                <select value={broadcastForm.targetRole} onChange={(e) => setBroadcastForm((p) => ({ ...p, targetRole: e.target.value as Broadcast['targetRole'] }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="ALL">All Stakeholders</option>
                  <option value="PARENT">Parents Only</option>
                  <option value="TEACHER">Teachers Only</option>
                  <option value="STUDENT">Students Only</option>
                </select>
                <select value={broadcastForm.priority} onChange={(e) => setBroadcastForm((p) => ({ ...p, priority: e.target.value as BroadcastPriority }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
                <input type="text" placeholder="Broadcast title" value={broadcastForm.title} onChange={(e) => setBroadcastForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <textarea placeholder="Message body…" value={broadcastForm.body} onChange={(e) => setBroadcastForm((p) => ({ ...p, body: e.target.value }))} required rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
              {broadcastForm.priority === 'EMERGENCY' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <strong>Emergency alert</strong> — this will be sent immediately to all selected recipients.
                </div>
              )}
              <Button type="submit">Send Broadcast</Button>
            </form>
          </Card>

          {broadcasts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Sent Broadcasts</h3>
              {broadcasts.map((b) => (
                <div key={b.id} className={`rounded-2xl border p-5 shadow-sm ${BROADCAST_STYLE[b.priority]}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{b.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGE[b.priority]}`}>{b.priority}</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">→ {b.targetRole}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{b.body}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Sent {b.sentOn}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
