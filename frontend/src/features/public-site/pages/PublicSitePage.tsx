import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getPublicSiteApi,
  getPublicPageApi,
  type PublicSectionResponse,
} from '../api/publicSiteApi';

// ── Section renderers ─────────────────────────────────────────────────────────

function HeroSection({ content }: { content: Record<string, unknown> }) {
  const headline = typeof content.headline === 'string' ? content.headline : '';
  const subtext  = typeof content.subtext === 'string' ? content.subtext : '';
  const imageUrl = typeof content.imageUrl === 'string' ? content.imageUrl : '';

  return (
    <section
      className="relative flex min-h-[400px] items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-16 text-center text-white"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {imageUrl && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 max-w-2xl">
        {headline && <h1 className="text-4xl font-bold leading-tight">{headline}</h1>}
        {subtext && <p className="mt-4 text-lg opacity-90">{subtext}</p>}
      </div>
    </section>
  );
}

function TextSection({ content }: { content: Record<string, unknown> }) {
  const heading = typeof content.heading === 'string' ? content.heading : '';
  const text    = typeof content.text === 'string' ? content.text : '';

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      {heading && <h2 className="mb-4 text-2xl font-semibold text-gray-800">{heading}</h2>}
      {text && <p className="whitespace-pre-line text-gray-600 leading-relaxed">{text}</p>}
    </section>
  );
}

function ImageSection({ content }: { content: Record<string, unknown> }) {
  const src     = typeof content.src === 'string' ? content.src : '';
  const alt     = typeof content.alt === 'string' ? content.alt : '';
  const caption = typeof content.caption === 'string' ? content.caption : '';

  if (!src) return null;
  return (
    <section className="mx-auto max-w-3xl px-6 py-8 text-center">
      <img src={src} alt={alt} className="mx-auto max-h-[500px] rounded-xl object-cover shadow" />
      {caption && <p className="mt-3 text-sm text-gray-500">{caption}</p>}
    </section>
  );
}

function ContactSection({ content }: { content: Record<string, unknown> }) {
  const heading = typeof content.heading === 'string' ? content.heading : 'Contact Us';
  const email   = typeof content.email === 'string' ? content.email : '';
  const phone   = typeof content.phone === 'string' ? content.phone : '';
  const address = typeof content.address === 'string' ? content.address : '';

  return (
    <section className="bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">{heading}</h2>
        <div className="space-y-3 text-gray-600">
          {email   && <p>Email: <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></p>}
          {phone   && <p>Phone: <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a></p>}
          {address && <p className="whitespace-pre-line">{address}</p>}
        </div>
      </div>
    </section>
  );
}

function GenericSection({ section }: { section: PublicSectionResponse }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
        {JSON.stringify(section.content, null, 2)}
      </pre>
    </section>
  );
}

function RenderSection({ section }: { section: PublicSectionResponse }) {
  switch (section.sectionType) {
    case 'HERO':    return <HeroSection    content={section.content} />;
    case 'TEXT':    return <TextSection    content={section.content} />;
    case 'IMAGE':   return <ImageSection   content={section.content} />;
    case 'CONTACT': return <ContactSection content={section.content} />;
    default:        return <GenericSection section={section} />;
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function PublicSitePage() {
  const { tenantCode = '', slug } = useParams<{ tenantCode: string; slug?: string }>();
  const [activeSlug, setActiveSlug] = useState<string>(slug ?? '');

  const { data: site, isLoading: siteLoading, isError: siteError } = useQuery({
    queryKey: ['public-site', tenantCode],
    queryFn: () => getPublicSiteApi(tenantCode),
    enabled: !!tenantCode,
  });

  const resolvedSlug = activeSlug || site?.pages[0]?.slug || '';

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['public-page', tenantCode, resolvedSlug],
    queryFn: () => getPublicPageApi(tenantCode, resolvedSlug),
    enabled: !!tenantCode && !!resolvedSlug,
  });

  if (siteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (siteError || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-lg font-semibold">School website not found.</p>
        <Link to="/login" className="text-blue-600 hover:underline text-sm">Go to login</Link>
      </div>
    );
  }

  const navItems = [...(site.nav ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation bar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-base font-bold text-blue-700">{site.schoolName}</span>
          <nav className="flex items-center gap-1">
            {navItems.length > 0
              ? navItems.map((item) => {
                  const pageSlug = site.pages.find((p) => p.id === item.pageId)?.slug;
                  if (pageSlug) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSlug(pageSlug)}
                        className={[
                          'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                          activeSlug === pageSlug
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        {item.label}
                      </button>
                    );
                  }
                  if (item.url) {
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        {item.label}
                      </a>
                    );
                  }
                  return null;
                })
              : site.pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveSlug(p.slug)}
                    className={[
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      resolvedSlug === p.slug
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {p.title}
                  </button>
                ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      {pageLoading && (
        <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
          Loading page…
        </div>
      )}

      {pageData && !pageLoading && (
        <main>
          {pageData.sections
            .filter((s) => s.visible)
            .sort((a, b) => a.position - b.position)
            .map((s) => (
              <RenderSection key={s.id} section={s} />
            ))}
          {pageData.sections.filter((s) => s.visible).length === 0 && (
            <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
              This page has no content yet.
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        {site.schoolName} · Powered by CloudCampus
      </footer>
    </div>
  );
}
