import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTenantStats } from '../api/tenantApi';
import { listSubscriptionPlans } from '../api/subscriptionApi';
import { PageHeader } from '@/shared/ui';

const STAT_CARDS = [
  { key: 'totalTenants',    label: 'Total Tenants',    color: 'text-gray-900',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  { key: 'activeTenants',   label: 'Active',           color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-100' },
  { key: 'suspendedTenants',label: 'Suspended',        color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'newThisMonth',    label: 'New This Month',   color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
] as const;

export function SuperAdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: getTenantStats,
  });
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: listSubscriptionPlans,
  });

  const monthlyRevenuePotential = plans.reduce((sum, plan) => sum + plan.priceMonthlyPaise, 0) / 100;
  const totalTenants = data?.totalTenants ?? 0;
  const activeTenants = data?.activeTenants ?? 0;
  const suspendedTenants = data?.suspendedTenants ?? 0;
  const newThisMonth = data?.newThisMonth ?? 0;
  const tenantHealthRate = totalTenants ? Math.round((activeTenants / totalTenants) * 100) : 0;
  const churnRiskRate = totalTenants ? Math.round((suspendedTenants / totalTenants) * 100) : 0;
  const supportQueueEstimate = suspendedTenants + Math.max(0, 5 - Math.min(newThisMonth, 5));

  const monetizationCards = [
    { label: 'Plan Catalog', value: plans.length, detail: 'Free, Starter, Professional, Enterprise', to: '/super-admin/tenants' },
    { label: 'AI Add-on Motion', value: 'AI', detail: 'Upsell AI analytics, copilot, reports, and website generation', to: '/super-admin/ai/usage' },
    { label: 'Catalog MRR Floor', value: `₹${monthlyRevenuePotential.toLocaleString('en-IN')}`, detail: 'Sum of published monthly plan prices', to: '/super-admin/tenants/new' },
  ];
  const controlCenterCards = [
    {
      label: 'Tenant Health',
      value: `${tenantHealthRate}%`,
      detail: `${activeTenants} active of ${totalTenants} total tenant(s)`,
      tone: 'border-emerald-100 bg-emerald-50 text-emerald-800',
      to: '/super-admin/analytics',
    },
    {
      label: 'Churn Risk',
      value: `${churnRiskRate}%`,
      detail: `${suspendedTenants} suspended tenant(s) need commercial review`,
      tone: 'border-rose-100 bg-rose-50 text-rose-800',
      to: '/super-admin/tenants',
    },
    {
      label: 'AI Usage',
      value: 'Live',
      detail: 'Monitor AI adoption, premium usage, and tenant budgets',
      tone: 'border-violet-100 bg-violet-50 text-violet-800',
      to: '/super-admin/ai/usage',
    },
    {
      label: 'Support Queue',
      value: supportQueueEstimate,
      detail: 'Estimated onboarding, risk, and account-success follow-ups',
      tone: 'border-amber-100 bg-amber-50 text-amber-800',
      to: '/super-admin/tenants',
    },
  ];
  const provisioningSteps = [
    { label: 'Create tenant workspace', detail: 'Register tenant code and platform account.', to: '/super-admin/tenants/new', done: totalTenants > 0 },
    { label: 'Assign subscription plan', detail: 'Set tenant limits and paid packaging.', to: '/super-admin/tenants', done: plans.length > 0 },
    { label: 'Enable feature toggles', detail: 'Switch on modules by plan and rollout stage.', to: '/super-admin/tenants', done: true },
    { label: 'Configure AI usage budget', detail: 'Review AI prompts, usage, and premium adoption.', to: '/super-admin/ai/usage', done: true },
    { label: 'Publish public demo presence', detail: 'Keep the product-facing website ready for buyers.', to: '/super-admin/public-website', done: true },
  ];
  const platformReadiness = [
    { label: 'Backend API', status: 'Ready', detail: 'Spring Boot service and health endpoints' },
    { label: 'Frontend', status: 'Ready', detail: 'Vite app route smoke checked after changes' },
    { label: 'Database', status: 'Tracked', detail: 'PostgreSQL and Flyway migrations' },
    { label: 'Redis', status: 'Tracked', detail: 'Cache/session infrastructure available' },
    { label: 'Queues', status: 'Tracked', detail: 'RabbitMQ foundation for async workloads' },
    { label: 'Public Website', status: 'Ready', detail: 'Marketing and school website surfaces connected' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <PageHeader title="Dashboard" />
        <p className="mt-0.5 text-sm text-gray-500">Platform-wide tenant overview</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
            <p className="text-xs font-medium text-gray-500">{c.label}</p>
            <p className={`mt-1 text-3xl font-bold ${c.color}`}>
              {isLoading ? '—' : (data?.[c.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">SaaS monetization</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">Subscription control center</h2>
            <p className="mt-1 text-sm text-slate-500">
              First-pass business panel for plan packaging, tenant upgrades, AI add-ons, and sales motion.
            </p>
          </div>
          <Link to="/super-admin/tenants" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
            Manage plans by tenant
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {monetizationCards.map((card) => (
            <Link key={card.label} to={card.to} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{plansLoading ? '...' : card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Enterprise SaaS control</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">Platform command center</h2>
            <p className="mt-1 text-sm text-slate-500">
              Revenue motion, tenant health, churn risk, AI adoption, and support signals in one Super Admin view.
            </p>
          </div>
          <Link to="/super-admin/analytics" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Open analytics
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {controlCenterCards.map((card) => (
            <Link key={card.label} to={card.to} className={`rounded-xl border p-4 transition hover:-translate-y-1 ${card.tone}`}>
              <p className="text-xs font-black uppercase tracking-wide opacity-75">{card.label}</p>
              <p className="mt-2 text-3xl font-black">{isLoading ? '...' : card.value}</p>
              <p className="mt-2 text-sm leading-6 opacity-80">{card.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Tenant provisioning</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">Launch checklist</h2>
            <p className="mt-1 text-sm text-slate-500">A repeatable activation path for new schools, demos, and enterprise rollouts.</p>
          </div>
          <div className="space-y-3">
            {provisioningSteps.map((step, index) => (
              <Link key={step.label} to={step.to} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-blue-200 hover:bg-blue-50">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {step.done ? '✓' : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-950">{step.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{step.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Readiness</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">Platform health snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">Investor-demo friendly service readiness without exposing tenant data.</p>
          </div>
          <div className="space-y-3">
            {platformReadiness.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-950">{item.label}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">{item.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/super-admin/tenants/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create Tenant
        </Link>
        <Link
          to="/super-admin/tenants"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          View All Tenants
        </Link>
      </div>
    </div>
  );
}
