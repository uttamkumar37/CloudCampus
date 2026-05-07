import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'

import { useSuperAdminDashboardSummary } from '../hooks/useSuperAdminDashboardSummary'
import type { Tenant } from '../types'

type KpiKey = 'totalTenants' | 'activeTenants' | 'tenantsCreatedThisMonth' | 'inactiveTenants'

const KPI_CONFIG: Array<{ key: KpiKey; label: string; icon: string; bg: string; text: string }> = [
  { key: 'totalTenants',            label: 'Total Schools',   icon: '🏫', bg: 'bg-violet-50',  text: 'text-violet-700'  },
  { key: 'activeTenants',           label: 'Active Schools',  icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { key: 'tenantsCreatedThisMonth', label: 'New This Month',  icon: '🚀', bg: 'bg-sky-50',     text: 'text-sky-700'     },
  { key: 'inactiveTenants',         label: 'Inactive',        icon: '⏸', bg: 'bg-slate-50',   text: 'text-slate-600'   },
]

export function SuperAdminDashboardPage() {
  const summaryQuery = useSuperAdminDashboardSummary()
  const summary = summaryQuery.data?.data

  const columns: DataTableColumn<Tenant>[] = [
    {
      key: 'schoolName',
      header: 'School',
      cell: (tenant) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: tenant.primaryColor || '#059669' }}
          >
            {tenant.schoolName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">{tenant.schoolName}</p>
            <p className="text-xs text-slate-400">/{tenant.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'schema',
      header: 'Schema',
      cell: (tenant) => (
        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{tenant.schemaName}</span>
      ),
    },
    {
      key: 'branding',
      header: 'Brand Color',
      cell: (tenant) => (
        <div className="flex items-center gap-2.5">
          <div
            className="h-5 w-5 rounded-lg border border-slate-200 shadow-sm"
            style={{ backgroundColor: tenant.primaryColor }}
          />
          <span className="text-xs font-mono text-slate-500">{tenant.primaryColor}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (tenant) => (
        <span className={`cc-badge ${tenant.active ? 'cc-badge-green' : 'cc-badge-slate'}`}>
          {tenant.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <section className="space-y-8">
      <PageHeader
        title="Platform Overview"
        subtitle="Live tenant portfolio health, provisioning activity, and operating posture."
        badge={{ label: 'Super Admin', tone: 'blue' }}
      />

      {/* KPI Cards */}
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_CONFIG.map(({ key, label, icon, bg, text }) => (
            <div
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {summary[key]}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${bg} ${text} flex items-center justify-center text-lg`}>
                  {icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : summaryQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="cc-skeleton-shimmer rounded-2xl h-28" />
          ))}
        </div>
      ) : null}

      {/* Newest Tenants table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Newest Schools</h2>
          <p className="mt-0.5 text-sm text-slate-500">Recently provisioned schools across the platform.</p>
        </div>

        <div className="p-6">
          {summaryQuery.isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Unable to load platform statistics.
            </div>
          ) : summaryQuery.isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="cc-skeleton-shimmer h-14 rounded-xl" />)}
            </div>
          ) : summary ? (
            <DataTable
              columns={columns}
              rows={summary.newestTenants}
              rowKey={(tenant) => tenant.slug}
              emptyText="No tenants have been created yet."
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
