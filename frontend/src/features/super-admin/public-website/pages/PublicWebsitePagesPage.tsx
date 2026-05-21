import { useState } from 'react';
import type { FormEvent } from 'react';
import { useToast } from '@/shared/ui';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { websiteSectionTemplates } from '../config/websiteBuilderTemplates';
import type { WebsiteSectionTemplate } from '../config/websiteBuilderTemplates';
import {
  useCreatePageMutation,
  useCreateSectionMutation,
  usePublishPageMutation,
  usePublishSectionMutation,
  useWebsiteNavigationQuery,
  useWebsitePagesQuery,
  useWebsiteSectionsQuery,
} from '../hooks/usePublicWebsiteQueries';

type BuilderWorkspace = 'pages' | 'templates' | 'ai' | 'navigation' | 'preview';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const workspaceTabs: Array<{ key: BuilderWorkspace; label: string; helper: string }> = [
  { key: 'pages', label: 'Pages', helper: 'Routes and draft status' },
  { key: 'templates', label: 'Templates', helper: 'Add real sections' },
  { key: 'ai', label: 'AI Assist', helper: 'Generate a starter route' },
  { key: 'navigation', label: 'Navigation', helper: 'Menu visibility preview' },
  { key: 'preview', label: 'Preview', helper: 'Device-safe checks' },
];

export function PublicWebsitePagesPage() {
  const { data, isLoading } = useWebsitePagesQuery();
  const navigationQuery = useWebsiteNavigationQuery();
  const createMutation = useCreatePageMutation();
  const publishMutation = usePublishPageMutation();
  const createSectionMutation = useCreateSectionMutation();
  const publishSectionMutation = usePublishSectionMutation();
  const { success, error: toastError, warning, info } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<BuilderWorkspace>('pages');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [aiPrompt, setAiPrompt] = useState('Create a premium CloudCampus landing page for school owners with demo CTAs, trust metrics, and AI ERP messaging.');

  const pages = data ?? [];
  const activePage = pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null;
  const sectionsQuery = useWebsiteSectionsQuery(activePage?.id ?? null);
  const sections = sectionsQuery.data ?? [];
  const navigation = navigationQuery.data ?? [];

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      warning('Enter a title and slug before creating a draft page.', 'Missing route details');
      return;
    }
    createMutation.mutate({
      pageKey: toSlug(slug),
      title,
      slug: toSlug(slug),
      seoJson: {
        title,
        description: `${title} CloudCampus public website page`,
        openGraphReady: true,
      },
      settingsJson: {
        dynamicSections: true,
        previewEnabled: true,
        defaultTemplatePreset: 'cloudcampus-enterprise-saas',
        editableFields: ['title', 'subtitle', 'image', 'cta', 'order', 'visibility', 'sectionType'],
        audiencePreview: ['school-admin', 'teacher', 'student', 'parent', 'investor'],
      },
    }, {
      onSuccess: (page) => {
        setSelectedPageId(page.id);
        setWorkspace('templates');
        success(`Draft page /${page.slug} created. Add sections next.`, 'Page created');
      },
      onError: () => toastError('Could not create this page. Check the route and try again.', 'Page creation failed'),
    });
    setTitle('');
    setSlug('');
  }

  function createSectionFromTemplate(template: WebsiteSectionTemplate) {
    if (!activePage) {
      warning('Create or select a page before adding sections.', 'Select a page');
      setWorkspace('pages');
      return;
    }

    createSectionMutation.mutate({
      pageId: activePage.id,
      payload: {
        sectionKey: `${template.sectionType}-${sections.length + 1}`,
        title: template.title,
        sectionType: template.sectionType,
        position: sections.length + 1,
        configJson: {
          ...template.defaultConfig,
          templateId: template.id,
          generatedBy: 'cloudcampus-builder-default-template',
        },
      },
    }, {
      onSuccess: () => success(`${template.title} added to /${activePage.slug}.`, 'Section added'),
      onError: () => toastError('Could not add this section. Please try again.', 'Section failed'),
    });
  }

  async function generateAiDraft() {
    const generatedSlug = toSlug(aiPrompt.split(' ').slice(0, 5).join('-')) || `ai-page-${Date.now()}`;
    const generatedTitle = toTitle(generatedSlug);

    try {
      const page = await createMutation.mutateAsync({
        pageKey: generatedSlug,
        title: generatedTitle,
        slug: generatedSlug,
        seoJson: {
          title: generatedTitle,
          description: `AI-assisted public website page generated from prompt: ${aiPrompt.slice(0, 140)}`,
          aiGenerated: true,
        },
        settingsJson: {
          aiPrompt,
          generatedBy: 'cloudcampus-superadmin-ai-assist',
          editableFields: ['title', 'subtitle', 'cta', 'audience', 'sectionType'],
          previewEnabled: true,
        },
      });

      const starterTemplates = websiteSectionTemplates.slice(0, 3);
      for (const [index, template] of starterTemplates.entries()) {
        await createSectionMutation.mutateAsync({
          pageId: page.id,
          payload: {
            sectionKey: `${template.sectionType}-${index + 1}`,
            title: template.title,
            sectionType: template.sectionType,
            position: index + 1,
            configJson: {
              ...template.defaultConfig,
              aiPrompt,
              templateId: template.id,
              generatedBy: 'cloudcampus-superadmin-ai-assist',
            },
          },
        });
      }

      setSelectedPageId(page.id);
      setWorkspace('preview');
      success(`AI draft /${page.slug} created with ${starterTemplates.length} starter sections.`, 'AI draft ready');
    } catch {
      toastError('The AI draft could not be created. Try a shorter prompt or a different page idea.', 'AI assist failed');
    }
  }

  function publishPage(pageId: string) {
    publishMutation.mutate(pageId, {
      onSuccess: (page) => success(`/${page.slug} is published.`, 'Page published'),
      onError: () => toastError('Could not publish this page. Please try again.', 'Publish failed'),
    });
  }

  function publishSection(sectionId: string) {
    publishSectionMutation.mutate(sectionId, {
      onSuccess: (section) => success(`${section.title} is published.`, 'Section published'),
      onError: () => toastError('Could not publish this section. Please try again.', 'Publish failed'),
    });
  }

  return (
    <PublicWebsiteShell
      title="Pages"
      subtitle="Manage global public pages with draft/publish workflows, slug routing, and dynamic section composition."
    >
      <div className="mb-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={onSubmit} className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Route composer</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">Create a premium draft page</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              New pages keep the existing public website runtime and start with builder-ready SEO, preview, and section-edit settings.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug (e.g. features)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Draft Page'}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Responsive preview</p>
              <h3 className="mt-1 text-xl font-black">Audience and device-safe by design</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">No-code foundation</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['Desktop', 'Tablet', 'Mobile'].map((device) => (
              <div key={device} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm font-black">{device}</p>
                <div className="mt-3 h-20 rounded-xl bg-[linear-gradient(135deg,rgba(34,211,238,0.35),rgba(168,85,247,0.28),rgba(251,191,36,0.18))]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-2 md:grid-cols-5">
        {workspaceTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setWorkspace(tab.key)}
            className={[
              'rounded-2xl border px-4 py-3 text-left transition',
              workspace === tab.key
                ? 'border-cyan-300 bg-cyan-50 text-cyan-900 shadow-sm'
                : 'border-white/70 bg-white/80 text-slate-600 hover:border-cyan-200 hover:text-cyan-800',
            ].join(' ')}
          >
            <span className="block text-sm font-black">{tab.label}</span>
            <span className="mt-1 block text-xs font-medium">{tab.helper}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading pages...</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3">
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Page routes</p>
                <p className="text-sm font-bold text-slate-900">{pages.length} drafts and published routes</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWorkspace('ai');
                  info('Describe the page and use Generate AI Draft to create a route with starter sections.', 'AI assist');
                }}
                className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
              >
                AI Draft
              </button>
            </div>
            {pages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
                Create the first route to start composing the public website.
              </div>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  className={[
                    'rounded-2xl border bg-white/85 px-4 py-3 shadow-sm transition',
                    activePage?.id === page.id ? 'border-cyan-300 ring-4 ring-cyan-100' : 'border-white/70 hover:border-cyan-200',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPageId(page.id);
                      setWorkspace('templates');
                    }}
                    className="block w-full text-left"
                  >
                    <p className="text-sm font-bold text-slate-900">{page.title}</p>
                    <p className="mt-1 text-xs text-slate-500">/{page.slug} · {page.status} · v{page.version}</p>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => publishPage(page.id)}
                      disabled={publishMutation.isPending}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                    >
                      {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                    </button>
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-cyan-300"
                    >
                      Preview
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
            {workspace === 'ai' && (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">AI website assistant</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">Generate a non-empty draft route</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  This uses the existing page and section APIs, then fills the route with structured starter sections.
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  rows={5}
                  className="mt-4 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
                <button
                  type="button"
                  onClick={generateAiDraft}
                  disabled={createMutation.isPending || createSectionMutation.isPending}
                  className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createMutation.isPending || createSectionMutation.isPending ? 'Generating...' : 'Generate AI Draft'}
                </button>
              </div>
            )}

            {workspace === 'navigation' && (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Navigation preview</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">Published menu readiness</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Super Admin can verify current navigation visibility here; full menu editing remains guarded by the existing navigation API.
                </p>
                <div className="mt-4 space-y-2">
                  {navigationQuery.isLoading ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Loading navigation...</p>
                  ) : navigation.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No navigation items are configured yet.</p>
                  ) : (
                    navigation.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.path} · {item.groupName} · {item.status}</p>
                        </div>
                        <span className={[
                          'rounded-full px-2.5 py-1 text-[11px] font-black',
                          item.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
                        ].join(' ')}
                        >
                          {item.visible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {workspace === 'preview' && (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Responsive preview</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      {activePage ? `Preview /${activePage.slug}` : 'Select a page to preview'}
                    </h3>
                  </div>
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                      <button
                        key={device}
                        type="button"
                        onClick={() => setPreviewMode(device)}
                        className={[
                          'rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition',
                          previewMode === device ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-500 hover:text-cyan-700',
                        ].join(' ')}
                      >
                        {device}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={[
                  'mx-auto mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-950 p-3 transition-all',
                  previewMode === 'desktop' ? 'max-w-full' : previewMode === 'tablet' ? 'max-w-xl' : 'max-w-xs',
                ].join(' ')}
                >
                  <div className="rounded-[1.25rem] bg-white p-4">
                    <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#0e7490,#f59e0b)] p-5 text-white">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Live route simulation</p>
                      <h4 className="mt-2 text-2xl font-black">{activePage?.title ?? 'No route selected'}</h4>
                      <p className="mt-2 text-sm text-cyan-50">
                        {activePage ? `${sections.length} sections · ${activePage.status} · version ${activePage.version}` : 'Create a page to see a preview shell.'}
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {(sections.length ? sections : [{ id: 'empty', title: 'Add a template section', sectionType: 'empty', status: 'draft' }]).map((section) => (
                        <div key={section.id} className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-sm font-bold text-slate-900">{section.title}</p>
                          <p className="text-xs text-slate-500">{section.sectionType} · {section.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(workspace === 'pages' || workspace === 'templates') && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                      {workspace === 'templates' ? 'Section library' : 'Route workspace'}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      {activePage ? `Compose /${activePage.slug}` : 'Select a page'}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Templates create real Website Builder sections with non-empty default config for future Super Admin editing.
                    </p>
                  </div>
                  {activePage && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {sections.length} sections
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {websiteSectionTemplates.map((template) => (
                    <article key={template.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-950">{template.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{template.description}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-600">
                          {template.sectionType}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">{template.audience}</span>
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-800">{template.previewTone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => createSectionFromTemplate(template)}
                        disabled={createSectionMutation.isPending}
                        className="mt-4 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {createSectionMutation.isPending ? 'Adding...' : activePage ? 'Add Default Section' : 'Select Page First'}
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}

            {activePage && (
              <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
                <h4 className="text-sm font-black text-slate-950">Current section order</h4>
                {sectionsQuery.isLoading ? (
                  <p className="mt-3 text-sm text-slate-500">Loading sections...</p>
                ) : sections.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No sections yet. Add a default template so this route never starts from a blank canvas.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {sections.map((section) => (
                      <div key={section.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{section.position}. {section.title}</p>
                          <p className="text-xs text-slate-500">{section.sectionType} · {section.status}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => publishSection(section.id)}
                          disabled={publishSectionMutation.isPending}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          {publishSectionMutation.isPending ? 'Publishing...' : 'Publish Section'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PublicWebsiteShell>
  );
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toTitle(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
