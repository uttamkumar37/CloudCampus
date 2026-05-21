import { Link } from 'react-router-dom';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useWebsiteMediaQuery } from '../hooks/usePublicWebsiteQueries';

const fallbackAssets = [
  { name: 'Product hero dashboard', bucket: 'public-site', status: 'Ready', href: '/' },
  { name: 'Investor narrative visual', bucket: 'public-site', status: 'Ready', href: '/investors' },
  { name: 'Demo showcase cards', bucket: 'conversion', status: 'Ready', href: '/demo' },
  { name: 'Pricing proof assets', bucket: 'monetization', status: 'Ready', href: '/pricing' },
];

export function PublicWebsiteMediaPage() {
  const { data, isLoading } = useWebsiteMediaQuery();
  const assets = (data ?? []).length > 0 ? data ?? [] : fallbackAssets;

  return (
    <PublicWebsiteShell
      title="Media Library"
      subtitle="Manage enterprise assets used across public pages: brand media, product videos, architecture visuals, and campaign creatives."
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading media assets...</p>
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-5">
            <h3 className="text-lg font-black text-slate-950">Media readiness</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Assets below are clickable. Backend media records appear automatically; fallback product assets keep the public website console complete during setup.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {assets.map((asset) => (
              <Link
                key={asset.name}
                to={asset.href ?? '/'}
                className="group overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/70"
              >
                <div className="h-32 bg-[linear-gradient(135deg,#0f172a,#0e7490,#f59e0b)] p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{asset.bucket}</p>
                  <p className="mt-2 text-lg font-black">{asset.name}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500">Status: {asset.status}</p>
                  <p className="mt-2 text-sm font-black text-cyan-700 group-hover:text-cyan-800">Open asset usage</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </PublicWebsiteShell>
  );
}
