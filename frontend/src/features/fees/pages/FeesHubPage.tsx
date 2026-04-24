import { PageHeader } from '../../../components/ui/PageHeader'

export function FeesHubPage() {
  return (
    <section className="space-y-4">
      <PageHeader title="Fees" subtitle="Assignments, payments, and pending balances." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <p>
          Backend: <code className="rounded bg-slate-100 px-1">/api/v1/fees/assignments</code>,{' '}
          <code className="rounded bg-slate-100 px-1">/api/v1/fees/payments</code>. Integrate lists and payment forms
          here.
        </p>
      </div>
    </section>
  )
}
