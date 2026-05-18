import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getPublicSiteApi,
  getPublicPageApi,
  type PublicSectionResponse,
} from '../api/publicSiteApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown): string { return typeof v === 'string' ? v : ''; }
function arr<T>(v: unknown): T[]  { return Array.isArray(v) ? (v as T[]) : []; }

// ── HERO ──────────────────────────────────────────────────────────────────────

function HeroSection({ content }: { content: Record<string, unknown> }) {
  const heading    = str(content.heading);
  const subheading = str(content.subheading) || str(content.subtext);
  const ctaText    = str(content.ctaText) || str(content.ctaLabel);
  const ctaUrl     = str(content.ctaUrl) || str(content.primaryUrl);
  const badge      = str(content.badge);

  return (
    <section className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#003366] via-[#004080] to-[#1a5276] px-6 py-16 text-center text-white">
      {/* Decorative circles */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-3xl">
        {badge && (
          <span className="mb-4 inline-block rounded-full border border-yellow-300/60 bg-yellow-400/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-yellow-200">
            {badge}
          </span>
        )}
        {heading && (
          <h1 className="text-3xl font-extrabold leading-snug md:text-4xl lg:text-5xl">
            {heading}
          </h1>
        )}
        {subheading && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100 md:text-lg">
            {subheading}
          </p>
        )}
        {ctaText && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={ctaUrl || '#'}
              className="rounded-full bg-yellow-400 px-7 py-3 text-sm font-bold text-[#003366] shadow-lg transition hover:bg-yellow-300"
            >
              {ctaText}
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/50 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────

function StatsSection({ content }: { content: Record<string, unknown> }) {
  const stats = arr<{ value: string; label: string; icon?: string }>(content.stats);
  if (stats.length === 0) return null;

  return (
    <section className="bg-[#003366] px-6 py-0">
      <div className="mx-auto max-w-6xl">
        <div className={`grid divide-x divide-white/20 text-white sm:grid-cols-${Math.min(stats.length, 4)} grid-cols-2`}>
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center py-6 px-4 text-center">
              {s.icon && <span className="mb-1 text-2xl">{s.icon}</span>}
              <p className="text-3xl font-extrabold text-yellow-400">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-blue-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────────────────

function ContactSection({ content }: { content: Record<string, unknown> }) {
  const address = str(content.address);
  const phone   = str(content.phone);
  const email   = str(content.email);

  return (
    <section id="contact" className="bg-[#f0f4f8] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#003366]">Contact Us</h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-yellow-400" />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {address && (
            <div className="rounded-xl border border-blue-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#003366] text-xl text-white">📍</div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#003366]">Address</p>
              <p className="text-sm leading-relaxed text-gray-600">{address}</p>
            </div>
          )}
          {phone && (
            <div className="rounded-xl border border-blue-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#003366] text-xl text-white">📞</div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#003366]">Phone</p>
              <a href={`tel:${phone}`} className="text-sm font-medium text-blue-700 hover:underline">{phone}</a>
            </div>
          )}
          {email && (
            <div className="rounded-xl border border-blue-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#003366] text-xl text-white">✉️</div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#003366]">Email</p>
              <a href={`mailto:${email}`} className="text-sm font-medium text-blue-700 hover:underline">{email}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── TEXT (rich — NVS-styled) ──────────────────────────────────────────────────

function TextSection({ content }: { content: Record<string, unknown> }) {
  const heading  = str(content.heading) || str(content.title);
  const body     = str(content.body) || str(content.text);
  const highlights = arr<string>(content.highlights);
  const features   = arr<{ icon: string; title: string; desc: string }>(content.features);
  const sections   = arr<{ icon: string; title: string; body: string }>(content.sections);
  const steps      = arr<{ step: number; title: string; desc: string }>(content.steps);
  const team       = arr<{ name: string; title: string; bio: string }>(content.team);

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      {heading && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#003366]">{heading}</h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-yellow-400" />
        </div>
      )}

      {body && (
        <p className="mx-auto max-w-3xl whitespace-pre-line text-center leading-relaxed text-gray-600">
          {body}
        </p>
      )}

      {highlights.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">✓</span>
              <span className="text-sm text-gray-700">{h}</span>
            </div>
          ))}
        </div>
      )}

      {features.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#003366]/10 text-2xl">
                {f.icon}
              </div>
              <p className="mb-2 font-bold text-[#003366]">{f.title}</p>
              <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {sections.map((s, i) => (
            <div key={i} className="rounded-xl border-t-4 border-[#003366] bg-white p-6 shadow-sm text-center">
              <p className="mb-3 text-3xl">{s.icon}</p>
              <p className="mb-2 font-bold text-[#003366]">{s.title}</p>
              <p className="text-sm leading-relaxed text-gray-500">{s.body}</p>
            </div>
          ))}
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-8 space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003366] text-sm font-bold text-white">
                {s.step}
              </div>
              <div>
                <p className="font-bold text-[#003366]">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {team.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {team.map((m, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#003366] text-xl font-bold text-white">
                {m.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[#003366]">{m.name}</p>
                <p className="text-xs font-medium text-yellow-600">{m.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── GALLERY ───────────────────────────────────────────────────────────────────

function GallerySection({ content }: { content: Record<string, unknown> }) {
  const title  = str(content.title);
  const images = arr<{ url: string; caption: string }>(content.images);

  return (
    <section className="bg-[#f0f4f8] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        {title && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#003366]">{title}</h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-yellow-400" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <div key={i} className="group overflow-hidden rounded-xl shadow-sm">
              <div className="relative h-44 overflow-hidden bg-[#003366]/10">
                {img.url ? (
                  <img src={img.url} alt={img.caption} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🏫</div>
                )}
              </div>
              {img.caption && (
                <div className="bg-white px-3 py-2 text-center text-xs font-medium text-gray-600">{img.caption}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section dispatcher ────────────────────────────────────────────────────────

function RenderSection({ section }: { section: PublicSectionResponse }) {
  switch (section.sectionType) {
    case 'HERO':    return <HeroSection    content={section.content} />;
    case 'STATS':   return <StatsSection   content={section.content} />;
    case 'GALLERY': return <GallerySection content={section.content} />;
    case 'TEXT':    return <TextSection    content={section.content} />;
    case 'CONTACT': return <ContactSection content={section.content} />;
    default:        return <TextSection    content={section.content} />;
  }
}

// ── Announcement ticker ───────────────────────────────────────────────────────

const ANNOUNCEMENTS = [
  'JNVST Class VI Admission 2025-26 — Results declared. Check official portal.',
  'Annual Sports Meet scheduled for 15 December 2025.',
  'Science Exhibition winners announced — Congratulations to all participants!',
  'National Integration Camp 2025 — Registration open for Class IX students.',
  'Board Exam Preparation classes begin 1 November 2025.',
];

function AnnouncementTicker() {
  return (
    <div className="flex items-stretch overflow-hidden bg-yellow-400 text-[#003366]">
      <div className="flex shrink-0 items-center bg-[#003366] px-4 py-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">
          Latest
        </span>
      </div>
      <div className="flex-1 overflow-hidden py-2">
        <div className="animate-marquee whitespace-nowrap text-xs font-semibold">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span key={i} className="mx-8">◆ {a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Quick links sidebar ───────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Admission Info',    icon: '📋' },
  { label: 'Academic Calendar', icon: '📅' },
  { label: 'Exam Results',      icon: '🏆' },
  { label: 'Fee Structure',     icon: '💰' },
  { label: 'Downloads',         icon: '⬇️' },
  { label: 'RTI',               icon: '📂' },
  { label: 'Grievance',         icon: '📝' },
  { label: 'Toll-Free Helpline',icon: '☎️' },
];

// ── Main page ─────────────────────────────────────────────────────────────────

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#003366] border-t-transparent" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (siteError || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-gray-500">
        <p className="text-lg font-semibold">School website not found.</p>
        <Link to="/login" className="text-sm text-blue-600 hover:underline">Go to login</Link>
      </div>
    );
  }

  const navItems = [...(site.nav ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Top utility bar ──────────────────────────────────────────────── */}
      <div className="bg-[#1a2744] px-4 py-1.5 text-right text-xs text-gray-300">
        <span className="mr-4">Government of India</span>
        <span className="mr-4">|</span>
        <span className="mr-4">Ministry of Education</span>
        <span>|</span>
        <span className="ml-4">Navodaya Vidyalaya Samiti</span>
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="border-b-4 border-yellow-400 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-5">
          {/* Emblem placeholder */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#003366] text-3xl text-white shadow">
            🏫
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">
              Navodaya Vidyalaya Samiti · Govt. of India
            </p>
            <h1 className="mt-0.5 text-xl font-extrabold leading-tight text-[#003366] sm:text-2xl">
              {site.schoolName}
            </h1>
            <p className="text-xs text-gray-500">Sector 15, Indira Nagar, Lucknow, Uttar Pradesh</p>
          </div>
          {/* India emblem on right */}
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-xs font-bold text-[#003366]">नवोदय विद्यालय समिति</p>
            <p className="text-xs text-gray-400">Empowering Rural Talent</p>
          </div>
        </div>
      </header>

      {/* ── Navigation bar ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-[#003366] shadow-md">
        <div className="mx-auto flex max-w-6xl items-center overflow-x-auto">
          {navItems.length > 0
            ? navItems.map((item) => {
                const pageSlug = site.pages.find((p) => p.id === item.pageId)?.slug;
                const isActive = resolvedSlug === pageSlug;
                if (pageSlug) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSlug(pageSlug)}
                      className={[
                        'whitespace-nowrap px-5 py-3.5 text-sm font-semibold transition-colors border-b-3',
                        isActive
                          ? 'border-b-[3px] border-yellow-400 bg-[#004080] text-yellow-400'
                          : 'border-b-[3px] border-transparent text-gray-200 hover:bg-[#004080] hover:text-white',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  );
                }
                return null;
              })
            : site.pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveSlug(p.slug)}
                  className={[
                    'whitespace-nowrap px-5 py-3.5 text-sm font-semibold transition-colors',
                    resolvedSlug === p.slug
                      ? 'border-b-[3px] border-yellow-400 bg-[#004080] text-yellow-400'
                      : 'border-b-[3px] border-transparent text-gray-200 hover:bg-[#004080] hover:text-white',
                  ].join(' ')}
                >
                  {p.title}
                </button>
              ))}
        </div>
      </nav>

      {/* ── Announcement ticker ──────────────────────────────────────────── */}
      <AnnouncementTicker />

      {/* ── Page content ─────────────────────────────────────────────────── */}
      {pageLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#003366] border-t-transparent" />
        </div>
      ) : pageData ? (
        <>
          {/* Two-column layout for home page: main + quick-links sidebar */}
          {resolvedSlug === 'home' ? (
            <div className="mx-auto max-w-6xl px-4 py-0">
              <div className="flex flex-col gap-0 lg:flex-row">
                {/* Main content */}
                <div className="min-w-0 flex-1">
                  {pageData.sections
                    .filter((s) => s.visible)
                    .sort((a, b) => a.position - b.position)
                    .map((s) => <RenderSection key={s.id} section={s} />)}
                </div>
                {/* Quick links sidebar */}
                <aside className="w-full shrink-0 border-l border-gray-100 bg-[#f7f9fc] px-4 py-6 lg:w-56">
                  <p className="mb-3 border-b-2 border-yellow-400 pb-2 text-xs font-extrabold uppercase tracking-widest text-[#003366]">
                    Quick Links
                  </p>
                  <ul className="space-y-1">
                    {QUICK_LINKS.map((l, i) => (
                      <li key={i}>
                        <a
                          href="#"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-[#003366] hover:text-white"
                        >
                          <span>{l.icon}</span>
                          <span>{l.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Notice board mini */}
                  <p className="mb-3 mt-6 border-b-2 border-yellow-400 pb-2 text-xs font-extrabold uppercase tracking-widest text-[#003366]">
                    Notices
                  </p>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-1.5"><span className="mt-1 text-yellow-500">◆</span>JNVST Result 2025 declared</li>
                    <li className="flex items-start gap-1.5"><span className="mt-1 text-yellow-500">◆</span>Admission form last date extended</li>
                    <li className="flex items-start gap-1.5"><span className="mt-1 text-yellow-500">◆</span>Annual Day — 26 Jan 2026</li>
                    <li className="flex items-start gap-1.5"><span className="mt-1 text-yellow-500">◆</span>Winter vacation: 25 Dec – 5 Jan</li>
                  </ul>
                </aside>
              </div>
            </div>
          ) : (
            <main className="bg-white">
              {pageData.sections
                .filter((s) => s.visible)
                .sort((a, b) => a.position - b.position)
                .map((s) => <RenderSection key={s.id} section={s} />)}
              {pageData.sections.filter((s) => s.visible).length === 0 && (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                  No content on this page yet.
                </div>
              )}
            </main>
          )}
        </>
      ) : null}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-8 bg-[#1a2744] text-gray-300">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-sm font-bold text-yellow-400">About JNV Lucknow</p>
              <p className="text-xs leading-relaxed text-gray-400">
                Jawahar Navodaya Vidyalaya Lucknow is a co-educational residential school run by
                Navodaya Vidyalaya Samiti, providing quality education to rural meritorious students.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-yellow-400">Useful Links</p>
              <ul className="space-y-1 text-xs">
                {['navodaya.gov.in', 'moe.gov.in', 'cbse.gov.in', 'ncert.nic.in'].map((l, i) => (
                  <li key={i}><a href={`https://${l}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 hover:underline">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-yellow-400">Contact</p>
              <p className="text-xs leading-relaxed text-gray-400">
                Sector 15, Indira Nagar<br />
                Lucknow, Uttar Pradesh – 226016<br />
                📞 +91 7905025730<br />
                ✉️ uttamkumar3797@gmail.com
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-gray-500">
          © 2025 {site.schoolName} · Navodaya Vidyalaya Samiti · Government of India
          <span className="mx-2">|</span>
          Powered by <span className="text-yellow-400">CloudCampus</span>
        </div>
      </footer>
    </div>
  );
}
