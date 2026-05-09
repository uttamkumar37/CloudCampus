import { useState } from 'react'
import { useSubscriptionPlans, useCreatePlan } from '../hooks/useSubscription'
import type { PlanFeature } from '../types'

const ALL_FEATURES: PlanFeature[] = [
  'STUDENT_MANAGEMENT',
  'TEACHER_MANAGEMENT',
  'ACADEMIC_MANAGEMENT',
  'ATTENDANCE_TRACKING',
  'FEE_MANAGEMENT',
  'EXAM_MANAGEMENT',
  'HOMEWORK_MANAGEMENT',
  'TIMETABLE_MANAGEMENT',
  'PARENT_PORTAL',
  'BULK_UPLOAD',
  'DASHBOARD_ACCESS',
  'ADVANCED_REPORTS',
  'CUSTOM_BRANDING',
]

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export default function SubscriptionPlansPage() {
  const { data: plans, isLoading } = useSubscriptionPlans()
  const createPlan = useCreatePlan()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    price: 0,
    billingCycleDays: 30,
    maxStudents: 100,
    maxTeachers: 10,
    description: '',
    features: [] as PlanFeature[],
  })
  const activePlans = (plans ?? []).filter((plan) => plan.active).length
  const selectedFeatures = form.features.length

  function toggleFeature(f: PlanFeature) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createPlan.mutate(form, {
      onSuccess: () => {
        setShowForm(false)
        setForm({ name: '', price: 0, billingCycleDays: 30, maxStudents: 100, maxTeachers: 10, description: '', features: [] })
      },
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Plan Catalog Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{plans?.length ?? 0} pricing plan(s)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Manage entitlement tiers, usage caps, and bundled feature sets for tenant subscriptions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Total" value={String(plans?.length ?? 0)} tone="text-sky-700" />
            <SnapshotStat label="Active" value={String(activePlans)} tone="text-emerald-700" />
            <SnapshotStat label="Features" value={String(ALL_FEATURES.length)} tone="text-violet-700" />
            <SnapshotStat label="Draft Picked" value={String(selectedFeatures)} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Catalog Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Observe draft readiness, feature selection depth, and plan creation state.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Form" value={showForm ? 'Open' : 'Closed'} tone="text-sky-700" />
            <SnapshotStat label="Draft Name" value={form.name ? 'Set' : 'Open'} tone="text-violet-700" />
            <SnapshotStat label="Create" value={createPlan.isPending ? 'Running' : 'Ready'} tone="text-emerald-700" />
            <SnapshotStat label="Status" value={activePlans > 0 ? 'Live' : 'Draft'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded p-4 mb-6 bg-gray-50 space-y-4">
          <h2 className="text-lg font-semibold">Create Plan</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Plan name (e.g. PRO)"
              className="border rounded px-3 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="number"
              min={0}
              placeholder="Price (INR)"
              className="border rounded px-3 py-2"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <input
              required
              type="number"
              min={1}
              placeholder="Billing cycle days"
              className="border rounded px-3 py-2"
              value={form.billingCycleDays}
              onChange={(e) => setForm({ ...form, billingCycleDays: Number(e.target.value) })}
            />
            <input
              required
              type="number"
              min={-1}
              placeholder="Max students (-1 = unlimited)"
              className="border rounded px-3 py-2"
              value={form.maxStudents}
              onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })}
            />
            <input
              required
              type="number"
              min={-1}
              placeholder="Max teachers (-1 = unlimited)"
              className="border rounded px-3 py-2"
              value={form.maxTeachers}
              onChange={(e) => setForm({ ...form, maxTeachers: Number(e.target.value) })}
            />
            <input
              placeholder="Description"
              className="border rounded px-3 py-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <p className="font-medium mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {ALL_FEATURES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    form.features.includes(f)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={createPlan.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {createPlan.isPending ? 'Creating...' : 'Create Plan'}
          </button>
          {createPlan.isError && (
            <p className="text-red-500 text-sm">Failed to create plan. Please try again.</p>
          )}
        </form>
      )}

      {isLoading ? (
        <p>Loading plans...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans?.map((plan) => (
            <div key={plan.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {plan.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-2xl font-semibold text-blue-700 mb-1">
                ₹{plan.price.toLocaleString()}
                <span className="text-sm text-gray-500 font-normal"> / {plan.billingCycleDays}d</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Students: {plan.maxStudents === -1 ? 'Unlimited' : plan.maxStudents} &bull; Teachers: {plan.maxTeachers === -1 ? 'Unlimited' : plan.maxTeachers}
              </p>
              {plan.description && <p className="text-sm text-gray-500 mb-3">{plan.description}</p>}
              <div className="flex flex-wrap gap-1">
                {plan.features.map((f) => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
