import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getPublicNavigation,
  getPublicPage,
  getPublicTheme,
} from '@/features/super-admin/public-website/api/publicWebsiteApi';

type Cta = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'light';
};

type NavItem = {
  label: string;
  href: string;
};

type MetricCard = {
  value: string;
  label: string;
  detail: string;
};

type DashboardMetric = {
  label: string;
  value: string;
  accent: string;
};

type RoleShowcase = {
  id: string;
  role: string;
  title: string;
  description: string;
  benefits: string[];
  features: string[];
  cta: Cta;
  preview: DashboardMetric[];
};

type FeatureCard = {
  title: string;
  description: string;
  icon: string;
};

type PortalPreview = {
  title: string;
  description: string;
  metrics: DashboardMetric[];
};

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  cta: Cta;
  features: string[];
  highlighted?: boolean;
};

type PublicWebsiteConfig = {
  nav: NavItem[];
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctas: Cta[];
    dashboardCards: DashboardMetric[];
  };
  stats: MetricCard[];
  roles: RoleShowcase[];
  features: FeatureCard[];
  portals: PortalPreview[];
  investor: {
    title: string;
    subtitle: string;
    points: FeatureCard[];
    cta: Cta;
  };
  demos: FeatureCard[];
  pricing: PricingPlan[];
  footer: {
    groups: Array<{ title: string; links: NavItem[] }>;
    socials: NavItem[];
  };
};

function slugFromPath(pathname: string) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    return 'home';
  }
  return clean;
}

const siteConfig: PublicWebsiteConfig = {
  nav: [
    { label: 'Platform', href: '#platform-preview' },
    { label: 'Solutions', href: '#roles' },
    { label: 'AI', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  hero: {
    eyebrow: 'CloudCampus Global SaaS',
    title: 'AI-Native School ERP & Digital Campus Platform',
    subtitle:
      'CloudCampus unifies school administration, teaching workflows, student services, parent communication, public websites, and AI-assisted operations on one secure multi-tenant platform.',
    ctas: [
      { label: 'Book Live Demo', href: '#demo', variant: 'primary' },
      { label: 'Explore Platform', href: '#platform-preview', variant: 'secondary' },
    ],
    dashboardCards: [
      { label: 'Attendance', value: '96.4%', accent: 'from-emerald-400 to-teal-300' },
      { label: 'Fees', value: '₹42L', accent: 'from-amber-300 to-orange-300' },
      { label: 'Exams', value: '18', accent: 'from-violet-300 to-fuchsia-300' },
      { label: 'AI Insights', value: '247', accent: 'from-cyan-300 to-blue-300' },
      { label: 'Parent App', value: '4.8', accent: 'from-rose-300 to-pink-300' },
      { label: 'Teacher Portal', value: '82%', accent: 'from-lime-300 to-emerald-300' },
    ],
  },
  stats: [
    { value: '1000+', label: 'Schools Ready', detail: 'Built for single campuses, school chains, and education groups.' },
    { value: '1M+', label: 'Students Scalable', detail: 'Data model and workflows designed for large multi-tenant scale.' },
    { value: '99.9%', label: 'Uptime Goal', detail: 'Observability, backups, health checks, and resilient operations.' },
    { value: 'AI', label: 'Powered Operations', detail: 'AI copilots, insights, prompt governance, and usage controls.' },
    { value: 'SaaS', label: 'Multi-Tenant Architecture', detail: 'Secure tenant isolation for every school and role.' },
  ],
  roles: [
    {
      id: 'admin',
      role: 'School Admin',
      title: 'Command center for every campus operation',
      description: 'Run admissions, academics, staff, fees, communications, and compliance from a polished operations console.',
      benefits: ['Unified operational visibility', 'Configurable academic setup', 'Fee, exam, and attendance controls'],
      features: ['Campus dashboard', 'Automation rules', 'Compliance reports'],
      cta: { label: 'Explore Admin Demo', href: '/demo', variant: 'primary' },
      preview: [
        { label: 'Open tasks', value: '32', accent: 'from-cyan-300 to-blue-300' },
        { label: 'Collections', value: '91%', accent: 'from-amber-300 to-orange-300' },
        { label: 'Active staff', value: '148', accent: 'from-emerald-300 to-teal-300' },
      ],
    },
    {
      id: 'teacher',
      role: 'Teacher',
      title: 'A faster workspace for teaching teams',
      description: 'Teachers manage lessons, homework, attendance, online classes, notices, and student progress without tool switching.',
      benefits: ['Lesson and homework workflows', 'QR attendance and timetable', 'Class-level student insights'],
      features: ['Lesson plans', 'Assignments', 'Class analytics'],
      cta: { label: 'Explore Teacher Demo', href: '/demo', variant: 'primary' },
      preview: [
        { label: 'Today classes', value: '6', accent: 'from-violet-300 to-fuchsia-300' },
        { label: 'Homework due', value: '14', accent: 'from-rose-300 to-pink-300' },
        { label: 'Attendance', value: '94%', accent: 'from-emerald-300 to-teal-300' },
      ],
    },
    {
      id: 'student',
      role: 'Student',
      title: 'A clean digital campus for every learner',
      description: 'Students see timetable, homework, fees, results, attendance, notices, assignments, and QR tools in one place.',
      benefits: ['Personal academic dashboard', 'Mobile-first access', 'Results, notices, and payments'],
      features: ['Student profile', 'QR scan', 'Results center'],
      cta: { label: 'Explore Student Demo', href: '/demo', variant: 'primary' },
      preview: [
        { label: 'Assignments', value: '8', accent: 'from-cyan-300 to-blue-300' },
        { label: 'Result trend', value: 'A+', accent: 'from-lime-300 to-emerald-300' },
        { label: 'Notices', value: '12', accent: 'from-amber-300 to-orange-300' },
      ],
    },
    {
      id: 'parent',
      role: 'Parent',
      title: 'Transparent communication for families',
      description: 'Parents track attendance, homework, fees, notices, results, and linked children through a simple parent portal.',
      benefits: ['Linked child view', 'Fee and result transparency', 'School communication timeline'],
      features: ['Parent app', 'Fee alerts', 'Progress feed'],
      cta: { label: 'Explore Parent Demo', href: '/demo', variant: 'primary' },
      preview: [
        { label: 'Children', value: '2', accent: 'from-violet-300 to-fuchsia-300' },
        { label: 'Fee status', value: 'Paid', accent: 'from-emerald-300 to-teal-300' },
        { label: 'Updates', value: '24', accent: 'from-cyan-300 to-blue-300' },
      ],
    },
    {
      id: 'investor',
      role: 'Investor',
      title: 'A scalable education SaaS story',
      description: 'Investors get a clear view of product depth, multi-tenant economics, public website growth loops, and AI-first expansion.',
      benefits: ['Large addressable market', 'Recurring SaaS revenue model', 'AI and mobile expansion roadmap'],
      features: ['Investor room', 'Growth metrics', 'Market narrative'],
      cta: { label: 'Investor View', href: '/investors', variant: 'primary' },
      preview: [
        { label: 'ARR motion', value: 'SaaS', accent: 'from-amber-300 to-orange-300' },
        { label: 'Tenancy', value: 'Multi', accent: 'from-cyan-300 to-blue-300' },
        { label: 'Roadmap', value: 'AI', accent: 'from-violet-300 to-fuchsia-300' },
      ],
    },
  ],
  features: [
    { title: 'Attendance Management', description: 'QR, session, student, staff, and role-based attendance flows.', icon: 'AT' },
    { title: 'Fee Management', description: 'Fee structures, collection workflows, receipts, and payment readiness.', icon: 'FM' },
    { title: 'Exam & Result System', description: 'Exam setup, marks entry, report cards, and performance records.', icon: 'EX' },
    { title: 'Homework & Lesson Planning', description: 'Teacher assignments, submissions, lesson plans, and class work.', icon: 'HL' },
    { title: 'Parent Communication', description: 'Notices, linked children, progress visibility, and family updates.', icon: 'PC' },
    { title: 'Student Profile', description: 'Academic, attendance, finance, document, and lifecycle records.', icon: 'SP' },
    { title: 'AI Assistant', description: 'AI copilots, prompt governance, analytics, and safe usage controls.', icon: 'AI' },
    { title: 'Reports & Analytics', description: 'Operational dashboards, comparisons, and school performance insights.', icon: 'RA' },
    { title: 'Website Builder', description: 'Public pages, SEO, themes, sections, publishing, and analytics.', icon: 'WB' },
    { title: 'Mobile App Ready', description: 'Expo mobile experience with offline sync patterns and push readiness.', icon: 'MA' },
    { title: 'Multi-Tenant SaaS', description: 'Tenant isolation, feature flags, subscription controls, and scale.', icon: 'MT' },
    { title: 'Security & Compliance', description: 'RBAC, audit logs, rate limits, encryption, and production guards.', icon: 'SC' },
  ],
  portals: [
    {
      title: 'Super Admin Portal',
      description: 'Tenant, AI, investor, website, analytics, and platform controls.',
      metrics: [
        { label: 'Tenants', value: '128', accent: 'from-cyan-300 to-blue-300' },
        { label: 'AI usage', value: '42K', accent: 'from-violet-300 to-fuchsia-300' },
      ],
    },
    {
      title: 'School Admin Portal',
      description: 'Daily command center for academic and operational leadership.',
      metrics: [
        { label: 'Collections', value: '91%', accent: 'from-amber-300 to-orange-300' },
        { label: 'Attendance', value: '96%', accent: 'from-emerald-300 to-teal-300' },
      ],
    },
    {
      title: 'Teacher Portal',
      description: 'Lesson plans, homework, attendance, timetable, and notices.',
      metrics: [
        { label: 'Classes', value: '6', accent: 'from-lime-300 to-emerald-300' },
        { label: 'Tasks', value: '18', accent: 'from-rose-300 to-pink-300' },
      ],
    },
    {
      title: 'Student Portal',
      description: 'Results, fees, timetable, assignments, notices, and QR access.',
      metrics: [
        { label: 'Score', value: 'A+', accent: 'from-violet-300 to-fuchsia-300' },
        { label: 'Due', value: '3', accent: 'from-cyan-300 to-blue-300' },
      ],
    },
    {
      title: 'Parent Portal',
      description: 'Linked child timelines, fees, homework, attendance, and updates.',
      metrics: [
        { label: 'Children', value: '2', accent: 'from-amber-300 to-orange-300' },
        { label: 'Alerts', value: '12', accent: 'from-rose-300 to-pink-300' },
      ],
    },
    {
      title: 'Public Website Builder',
      description: 'Dynamic pages, sections, themes, SEO, media, and publishing.',
      metrics: [
        { label: 'Pages', value: '24', accent: 'from-emerald-300 to-teal-300' },
        { label: 'SEO', value: 'Live', accent: 'from-cyan-300 to-blue-300' },
      ],
    },
  ],
  investor: {
    title: 'Invest in the Future of Digital Education',
    subtitle:
      'CloudCampus connects ERP depth, AI-first operations, public website growth, mobile engagement, and multi-tenant SaaS economics for the next generation of schools.',
    points: [
      { title: 'Market Opportunity', description: 'A fragmented school software market ready for modern SaaS consolidation.', icon: 'MO' },
      { title: 'SaaS Subscription Model', description: 'Recurring subscriptions across schools, chains, modules, and AI usage.', icon: 'SM' },
      { title: 'Scalable Architecture', description: 'Multi-tenant platform foundation for broad deployment and governance.', icon: 'SA' },
      { title: 'AI-First Roadmap', description: 'Copilots, insights, automation, and prompt-controlled operations.', icon: 'AR' },
      { title: 'Website Builder', description: 'School-facing acquisition loops through branded public websites.', icon: 'WB' },
      { title: 'Mobile Expansion', description: 'Parent, student, and teacher engagement through mobile-first access.', icon: 'ME' },
      { title: 'Revenue Growth Potential', description: 'Expansion across payments, AI, communications, analytics, and websites.', icon: 'RG' },
    ],
    cta: { label: 'Contact for Investment', href: '#contact', variant: 'light' },
  },
  demos: [
    { title: 'Explore Admin Demo', description: 'Inspect admissions, fees, attendance, reports, and school operations.', icon: 'AD' },
    { title: 'Explore Teacher Demo', description: 'See lesson plans, homework, timetable, notices, and class insights.', icon: 'TD' },
    { title: 'Explore Student Demo', description: 'Preview timetable, assignments, results, fees, and profile tools.', icon: 'SD' },
    { title: 'Explore Parent Demo', description: 'Review linked children, fee status, homework, notices, and updates.', icon: 'PD' },
  ],
  pricing: [
    {
      name: 'Starter',
      description: 'For individual schools beginning their digital campus journey.',
      price: 'Editable',
      cta: { label: 'Book Live Demo', href: '#demo', variant: 'secondary' },
      features: ['Core ERP modules', 'Attendance and notices', 'Basic reports', 'Public school website'],
    },
    {
      name: 'Growth',
      description: 'For growing schools and groups that need automation and mobile engagement.',
      price: 'Editable',
      highlighted: true,
      cta: { label: 'Explore Platform', href: '#platform-preview', variant: 'primary' },
      features: ['Everything in Starter', 'Finance and exams', 'AI assistant workflows', 'Parent and teacher portals'],
    },
    {
      name: 'Enterprise',
      description: 'For chains, districts, and investors scaling a multi-school operating model.',
      price: 'Custom',
      cta: { label: 'Contact Sales', href: '#contact', variant: 'secondary' },
      features: ['Multi-tenant controls', 'Investor rooms', 'Advanced analytics', 'Custom rollout support'],
    },
  ],
  footer: {
    groups: [
      {
        title: 'Product',
        links: [
          { label: 'Platform', href: '#platform-preview' },
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
        ],
      },
      {
        title: 'Solutions',
        links: [
          { label: 'School Admin', href: '#roles' },
          { label: 'Teacher', href: '#roles' },
          { label: 'Parent App', href: '#roles' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'Investor', href: '#investor' },
          { label: 'Contact', href: '#contact' },
          { label: 'Admin Login', href: '/login' },
        ],
      },
    ],
    socials: [
      { label: 'LinkedIn', href: '#contact' },
      { label: 'X', href: '#contact' },
      { label: 'YouTube', href: '#contact' },
    ],
  },
};

export default function CloudCampusPublicWebsitePage() {
  const location = useLocation();
  const slug = slugFromPath(location.pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState(siteConfig.roles[0].id);

  const navQuery = useQuery({ queryKey: ['cloudcampus-public-nav'], queryFn: getPublicNavigation });
  const themeQuery = useQuery({ queryKey: ['cloudcampus-public-theme'], queryFn: getPublicTheme });
  useQuery({ queryKey: ['cloudcampus-public-page', slug], queryFn: () => getPublicPage(slug) });

  const navItems = useMemo(() => {
    const builderItems = (navQuery.data ?? [])
      .filter((item) => item.path && item.label)
      .map((item) => ({ label: item.label, href: item.path }));

    return builderItems.length > 0 ? builderItems : siteConfig.nav;
  }, [navQuery.data]);

  const themeAccent = (themeQuery.data?.tokensJson?.accent as string | undefined) ?? '#14b8a6';
  const activeRole = siteConfig.roles.find((role) => role.id === activeRoleId) ?? siteConfig.roles[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <SiteNavbar
        navItems={navItems}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((current) => !current)}
      />
      <main>
        <HeroSection accent={themeAccent} />
        <StatsSection />
        <RoleShowcaseSection activeRole={activeRole} onRoleChange={setActiveRoleId} />
        <FeatureGridSection />
        <PlatformPreviewSection />
        <InvestorSection />
        <DemoExperienceSection />
        <PricingSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteNavbar({
  navItems,
  isMenuOpen,
  onMenuToggle,
}: {
  navItems: NavItem[];
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101827] text-sm font-black text-white shadow-lg shadow-cyan-500/20">
            CC
          </span>
          <span className="text-lg font-black text-[#101827]">CloudCampus</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-950 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/investors"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-slate-950"
          >
            Investor View
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-[#101827] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-cyan-700"
          >
            Admin Login
          </Link>
        </div>

        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-2xl lg:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <a key={`${item.label}-${item.href}-mobile`} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                {item.label}
              </a>
            ))}
            <Link to="/investors" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800">
              Investor View
            </Link>
            <Link to="/login" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              Admin Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function HeroSection({ accent }: { accent: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(20,184,166,0.38),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(168,85,247,0.32),transparent_26%),radial-gradient(circle_at_64%_84%,rgba(245,158,11,0.24),transparent_28%)]" />
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: `linear-gradient(130deg, ${accent}22, transparent 35%, rgba(255,255,255,0.06) 70%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />

      <div className="relative mx-auto grid min-h-[86svh] max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:pt-10">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
            {siteConfig.hero.eyebrow}
          </p>
          <h1 className="mt-7 text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            {siteConfig.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            {siteConfig.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {siteConfig.hero.ctas.map((cta) => (
              <CtaLink key={cta.label} cta={cta} />
            ))}
          </div>
        </div>

        <HeroDashboard />
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-cyan-400/25 via-violet-400/20 to-amber-300/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="rounded-[1.25rem] bg-slate-950/80 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">CloudCampus OS</p>
              <p className="text-xs text-slate-400">Live campus command center</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">Live</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {siteConfig.hero.dashboardCards.map((card) => (
              <MetricTile key={card.label} metric={card} />
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-white">AI Operations Pulse</p>
              <p className="text-xs text-cyan-200">Next 7 days</p>
            </div>
            <div className="flex h-28 items-end gap-2">
              {[54, 78, 46, 86, 70, 94, 82, 64, 76].map((height, index) => (
                <div key={`${height}-${index}`} className="flex flex-1 items-end rounded-full bg-white/5">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-cyan-400 to-violet-300"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="-mt-10 px-5 sm:px-8">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-200/80 backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-5">
        {siteConfig.stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-slate-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl">
            <p className="text-3xl font-black text-slate-950">{stat.value}</p>
            <h2 className="mt-2 text-sm font-black text-slate-800">{stat.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoleShowcaseSection({
  activeRole,
  onRoleChange,
}: {
  activeRole: RoleShowcase;
  onRoleChange: (roleId: string) => void;
}) {
  return (
    <SectionShell id="roles" eyebrow="Role-based experiences" title="Every stakeholder gets a focused digital workspace" subtitle="CloudCampus is not a single admin screen. It is a complete ecosystem for school leaders, teachers, students, parents, and investors.">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {siteConfig.roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition ${
              role.id === activeRole.id
                ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/15'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-slate-950'
            }`}
          >
            {role.role}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
          <p className="text-sm font-black text-cyan-700">{activeRole.role}</p>
          <h3 className="mt-3 text-3xl font-black leading-tight text-slate-950">{activeRole.title}</h3>
          <p className="mt-4 text-base leading-7 text-slate-600">{activeRole.description}</p>
          <div className="mt-6 grid gap-3">
            {activeRole.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <p className="text-sm font-semibold text-slate-700">{benefit}</p>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <CtaLink cta={activeRole.cta} />
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-black">{activeRole.role} Preview</p>
              <p className="text-xs text-slate-400">Configurable dashboard surface</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">Preview</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {activeRole.preview.map((metric) => (
              <MetricTile key={metric.label} metric={metric} />
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {activeRole.features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm font-bold text-white">{feature}</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-violet-300" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function FeatureGridSection() {
  return (
    <SectionShell id="features" eyebrow="Enterprise feature fabric" title="One connected platform across ERP, AI, mobile, and public growth" subtitle="The feature model is modular, role-aware, and ready for Website Builder-driven section ordering.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {siteConfig.features.map((feature) => (
          <article key={feature.title} className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-2xl hover:shadow-cyan-100/80">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white transition group-hover:bg-cyan-700">
              {feature.icon}
            </span>
            <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function PlatformPreviewSection() {
  return (
    <SectionShell id="platform-preview" eyebrow="Platform preview" title="A premium operating system for every portal" subtitle="Modern portal surfaces help teams scan, compare, decide, and act quickly across the full school ecosystem.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {siteConfig.portals.map((portal) => (
          <article key={portal.title} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {portal.metrics.map((metric) => (
                  <MetricTile key={metric.label} metric={metric} />
                ))}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-slate-950">{portal.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{portal.description}</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function InvestorSection() {
  return (
    <section id="investor" className="relative overflow-hidden bg-[#101827] px-5 py-24 text-white sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.32),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.22),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black text-cyan-200">Investor narrative</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{siteConfig.investor.title}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">{siteConfig.investor.subtitle}</p>
            <div className="mt-8">
              <CtaLink cta={siteConfig.investor.cta} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {siteConfig.investor.points.map((point) => (
              <article key={point.title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">{point.icon}</span>
                <h3 className="mt-4 text-base font-black">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{point.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoExperienceSection() {
  return (
    <SectionShell id="demo" eyebrow="Demo experience" title="Experience CloudCampus Before Login" subtitle="Start with role-led demo paths before moving into authenticated portals.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {siteConfig.demos.map((demo) => (
          <Link key={demo.title} to="/demo" className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-2xl hover:shadow-cyan-100/80">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-sm font-black text-cyan-800">{demo.icon}</span>
            <h3 className="mt-5 text-lg font-black text-slate-950">{demo.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{demo.description}</p>
            <span className="mt-5 inline-flex text-sm font-black text-cyan-700">Open demo</span>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

function PricingSection() {
  return (
    <SectionShell id="pricing" eyebrow="Pricing" title="Commercial packaging ready for future dynamic editing" subtitle="Plans are structured for Website Builder and Super Admin pricing controls, with editable copy and CTA data.">
      <div className="grid gap-5 lg:grid-cols-3">
        {siteConfig.pricing.map((plan) => (
          <article key={plan.name} className={`rounded-[1.75rem] border p-6 shadow-xl transition hover:-translate-y-1 ${
            plan.highlighted
              ? 'border-slate-950 bg-slate-950 text-white shadow-slate-300'
              : 'border-slate-200 bg-white text-slate-950 shadow-slate-200/70'
          }`}>
            <p className={`text-sm font-black ${plan.highlighted ? 'text-cyan-200' : 'text-cyan-700'}`}>{plan.name}</p>
            <h3 className="mt-4 text-4xl font-black">{plan.price}</h3>
            <p className={`mt-3 min-h-16 text-sm leading-6 ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>{plan.description}</p>
            <div className="mt-6">
              <CtaLink cta={plan.cta} />
            </div>
            <div className="mt-7 grid gap-3">
              {plan.features.map((feature) => (
                <p key={feature} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${plan.highlighted ? 'bg-white/10 text-slate-100' : 'bg-slate-50 text-slate-700'}`}>
                  {feature}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function SiteFooter() {
  return (
    <footer id="contact" className="bg-white px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-slate-200 pt-12 lg:grid-cols-[1.2fr_1.8fr]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101827] text-sm font-black text-white">CC</span>
            <span className="text-lg font-black text-[#101827]">CloudCampus</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
            AI-native school ERP, digital campus operations, public website builder, and investor-ready SaaS platform for modern education networks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {siteConfig.footer.socials.map((social) => (
              <a key={social.label} href={social.href} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700">
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {siteConfig.footer.groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black text-slate-950">{group.title}</h3>
              <div className="mt-4 grid gap-3">
                {group.links.map((link) => (
                  <a key={`${group.title}-${link.label}`} href={link.href} className="text-sm font-semibold text-slate-600 hover:text-cyan-700">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright © 2026 CloudCampus. All rights reserved.</p>
        <p>Contact: hello@cloudcampus.io</p>
      </div>
    </footer>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-black text-cyan-700">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function MetricTile({ metric }: { metric: DashboardMetric }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
      <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${metric.accent}`} />
      <p className="text-2xl font-black text-white">{metric.value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-300">{metric.label}</p>
    </div>
  );
}

function CtaLink({ cta }: { cta: Cta }) {
  const className =
    cta.variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-300'
      : cta.variant === 'light'
        ? 'inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-cyan-50'
        : 'inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-800';

  if (cta.href.startsWith('/')) {
    return (
      <Link to={cta.href} className={className}>
        {cta.label}
      </Link>
    );
  }

  return (
    <a href={cta.href} className={className}>
      {cta.label}
    </a>
  );
}
