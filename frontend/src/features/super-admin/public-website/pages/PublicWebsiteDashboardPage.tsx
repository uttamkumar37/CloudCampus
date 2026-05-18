import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useWebsiteDashboardQuery } from '../hooks/usePublicWebsiteQueries';

const journeyCards = [
  { title: 'School Conversion', detail: 'Hero, role pages, demos, pricing, and admin-login continuity.' },
  { title: 'Investor Conversion', detail: 'Market narrative, SaaS model, AI roadmap, and public investor room paths.' },
  { title: 'Builder Operations', detail: 'Draft routes, template-backed sections, SEO, theme tokens, snapshots, and rollback.' },
];

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
              <div key={card.label} className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/70 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Experience funnel</p>
                  <h3 className="mt-2 text-2xl font-black">Public website command center</h3>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  Runtime ready
                </span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {journeyCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-sm font-black text-white">{card.title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{card.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 h-24 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.3),rgba(168,85,247,0.24),rgba(251,191,36,0.18))]" />
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
              <h3 className="text-lg font-bold text-slate-900">Top Pages</h3>
              <div className="mt-3 space-y-2">
                {(data?.topPages ?? []).length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Analytics will appear after public events are ingested through the DSEP event pipeline.
                  </div>
                ) : (
                  (data?.topPages ?? []).map((page) => (
                    <div key={String(page.path)} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{String(page.path)}</span>
                      <span className="font-semibold text-cyan-700">{String(page.views)} views</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-5">
            <h3 className="text-lg font-bold text-slate-900">Builder Readiness</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              {['Audience preview', 'Device preview', 'Template defaults', 'Snapshot publish'].map((item) => (
                <div key={item} className="rounded-xl bg-white/80 px-4 py-3 text-sm font-bold text-cyan-900">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PublicWebsiteShell>
  );
}
