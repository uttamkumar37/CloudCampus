import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  priority: TaskPriority
  dueDate: string
  status: TaskStatus
  createdOn: string
}

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-sky-100 text-sky-700',
  HIGH: 'bg-rose-100 text-rose-700',
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  DONE: 'bg-emerald-100 text-emerald-700',
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
]

const today = new Date().toISOString().slice(0, 10)

export function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'MEDIUM' as TaskPriority, dueDate: '' })
  const [showForm, setShowForm] = useState(false)

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setTasks((prev) => [{ id: crypto.randomUUID(), ...form, status: 'TODO' as TaskStatus, createdOn: today }, ...prev])
    setForm({ title: '', description: '', assignedTo: '', priority: 'MEDIUM', dueDate: '' })
    setShowForm(false)
  }

  const moveTask = (id: string, status: TaskStatus) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const todo = tasks.filter((t) => t.status === 'TODO').length
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const done = tasks.filter((t) => t.status === 'DONE').length
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'DONE').length

  return (
    <section className="space-y-6">
      <PageHeader
        title="Task Board"
        subtitle="Create, assign, and track internal school admin tasks across team members."
        badge={{ label: `${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">To Do</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{todo}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{inProgress}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Done</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{done}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${overdue > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${overdue > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Overdue</p>
          <p className={`mt-1 text-2xl font-bold ${overdue > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{overdue}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">New Task</h2>
          <form className="mt-4 space-y-3" onSubmit={handleCreate}>
            <input type="text" placeholder="Task title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Assigned to" value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <Button type="submit">Create Task</Button>
          </form>
        </Card>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No tasks yet. Create the first task using the button above.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map(({ status, label }) => {
            const col = tasks.filter((t) => t.status === status)
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[status]}`}>{label}</span>
                  <span className="text-xs text-slate-400">{col.length}</span>
                </div>
                {col.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs text-slate-400">Empty</p>
                  </div>
                ) : (
                  col.map((task) => {
                    const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'DONE'
                    return (
                      <div key={task.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${isOverdue ? 'border-rose-200' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1">
                              <p className="font-semibold text-slate-950 text-sm">{task.title}</p>
                              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
                            </div>
                            {task.description && <p className="mt-1 text-xs text-slate-500">{task.description}</p>}
                            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-400">
                              {task.assignedTo && <span>→ {task.assignedTo}</span>}
                              {task.dueDate && <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>Due {task.dueDate}</span>}
                            </div>
                          </div>
                          <button type="button" onClick={() => deleteTask(task.id)} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {status !== 'TODO' && <button type="button" onClick={() => moveTask(task.id, 'TODO')} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition">← To Do</button>}
                          {status !== 'IN_PROGRESS' && <button type="button" onClick={() => moveTask(task.id, 'IN_PROGRESS')} className="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-200 transition">In Progress</button>}
                          {status !== 'DONE' && <button type="button" onClick={() => moveTask(task.id, 'DONE')} className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200 transition">Done ✓</button>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
