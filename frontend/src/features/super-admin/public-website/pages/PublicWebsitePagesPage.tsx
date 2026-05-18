import { useState } from 'react';
import type { FormEvent } from 'react';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { useCreatePageMutation, usePublishPageMutation, useWebsitePagesQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsitePagesPage() {
  const { data, isLoading } = useWebsitePagesQuery();
  const createMutation = useCreatePageMutation();
  const publishMutation = usePublishPageMutation();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      return;
    }
    createMutation.mutate({
      pageKey: slug.trim().replaceAll('/', '-'),
      title,
      slug: slug.trim().replace(/^\//, ''),
      seoJson: { title, description: `${title} page` },
      settingsJson: { dynamicSections: true, previewEnabled: true },
    });
    setTitle('');
    setSlug('');
  }

  return (
    <PublicWebsiteShell
      title="Pages"
      subtitle="Manage global public pages with draft/publish workflows, slug routing, and dynamic section composition."
    >
      <form onSubmit={onSubmit} className="mb-6 grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 md:grid-cols-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (e.g. features)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Create Draft Page
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading pages...</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((page) => (
            <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/80 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{page.title}</p>
                <p className="text-xs text-slate-500">/{page.slug} · {page.status} · v{page.version}</p>
              </div>
              <button
                onClick={() => publishMutation.mutate(page.id)}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Publish
              </button>
            </div>
          ))}
        </div>
      )}
    </PublicWebsiteShell>
  );
}
