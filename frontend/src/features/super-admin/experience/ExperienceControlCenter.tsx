import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AiExperienceManager from './AiExperienceManager';
import BrandingSystemManager from './BrandingSystemManager';
import ContentBlockEditor from './ContentBlockEditor';
import DemoScenarioManager from './DemoScenarioManager';
import ExperienceAnalyticsDashboard from './ExperienceAnalyticsDashboard';
import InvestorRoomBuilder from './InvestorRoomBuilder';
import MarketingAutomationManager from './MarketingAutomationManager';
import PresentationBuilderManager from './PresentationBuilderManager';
import RenderProfilePreview from './RenderProfilePreview';
import SeedHealthPanel from './SeedHealthPanel';
import StakeholderJourneyManager from './StakeholderJourneyManager';
import StorytellingManager from './StorytellingManager';
import TemplateMarketplaceManager from './TemplateMarketplaceManager';
import TrustPlatformManager from './TrustPlatformManager';
import WebsiteRouteManager from './WebsiteRouteManager';
import { getExperienceSeedHealth } from './experienceStudioApi';

type Tab =
  | 'branding'
  | 'website'
  | 'journeys'
  | 'blocks'
  | 'demo'
  | 'investor'
  | 'ai'
  | 'analytics'
  | 'storytelling'
  | 'presentation'
  | 'marketing'
  | 'templates'
  | 'trust';

const TABS: { id: Tab; label: string; icon: string; description: string }[] = [
  { id: 'branding', label: 'Branding Systems', icon: 'BR', description: 'Manage tokens, typography, and brand packs' },
  { id: 'website', label: 'Website Routes', icon: 'WR', description: 'Control route-wise layout, SEO, and CTA configuration' },
  { id: 'journeys', label: 'Stakeholder Journeys', icon: 'SJ', description: 'Define role-specific narratives and conversion goals' },
  { id: 'blocks', label: 'Content Blocks', icon: 'CB', description: 'Edit and publish public-facing copy and structured content' },
  { id: 'demo', label: 'Demo Scenarios', icon: 'DM', description: 'Configure self-serve interactive ERP demonstrations' },
  { id: 'investor', label: 'Investor Rooms', icon: 'IR', description: 'Manage private data rooms for investor stakeholders' },
  { id: 'ai', label: 'AI Experience', icon: 'AI', description: 'Manage AI prompts, knowledge, guardrails, and usage governance' },
  { id: 'analytics', label: 'Analytics', icon: 'AN', description: 'Track page views, CTA clicks, demo starts, and investor engagement' },
  { id: 'storytelling', label: 'Storytelling Scenes', icon: 'ST', description: 'Publish narrative scenes with proof points and animations' },
  { id: 'presentation', label: 'Presentation Builder', icon: 'PR', description: 'Create and publish role-specific dynamic presentation decks' },
  { id: 'marketing', label: 'Marketing Campaigns', icon: 'MK', description: 'Launch and orchestrate campaign funnels and automation steps' },
  { id: 'templates', label: 'Template Marketplace', icon: 'TP', description: 'Curate reusable website templates and publish catalog entries' },
  { id: 'trust', label: 'Trust Modules', icon: 'TS', description: 'Maintain security, compliance, and reliability trust modules' },
];

type StudioDomainStatus = 'live' | 'in-progress' | 'planned';
type DomainHealth = 'healthy' | 'attention' | 'unknown';
type CheckState = 'pass' | 'fail' | 'unknown';
type CheckDetail = {
  label: string;
  state: CheckState;
};
type DomainHealthSnapshot = {
  health: DomainHealth;
  tooltip: string;
  details: CheckDetail[];
};

type StudioDomain = {
  key: string;
  name: string;
  goal: string;
  owner: string;
  status: StudioDomainStatus;
  capabilities: string[];
};

const STUDIO_DOMAINS: StudioDomain[] = [
  {
    key: 'branding',
    name: 'Global Branding Engine',
    goal: 'Control platform-wide visual identity, tokens, and theme packs from one console.',
    owner: 'Design Platform',
    status: 'live',
    capabilities: ['Design tokens', 'Theme packs', 'Brand versioning', 'Override rules'],
  },
  {
    key: 'website-builder',
    name: 'Dynamic Website Builder',
    goal: 'Compose role-aware pages with reusable sections, widgets, and SEO controls.',
    owner: 'Growth Platform',
    status: 'live',
    capabilities: ['Layout schema', 'Reusable sections', 'SEO metadata', 'Route publishing'],
  },
  {
    key: 'stakeholder-engine',
    name: 'Stakeholder Experience Engine',
    goal: 'Render unique journeys for investors, school leaders, teachers, parents, and students.',
    owner: 'Product Platform',
    status: 'live',
    capabilities: ['Audience segmentation', 'Journey rules', 'CTA variants', 'Narrative templates'],
  },
  {
    key: 'demo-platform',
    name: 'Interactive ERP Demo Platform',
    goal: 'Run isolated, resettable role-based demo tenants and guided walkthroughs.',
    owner: 'Experience Platform',
    status: 'live',
    capabilities: ['Scenario catalog', 'Session orchestration', 'Role simulation', 'Lifecycle controls'],
  },
  {
    key: 'ai-platform',
    name: 'AI Experience Platform',
    goal: 'Expose role-aware AI copilots with usage controls, budget limits, and audit trails.',
    owner: 'AI Platform',
    status: 'live',
    capabilities: ['Role-aware prompts', 'Budget controls', 'Guardrails', 'Usage observability'],
  },
  {
    key: 'storytelling',
    name: 'Enterprise Storytelling System',
    goal: 'Craft trust-building, animated narratives with metrics, architecture, and proof points.',
    owner: 'Narrative Design',
    status: 'live',
    capabilities: ['Scene timelines', 'Animated metrics', 'Proof modules', 'Case studies'],
  },
  {
    key: 'presentation',
    name: 'Dynamic Presentation Builder',
    goal: 'Create stakeholder decks with live widgets, charts, and public/private share modes.',
    owner: 'Revenue Platform',
    status: 'live',
    capabilities: ['Slide composition', 'Audience presets', 'Publish links', 'Deck lifecycle'],
  },
  {
    key: 'marketing',
    name: 'Marketing Automation System',
    goal: 'Capture, nurture, and convert leads through campaign workflows and analytics.',
    owner: 'Growth Operations',
    status: 'live',
    capabilities: ['Campaign engine', 'Step orchestration', 'Lead enrollment', 'Conversion tracking'],
  },
  {
    key: 'templates',
    name: 'Website Template Marketplace',
    goal: 'Offer reusable industry templates with branding packs and editable widgets.',
    owner: 'Template Platform',
    status: 'live',
    capabilities: ['Template catalog', 'Category tags', 'One-click clone', 'Template analytics'],
  },
  {
    key: 'analytics',
    name: 'Analytics and Insights Platform',
    goal: 'Track journeys, engagement, funnels, and AI usage with near-real-time dashboards.',
    owner: 'Data Platform',
    status: 'live',
    capabilities: ['Event ingestion', 'Session analytics', 'Funnel dashboards', 'Exports'],
  },
  {
    key: 'trust',
    name: 'Enterprise Trust Platform',
    goal: 'Visually showcase architecture, security, compliance, and reliability posture.',
    owner: 'Security and Compliance',
    status: 'live',
    capabilities: ['Trust modules', 'Security posture widgets', 'Audit evidence', 'SLA storytelling'],
  },
];

function healthClass(health: DomainHealth) {
  if (health === 'healthy') return 'bg-green-100 text-green-700';
  if (health === 'attention') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

function healthLabel(health: DomainHealth) {
  if (health === 'healthy') return 'healthy';
  if (health === 'attention') return 'attention';
  return 'unknown';
}

function checkDotClass(state: CheckState) {
  if (state === 'pass') return 'bg-green-500';
  if (state === 'fail') return 'bg-amber-500';
  return 'bg-slate-400';
}

const DOMAIN_CHECKS: Record<string, string[]> = {
  branding: ['publishedBrandSystems'],
  'website-builder': ['requiredRouteAudienceCoverage'],
  'stakeholder-engine': ['requiredJourneyAudienceCoverage'],
  'demo-platform': ['minimumDemoScenarios'],
  'ai-platform': [],
  storytelling: ['minimumPublishedStoryScenes'],
  presentation: ['minimumPublishedPresentations'],
  marketing: ['minimumActiveCampaigns'],
  templates: ['minimumPublishedTemplates'],
  analytics: ['minimumPublishedContentBlocks'],
  trust: ['minimumPublishedTrustModules'],
};

const CHECK_LABELS: Record<string, string> = {
  publishedBrandSystems: 'Published brand systems',
  requiredRouteAudienceCoverage: 'Required route audience coverage',
  requiredJourneyAudienceCoverage: 'Required journey audience coverage',
  minimumDemoScenarios: 'Minimum demo scenarios',
  minimumPublishedStoryScenes: 'Minimum published story scenes',
  minimumPublishedPresentations: 'Minimum published presentations',
  minimumActiveCampaigns: 'Minimum active campaigns',
  minimumPublishedTemplates: 'Minimum published templates',
  minimumPublishedContentBlocks: 'Minimum published content blocks',
  minimumPublishedTrustModules: 'Minimum published trust modules',
};

function resolveDomainHealth(
  domain: StudioDomain,
  checks: Record<string, boolean> | undefined,
  checksLoaded: boolean,
): DomainHealthSnapshot {
  if (!checksLoaded) {
    return {
      health: 'unknown',
      tooltip: 'Seed health not loaded yet.',
      details: [{ label: 'Seed health', state: 'unknown' }],
    };
  }

  const expectedChecks = DOMAIN_CHECKS[domain.key] ?? [];
  if (expectedChecks.length === 0) {
    return {
      health: domain.status === 'planned' ? 'attention' : 'healthy',
      tooltip: 'No domain-specific checks configured. Operational status inferred from studio state.',
      details: [{ label: 'Domain-specific checks', state: 'unknown' }],
    };
  }

  const details = expectedChecks.map((check): CheckDetail => {
    const label = CHECK_LABELS[check] ?? check;
    const result = checks?.[check];
    if (result === undefined) return { label, state: 'unknown' };
    return { label, state: result ? 'pass' : 'fail' };
  });

  const hasUnknownCheck = expectedChecks.some((check) => checks?.[check] === undefined);
  if (hasUnknownCheck) {
    return {
      health: 'unknown',
      tooltip: details.map((item) => `${item.label}: ${item.state}`).join('\n'),
      details,
    };
  }

  const allPassing = expectedChecks.every((check) => checks?.[check]);
  return {
    health: allPassing ? 'healthy' : 'attention',
    tooltip: details.map((item) => `${item.label}: ${item.state}`).join('\n'),
    details,
  };
}

export default function ExperienceControlCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('branding');
  const [openDomainPopover, setOpenDomainPopover] = useState<string | null>(null);
  const { data: seedHealth, isSuccess: hasSeedHealth } = useQuery({
    queryKey: ['sa:exp:seed-health:studio'],
    queryFn: getExperienceSeedHealth,
  });

  const domainsWithHealth = STUDIO_DOMAINS.map((domain) => ({
    ...domain,
    healthSnapshot: resolveDomainHealth(domain, seedHealth?.checks, hasSeedHealth),
  }));

  const healthyCount = domainsWithHealth.filter((d) => d.healthSnapshot.health === 'healthy').length;
  const attentionCount = domainsWithHealth.filter((d) => d.healthSnapshot.health === 'attention').length;
  const unknownCount = domainsWithHealth.filter((d) => d.healthSnapshot.health === 'unknown').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-sky-700 font-semibold uppercase tracking-widest mb-1">
            Super Admin
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Enterprise Experience Studio</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-4xl">
            Design, orchestrate, and publish stakeholder-specific digital experiences without code changes.
            Manage branding, website narratives, demos, investor journeys, AI showcases, campaigns, and trust stories
            from one Super Admin command center.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Platform Mission</h2>
            <p className="mt-2 text-sm text-slate-600">
              Deliver premium role-specific experiences for investors, school owners, principals, teachers,
              parents, students, partners, government stakeholders, and enterprise prospects.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricPill label="Domains" value={String(STUDIO_DOMAINS.length)} />
              <MetricPill label="Healthy" value={String(healthyCount)} />
              <MetricPill label="Attention" value={String(attentionCount)} />
              <MetricPill label="Unknown" value={String(unknownCount)} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Control Principles</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>UI-first configuration with no deployment dependency</li>
              <li>Tenant-safe and role-aware rendering contracts</li>
              <li>Feature-flag controlled progressive rollout</li>
              <li>Audit-logged publishing and rollback workflows</li>
            </ul>
          </section>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Experience Domains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {domainsWithHealth.map((domain) => (
              <article key={domain.key} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">{domain.name}</h3>
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDomainPopover(domain.key)}
                    onMouseLeave={() => setOpenDomainPopover((current) => (current === domain.key ? null : current))}
                  >
                    <button
                      type="button"
                      onFocus={() => setOpenDomainPopover(domain.key)}
                      onBlur={() => setOpenDomainPopover((current) => (current === domain.key ? null : current))}
                      onClick={() => setOpenDomainPopover((current) => (current === domain.key ? null : domain.key))}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${healthClass(domain.healthSnapshot.health)}`}
                      aria-label={`${domain.name} health details`}
                      aria-expanded={openDomainPopover === domain.key}
                    >
                      {healthLabel(domain.healthSnapshot.health)}
                    </button>
                    {openDomainPopover === domain.key && (
                      <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Health checks</p>
                        <ul className="space-y-1.5">
                          {domain.healthSnapshot.details.map((item) => (
                            <li key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                              <span className={`h-2 w-2 rounded-full ${checkDotClass(item.state)}`} aria-hidden="true" />
                              <span className="flex-1">{item.label}</span>
                              <span className="font-semibold uppercase text-[10px] tracking-wide">{item.state}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{domain.goal}</p>
                <p className="mt-2 text-xs text-slate-500">Owner: {domain.owner}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {domain.capabilities.map((capability) => (
                    <span key={capability} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {capability}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Management Consoles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left rounded-xl p-5 border-2 transition ${
                activeTab === tab.id
                  ? 'border-sky-600 bg-sky-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="text-xs font-semibold text-sky-700 mb-2">{tab.icon}</div>
              <div className="font-semibold text-slate-900 mb-0.5">{tab.label}</div>
              <div className="text-xs text-slate-500">{tab.description}</div>
            </button>
          ))}
        </div>
        </section>

        <SeedHealthPanel />

        <RenderProfilePreview />

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {activeTab === 'branding' && <BrandingSystemManager />}
          {activeTab === 'website' && <WebsiteRouteManager />}
          {activeTab === 'journeys' && <StakeholderJourneyManager />}
          {activeTab === 'blocks'   && <ContentBlockEditor />}
          {activeTab === 'demo'     && <DemoScenarioManager />}
          {activeTab === 'investor' && <InvestorRoomBuilder />}
          {activeTab === 'ai' && <AiExperienceManager />}
          {activeTab === 'analytics' && <ExperienceAnalyticsDashboard />}
          {activeTab === 'storytelling' && <StorytellingManager />}
          {activeTab === 'presentation' && <PresentationBuilderManager />}
          {activeTab === 'marketing' && <MarketingAutomationManager />}
          {activeTab === 'templates' && <TemplateMarketplaceManager />}
          {activeTab === 'trust' && <TrustPlatformManager />}
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
