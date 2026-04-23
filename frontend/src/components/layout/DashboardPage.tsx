import { PageHeader } from '../ui/PageHeader'

export function DashboardPage() {
  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to EduTenant. Your multi-tenant school platform frontend is ready."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-500">Students</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">-</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-500">Teachers</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">-</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-500">Classes</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">-</p>
        </article>
      </div>
    </section>
  )
}
