import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTenantStats } from '../api/tenantApi';

const STAT_CARDS = [
  { key: 'totalTenants',    label: 'Total Tenants',    color: 'text-gray-900',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  { key: 'activeTenants',   label: 'Active',           color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-100' },
  { key: 'suspendedTenants',label: 'Suspended',        color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'newThisMonth',    label: 'New This Month',   color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
] as const;

export function SuperAdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: getTenantStats,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">Platform-wide tenant overview</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
            <p className="text-xs font-medium text-gray-500">{c.label}</p>
            <p className={`mt-1 text-3xl font-bold ${c.color}`}>
              {isLoading ? '—' : (data?.[c.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          to="/super-admin/tenants/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create Tenant
        </Link>
        <Link
          to="/super-admin/tenants"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          View All Tenants
        </Link>
      </div>
    </div>
  );
}
