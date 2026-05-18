import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useWebsiteMediaQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsiteMediaPage() {
  const { data, isLoading } = useWebsiteMediaQuery();

  return (
    <PublicWebsiteShell
      title="Media Library"
      subtitle="Manage enterprise assets used across public pages: brand media, product videos, architecture visuals, and campaign creatives."
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading media assets...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(data ?? []).map((asset) => (
            <div key={asset.name} className="rounded-xl border border-white/70 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
              <p className="text-xs text-slate-500">Bucket: {asset.bucket} · {asset.status}</p>
            </div>
          ))}
        </div>
      )}
    </PublicWebsiteShell>
  );
}
