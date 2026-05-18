import { useMemo, useState } from 'react';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import {
  useAuditTimelineQuery,
  usePublishWebsiteMutation,
  useRollbackAuditQuery,
  useRollbackSnapshotMutation,
  useSnapshotsQuery,
  useWebsiteNavigationQuery,
  useWebsitePagesQuery,
  useWebsiteSeoQuery,
  useWebsiteThemesQuery,
} from '../hooks/usePublicWebsiteQueries';
import { hasBlockingPreviewIssues, validateWebsitePreview } from '../utils/previewValidation';

function totalRestoredItems(counts: Record<string, unknown>): number {
  return Object.values(counts).reduce<number>((sum, value) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    return Number.isFinite(numericValue) ? sum + numericValue : sum;
  }, 0);
}

function formatEventType(eventType: string): string {
  return eventType
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function PublicWebsitePublishPage() {
  const publishMutation = usePublishWebsiteMutation();
  const rollbackMutation = useRollbackSnapshotMutation();
  const { data, isLoading } = useSnapshotsQuery();
  const pagesQuery = useWebsitePagesQuery();
  const navigationQuery = useWebsiteNavigationQuery();
  const themesQuery = useWebsiteThemesQuery();
  const seoQuery = useWebsiteSeoQuery();
  const { data: timeline, isLoading: timelineLoading } = useAuditTimelineQuery(50);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const { data: rollbackAudit } = useRollbackAuditQuery(selectedSnapshotId);
  const selectedSnapshot = useMemo(
    () => (data ?? []).find((snapshot) => snapshot.id === selectedSnapshotId) ?? null,
    [data, selectedSnapshotId],
  );
  const previewResults = useMemo(
    () =>
      validateWebsitePreview({
        pages: pagesQuery.data ?? [],
        navigation: navigationQuery.data ?? [],
        themes: themesQuery.data ?? [],
        seo: seoQuery.data ?? [],
      }),
    [navigationQuery.data, pagesQuery.data, seoQuery.data, themesQuery.data],
  );
  const previewLoading = pagesQuery.isLoading || navigationQuery.isLoading || themesQuery.isLoading || seoQuery.isLoading;
  const hasPreviewErrors = hasBlockingPreviewIssues(previewResults);

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
            disabled={publishMutation.isPending || previewLoading || hasPreviewErrors}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish Website'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Preview validation</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {previewResults.map((result) => {
              const errors = result.issues.filter((issue) => issue.severity === 'error').length;
              const warnings = result.issues.filter((issue) => issue.severity === 'warning').length;
              return (
              <div key={result.device} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black">{result.label}</p>
                  <span className={['rounded-full px-2.5 py-1 text-[11px] font-black', errors > 0 ? 'bg-rose-400/15 text-rose-200' : 'bg-emerald-400/15 text-emerald-200'].join(' ')}>
                    {errors > 0 ? `${errors} fix` : 'OK'}
                  </span>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-2" style={{ maxWidth: `${Math.min(result.width / 6, 180)}px` }}>
                  <div className="h-14 rounded-lg bg-[linear-gradient(135deg,rgba(34,211,238,0.35),rgba(16,185,129,0.22),rgba(251,191,36,0.18))]" />
                </div>
                {result.issues.length === 0 ? (
                  <p className="mt-3 text-xs font-semibold text-slate-300">Required content is ready.</p>
                ) : (
                  <ul className="mt-3 space-y-1.5">
                    {result.issues.slice(0, 3).map((issue) => (
                      <li key={`${result.device}-${issue.message}`} className={['text-xs leading-5', issue.severity === 'error' ? 'text-rose-100' : 'text-amber-100'].join(' ')}>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
                {warnings > 0 && errors === 0 && (
                  <p className="mt-2 text-xs font-semibold text-amber-100">{warnings} warning{warnings === 1 ? '' : 's'}</p>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading snapshots...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-950">Release timeline</h3>
            <p className="text-sm text-slate-500">Select a snapshot, review it, then restore that release state.</p>
          </div>
          <div className="space-y-2">
            {(data ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                No snapshots yet. Publish the first release after routes, sections, SEO, and theme are ready.
              </div>
            ) : (
              (data ?? []).map((snapshot) => (
                <button
                  key={snapshot.id}
                  type="button"
                  onClick={() => setSelectedSnapshotId(snapshot.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    selectedSnapshotId === snapshot.id
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{snapshot.versionLabel}</p>
                    <p className="text-xs text-slate-500">{new Date(snapshot.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                    {selectedSnapshotId === snapshot.id ? 'Selected' : 'Select'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Rollback</p>
          {selectedSnapshot ? (
            <>
              <h3 className="mt-2 text-xl font-black text-slate-950">{selectedSnapshot.versionLabel}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Restores published flags for pages, sections, themes, navigation, and SEO to this snapshot. The snapshot stays immutable.
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Created {new Date(selectedSnapshot.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => rollbackMutation.mutate(selectedSnapshot.id)}
                disabled={rollbackMutation.isPending}
                className="mt-4 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rollbackMutation.isPending ? 'Restoring...' : 'Rollback Selected Snapshot'}
              </button>
              <div className="mt-5 border-t border-amber-200 pt-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Audit</p>
                {(rollbackAudit ?? []).length === 0 ? (
                  <p className="mt-2 text-sm text-amber-800">No rollback events recorded for this snapshot.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {(rollbackAudit ?? []).slice(0, 3).map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-amber-200 bg-white/70 p-3">
                        <p className="text-xs font-semibold text-slate-900">{new Date(entry.createdAt).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          Restored {totalRestoredItems(entry.restoredCountsJson)} items
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-amber-300 p-4 text-sm text-amber-800">
              Select a release snapshot from the timeline to enable rollback.
            </div>
          )}
        </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-white/70 bg-white/85 p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Audit timeline</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">Builder activity</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {(timeline ?? []).length} events
          </span>
        </div>
        {timelineLoading ? (
          <p className="text-sm text-slate-500">Loading timeline...</p>
        ) : (timeline ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            No builder audit events yet. Saves, publishes, rollbacks, and theme changes will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {(timeline ?? []).slice(0, 12).map((event) => (
              <div key={event.id} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-black text-cyan-800">
                      {event.resourceType}
                    </span>
                    <p className="text-sm font-bold text-slate-900">{formatEventType(event.eventType)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{event.resourceLabel}</p>
                </div>
                <p className="text-xs font-semibold text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicWebsiteShell>
  );
}
