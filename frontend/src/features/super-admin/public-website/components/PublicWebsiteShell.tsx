import { Link, useLocation } from 'react-router-dom';
import { useToast } from '@/shared/ui';
import { websiteBuilderReadiness } from '../config/websiteBuilderTemplates';

const ITEMS = [
  { label: 'Website Dashboard', to: '/super-admin/public-website' },
  { label: 'Pages', to: '/super-admin/public-website/pages' },
  {
    label: 'Sections',
    to: '/super-admin/public-website/pages',
    intent: 'Open Pages and select a route. The section library is available inside the page composer.',
  },
  {
    label: 'Content Blocks',
    to: '/super-admin/public-website/pages',
    intent: 'Content blocks are edited as structured sections inside the Pages workspace.',
  },
  {
    label: 'Navigation',
    to: '/super-admin/public-website/pages',
    intent: 'Navigation preview is available in the Pages workspace. Publishing remains in Publish Center.',
  },
  { label: 'Branding', to: '/super-admin/public-website/branding' },
  { label: 'SEO', to: '/super-admin/public-website/seo' },
  { label: 'Media Library', to: '/super-admin/public-website/media' },
  { label: 'Analytics', to: '/super-admin/public-website/analytics' },
  {
    label: 'Demo Showcase',
    to: '/super-admin/public-website/pages',
    intent: 'Use the Demo Conversion template from Pages to build or update demo showcase sections.',
  },
  {
    label: 'Investor Showcase',
    to: '/super-admin/public-website/pages',
    intent: 'Use the Investor Narrative template from Pages to build or update investor showcase sections.',
  },
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
  const publicWebsiteUrl = getPublicWebsiteUrl();
  const { info } = useToast();

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#ecfeff_30%,#f8fafc_65%)] px-4 py-5 sm:px-6">
      <div className="rounded-[2rem] border border-white/60 bg-white/75 p-4 shadow-2xl shadow-slate-200 backdrop-blur-md sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Experience Studio</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-300">
              Public Website Platform
            </div>
            <a
              href={publicWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-bold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              View Live Website
            </a>
            <Link
              to="/super-admin/public-website/publish"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              Publish Center
            </Link>
          </div>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-4">
          {websiteBuilderReadiness.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-2 md:grid-cols-4 xl:grid-cols-6">
          {ITEMS.map((item) => {
            const active = location.pathname === item.to && !('intent' in item);
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => {
                  if ('intent' in item) {
                    info(item.intent, item.label);
                  }
                }}
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

function getPublicWebsiteUrl() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return new URL('/', window.location.origin).toString();
}
