import { useQuery } from '@tanstack/react-query';
import { getExperienceSeedHealth } from './experienceStudioApi';

export default function SeedHealthPanel() {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['sa:exp:seed-health'],
    queryFn: getExperienceSeedHealth,
    staleTime: 30_000,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Experience Seed Health</h2>
          <p className="mt-1 text-sm text-slate-600">
            One-click readiness checks for published Experience Studio baseline data.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Checks'}
        </button>
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Loading seed health...</p>}
      {error && <p className="mt-4 text-sm text-rose-700">Failed to load seed health.</p>}

      {data && (
        <div className="mt-4 space-y-4">
          <div className={`rounded-xl border px-4 py-3 ${data.ready ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className={`text-sm font-semibold ${data.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
              {data.ready ? 'Ready: Experience baseline is complete.' : 'Not ready: some required checks are missing.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Metric label="Published Brands" value={String(data.publishedBrandSystems)} />
            <Metric label="Published Routes" value={String(data.publishedWebsiteRoutes)} />
            <Metric label="Published Journeys" value={String(data.publishedStakeholderJourneys)} />
            <Metric label="Required Audiences" value={String(data.requiredAudienceCount)} />
            <Metric label="Active Demos" value={String(data.activeDemoScenarios)} />
            <Metric label="Investor Rooms" value={String(data.activeInvestorRooms)} />
            <Metric label="Presentations" value={String(data.publishedPresentations)} />
            <Metric label="Content Blocks" value={String(data.publishedContentBlocks)} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Checks</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(data.checks).map(([key, pass]) => (
                <div key={key} className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                  <span className="text-slate-700">{key}</span>
                  <span className={pass ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>{pass ? 'PASS' : 'FAIL'}</span>
                </div>
              ))}
            </div>
          </div>

          {(data.missingRouteAudiences.length > 0 || data.missingJourneyAudiences.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-800">Missing Route Audiences</p>
                <p className="mt-1 text-amber-700">{data.missingRouteAudiences.join(', ') || 'None'}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-800">Missing Journey Audiences</p>
                <p className="mt-1 text-amber-700">{data.missingJourneyAudiences.join(', ') || 'None'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
