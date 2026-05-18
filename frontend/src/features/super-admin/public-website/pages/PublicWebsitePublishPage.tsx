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

  return (
    <PublicWebsiteShell
      title="Publish Center"
      subtitle="Publish full website releases, keep rollback snapshots, and control preview-safe deployment operations."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => publishMutation.mutate()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Publish Website
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading snapshots...</p>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((snapshot) => (
            <div key={snapshot.id} className="flex items-center justify-between rounded-xl border border-white/70 bg-white/80 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{snapshot.versionLabel}</p>
                <p className="text-xs text-slate-500">{new Date(snapshot.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => rollbackMutation.mutate(snapshot.id)}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Rollback
              </button>
            </div>
          ))}
        </div>
      )}
    </PublicWebsiteShell>
  );
}
