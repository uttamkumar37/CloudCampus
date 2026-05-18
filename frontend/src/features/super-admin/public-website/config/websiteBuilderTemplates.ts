export type WebsiteSectionTemplate = {
  id: string;
  title: string;
  sectionType: string;
  description: string;
  audience: string;
  previewTone: string;
  defaultConfig: Record<string, unknown>;
};

export const websiteSectionTemplates: WebsiteSectionTemplate[] = [
  {
    id: 'ai-saas-hero',
    title: 'AI SaaS Hero',
    sectionType: 'hero',
    description: 'Full-screen premium story block with CTAs, platform proof, and dashboard mockup defaults.',
    audience: 'Schools, investors',
    previewTone: 'Gradient hero',
    defaultConfig: {
      title: 'AI-Native School ERP & Digital Campus Platform',
      subtitle:
        'A secure multi-tenant operating system for school admins, teachers, students, parents, and growth teams.',
      ctas: [
        { label: 'Book Live Demo', href: '#demo', variant: 'primary' },
        { label: 'Explore Platform', href: '#platform-preview', variant: 'secondary' },
      ],
      dashboardCards: ['Attendance', 'Fees', 'Exams', 'AI Insights', 'Parent App', 'Teacher Portal'],
      visibility: true,
      orderLocked: false,
    },
  },
  {
    id: 'stakeholder-showcase',
    title: 'Stakeholder Showcase',
    sectionType: 'role_showcase',
    description: 'Role-based tabs for School Admin, Teacher, Student, Parent, and Investor journeys.',
    audience: 'Buying committee',
    previewTone: 'Tabbed cards',
    defaultConfig: {
      title: 'Every stakeholder gets a focused digital workspace',
      roles: ['School Admin', 'Teacher', 'Student', 'Parent', 'Investor'],
      layout: 'tabs-with-dashboard-preview',
      visibility: true,
    },
  },
  {
    id: 'trust-metrics',
    title: 'Trust Metrics',
    sectionType: 'stats',
    description: 'Enterprise proof cards for scalability, uptime goals, AI operations, and multi-tenancy.',
    audience: 'Leadership',
    previewTone: 'Glass metrics',
    defaultConfig: {
      stats: ['1000+ Schools Ready', '1M+ Students Scalable', '99.9% Uptime Goal', 'AI-Powered Operations'],
      layout: 'five-card-grid',
      visibility: true,
    },
  },
  {
    id: 'investor-narrative',
    title: 'Investor Narrative',
    sectionType: 'investor',
    description: 'Market, SaaS model, architecture, AI roadmap, and revenue expansion story.',
    audience: 'Investors',
    previewTone: 'Dark premium',
    defaultConfig: {
      title: 'Invest in the Future of Digital Education',
      points: [
        'Market opportunity',
        'SaaS subscription model',
        'Multi-tenant scalable architecture',
        'AI-first roadmap',
        'Mobile app expansion',
      ],
      cta: { label: 'Contact for Investment', href: '#contact' },
      visibility: true,
    },
  },
  {
    id: 'demo-conversion',
    title: 'Demo Conversion',
    sectionType: 'demo_cards',
    description: 'Demo entry cards for Admin, Teacher, Student, and Parent preview experiences.',
    audience: 'Prospects',
    previewTone: 'Action grid',
    defaultConfig: {
      title: 'Experience CloudCampus Before Login',
      demos: ['Admin Demo', 'Teacher Demo', 'Student Demo', 'Parent Demo'],
      ctaMode: 'demo-route',
      visibility: true,
    },
  },
  {
    id: 'pricing-packages',
    title: 'Pricing Packages',
    sectionType: 'pricing',
    description: 'Editable Starter, Growth, and Enterprise pricing cards with future billing readiness.',
    audience: 'Sales',
    previewTone: 'Plan cards',
    defaultConfig: {
      plans: ['Starter', 'Growth', 'Enterprise'],
      pricingEditable: true,
      enterpriseCta: 'Contact Sales',
      visibility: true,
    },
  },
];

export const websiteBuilderReadiness = [
  { label: 'Dynamic routes', value: 'Enabled by WebsitePage slug runtime' },
  { label: 'Default templates', value: 'Every section starts with a structured config' },
  { label: 'Preview modes', value: 'Audience and device preview cues in builder UI' },
  { label: 'Publish safety', value: 'Snapshot release and rollback workflow' },
];
