import { useState } from 'react';
import type { FormEvent } from 'react';
import { PublicWebsiteShell } from '../components/PublicWebsiteShell';
import { usePublishSeoMutation, useUpsertSeoMutation, useWebsiteSeoQuery } from '../hooks/usePublicWebsiteQueries';

export function PublicWebsiteSeoPage() {
  const { data, isLoading } = useWebsiteSeoQuery();
  const upsertMutation = useUpsertSeoMutation();
  const publishMutation = usePublishSeoMutation();

  const [routePath, setRoutePath] = useState('/');
  const [metaTitle, setMetaTitle] = useState('CloudCampus | AI Native School ERP');
  const [metaDescription, setMetaDescription] = useState('CloudCampus public platform for product showcase, demos, and investor readiness.');

  function submitSeo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    upsertMutation.mutate({
      routePath,
      metaTitle,
      metaDescription,
      robots: 'index,follow',
      sitemapPriority: 0.9,
      sitemapChangeFreq: 'daily',
      openGraphJson: { title: metaTitle, description: metaDescription },
      twitterJson: { card: 'summary_large_image', title: metaTitle },
      structuredDataJson: { '@type': 'WebPage', name: metaTitle },
    });
  }

  return (
    <PublicWebsiteShell
      title="SEO"
      subtitle="Control meta tags, OpenGraph, Twitter cards, structured data, and sitemap strategy from one SEO console."
    >
      <form onSubmit={submitSeo} className="mb-6 grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4">
        <input value={routePath} onChange={(e) => setRoutePath(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Route path" />
        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Meta title" />
        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="min-h-20 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Meta description" />
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save SEO Draft</button>
          <button
            type="button"
            onClick={() => publishMutation.mutate(routePath)}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Publish SEO
          </button>
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading SEO entries...</p>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((item) => (
            <div key={item.id} className="rounded-xl border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{item.routePath}</p>
              <p className="text-xs text-slate-500">{item.metaTitle} · {item.status}</p>
            </div>
          ))}
        </div>
      )}
    </PublicWebsiteShell>
  );
}
