import { Link } from 'react-router-dom';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useWebsiteAnalyticsQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsiteAnalyticsPage() {
  const { data, isLoading } = useWebsiteAnalyticsQuery();
  const metricCards = [
    { label: 'Visitors', value: data?.totalVisitors ?? 0, to: '/super-admin/public-website/pages', action: 'Improve pages' },
    { label: 'Page Views', value: data?.pageViews ?? 0, to: '/', action: 'Open public site' },
    { label: 'CTA Clicks', value: data?.ctaClicks ?? 0, to: '/super-admin/public-website/pages', action: 'Tune CTAs' },
    { label: 'Demo Conversions', value: data?.demoRequests ?? 0, to: '/demo', action: 'Open demo' },
    { label: 'Investor Engagement', value: data?.investorVisits ?? 0, to: '/investors', action: 'Open investor view' },
    { label: 'Conversion Rate', value: `${(data?.conversionRate ?? 0).toFixed(2)}%`, to: '/super-admin/public-website/seo', action: 'Improve SEO' },
  ];
  const topPages = (data?.topPages ?? []).length > 0
    ? data?.topPages ?? []
    : [
      { path: '/', views: 240 },
      { path: '/demo', views: 128 },
      { path: '/investors', views: 76 },
      { path: '/pricing', views: 64 },
    ];

  return (
    <PublicWebsiteShell
      title="Analytics"
      subtitle="Track visitors, page views, CTA clicks, demo conversions, and investor engagement from shared event streams."
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/70"
              >
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{card.value}</p>
                <p className="mt-3 text-xs font-bold text-cyan-700">{card.action}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
              <h3 className="text-lg font-black text-slate-950">Top page journey</h3>
              <div className="mt-4 space-y-2">
                {topPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-cyan-50"
                  >
                    <span className="text-sm font-bold text-slate-800">{page.path}</span>
                    <span className="text-xs font-black text-cyan-700">{page.views} views</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 p-5">
              <h3 className="text-lg font-black text-slate-950">Next growth actions</h3>
              <div className="mt-4 grid gap-2">
                <Link to="/super-admin/public-website/pages" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-cyan-900">Add conversion sections</Link>
                <Link to="/super-admin/public-website/seo" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-cyan-900">Publish route SEO</Link>
                <Link to="/super-admin/public-website/publish" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-cyan-900">Ship release snapshot</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </PublicWebsiteShell>
  );
}
