import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useWebsiteAnalyticsQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsiteAnalyticsPage() {
  const { data, isLoading } = useWebsiteAnalyticsQuery();

  return (
    <PublicWebsiteShell
      title="Analytics"
      subtitle="Track visitors, page views, CTA clicks, demo conversions, and investor engagement from shared event streams."
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs text-slate-500">Visitors</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{data?.totalVisitors ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs text-slate-500">Page Views</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{data?.pageViews ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs text-slate-500">CTA Clicks</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{data?.ctaClicks ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs text-slate-500">Demo Conversions</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{data?.demoRequests ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs text-slate-500">Investor Engagement</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{data?.investorVisits ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs text-slate-500">Conversion Rate</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{(data?.conversionRate ?? 0).toFixed(2)}%</p>
          </div>
        </div>
      )}
    </PublicWebsiteShell>
  );
}
