import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getPublicWebsite, submitAdmissionLead } from '../api/publicWebsiteApi'
import type { AdmissionLeadRequest, PublicWebsiteData, WebsiteConfig, WebsiteSection } from '../types'

interface Props {
  slug: string
}

export function SchoolWebsitePage({ slug }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-website', slug],
    queryFn: () => getPublicWebsite(slug),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <PageSkeleton />
  if (isError || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold">School website not found</p>
          <p className="text-slate-400 text-sm mt-1">This school may not be active or the link may be incorrect.</p>
        </div>
      </div>
    )
  }

  const site = data.data
  const { config, sections, gallery } = site
  const theme = config.themeColor ?? '#10b981'

  const sectionMap = Object.fromEntries(sections.map((s) => [s.sectionKey, s]))
  const logoUrl = config.logoUrl || site.logoUrl

  return (
    <div className="font-sans text-slate-800 antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: theme }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${site.schoolName} logo`}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                {site.schoolName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-base leading-tight">{site.schoolName}</p>
              {config.affiliationBoard && (
                <p className="text-white/70 text-xs leading-tight">{config.affiliationBoard}</p>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-white/90 text-sm font-medium">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            {config.noticesText && <a href="#notices" className="hover:text-white transition-colors">Notices</a>}
            {gallery.length > 0 && <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>}
            {config.admissionsOpen && (
              <a
                href="#admissions"
                className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors border border-white/30"
              >
                Admissions Open
              </a>
            )}
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          <a href="#portal" className="px-4 py-1.5 rounded-full border border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
            Login Portal
          </a>
          </div>
          {/* Mobile menu placeholder — minimal for now */}
          <div className="md:hidden">
            {config.admissionsOpen && (
              <a href="#admissions" className="text-white text-xs font-semibold border border-white/40 px-3 py-1 rounded-full">
                Admissions
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection site={site} theme={theme} section={sectionMap['hero']} />

      {/* Stats Bar */}
      <StatsBar config={config} />

      {/* About */}
      {(config.aboutText || config.visionText || config.missionText) && (
        <AboutSection config={config} section={sectionMap['about']} theme={theme} />
      )}

      {/* Notices */}
      {config.noticesText && (
        <NoticesSection noticesText={config.noticesText} section={sectionMap['notices']} />
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <GallerySection gallery={gallery} section={sectionMap['gallery']} />
      )}

      {/* Admissions */}
      {config.admissionsOpen && (
        <AdmissionsSection slug={slug} config={config} section={sectionMap['admissions']} theme={theme} />
      )}

      {/* Contact */}
      <ContactSection config={config} section={sectionMap['contact']} theme={theme} />

      {/* Login Portal */}
      <PortalSection slug={slug} theme={theme} />

      {/* Footer */}
      <footer className="py-8 text-center text-white/80 text-sm" style={{ backgroundColor: theme }}>
        <p className="font-medium">{site.schoolName}</p>
        {config.schoolAddress && (
          <p className="text-white/60 text-xs mt-1">{config.schoolAddress}{config.schoolCity ? `, ${config.schoolCity}` : ''}</p>
        )}
        <p className="text-white/50 text-xs mt-3">© {new Date().getFullYear()} {site.schoolName}. Powered by CloudCampus.</p>
      </footer>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({
  site, theme, section,
}: {
  site: PublicWebsiteData
  theme: string
  section?: WebsiteSection
}) {
  const config = site.config
  const bgStyle = config.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.6) 100%), url(${config.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: `linear-gradient(135deg, ${theme} 0%, ${theme}dd 100%)` }

  const ctaText = config.heroCtaText || (config.admissionsOpen ? 'Apply for Admissions' : null)
  const ctaLink = config.heroCtaLink || (config.admissionsOpen ? '#admissions' : null)

  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-20" style={bgStyle}>
      {/* Achievement badge */}
      {config.achievementBadge && (
        <div className="mb-6 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full">
          <svg className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {config.achievementBadge}
        </div>
      )}

      <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 leading-tight">
        {section?.title ?? site.schoolName}
      </h1>

      {(section?.subtitle || config.schoolTagline) && (
        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
          {section?.subtitle ?? config.schoolTagline}
        </p>
      )}

      {config.schoolEstablishedYear && (
        <p className="text-white/60 text-sm mt-3">Established {config.schoolEstablishedYear}</p>
      )}

      {ctaText && ctaLink && (
        <a
          href={ctaLink}
          className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all border-2 border-white text-white hover:bg-white hover:text-slate-800"
          style={{ '--hover-color': theme } as React.CSSProperties}
        >
          {ctaText}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      )}
    </div>
  )
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ config }: { config: WebsiteConfig }) {
  const items = [
    config.studentCount ? { value: config.studentCount.toLocaleString() + '+', label: 'Students' } : null,
    config.teacherCount ? { value: config.teacherCount.toLocaleString() + '+', label: 'Educators' } : null,
    config.schoolEstablishedYear ? { value: (new Date().getFullYear() - config.schoolEstablishedYear) + '+', label: 'Years of Excellence' } : null,
    config.affiliationBoard ? { value: config.affiliationBoard, label: 'Affiliation' } : null,
    config.mediumOfInstruction ? { value: config.mediumOfInstruction, label: 'Medium' } : null,
  ].filter(Boolean) as { value: string; label: string }[]

  if (items.length === 0) return null

  return (
    <div className="py-8 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className={`grid gap-6 text-center ${items.length <= 3 ? 'grid-cols-' + items.length : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-' + items.length}`}>
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <p className="text-2xl md:text-3xl font-extrabold text-white">{item.value}</p>
              <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutSection({ config, section, theme }: { config: WebsiteConfig; section?: WebsiteSection; theme: string }) {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title={section?.title ?? 'About Us'} subtitle={section?.subtitle} theme={theme} />

        {config.aboutText && (
          <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base mt-6 max-w-3xl">
            {config.aboutText}
          </p>
        )}

        {(config.visionText || config.missionText) && (
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {config.visionText && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme + '20' }}>
                    <svg className="w-4 h-4" style={{ color: theme }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800">Our Vision</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{config.visionText}</p>
              </div>
            )}
            {config.missionText && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme + '20' }}>
                    <svg className="w-4 h-4" style={{ color: theme }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800">Our Mission</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{config.missionText}</p>
              </div>
            )}
          </div>
        )}

        {config.schoolType && (
          <div className="mt-6 inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {config.schoolType} School
          </div>
        )}
      </div>
    </section>
  )
}

// ── Notices ───────────────────────────────────────────────────────────────────

function NoticesSection({ noticesText, section }: { noticesText: string; section?: WebsiteSection }) {
  const notices = noticesText.split('\n').filter((l) => l.trim().length > 0)
  return (
    <section id="notices" className="py-16 bg-amber-50 border-y border-amber-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{section?.title ?? 'Notices & Announcements'}</h2>
            {section?.subtitle && <p className="text-sm text-slate-500">{section.subtitle}</p>}
          </div>
        </div>
        <div className="space-y-2">
          {notices.map((notice, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-amber-100 px-4 py-3 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">{notice}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function GallerySection({ gallery, section }: { gallery: PublicWebsiteData['gallery']; section?: WebsiteSection }) {
  return (
    <section id="gallery" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={section?.title ?? 'Photo Gallery'} subtitle={section?.subtitle ?? 'Moments from our vibrant school community'} theme="#64748b" />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gallery.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square shadow-sm">
              <img
                src={item.imageUrl}
                alt={item.caption ?? ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Photo' }}
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-medium truncate">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Admissions ────────────────────────────────────────────────────────────────

function AdmissionsSection({
  slug, config, section, theme,
}: {
  slug: string
  config: WebsiteConfig
  section?: WebsiteSection
  theme: string
}) {
  const [form, setForm] = useState<AdmissionLeadRequest>({
    parentName: '', parentEmail: '', parentPhone: '', studentName: '', applyingClass: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: (payload: AdmissionLeadRequest) => submitAdmissionLead(slug, payload),
    onSuccess: () => setSubmitted(true),
  })

  const classOptions = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11 - Science', '11 - Commerce', '11 - Arts', '12 - Science', '12 - Commerce', '12 - Arts']

  return (
    <section id="admissions" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading title={section?.title ?? 'Admissions'} subtitle={section?.subtitle ?? 'Join our school family — applications are now open'} theme={theme} />

        {config.admissionInfo && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
            {config.admissionInfo}
          </div>
        )}

        <div className="mt-8">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-800 font-bold text-xl">Enquiry Submitted!</p>
              <p className="text-emerald-600 text-sm mt-2 max-w-sm mx-auto">
                Thank you for your interest. Our admissions team will reach out to you shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <AField label="Parent / Guardian Name *" value={form.parentName} onChange={(v) => setForm((p) => ({ ...p, parentName: v }))} required />
                <AField label="Phone Number *" value={form.parentPhone} onChange={(v) => setForm((p) => ({ ...p, parentPhone: v }))} required type="tel" />
                <AField label="Email Address" value={form.parentEmail} onChange={(v) => setForm((p) => ({ ...p, parentEmail: v }))} type="email" />
                <AField label="Student Name *" value={form.studentName} onChange={(v) => setForm((p) => ({ ...p, studentName: v }))} required />
                <div className="md:col-span-1">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class Applying For</span>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 appearance-none bg-white"
                      value={form.applyingClass}
                      onChange={(e) => setForm((p) => ({ ...p, applyingClass: e.target.value }))}
                    >
                      <option value="">Select class…</option>
                      {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message (Optional)</span>
                <textarea
                  rows={3}
                  placeholder="Any questions or special requirements…"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none text-slate-700 placeholder:text-slate-300"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                />
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-8 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: theme }}
                >
                  {mutation.isPending ? 'Submitting…' : 'Submit Enquiry →'}
                </button>
                {mutation.isError && (
                  <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────

function ContactSection({
  config, section, theme,
}: {
  config: WebsiteConfig
  section?: WebsiteSection
  theme: string
}) {
  const socialLinks = [
    { label: 'Facebook', href: config.facebookUrl, icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { label: 'Instagram', href: config.instagramUrl, icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 6.5h11a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 17v-9A1.5 1.5 0 016.5 6.5z' },
    { label: 'YouTube', href: config.youtubeUrl, icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
    { label: 'Twitter / X', href: config.twitterUrl, icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  ].filter((s) => s.href) as { label: string; href: string; icon: string }[]

  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading title={section?.title ?? 'Contact Us'} subtitle={section?.subtitle ?? 'Get in touch with us'} theme={theme} />
        <div className="mt-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            {(config.schoolAddress || config.schoolCity) && (
              <ContactRow icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" label="Address">
                {[config.schoolAddress, config.schoolCity, config.schoolState, config.schoolPincode].filter(Boolean).join(', ')}
              </ContactRow>
            )}
            {config.schoolPhone && (
              <ContactRow icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" label="Phone">
                {config.schoolPhone}
              </ContactRow>
            )}
            {config.schoolEmail && (
              <ContactRow icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" label="Email">
                <a href={`mailto:${config.schoolEmail}`} className="underline underline-offset-2" style={{ color: theme }}>{config.schoolEmail}</a>
              </ContactRow>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Follow Us</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:shadow-sm hover:border-slate-300 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle, theme }: { title: string; subtitle?: string; theme: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: theme }} />
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{title}</h2>
      </div>
      {subtitle && <p className="text-slate-500 text-sm ml-11">{subtitle}</p>}
    </div>
  )
}

function ContactRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <div className="text-sm text-slate-700 mt-0.5">{children}</div>
      </div>
    </div>
  )
}

function AField({ label, value, onChange, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300"
      />
    </label>
  )
}

// ── Login Portal ──────────────────────────────────────────────────────────────

const PORTAL_ROLES = [
  {
    role: 'SCHOOL_ADMIN',
    label: 'School Admin',
    desc: 'Manage school operations, staff & data',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    color: 'bg-violet-50 border-violet-100 text-violet-700',
    dot: 'bg-violet-500',
  },
  {
    role: 'TEACHER',
    label: 'Teacher',
    desc: 'Classes, attendance, homework & grades',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    role: 'STUDENT',
    label: 'Student',
    desc: 'Dashboard, timetable, results & fees',
    icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
    color: 'bg-sky-50 border-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },
  {
    role: 'PARENT',
    label: 'Parent',
    desc: "Track your children's progress & fees",
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'bg-amber-50 border-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
]

function PortalSection({ slug, theme }: { slug: string; theme: string }) {
  return (
    <section id="portal" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading
          title="School Portal"
          subtitle="Select your role to sign in to the school management system"
          theme={theme}
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTAL_ROLES.map(({ role, label, desc, icon, color, dot }) => (
            <a
              key={role}
              href={`/login?school=${slug}&role=${role}`}
              className={`group flex flex-col gap-3 p-5 rounded-2xl border ${color} hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
                <span className={`w-2 h-2 rounded-full ${dot}`} />
              </div>
              <div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs mt-0.5 opacity-70 leading-relaxed">{desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold mt-auto pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                Sign in
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function PageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-16 bg-slate-200" />
      <div className="h-[75vh] bg-slate-100" />
      <div className="h-20 bg-slate-800" />
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  )
}
