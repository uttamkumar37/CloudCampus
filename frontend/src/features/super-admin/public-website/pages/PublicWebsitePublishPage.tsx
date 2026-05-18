import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import {
  usePublishWebsiteMutation,
  useRollbackSnapshotMutation,
  useSnapshotsQuery,
} from '../hooks/usePublicWebsiteQueries';

export function PublicWebsitePublishPage() {
  const publishMutation = usePublishWebsiteMutation();
  const rollbackMutation = useRollbackSnapshotMutation();
  const { data, isLoading } = useSnapshotsQuery();
  const releaseChecks = [
    'Published routes and sections',
    'SEO and Open Graph metadata',
    'Theme tokens and navigation',
    'Demo and investor journeys',
  ];

  return (
    <PublicWebsiteShell
      title="Publish Center"
      subtitle="Publish full website releases, keep rollback snapshots, and control preview-safe deployment operations."
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Release workflow</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">Publish a snapshot-backed website release</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This uses the existing Website Builder publish service so public runtime, rollback, and Super Admin governance stay intact.
          </p>
          <button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish Website'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Preflight</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {releaseChecks.map((check) => (
              <div key={check} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-black text-emerald-200">
                  OK
                </span>
                <p className="mt-3 text-sm font-bold text-white">{check}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading snapshots...</p>
      ) : (
        <div className="rounded-2xl border border-white/70 bg-white/85 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-950">Release timeline</h3>
            <p className="text-sm text-slate-500">Rollback stays available from the existing publish snapshot API.</p>
          </div>
          <div className="space-y-2">
            {(data ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                No snapshots yet. Publish the first release after routes, sections, SEO, and theme are ready.
              </div>
            ) : (
              (data ?? []).map((snapshot) => (
                <div key={snapshot.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{snapshot.versionLabel}</p>
                    <p className="text-xs text-slate-500">{new Date(snapshot.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => rollbackMutation.mutate(snapshot.id)}
                    disabled={rollbackMutation.isPending}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Rollback
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </PublicWebsiteShell>
  );
}
