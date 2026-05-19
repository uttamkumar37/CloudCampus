import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTenants } from '../api/tenantApi';
import {
  getGlobalAiUsage,
  getTenantAiUsage,
  type AiUsageSummaryResponse,
  type AiUsageAnomaly,
  type FeatureAiUsage,
  type ModelAiUsage,
  type TenantAiUsage,
} from '../api/aiUsageApi';

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}

function money(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function tenantLabel(tenantId: string | null, tenantMap: Record<string, string>) {
  if (!tenantId) return 'Unassigned';
  return tenantMap[tenantId] ?? `${tenantId.substring(0, 8)}...`;
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

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'HIGH'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-amber-200 bg-amber-50 text-amber-700';
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {severity}
    </span>
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

function TenantTable({
  rows,
  tenantMap,
}: {
  rows: TenantAiUsage[];
  tenantMap: Record<string, string>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No tenant AI activity this month.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Tenant', 'Tokens', 'Requests', 'Failures', 'Cost', 'Budget'].map((h) => (
              <th key={h} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, index) => {
            const failurePct = pct(row.failedRequests, row.requests);
            return (
              <tr key={row.tenantId ?? `tenant-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{tenantLabel(row.tenantId, tenantMap)}</td>
                <td className="px-4 py-2 text-gray-700">{fmt(row.tokens)}</td>
                <td className="px-4 py-2 text-gray-700">{fmt(row.requests)}</td>
                <td className={`px-4 py-2 ${failurePct >= 25 ? 'text-red-600' : 'text-gray-700'}`}>
                  {fmt(row.failedRequests)} ({failurePct}%)
                </td>
                <td className="px-4 py-2 text-gray-700">{money(row.estimatedCostUsd)}</td>
                <td className="px-4 py-2 text-gray-700">
                  {row.budgetUtilisationPct === null ? 'Unlimited' : `${row.budgetUtilisationPct}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FeatureTable({ rows }: { rows: FeatureAiUsage[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No feature usage recorded yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Feature', 'Tokens', 'Requests', 'Failures', 'Cost'].map((h) => (
              <th key={h} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const failurePct = pct(row.failedRequests, row.requests);
            return (
              <tr key={row.feature} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{row.feature}</td>
                <td className="px-4 py-2 text-gray-700">{fmt(row.tokens)}</td>
                <td className="px-4 py-2 text-gray-700">{fmt(row.requests)}</td>
                <td className={`px-4 py-2 ${failurePct >= 25 ? 'text-red-600' : 'text-gray-700'}`}>
                  {fmt(row.failedRequests)} ({failurePct}%)
                </td>
                <td className="px-4 py-2 text-gray-700">{money(row.estimatedCostUsd)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ModelTable({ rows }: { rows: ModelAiUsage[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No model usage recorded yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Provider / Model', 'Tokens', 'Requests', 'Failures', 'Latency', 'Cost'].map((h) => (
              <th key={h} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const failurePct = pct(row.failedRequests, row.requests);
            return (
              <tr key={`${row.provider}-${row.model}`} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">
                  {row.provider} / {row.model}
                </td>
                <td className="px-4 py-2 text-gray-700">{fmt(row.tokens)}</td>
                <td className="px-4 py-2 text-gray-700">{fmt(row.requests)}</td>
                <td className={`px-4 py-2 ${failurePct >= 25 ? 'text-red-600' : 'text-gray-700'}`}>
                  {fmt(row.failedRequests)} ({failurePct}%)
                </td>
                <td className={`px-4 py-2 ${row.avgLatencyMs >= 5000 ? 'text-amber-600' : 'text-gray-700'}`}>
                  {fmt(row.avgLatencyMs)} ms
                </td>
                <td className="px-4 py-2 text-gray-700">{money(row.estimatedCostUsd)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnomalyList({
  rows,
  tenantMap,
}: {
  rows: AiUsageAnomaly[];
  tenantMap: Record<string, string>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
        No AI usage anomalies detected for the current month.
      </div>
    );
  }
  return (
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
      {rows.map((row, index) => (
        <div key={`${row.scope}-${row.signal}-${index}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={row.severity} />
              <p className="text-sm font-semibold text-gray-900">{row.signal}</p>
              <span className="text-xs text-gray-400">{row.scope}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{row.detail}</p>
            {row.tenantId && (
              <p className="mt-1 text-xs text-gray-400">Tenant: {tenantLabel(row.tenantId, tenantMap)}</p>
            )}
          </div>
          <div className="text-left text-xs text-gray-500 sm:text-right">
            <p>{fmt(row.tokens)} tokens</p>
            <p>{fmt(row.requests)} requests</p>
          </div>
        </div>
      ))}
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                label="Estimated cost"
                value={money(global.estimatedCostUsd)}
                sub="token-based estimate"
              />
              <StatCard
                label="Active tenants"
                value={String(global.byTenant.length)}
                sub="with AI activity this month"
                highlight={global.anomalies.some((a) => a.severity === 'HIGH')}
              />
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Anomalies</h3>
              <AnomalyList rows={global.anomalies} tenantMap={tenantMap} />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Usage by tenant</h3>
              <TenantTable rows={global.byTenant} tenantMap={tenantMap} />
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">Usage by feature</h3>
                <FeatureTable rows={global.byFeature} />
              </section>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">Usage by model</h3>
                <ModelTable rows={global.byModel} />
              </section>
            </div>
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
