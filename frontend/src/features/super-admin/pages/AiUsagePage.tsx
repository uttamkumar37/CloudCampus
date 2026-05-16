import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTenants } from '../api/tenantApi';
import {
  getGlobalAiUsage,
  getTenantAiUsage,
  type AiUsageSummaryResponse,
} from '../api/aiUsageApi';

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function UtilBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-amber-500' :
                'bg-green-500';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function TenantUsagePanel({ tenantId }: { tenantId: string }) {
  const { data, isLoading, isError } = useQuery<AiUsageSummaryResponse>({
    queryKey: ['ai-usage-tenant', tenantId],
    queryFn:  () => getTenantAiUsage(tenantId),
    enabled:  !!tenantId,
  });

  if (isLoading) return <p className="text-sm text-gray-400">Loading…</p>;
  if (isError)   return <p className="text-sm text-red-600">Failed to load usage data.</p>;
  if (!data)     return null;

  const budgetUnlimited = data.monthlyTokenBudget === 0;
  const limitUnlimited  = data.dailyRequestLimit  === 0;
  const periodLabel = new Date(data.periodStart).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Period: {periodLabel} (UTC)</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Tokens this month" value={fmt(data.tokensThisMonth)} />
        <StatCard label="Requests this month" value={fmt(data.requestsThisMonth)} />
        <StatCard
          label="Requests today"
          value={fmt(data.requestsToday)}
          highlight={!limitUnlimited && data.requestsToday >= data.dailyRequestLimit}
        />
      </div>

      {/* Monthly token budget */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Monthly Token Budget</span>
          <span className="text-sm font-semibold text-gray-900">
            {budgetUnlimited
              ? 'Unlimited'
              : `${fmt(data.tokensThisMonth)} / ${fmt(data.monthlyTokenBudget)}`}
          </span>
        </div>
        {!budgetUnlimited && data.budgetUtilisationPct !== null && (
          <>
            <UtilBar pct={data.budgetUtilisationPct} />
            <p className="text-right text-xs text-gray-500">{data.budgetUtilisationPct}% used</p>
          </>
        )}
        {budgetUnlimited && (
          <p className="text-xs text-gray-400">
            Set <code className="rounded bg-gray-100 px-1">AI_MONTHLY_TOKEN_BUDGET</code> in tenant config to enable.
          </p>
        )}
      </div>

      {/* Daily request limit */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Daily Request Limit</span>
          <span className="text-sm font-semibold text-gray-900">
            {limitUnlimited
              ? 'Unlimited'
              : `${fmt(data.requestsToday)} / ${fmt(data.dailyRequestLimit)}`}
          </span>
        </div>
        {limitUnlimited && (
          <p className="text-xs text-gray-400">
            Set <code className="rounded bg-gray-100 px-1">AI_REQUESTS_PER_DAY</code> in tenant config to enable.
          </p>
        )}
      </div>
    </div>
  );
}

export function AiUsagePage() {
  const [selectedTenantId, setSelectedTenantId] = useState('');

  const { data: tenantsPage, isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants-all'],
    queryFn:  () => listTenants(0, 200),
  });

  const { data: global, isLoading: globalLoading } = useQuery({
    queryKey: ['ai-usage-global'],
    queryFn:  getGlobalAiUsage,
    refetchInterval: 30_000,
  });

  const tenants = tenantsPage?.items ?? [];

  const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t.name]));

  const periodLabel = global
    ? new Date(global.periodStart).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">AI Usage & Budgets</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Monitor token consumption and enforce per-tenant AI budgets.
        </p>
      </div>

      {/* Global strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Platform — {periodLabel}
        </h2>
        {globalLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : global ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Total tokens"
                value={fmt(global.totalTokensThisMonth)}
                sub="this month (all tenants)"
              />
              <StatCard
                label="Total requests"
                value={fmt(global.totalRequestsThisMonth)}
                sub="this month (all tenants)"
              />
              <StatCard
                label="Active tenants"
                value={String(global.byTenant.length)}
                sub="with AI activity this month"
              />
            </div>

            {global.byTenant.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Tenant', 'Tokens', 'Requests'].map((h) => (
                        <th key={h} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {global.byTenant.map((row) => (
                      <tr key={row.tenantId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {tenantMap[row.tenantId] ?? row.tenantId.substring(0, 8) + '…'}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{fmt(row.tokens)}</td>
                        <td className="px-4 py-2 text-gray-700">{fmt(row.requests)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Per-tenant detail */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Per-Tenant Detail
        </h2>
        {tenantsLoading ? (
          <p className="text-sm text-gray-400">Loading tenants…</p>
        ) : (
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— choose a tenant —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        )}
        {selectedTenantId && <TenantUsagePanel tenantId={selectedTenantId} />}
      </div>
    </div>
  );
}
