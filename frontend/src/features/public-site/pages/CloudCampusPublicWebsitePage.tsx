import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicNavigation, getPublicPage, getPublicTheme } from '@/features/super-admin/public-website/api/publicWebsiteApi';

function slugFromPath(pathname: string) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    return 'home';
  }
  return clean;
}

const FALLBACK_COPY: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: 'CloudCampus: The Enterprise AI-Native Platform For Modern Education Networks',
    subtitle: 'One platform for ERP, AI operations, public website control, mobile ecosystem, and investor-ready governance.',
  },
  features: {
    title: 'Unified Features Across Academic, Operational, Financial, and Digital Growth',
    subtitle: 'From admissions to analytics, every function is orchestrated on a multi-tenant core.',
  },
  platform: {
    title: 'Built for Multi-Tenant Scale and Enterprise Reliability',
    subtitle: 'CloudCampus architecture supports district, chain, and enterprise-wide operations with strict tenant isolation.',
  },
  ai: {
    title: 'AI Governance Built In, Not Bolted On',
    subtitle: 'Prompt control, usage analytics, and AI-assisted workflows across super admin and school operations.',
  },
  investors: {
    title: 'Investor Showcase: Product Depth, Market Readiness, and Scalable Unit Economics',
    subtitle: 'A clear path from product-led growth to enterprise expansion.',
  },
  demo: {
    title: 'Interactive ERP Demos for CBSE, ICSE, and International Models',
    subtitle: 'Launch realistic demos and inspect operations across all roles in minutes.',
  },
  pricing: {
    title: 'Flexible Commercial Plans for Institutions and Enterprise Groups',
    subtitle: 'Pricing aligned to adoption stage, tenant volume, and advanced AI usage.',
  },
  about: {
    title: 'About CloudCampus',
    subtitle: 'We are building the operating system for future-ready schools and education networks.',
  },
  contact: {
    title: 'Connect With Product, Sales, and Enterprise Architecture Teams',
    subtitle: 'Tell us your use case and we will tailor a rollout blueprint.',
  },
};

export default function CloudCampusPublicWebsitePage() {
  const location = useLocation();
  const slug = slugFromPath(location.pathname);

  const navQuery = useQuery({ queryKey: ['cloudcampus-public-nav'], queryFn: getPublicNavigation });
  const themeQuery = useQuery({ queryKey: ['cloudcampus-public-theme'], queryFn: getPublicTheme });
  const pageQuery = useQuery({ queryKey: ['cloudcampus-public-page', slug], queryFn: () => getPublicPage(slug) });

  const pageTitle = pageQuery.data?.page?.title ?? FALLBACK_COPY[slug]?.title ?? 'CloudCampus Public Platform';
  const subtitle = (pageQuery.data?.page?.seoJson?.description as string | undefined) ?? FALLBACK_COPY[slug]?.subtitle ?? '';

  const themePrimary = (themeQuery.data?.tokensJson?.primary as string | undefined) ?? '#071C32';
  const themeAccent = (themeQuery.data?.tokensJson?.accent as string | undefined) ?? '#11B5B8';

  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{
        backgroundImage: `radial-gradient(circle at 10% 10%, ${themeAccent}33, transparent 32%), radial-gradient(circle at 85% 5%, ${themeAccent}44, transparent 25%), linear-gradient(160deg, ${themePrimary}, #020617 70%)`,
      }}
    >
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-black tracking-tight">CloudCampus</Link>
          <nav className="hidden gap-3 md:flex">
            {(navQuery.data ?? []).map((item) => (
              <Link key={item.id} to={item.path} className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/login" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900">Admin Login</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl md:p-12">
          <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Public Website Platform
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-base text-slate-200/90 md:text-lg">{subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/demo" className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-900 hover:bg-cyan-400">Start Demo</Link>
            <Link to="/investors" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:border-cyan-300">Investor View</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-200">AI Showcase</h3>
            <p className="mt-2 text-sm text-slate-200">Prompt controls, usage analytics, and role-aware AI assistants.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-200">ERP Depth</h3>
            <p className="mt-2 text-sm text-slate-200">Student lifecycle, finance, attendance, academics, and operations.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-200">Enterprise Readiness</h3>
            <p className="mt-2 text-sm text-slate-200">Multi-tenant isolation, observability, security, and scalability posture.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
