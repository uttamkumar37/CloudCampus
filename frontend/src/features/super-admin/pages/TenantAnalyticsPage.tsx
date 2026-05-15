import { useQuery } from '@tanstack/react-query';
import { getPlatformAnalytics } from '../api/analyticsApi';
import type { TenantAnalyticsSummary } from '../api/analyticsApi';

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function RateBadge({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? 'bg-green-100 text-green-700' :
    rate >= 50 ? 'bg-amber-100 text-amber-700' :
                 'bg-red-100 text-red-600';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${color}`}>
      {rate.toFixed(1)}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'ACTIVE'    ? 'bg-green-100 text-green-700' :
    status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-gray-100 text-gray-500';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function TenantAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn:  getPlatformAnalytics,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <div className="p-6 text-sm text-gray-400">Loading analytics…</div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Platform Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Live snapshot across all tenants — sorted by active student count.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Tenants"
          value={fmt(data.totalTenants)}
          sub={`${fmt(data.activeTenants)} active`}
        />
        <StatCard label="Students"       value={fmt(data.totalStudents)} />
        <StatCard label="Staff"          value={fmt(data.totalStaff)} />
        <StatCard label="Schools"        value={fmt(data.totalSchools)} />
        <StatCard
          label="Total Fee Due"
          value={fmtCurrency(data.totalFeeDue)}
        />
        <StatCard
          label="Fee Collection"
          value={`${data.feeCollectionRate.toFixed(1)}%`}
          sub={`${fmtCurrency(data.totalFeePaid)} paid`}
        />
      </div>

      {/* Per-tenant table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Tenant Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                <th className="px-4 py-2">Tenant</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Students</th>
                <th className="px-4 py-2 text-right">Staff</th>
                <th className="px-4 py-2 text-right">Schools</th>
                <th className="px-4 py-2 text-right">Fee Due</th>
                <th className="px-4 py-2 text-right">Fee Paid</th>
                <th className="px-4 py-2 text-right">Collection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.tenants.map((t: TenantAnalyticsSummary) => (
                <tr key={t.tenantId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{t.tenantName}</p>
                    <p className="text-xs text-gray-400">{t.tenantCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.tenantStatus} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(t.activeStudents)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(t.activeStaff)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(t.activeSchools)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmtCurrency(t.totalFeeDue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-green-700">{fmtCurrency(t.totalFeePaid)}</td>
                  <td className="px-4 py-3 text-right">
                    <RateBadge rate={t.feeCollectionRate} />
                  </td>
                </tr>
              ))}
              {data.tenants.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                    No tenants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
