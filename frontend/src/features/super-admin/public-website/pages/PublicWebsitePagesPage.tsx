import { useState } from 'react';
import type { FormEvent } from 'react';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { websiteSectionTemplates } from '../config/websiteBuilderTemplates';
import type { WebsiteSectionTemplate } from '../config/websiteBuilderTemplates';
import {
  useCreatePageMutation,
  useCreateSectionMutation,
  usePublishPageMutation,
  usePublishSectionMutation,
  useWebsitePagesQuery,
  useWebsiteSectionsQuery,
} from '../hooks/usePublicWebsiteQueries';

export function PublicWebsitePagesPage() {
  const { data, isLoading } = useWebsitePagesQuery();
  const createMutation = useCreatePageMutation();
  const publishMutation = usePublishPageMutation();
  const createSectionMutation = useCreateSectionMutation();
  const publishSectionMutation = usePublishSectionMutation();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const pages = data ?? [];
  const activePage = pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null;
  const sectionsQuery = useWebsiteSectionsQuery(activePage?.id ?? null);
  const sections = sectionsQuery.data ?? [];

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      return;
    }
    createMutation.mutate({
      pageKey: slug.trim().replaceAll('/', '-'),
      title,
      slug: slug.trim().replace(/^\//, ''),
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
    });
    setTitle('');
    setSlug('');
  }

  function createSectionFromTemplate(template: WebsiteSectionTemplate) {
    if (!activePage) {
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

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading pages...</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
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
                  <button type="button" onClick={() => setSelectedPageId(page.id)} className="block w-full text-left">
                    <p className="text-sm font-bold text-slate-900">{page.title}</p>
                    <p className="mt-1 text-xs text-slate-500">/{page.slug} · {page.status} · v{page.version}</p>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => publishMutation.mutate(page.id)}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                    >
                      Publish
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Section library</p>
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
                    disabled={!activePage || createSectionMutation.isPending}
                    className="mt-4 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add Default Section
                  </button>
                </article>
              ))}
            </div>

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
                          onClick={() => publishSectionMutation.mutate(section.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          Publish Section
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
