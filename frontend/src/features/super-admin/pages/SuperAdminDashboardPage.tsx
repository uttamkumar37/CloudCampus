import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'

import { useSuperAdminDashboardSummary } from '../hooks/useSuperAdminDashboardSummary'
import type { Tenant } from '../types'

export function SuperAdminDashboardPage() {
  const summaryQuery = useSuperAdminDashboardSummary()
  const summary = summaryQuery.data?.data

  const columns: DataTableColumn<Tenant>[] = [
    {
      key: 'schoolName',
      header: 'School',
      cell: (tenant) => (
        <div>
          <p className="font-semibold text-slate-900">{tenant.schoolName}</p>
          <p className="text-xs text-slate-500">/{tenant.slug}</p>
        </div>
      ),
    },
    {
      key: 'schema',
      header: 'Schema',
      cell: (tenant) => tenant.schemaName,
    },
    {
      key: 'branding',
      header: 'Branding',
      cell: (tenant) => (
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-slate-300"
            style={{ backgroundColor: tenant.primaryColor }}
          />
          <span>{tenant.primaryColor}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (tenant) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tenant.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {tenant.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <section className="space-y-8">
      <PageHeader
        title="Platform Overview"
        subtitle="Live tenant portfolio health, recent provisioning activity, and operating posture."
      />

      {summary ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total Tenants', summary.totalTenants.toString()],
            ['Active Tenants', summary.activeTenants.toString()],
            ['Created This Month', summary.tenantsCreatedThisMonth.toString()],
            ['Inactive Tenants', summary.inactiveTenants.toString()],
          ].map(([title, value]) => (
            <article
              key={title}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">Newest Tenants</h2>
          <p className="mt-1 text-sm text-slate-500">Recently provisioned schools across the platform.</p>
        </div>

        {summaryQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Unable to load super admin statistics.
          </div>
        ) : null}

        {summary ? (
          <DataTable
            columns={columns}
            rows={summary.newestTenants}
            rowKey={(tenant) => tenant.slug}
            emptyText="No tenants have been created yet."
          />
        ) : null}
      </div>
    </section>
  )
}
