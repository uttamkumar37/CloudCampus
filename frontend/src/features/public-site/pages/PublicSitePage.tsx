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

// ── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection({ content }: { content: Record<string, unknown> }) {
  const heading   = str(content.heading);
  const subheading = str(content.subheading) || str(content.subtext);
  const rawBg     = str(content.backgroundImage) || str(content.imageUrl);
  const bgUrl     = /^https?:\/\//i.test(rawBg) ? rawBg : '';
  const ctaLabel  = str(content.ctaLabel);
  const ctaUrl    = str(content.ctaUrl);
  const secLabel  = str(content.secondaryCtaLabel);
  const secUrl    = str(content.secondaryCtaUrl);
  const badge     = str(content.badge);

  return (
    <section
      className="relative flex min-h-[480px] items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 px-6 py-20 text-center text-white"
      style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {bgUrl && <div className="absolute inset-0 bg-black/55" />}
      <div className="relative z-10 max-w-3xl">
        {badge && (
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
            {badge}
          </span>
        )}
        {heading && <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">{heading}</h1>}
        {subheading && <p className="mt-4 text-lg opacity-90 md:text-xl">{subheading}</p>}
        {(ctaLabel || secLabel) && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {ctaLabel && (
              <a
                href={ctaUrl || '#'}
                className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow hover:bg-blue-50 transition-colors"
              >
                {ctaLabel}
              </a>
            )}
            {secLabel && (
              <a
                href={secUrl || '#'}
                className="rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {secLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── STATS ────────────────────────────────────────────────────────────────────

function StatsSection({ content }: { content: Record<string, unknown> }) {
  const title = str(content.title);
  const stats = arr<{ value: string; label: string }>(content.stats);

  return (
    <section className="bg-blue-700 px-6 py-14 text-white">
      <div className="mx-auto max-w-5xl">
        {title && <h2 className="mb-10 text-center text-2xl font-bold">{title}</h2>}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── GALLERY ──────────────────────────────────────────────────────────────────

function GallerySection({ content }: { content: Record<string, unknown> }) {
  const title    = str(content.title);
  const subtitle = str(content.subtitle);
  const images   = arr<{ url: string; caption: string }>(content.images);

  return (
    <section className="bg-gray-50 px-6 py-14">
      <div className="mx-auto max-w-5xl">
        {title && <h2 className="text-center text-2xl font-bold text-gray-800">{title}</h2>}
        {subtitle && <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p>}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-xl shadow">
              <img
                src={img.url}
                alt={img.caption}
                className="h-48 w-full object-cover transition-transform hover:scale-105"
              />
              {img.caption && (
                <p className="bg-white px-3 py-2 text-center text-xs text-gray-500">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection({ content }: { content: Record<string, unknown> }) {
  const heading     = str(content.heading);
  const subtext     = str(content.subtext);
  const primaryLabel  = str(content.primaryLabel);
  const primaryUrl    = str(content.primaryUrl);
  const secondaryLabel = str(content.secondaryLabel);
  const secondaryUrl   = str(content.secondaryUrl);
  const highlight   = str(content.highlight);

  return (
    <section className="bg-indigo-700 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl text-center">
        {heading && <h2 className="text-3xl font-extrabold">{heading}</h2>}
        {subtext && <p className="mt-4 text-base opacity-90">{subtext}</p>}
        {highlight && (
          <p className="mt-4 inline-block rounded-full bg-white/20 px-5 py-1.5 text-sm font-semibold">
            {highlight}
          </p>
        )}
        {(primaryLabel || secondaryLabel) && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryLabel && (
              <a
                href={primaryUrl || '#'}
                className="rounded-lg bg-white px-7 py-3 text-sm font-bold text-indigo-700 shadow hover:bg-indigo-50 transition-colors"
              >
                {primaryLabel}
              </a>
            )}
            {secondaryLabel && (
              <a
                href={secondaryUrl || '#'}
                className="rounded-lg border border-white/60 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {secondaryLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────────────

function ContactSection({ content }: { content: Record<string, unknown> }) {
  const title    = str(content.title);
  const subtitle = str(content.subtitle);
  const address  = str(content.address);
  const hours    = str(content.officeHours);
  // Multi-department contacts array
  const contacts = arr<{ dept: string; phone: string; email: string }>(content.contacts);
  // Single contact fallback
  const phone = str(content.phone);
  const email = str(content.email);

  return (
    <section className="bg-gray-50 px-6 py-14">
      <div className="mx-auto max-w-3xl">
        {title && <h2 className="text-center text-2xl font-bold text-gray-800">{title}</h2>}
        {subtitle && <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>}

        {contacts.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {contacts.map((c, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">{c.dept}</p>
                {c.phone && <p className="text-sm text-gray-700">📞 <a href={`tel:${c.phone}`} className="hover:text-blue-600">{c.phone}</a></p>}
                {c.email && <p className="mt-1 text-sm text-gray-700">✉️ <a href={`mailto:${c.email}`} className="hover:text-blue-600">{c.email}</a></p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-3 text-center text-gray-600">
            {phone && <p>📞 <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a></p>}
            {email && <p>✉️ <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></p>}
          </div>
        )}

        {address && (
          <p className="mt-6 text-center text-sm text-gray-500">📍 {address}</p>
        )}
        {hours && (
          <p className="mt-2 text-center text-xs text-gray-400">🕐 {hours}</p>
        )}
      </div>
    </section>
  );
}

// ── TEXT (rich — handles all sub-shapes) ──────────────────────────────────────

function TextSection({ content }: { content: Record<string, unknown> }) {
  const title  = str(content.title);
  const body   = str(content.body) || str(content.text);
  const author = str(content.author);
  const authorTitle = str(content.authorTitle);

  // Feature cards
  const features = arr<{ icon: string; title: string; desc: string }>(content.features);
  // Testimonials
  const testimonials = arr<{ quote: string; author: string; role: string }>(content.testimonials);
  // Vision/mission sections
  const sections = arr<{ icon: string; title: string; body: string }>(content.sections);
  // Leadership team
  const team = arr<{ name: string; title: string; bio: string; image?: string }>(content.team);
  // Curriculum stages
  const stages = arr<{ stage: string; ages: string; focus: string }>(content.stages);
  // Departments
  const departments = arr<{ name: string; subjects?: string[]; code?: string }>(content.departments);
  // Extra-curricular programmes
  const programmes = arr<{ icon: string; title: string; desc: string }>(content.programmes);
  // Admission grades
  const grades = arr<{ grade: string; minAge: string; seats: number | string }>(content.grades);
  // Admission steps
  const steps = arr<{ step: number; title: string; desc: string }>(content.steps);
  // Fee table
  const feeTable = arr<{ level: string; tuition: string; examFee: string; annualCharges: string }>(content.feeTable);
  const scholarship = str(content.scholarship);
  const disclaimer  = str(content.disclaimer);
  // Documents list
  const documents = arr<string>(content.documents);
  const note = str(content.note);
  // Travel routes
  const routes = arr<{ mode: string; desc: string }>(content.routes);

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      {title && <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">{title}</h2>}

      {/* Plain body text */}
      {body && (
        <p className="mx-auto max-w-3xl whitespace-pre-line text-center text-gray-600 leading-relaxed">
          {body}
        </p>
      )}

      {/* Author attribution */}
      {author && (
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-gray-800">— {author}</p>
          {authorTitle && <p className="text-xs text-gray-500">{authorTitle}</p>}
        </div>
      )}

      {/* Feature cards (Why Choose Us) */}
      {features.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="mb-3 text-3xl">{f.icon.length <= 2 ? f.icon : '⭐'}</p>
              <p className="mb-2 font-semibold text-gray-800">{f.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-xl bg-blue-50 p-6">
              <p className="text-sm italic text-gray-700 leading-relaxed">"{t.quote}"</p>
              <p className="mt-4 text-xs font-semibold text-blue-700">{t.author}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      )}

      {/* Vision / Mission / Values */}
      {sections.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 text-center">
              <p className="mb-3 text-3xl">{s.icon.length <= 2 ? s.icon : '✦'}</p>
              <p className="mb-2 font-bold text-indigo-800">{s.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Leadership Team */}
      {team.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {team.map((m, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                {m.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{m.name}</p>
                <p className="text-xs font-medium text-indigo-600">{m.title}</p>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Curriculum Stages */}
      {stages.length > 0 && (
        <div className="mt-6 space-y-3">
          {stages.map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{s.stage}</span>
                <span className="text-xs text-gray-400">{s.ages}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{s.focus}</p>
            </div>
          ))}
        </div>
      )}

      {/* Departments & Subjects */}
      {departments.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {departments.map((d, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 font-semibold text-gray-800">{d.name}</p>
              {d.subjects && (
                <div className="flex flex-wrap gap-2">
                  {d.subjects.map((sub, j) => (
                    <span key={j} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{sub}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Extra-curricular Programmes */}
      {programmes.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-gray-800">{p.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Admission Grades */}
      {grades.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Grade</th>
                <th className="px-5 py-3 text-left font-semibold">Min. Age</th>
                <th className="px-5 py-3 text-left font-semibold">Available Seats</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-5 py-3 font-medium text-gray-800">{g.grade}</td>
                  <td className="px-5 py-3 text-gray-600">{g.minAge}</td>
                  <td className="px-5 py-3 text-gray-600">{String(g.seats)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {note && <p className="mt-3 text-xs text-gray-400 italic">{note}</p>}

      {/* Admission Steps */}
      {steps.length > 0 && (
        <div className="mt-6 space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                {s.step}
              </div>
              <div className="pt-1">
                <p className="font-semibold text-gray-800">{s.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fee Table */}
      {feeTable.length > 0 && (
        <>
          {disclaimer && <p className="mb-3 text-xs text-gray-400 italic">{disclaimer}</p>}
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-indigo-700 text-white">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Level</th>
                  <th className="px-5 py-3 text-left font-semibold">Tuition</th>
                  <th className="px-5 py-3 text-left font-semibold">Exam Fee</th>
                  <th className="px-5 py-3 text-left font-semibold">Annual Charges</th>
                </tr>
              </thead>
              <tbody>
                {feeTable.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-5 py-3 font-medium text-gray-800">{r.level}</td>
                    <td className="px-5 py-3 text-gray-600">{r.tuition}</td>
                    <td className="px-5 py-3 text-gray-600">{r.examFee}</td>
                    <td className="px-5 py-3 text-gray-600">{r.annualCharges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {scholarship && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800">
              🎓 {scholarship}
            </div>
          )}
        </>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <ul className="mt-4 space-y-2">
          {documents.map((doc, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="mt-0.5 text-blue-600">✓</span>
              {doc}
            </li>
          ))}
        </ul>
      )}

      {/* Travel Routes */}
      {routes.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {routes.map((r, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-2 font-semibold text-gray-800">{r.mode}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── IMAGE ────────────────────────────────────────────────────────────────────

function ImageSection({ content }: { content: Record<string, unknown> }) {
  const src     = str(content.src);
  const alt     = str(content.alt);
  const caption = str(content.caption);
  if (!src) return null;
  return (
    <section className="mx-auto max-w-3xl px-6 py-8 text-center">
      <img src={src} alt={alt} className="mx-auto max-h-[500px] rounded-xl object-cover shadow" />
      {caption && <p className="mt-3 text-sm text-gray-500">{caption}</p>}
    </section>
  );
}

// ── Section dispatcher ────────────────────────────────────────────────────────

function RenderSection({ section }: { section: PublicSectionResponse }) {
  switch (section.sectionType) {
    case 'HERO':    return <HeroSection    content={section.content} />;
    case 'STATS':   return <StatsSection   content={section.content} />;
    case 'GALLERY': return <GallerySection content={section.content} />;
    case 'CTA':     return <CtaSection     content={section.content} />;
    case 'TEXT':    return <TextSection    content={section.content} />;
    case 'IMAGE':   return <ImageSection   content={section.content} />;
    case 'CONTACT': return <ContactSection content={section.content} />;
    default:        return <TextSection    content={section.content} />;
  }
}

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
      <div className="flex min-h-screen items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (siteError || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-lg font-semibold">School website not found.</p>
        <Link to="/login" className="text-sm text-blue-600 hover:underline">Go to login</Link>
      </div>
    );
  }

  const navItems = [...(site.nav ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-base font-extrabold text-blue-700 tracking-tight">{site.schoolName}</span>
          <nav className="flex flex-wrap items-center gap-1">
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
                          resolvedSlug === pageSlug
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100',
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
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
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
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100',
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
      <footer className="border-t border-gray-100 bg-gray-50 py-8 text-center">
        <p className="text-sm font-semibold text-gray-700">{site.schoolName}</p>
        <p className="mt-1 text-xs text-gray-400">Powered by CloudCampus</p>
      </footer>
    </div>
  );
}
