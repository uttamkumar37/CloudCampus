import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useWebsiteDashboardQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsiteDashboardPage() {
  const { data, isLoading } = useWebsiteDashboardQuery();

  const cards = [
    { label: 'Total Visitors', value: data?.totalVisitors ?? 0 },
    { label: 'Published Pages', value: data?.publishedPages ?? 0 },
    { label: 'SEO Coverage', value: data?.seoCoverage ?? 0 },
    { label: 'Demo Requests', value: data?.demoRequests ?? 0 },
    { label: 'Investor Visits', value: data?.investorVisits ?? 0 },
    { label: 'Conversion Rate', value: `${(data?.conversionRate ?? 0).toFixed(1)}%` },
  ];

  return (
    <PublicWebsiteShell
      title="Website Dashboard"
      subtitle="Monitor traffic, conversion, engagement, and publishing health of the CloudCampus global website."
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading dashboard metrics...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/70 bg-white/80 p-5">
            <h3 className="text-lg font-bold text-slate-900">Top Pages</h3>
            <div className="mt-3 space-y-2">
              {(data?.topPages ?? []).map((page) => (
                <div key={String(page.path)} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{String(page.path)}</span>
                  <span className="font-semibold text-cyan-700">{String(page.views)} views</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PublicWebsiteShell>
  );
}
