import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type ExpenseCategory = 'SALARY' | 'UTILITIES' | 'MAINTENANCE' | 'SUPPLIES' | 'EVENTS' | 'TRANSPORT' | 'OTHER'

interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  paidTo: string
  date: string
  approvedBy: string
  note: string
}

const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  SALARY: 'bg-violet-100 text-violet-700',
  UTILITIES: 'bg-sky-100 text-sky-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
  SUPPLIES: 'bg-amber-100 text-amber-700',
  EVENTS: 'bg-pink-100 text-pink-700',
  TRANSPORT: 'bg-teal-100 text-teal-700',
  OTHER: 'bg-slate-100 text-slate-600',
}

const today = new Date().toISOString().slice(0, 10)
const currentMonth = today.slice(0, 7)

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [form, setForm] = useState({ title: '', category: 'OTHER' as ExpenseCategory, amount: 0, paidTo: '', date: today, approvedBy: '', note: '' })
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'ALL'>('ALL')

  const visible = filterCategory === 'ALL' ? expenses : expenses.filter((e) => e.category === filterCategory)
  const totalThisMonth = expenses.filter((e) => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0)
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = (Object.keys(CATEGORY_COLOR) as ExpenseCategory[]).map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter((e) => e.category === cat).length,
  })).filter((c) => c.count > 0)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || form.amount <= 0) return
    setExpenses((prev) => [{ id: crypto.randomUUID(), ...form, amount: Number(form.amount) }, ...prev])
    setForm((p) => ({ ...p, title: '', amount: 0, paidTo: '', approvedBy: '', note: '' }))
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Expense Tracker"
        subtitle="Record and categorize school expenditures. Track spending by category and period."
        badge={{ label: `₹ ${totalAll.toLocaleString('en-IN')} Total`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">This Month</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">₹ {totalThisMonth.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">All Time</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">₹ {totalAll.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Entries</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{expenses.length}</p>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {byCategory.sort((a, b) => b.total - a.total).map(({ cat, total, count }) => (
            <div key={cat} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[cat]}`}>{cat}</span>
                <span className="text-xs text-slate-400">{count} entries</span>
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">₹ {total.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Record Expense</h2>
        <form className="mt-4 space-y-3" onSubmit={handleAdd}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Expense title / description" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ExpenseCategory }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="SALARY">Salary</option>
              <option value="UTILITIES">Utilities</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SUPPLIES">Supplies</option>
              <option value="EVENTS">Events</option>
              <option value="TRANSPORT">Transport</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="number" min={1} placeholder="Amount (₹)" value={form.amount || ''} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Paid to (vendor / person)" value={form.paidTo} onChange={(e) => setForm((p) => ({ ...p, paidTo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Approved by" value={form.approvedBy} onChange={(e) => setForm((p) => ({ ...p, approvedBy: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <input type="text" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <Button type="submit">Add Expense</Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['ALL', ...Object.keys(CATEGORY_COLOR)] as const).map((cat) => (
          <button key={cat} type="button" onClick={() => setFilterCategory(cat as ExpenseCategory | 'ALL')} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${filterCategory === cat ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No expenses recorded. Add the first entry above.</p>
          </div>
        ) : (
          visible.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{exp.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[exp.category]}`}>{exp.category}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{exp.date}{exp.paidTo ? ` · ${exp.paidTo}` : ''}{exp.approvedBy ? ` · Approved by ${exp.approvedBy}` : ''}</p>
                {exp.note && <p className="mt-0.5 text-xs text-slate-400 italic">{exp.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-slate-900">₹ {exp.amount.toLocaleString('en-IN')}</p>
                <button type="button" onClick={() => setExpenses((prev) => prev.filter((e) => e.id !== exp.id))} className="text-xs text-slate-400 hover:text-rose-500 transition">✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      <BudgetPlanningPanel totalSpent={totalAll} />
    </section>
  )
}

// ── Budget Planning Module ─────────────────────────────────────────────────

interface BudgetLine {
  id: string
  category: string
  budgetedAmount: number
  period: string
}

function BudgetPlanningPanel({ totalSpent }: { totalSpent: number }) {
  const [lines, setLines] = useState<BudgetLine[]>([
    { id: '1', category: 'SALARY', budgetedAmount: 500000, period: currentMonth },
    { id: '2', category: 'UTILITIES', budgetedAmount: 30000, period: currentMonth },
    { id: '3', category: 'MAINTENANCE', budgetedAmount: 20000, period: currentMonth },
  ])
  const [form, setForm] = useState({ category: 'OTHER', budgetedAmount: 0, period: currentMonth })
  const [showForm, setShowForm] = useState(false)

  const totalBudget = lines.reduce((s, l) => s + l.budgetedAmount, 0)
  const overBudget = totalSpent > totalBudget

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (form.budgetedAmount <= 0) return
    const existing = lines.find((l) => l.category === form.category && l.period === form.period)
    if (existing) {
      setLines((prev) => prev.map((l) => l.id === existing.id ? { ...l, budgetedAmount: Number(form.budgetedAmount) } : l))
    } else {
      setLines((prev) => [...prev, { id: crypto.randomUUID(), ...form, budgetedAmount: Number(form.budgetedAmount) }])
    }
    setForm((p) => ({ ...p, budgetedAmount: 0 }))
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Budget Planning</h2>
          <p className="text-sm text-slate-500">Plan expected spending by category and period.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Set Budget'}
        </button>
      </div>

      <div className={`rounded-2xl border px-5 py-4 shadow-sm ${overBudget ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${overBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
              {overBudget ? 'Over Budget' : 'Within Budget'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Total budgeted: ₹ {totalBudget.toLocaleString('en-IN')} · Spent: ₹ {totalSpent.toLocaleString('en-IN')}</p>
          </div>
          <p className={`text-lg font-bold ${overBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
            {overBudget ? '-' : '+'}₹ {Math.abs(totalBudget - totalSpent).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/60">
          <div className={`h-2 rounded-full transition-all ${overBudget ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0)}%` }} />
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="flex flex-wrap gap-3" onSubmit={handleAdd}>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="SALARY">Salary</option>
              <option value="UTILITIES">Utilities</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SUPPLIES">Supplies</option>
              <option value="EVENTS">Events</option>
              <option value="TRANSPORT">Transport</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="number" min={1} placeholder="Budgeted amount (₹)" value={form.budgetedAmount || ''} onChange={(e) => setForm((p) => ({ ...p, budgetedAmount: Number(e.target.value) }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="month" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save</button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {lines.map((l) => {
          const pct = totalBudget > 0 ? Math.round((l.budgetedAmount / totalBudget) * 100) : 0
          return (
            <div key={l.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{l.category}</span>
                <span className="text-xs text-slate-400">{l.period}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">{pct}% of budget</span>
                <p className="font-bold text-slate-900">₹ {l.budgetedAmount.toLocaleString('en-IN')}</p>
                <button type="button" onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))} className="text-xs text-slate-300 hover:text-rose-500 transition">✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Cashbook & Reconciliation ──────────────────────────────────────────────

type CashEntryType = 'INCOME' | 'EXPENSE'

interface CashEntry {
  id: string
  date: string
  description: string
  type: CashEntryType
  amount: number
  reference: string
  reconciled: boolean
}

export function CashbookPanel() {
  const [entries, setEntries] = useState<CashEntry[]>([
    { id: '1', date: today, description: 'Fee collection – Class 8', type: 'INCOME', amount: 45000, reference: 'RCP-001', reconciled: false },
    { id: '2', date: today, description: 'Stationery purchase', type: 'EXPENSE', amount: 3200, reference: 'EXP-001', reconciled: true },
  ])
  const [form, setForm] = useState({ date: today, description: '', type: 'INCOME' as CashEntryType, amount: 0, reference: '' })
  const [showForm, setShowForm] = useState(false)

  const totalIncome = entries.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0)
  const totalExpense = entries.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense
  const unreconciled = entries.filter((e) => !e.reconciled).length

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!form.description.trim() || form.amount <= 0) return
    setEntries((prev) => [{ id: crypto.randomUUID(), ...form, amount: Number(form.amount), reconciled: false }, ...prev])
    setForm((p) => ({ ...p, description: '', amount: 0, reference: '' }))
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Cashbook & Reconciliation</h2>
          <p className="text-sm text-slate-500">Daily cashflow entries matched against bank records.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Total Income</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">₹ {totalIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">Total Expense</p>
          <p className="mt-1 text-xl font-bold text-rose-700">₹ {totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${balance >= 0 ? 'border-sky-200 bg-sky-50' : 'border-rose-200 bg-rose-50'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${balance >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>Balance</p>
          <p className={`mt-1 text-xl font-bold ${balance >= 0 ? 'text-sky-700' : 'text-rose-700'}`}>₹ {Math.abs(balance).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {unreconciled > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <strong>{unreconciled} unreconciled</strong> entries pending bank confirmation.
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleAdd}>
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as CashEntryType }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
            </select>
            <input type="number" min={1} placeholder="Amount (₹)" value={form.amount || ''} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <input type="text" placeholder="Reference no." value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="col-span-full sm:col-span-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add</button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-3 shadow-sm ${e.type === 'EXPENSE' ? 'border-rose-100' : 'border-emerald-100'}`}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${e.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{e.type}</span>
                <p className="font-medium text-slate-950">{e.description}</p>
                {e.reference && <span className="font-mono text-[10px] text-slate-400">{e.reference}</span>}
                {e.reconciled && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">✓ Reconciled</span>}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">{e.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className={`font-bold ${e.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>{e.type === 'INCOME' ? '+' : '-'}₹ {e.amount.toLocaleString('en-IN')}</p>
              {!e.reconciled && <button type="button" onClick={() => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, reconciled: true } : x))} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition">Reconcile</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
