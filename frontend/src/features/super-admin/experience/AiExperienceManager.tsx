import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { generateAiContent, type AiContentGenerateResponse } from './experienceStudioApi';

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

const CONTENT_TYPES = [
  { value: 'HERO', label: 'Hero Section' },
  { value: 'FEATURES', label: 'Features Section' },
  { value: 'TESTIMONIAL', label: 'Testimonial' },
  { value: 'PRICING', label: 'Pricing Section' },
  { value: 'CTA', label: 'Call to Action' },
];

function tryParseJson(raw: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, string>;
    return null;
  } catch {
    return null;
  }
}

type GeneratorPanelProps = {
  blockId: string;
  onClose: () => void;
};

function GeneratorPanel({ blockId, onClose }: GeneratorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('HERO');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AiContentGenerateResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () => generateAiContent(blockId, { prompt, contentType }),
    retry: false,
    onSuccess: (data) => {
      setResult(data);
      setCopied(false);
    },
  });

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedResult = result ? tryParseJson(result.generatedContent) : null;

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">AI Content Generator</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-slate-500 hover:text-slate-700"
          aria-label="Close AI generator"
        >
          Close
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Block ID: <code className="font-mono text-slate-700">{blockId}</code>
      </p>

      {/* Content type selector */}
      <div>
        <label htmlFor="ai-content-type" className="block text-sm font-medium text-slate-700 mb-1.5">
          Content Type
        </label>
        <select
          id="ai-content-type"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          {CONTENT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prompt textarea */}
      <div>
        <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-700 mb-1.5">
          Prompt
        </label>
        <textarea
          id="ai-prompt"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the marketing copy you want to generate. E.g. Highlight CloudCampus attendance automation features for school principals."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y"
        />
      </div>

      {/* Error */}
      {mutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Generation failed. Check that the AI provider is configured and try again.
        </div>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !prompt.trim()}
        className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition"
      >
        {mutation.isPending ? 'Generating...' : 'Generate Content'}
      </button>

      {/* Result preview */}
      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Generated Content</h4>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>

          {parsedResult ? (
            <dl className="space-y-3 text-sm">
              {Object.entries(parsedResult).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
                    {key}
                  </dt>
                  <dd className="text-slate-800">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <pre className="whitespace-pre-wrap text-xs text-slate-700 font-mono bg-slate-50 rounded-lg p-3 overflow-auto max-h-60">
              {result.generatedContent}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function AiExperienceManager() {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

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
              {module.cta} &rarr;
            </Link>
          </div>
        ))}
      </div>

      {/* AI Content Generation */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Content Block AI Generator</h3>
          <p className="mt-1 text-sm text-slate-600">
            Generate structured marketing copy for any content block using the configured AI provider.
            The output is returned as JSON with keys: title, subtitle, body, ctaText.
          </p>
        </div>

        {activeBlockId ? (
          <GeneratorPanel blockId={activeBlockId} onClose={() => setActiveBlockId(null)} />
        ) : (
          <div className="space-y-3">
            <label htmlFor="block-id-input" className="block text-sm font-medium text-slate-700">
              Content Block ID
            </label>
            <div className="flex gap-3">
              <input
                id="block-id-input"
                type="text"
                placeholder="Enter a content block UUID"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) setActiveBlockId(val);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  const val = input.value.trim();
                  if (val) setActiveBlockId(val);
                }}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition"
              >
                Open Generator
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Copy the block UUID from the Content Blocks console and paste it above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
