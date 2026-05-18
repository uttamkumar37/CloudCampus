import { Link } from 'react-router-dom';

const AI_MODULES = [
  {
    title: 'Prompt Governance',
    description: 'Manage role-aware prompt templates, activation policies, and versioned updates.',
    path: '/super-admin/ai/prompts',
    cta: 'Open Prompt Console',
  },
  {
    title: 'Knowledge Base Operations',
    description: 'Publish curated AI context and operational knowledge for assistant grounding.',
    path: '/super-admin/ai/knowledge',
    cta: 'Open Knowledge Console',
  },
  {
    title: 'Usage and Budget Monitoring',
    description: 'Track usage trends, cost footprints, and guardrail signals across tenants.',
    path: '/super-admin/ai/usage',
    cta: 'Open Usage Console',
  },
];

export default function AiExperienceManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">AI Experience Platform</h2>
        <span className="text-sm text-slate-500">3 operational consoles</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        AI controls are fully integrated through dedicated Super Admin modules. Use the links below to manage prompts,
        knowledge, and usage governance from the same experience workflow.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AI_MODULES.map((module) => (
          <div key={module.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
            <Link to={module.path} className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:text-sky-800">
              {module.cta} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
