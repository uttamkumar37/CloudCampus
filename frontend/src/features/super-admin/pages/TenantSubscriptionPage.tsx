import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useTenantSubscription,
  useSubscribeTenant,
  useCancelSubscription,
  useTenantPayments,
  useRecordPayment,
  useInitiatePayment,
} from '../hooks/useSubscription'
import { useSubscriptionPlans } from '../hooks/useSubscription'
import type { RecordPaymentRequest, InitiatePaymentResponse } from '../types'

// Razorpay checkout.js is loaded via index.html — declare the global
declare const Razorpay: new (options: Record<string, unknown>) => { open(): void }

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

function openRazorpayCheckout(
  data: InitiatePaymentResponse,
  onSuccess: () => void,
) {
  const options = {
    key: data.keyId,
    amount: data.amountInPaise,
    currency: data.currency,
    order_id: data.orderId,
    name: 'CloudCampus',
    description: 'SaaS Subscription Payment',
    handler: (_response: Record<string, string>) => {
      // Razorpay calls this after a successful payment.
      // The backend confirms the payment via the webhook (HMAC-verified).
      onSuccess()
    },
    modal: {
      ondismiss: () => {
        // user closed modal without paying — no action needed
      },
    },
    theme: { color: '#2563eb' },
  }
  const rzp = new Razorpay(options)
  rzp.open()
}

export default function TenantSubscriptionPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const id = tenantId ?? ''

  const { data: subscription, isLoading: subLoading, refetch: refetchSubscription } =
    useTenantSubscription(id)
  const { data: plans } = useSubscriptionPlans()
  const { data: payments, isLoading: payLoading, refetch: refetchPayments } = useTenantPayments(id)

  const subscribeMutation = useSubscribeTenant(id)
  const cancelMutation = useCancelSubscription(id)
  const recordPaymentMutation = useRecordPayment()
  const initiatePaymentMutation = useInitiatePayment(id)

  const [subscribeForm, setSubscribeForm] = useState({ planId: '', durationDays: 365 })
  const [awaitingPaymentConfirmation, setAwaitingPaymentConfirmation] = useState(false)
  const [paymentForm, setPaymentForm] = useState<RecordPaymentRequest>({
    tenantId: id,
    subscriptionId: undefined,
    amount: 0,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'MANUAL',
    referenceNo: '',
    notes: '',
  })
  const paymentCount = payments?.length ?? 0
  const paidCount = (payments ?? []).filter((payment) => payment.status === 'PAID').length

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    subscribeMutation.mutate({ planId: subscribeForm.planId, durationDays: subscribeForm.durationDays })
  }

  function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    recordPaymentMutation.mutate({ ...paymentForm, tenantId: id })
  }

  function handlePayOnline() {
    initiatePaymentMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (!data) return
        openRazorpayCheckout(data, () => {
          // Razorpay modal closed after payment — wait for user to confirm
          // so they can verify the bank deduction before refreshing status.
          setAwaitingPaymentConfirmation(true)
        })
      },
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-700">Billing Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Tenant {id || 'N/A'} billing workspace</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Assign plans, track payment state, and manage manual or online collection for this tenant.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Plan" value={subscription?.plan.name ?? 'None'} tone="text-violet-700" />
            <SnapshotStat label="Status" value={subscription?.status ?? 'Open'} tone="text-sky-700" />
            <SnapshotStat label="Payments" value={String(paymentCount)} tone="text-emerald-700" />
            <SnapshotStat label="Settled" value={String(paidCount)} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Billing Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Monitor checkout readiness, manual recording flow, and subscription lifecycle controls.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Subscribe" value={subscribeMutation.isPending ? 'Saving' : 'Ready'} tone="text-violet-700" />
            <SnapshotStat label="Manual Pay" value={recordPaymentMutation.isPending ? 'Saving' : 'Ready'} tone="text-sky-700" />
            <SnapshotStat label="Online" value={initiatePaymentMutation.isPending ? 'Opening' : 'Ready'} tone="text-emerald-700" />
            <SnapshotStat label="Confirm" value={awaitingPaymentConfirmation ? 'Open' : 'Idle'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold">Subscription Management — {id}</h1>

      {/* Active Subscription */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Active Subscription</h2>
        {subLoading ? (
          <p>Loading...</p>
        ) : subscription ? (
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Plan:</span> {subscription.plan.name}</p>
            <p><span className="font-medium">Status:</span> {subscription.status}</p>
            <p>
              <span className="font-medium">Payment:</span>{' '}
              <span className={subscription.paymentStatus === 'PAID' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                {subscription.paymentStatus}
              </span>
            </p>
            <p><span className="font-medium">Period:</span> {subscription.startDate} → {subscription.endDate}</p>
            <div className="flex gap-3 mt-3">
              {subscription.paymentStatus !== 'PAID' && (
                <button
                  onClick={handlePayOnline}
                  disabled={initiatePaymentMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {initiatePaymentMutation.isPending ? 'Opening checkout...' : '💳 Pay Online'}
                </button>
              )}
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
            {awaitingPaymentConfirmation && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    refetchSubscription()
                    refetchPayments()
                    setAwaitingPaymentConfirmation(false)
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                >
                  ✓ Payment Done — Refresh Status
                </button>
                <p className="text-xs text-slate-500 mt-1">
                  Click after your bank confirms the deduction.
                </p>
              </div>
            )}
            {initiatePaymentMutation.isError && (
              <p className="text-red-500 text-xs mt-2">
                Could not initiate payment. Check Razorpay configuration.
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active subscription.</p>
        )}
      </section>

      {/* Subscribe Form */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Assign / Change Plan</h2>
        <form onSubmit={handleSubscribe} className="flex flex-wrap gap-3 items-end">
          <select
            required
            className="border rounded px-3 py-2 text-sm"
            value={subscribeForm.planId}
            onChange={(e) => setSubscribeForm({ ...subscribeForm, planId: e.target.value })}
          >
            <option value="">Select a plan</option>
            {plans?.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            placeholder="Duration (days)"
            className="border rounded px-3 py-2 text-sm w-40"
            value={subscribeForm.durationDays}
            onChange={(e) => setSubscribeForm({ ...subscribeForm, durationDays: Number(e.target.value) })}
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {subscribeMutation.isPending ? 'Saving...' : 'Subscribe'}
          </button>
        </form>
      </section>

      {/* Record Payment */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Record Manual Payment</h2>
        <form onSubmit={handlePayment} className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            min={0.01}
            step="0.01"
            placeholder="Amount"
            className="border rounded px-3 py-2 text-sm"
            value={paymentForm.amount || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
          />
          <input
            required
            type="date"
            className="border rounded px-3 py-2 text-sm"
            value={paymentForm.paymentDate}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as RecordPaymentRequest['paymentMethod'] })}
          >
            {['MANUAL', 'BANK_TRANSFER', 'UPI', 'RAZORPAY', 'STRIPE'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            placeholder="Reference No."
            className="border rounded px-3 py-2 text-sm"
            value={paymentForm.referenceNo ?? ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
          />
          <input
            placeholder="Notes"
            className="border rounded px-3 py-2 text-sm col-span-2"
            value={paymentForm.notes ?? ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
          />
          <button
            type="submit"
            disabled={recordPaymentMutation.isPending}
            className="col-span-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
          </button>
        </form>
      </section>

      {/* Payment History */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Payment History</h2>
        {payLoading ? (
          <p>Loading...</p>
        ) : !payments?.length ? (
          <p className="text-gray-500 text-sm">No payment records.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Method</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Ref No.</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{p.paymentDate}</td>
                  <td className="border px-3 py-2">₹{Number(p.amount).toLocaleString()}</td>
                  <td className="border px-3 py-2">{p.paymentMethod}</td>
                  <td className="border px-3 py-2">{p.status}</td>
                  <td className="border px-3 py-2">{p.referenceNo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
