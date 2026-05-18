import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExperienceAnalytics, type ExperienceAnalytics } from './experienceStudioApi';

const PERIOD_OPTIONS: { label: string; value: number }[] = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

type StatCardProps = {
  label: string;
  value: number;
  colorClass: string;
  icon: string;
  loading: boolean;
};

function StatCard({ label, value, colorClass, icon, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold text-white ${colorClass}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
      )}
    </div>
  );
}

type BarChartProps = {
  data: Record<string, number>;
  loading: boolean;
};

function BarChart({ data, loading }: BarChartProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-6 flex-1 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No events recorded for this period.</p>;
  }

  const maxCount = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-2.5" role="list" aria-label="Events by type">
      {entries.map(([type, count]) => {
        const widthPct = Math.round((count / maxCount) * 100);
        return (
          <div key={type} className="flex items-center gap-3" role="listitem">
            <span className="w-40 truncate text-xs font-medium text-slate-600" title={type}>
              {type}
            </span>
            <div className="flex-1 overflow-hidden rounded-full bg-slate-100" style={{ height: '20px' }}>
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${widthPct}%` }}
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={maxCount}
              />
            </div>
            <span className="w-12 text-right text-xs font-semibold text-slate-700">
              {count.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-100 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-5 flex-1 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildAnalyticsStats(data: ExperienceAnalytics) {
  return [
    {
      label: 'Page Views',
      value: data.totalPageViews,
      colorClass: 'bg-sky-500',
      icon: 'PV',
    },
    {
      label: 'CTA Clicks',
      value: data.totalCtaClicks,
      colorClass: 'bg-violet-500',
      icon: 'CT',
    },
    {
      label: 'Demo Starts',
      value: data.totalDemoStarts,
      colorClass: 'bg-emerald-500',
      icon: 'DS',
    },
    {
      label: 'Investor Views',
      value: data.totalInvestorViews,
      colorClass: 'bg-amber-500',
      icon: 'IV',
    },
  ];
}

export default function ExperienceAnalyticsDashboard() {
  const [days, setDays] = useState(7);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['sa:exp:analytics', days],
    queryFn: () => getExperienceAnalytics(days),
    staleTime: 60_000,
  });

  const stats = data ? buildAnalyticsStats(data) : null;
  const loading = isLoading || isFetching;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Experience Analytics</h2>
          {data && (
            <p className="mt-0.5 text-sm text-slate-500">
              {data.periodLabel} &mdash; {data.totalEvents.toLocaleString()} total events
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-sm font-medium transition ${
                  days === opt.value
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load analytics data. Check that the backend is running and try again.
        </div>
      )}

      {isLoading && !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(stats ?? buildAnalyticsStats({ totalPageViews: 0, totalCtaClicks: 0, totalDemoStarts: 0, totalInvestorViews: 0, totalEvents: 0, eventsByType: {}, periodLabel: '' })).map(
              (stat) => (
                <StatCard key={stat.label} {...stat} loading={loading} />
              ),
            )}
          </div>

          {/* Bar chart breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Events by Type</h3>
            <BarChart data={data?.eventsByType ?? {}} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
