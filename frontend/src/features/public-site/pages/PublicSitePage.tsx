import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getPublicSiteApi,
  getPublicPageApi,
  type PublicSectionResponse,
} from '../api/publicSiteApi';

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function safeHref(value: unknown, fallback = '#') {
  const href = str(value).trim();
  if (!href) return fallback;
  if (href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href.startsWith('https://') || href.startsWith('http://')) return href;
  return fallback;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'CC';
}

function HeroSection({ content, schoolName }: { content: Record<string, unknown>; schoolName: string }) {
  const heading = str(content.heading) || schoolName;
  const subheading = str(content.subheading) || str(content.subtext) || str(content.body);
  const ctaText = str(content.ctaText) || str(content.ctaLabel);
  const ctaUrl = safeHref(content.ctaUrl || content.primaryUrl);
  const badge = str(content.badge);
  const highlights = arr<string>(content.highlights);

  return (
    <section className="relative overflow-hidden bg-slate-950 px-5 py-16 text-white sm:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.35),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,64,175,0.9),rgba(8,145,178,0.75))]" />
      <div className="relative mx-auto max-w-6xl">
        {badge && (
          <span className="inline-flex rounded-full border border-cyan-200/50 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100">
            {badge}
          </span>
        )}
        <div className="mt-5 max-w-3xl">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{heading}</h1>
          {subheading && <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">{subheading}</p>}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {ctaText && (
            <a href={ctaUrl} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-cyan-50">
              {ctaText}
            </a>
          )}
          <a href="#contact" className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
            Contact School
          </a>
        </div>
        {highlights.length > 0 && (
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {highlights.slice(0, 3).map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatsSection({ content }: { content: Record<string, unknown> }) {
  const stats = arr<{ value: string; label: string; icon?: string }>(content.stats);
  if (stats.length === 0) return null;

  return (
    <section className="bg-white px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.slice(0, 8).map((stat, index) => (
          <div key={`${stat.label}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            {stat.icon && <p className="mb-2 text-2xl">{stat.icon}</p>}
            <p className="text-3xl font-black text-slate-950">{stat.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TextSection({ content }: { content: Record<string, unknown> }) {
  const heading = str(content.heading) || str(content.title);
  const body = str(content.body) || str(content.text);
  const highlights = arr<string>(content.highlights);
  const features = arr<{ icon?: string; title: string; desc?: string; body?: string }>(content.features);

  return (
    <section className="bg-white px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          {heading && <h2 className="text-3xl font-black text-slate-950">{heading}</h2>}
          {body && <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">{body}</p>}
        </div>
        {highlights.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-900">
                {item}
              </div>
            ))}
          </div>
        )}
        {features.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={`${feature.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-2xl">{feature.icon || '>'}</p>
                <h3 className="mt-3 text-base font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.desc || feature.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AdmissionsSection({ content }: { content: Record<string, unknown> }) {
  const heading = str(content.heading) || 'Admissions';
  const body = str(content.body);
  const steps = arr<{ step: number; title: string; desc: string }>(content.steps);
  const ctaText = str(content.ctaText) || 'Start Admission Inquiry';

  return (
    <section id="admissions" className="bg-slate-50 px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">Admissions</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{heading}</h2>
            {body && <p className="mt-4 text-base leading-8 text-slate-600">{body}</p>}
            <a href="#contact" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              {ctaText}
            </a>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {step.step || index + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-950">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NoticeSection({ content }: { content: Record<string, unknown> }) {
  const heading = str(content.heading) || 'Latest announcements';
  const notices = arr<string>(content.notices);
  if (notices.length === 0) return null;

  return (
    <section className="border-y border-amber-200 bg-amber-50 px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center">
        <p className="shrink-0 text-xs font-black uppercase tracking-widest text-amber-800">{heading}</p>
        <div className="flex flex-wrap gap-2">
          {notices.slice(0, 4).map((notice) => (
            <span key={notice} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {notice}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacultySection({ content }: { content: Record<string, unknown> }) {
  const heading = str(content.heading) || 'Faculty';
  const team = arr<{ name: string; title: string; bio: string }>(content.team);

  return (
    <section className="bg-white px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-950">{heading}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <article key={member.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                {initials(member.name)}
              </div>
              <p className="mt-4 font-bold text-slate-950">{member.name}</p>
              <p className="text-sm font-semibold text-blue-700">{member.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{member.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ content }: { content: Record<string, unknown> }) {
  const title = str(content.title) || str(content.heading) || 'Gallery';
  const images = arr<{ url: string; caption: string }>(content.images);

  return (
    <section className="bg-slate-50 px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-950">{title}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(images.length > 0 ? images : [
            { url: '', caption: 'Campus' },
            { url: '', caption: 'Activities' },
            { url: '', caption: 'Achievements' },
          ]).map((image, index) => (
            <div key={`${image.caption}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {image.url ? (
                <img src={image.url} alt={image.caption || title} loading="lazy" className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 text-4xl font-black text-blue-800">
                  {initials(image.caption || title)}
                </div>
              )}
              {image.caption && <p className="px-4 py-3 text-sm font-semibold text-slate-700">{image.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ content }: { content: Record<string, unknown> }) {
  const heading = str(content.heading) || 'Ready to connect?';
  const body = str(content.body);
  const ctaText = str(content.ctaText) || 'Request Callback';
  const ctaUrl = safeHref(content.ctaUrl, '#contact');

  return (
    <section className="bg-slate-950 px-5 py-14 text-white sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-black">{heading}</h2>
          {body && <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{body}</p>}
        </div>
        <a href={ctaUrl} className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 hover:bg-cyan-50">
          {ctaText}
        </a>
      </div>
    </section>
  );
}

function ContactSection({ content }: { content: Record<string, unknown> }) {
  const address = str(content.address);
  const phone = str(content.phone);
  const email = str(content.email);

  return (
    <section id="contact" className="bg-white px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-slate-950">Contact</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ['Address', address || 'Add campus address in builder'],
            ['Phone', phone || 'Add phone number in builder'],
            ['Email', email || 'Add email in builder'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RenderSection({ section, schoolName }: { section: PublicSectionResponse; schoolName: string }) {
  const normalizedType = section.sectionType.toUpperCase();
  switch (normalizedType) {
    case 'HERO': return <HeroSection content={section.content} schoolName={schoolName} />;
    case 'STATS': return <StatsSection content={section.content} />;
    case 'TEXT': return <TextSection content={section.content} />;
    case 'GALLERY':
    case 'IMAGE': return <GallerySection content={section.content} />;
    case 'CONTACT': return <ContactSection content={section.content} />;
    case 'CTA': return <CtaSection content={section.content} />;
    case 'NOTICE': return <NoticeSection content={section.content} />;
    case 'FACULTY': return <FacultySection content={section.content} />;
    case 'ADMISSIONS': return <AdmissionsSection content={section.content} />;
    default: return <TextSection content={section.content} />;
  }
}

export function PublicSitePage() {
  const { tenantCode = '', slug } = useParams<{ tenantCode: string; slug?: string }>();
  const [activeSlug, setActiveSlug] = useState<string>(slug ?? '');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (slug) setActiveSlug(slug);
  }, [slug]);

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

  const navItems = useMemo(() => {
    if (!site) return [];
    const fromNav = [...(site.nav ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.id,
        label: item.label,
        slug: site.pages.find((page) => page.id === item.pageId)?.slug,
        url: item.url,
      }))
      .filter((item) => item.slug || item.url);
    if (fromNav.length > 0) return fromNav;
    return site.pages.map((page) => ({ id: page.id, label: page.title, slug: page.slug, url: null }));
  }, [site]);

  if (siteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading school website...</p>
        </div>
      </div>
    );
  }

  if (siteError || !site || site.pages.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-slate-500">
        <p className="text-lg font-semibold text-slate-900">School website not found.</p>
        <Link to="/login" className="text-sm font-semibold text-blue-600 hover:underline">Go to login</Link>
      </div>
    );
  }

  const visibleSections = pageData?.sections
    .filter((section) => section.visible)
    .sort((a, b) => a.position - b.position) ?? [];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button type="button" onClick={() => setActiveSlug(site.pages[0]?.slug ?? '')} className="flex min-w-0 items-center gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
              {initials(site.schoolName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">{site.schoolName}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">CloudCampus Website</p>
            </div>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              item.slug ? (
                <button
                  key={item.id}
                  onClick={() => setActiveSlug(item.slug ?? '')}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${resolvedSlug === item.slug ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                >
                  {item.label}
                </button>
              ) : (
                <a key={item.id} href={safeHref(item.url)} className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                  {item.label}
                </a>
              )
            ))}
            <a href="#contact" className="ml-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Enquire
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((value) => !value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 lg:hidden"
            aria-expanded={mobileNavOpen}
          >
            Menu
          </button>
        </div>
        {mobileNavOpen && (
          <div className="border-t border-slate-200 px-5 py-3 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                item.slug ? (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSlug(item.slug ?? ''); setMobileNavOpen(false); }}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-left text-sm font-bold text-slate-700"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a key={item.id} href={safeHref(item.url)} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                    {item.label}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </header>

      {pageLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
        </div>
      ) : visibleSections.length > 0 ? (
        <main>
          {visibleSections.map((section) => (
            <RenderSection key={section.id} section={section} schoolName={site.schoolName} />
          ))}
        </main>
      ) : (
        <main className="flex h-72 items-center justify-center px-5 text-center">
          <div>
            <p className="text-lg font-bold text-slate-950">This page is being prepared.</p>
            <p className="mt-2 text-sm text-slate-500">Please check back soon.</p>
          </div>
        </main>
      )}

      <footer className="bg-slate-950 px-5 py-10 text-slate-300 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-lg font-black text-white">{site.schoolName}</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
              A modern school website powered by CloudCampus, built for admissions, communication, trust, and parent engagement.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Explore</p>
            <div className="mt-3 grid gap-2">
              {site.pages.slice(0, 5).map((page) => (
                <button key={page.id} onClick={() => setActiveSlug(page.slug)} className="text-left text-sm text-slate-400 hover:text-white">
                  {page.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Powered by</p>
            <p className="mt-3 text-sm font-semibold text-cyan-300">CloudCampus Website Builder</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
