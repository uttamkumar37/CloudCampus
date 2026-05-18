import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  { label: 'Website Dashboard', to: '/super-admin/public-website' },
  { label: 'Pages', to: '/super-admin/public-website/pages' },
  { label: 'Sections', to: '/super-admin/public-website/pages' },
  { label: 'Content Blocks', to: '/super-admin/public-website/pages' },
  { label: 'Navigation', to: '/super-admin/public-website/pages' },
  { label: 'Branding', to: '/super-admin/public-website/branding' },
  { label: 'SEO', to: '/super-admin/public-website/seo' },
  { label: 'Media Library', to: '/super-admin/public-website/media' },
  { label: 'Analytics', to: '/super-admin/public-website/analytics' },
  { label: 'Demo Showcase', to: '/super-admin/public-website/pages' },
  { label: 'Investor Showcase', to: '/super-admin/public-website/pages' },
  { label: 'Publish Center', to: '/super-admin/public-website/publish' },
] as const;

export function PublicWebsiteShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const location = useLocation();

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#ecfeff_30%,#f8fafc_65%)] px-6 py-6">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl shadow-slate-200 backdrop-blur-md">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white">Public Website Platform</div>
        </div>

        <div className="mb-6 grid gap-2 md:grid-cols-4 xl:grid-cols-6">
          {ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={[
                  'rounded-xl border px-3 py-2 text-xs font-semibold transition',
                  active
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                    : 'border-white/50 bg-white/70 text-slate-600 hover:border-cyan-200 hover:text-cyan-700',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}
