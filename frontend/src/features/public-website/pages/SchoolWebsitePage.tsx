import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getPublicWebsite, submitAdmissionLead } from '../api/publicWebsiteApi'
import type { AdmissionLeadRequest, PublicWebsiteData, WebsiteSection } from '../types'

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
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        School website not found or unavailable.
      </div>
    )
  }

  const site = data.data
  const { config, sections, gallery } = site
  const themeColor = config.themeColor ?? '#10b981'

  const sectionMap = Object.fromEntries(sections.map((s) => [s.sectionKey, s]))

  return (
    <div className="font-sans">
      {/* Nav */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 shadow-sm"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex items-center gap-3">
          {site.logoUrl && (
            <img src={site.logoUrl} alt="logo" className="h-10 w-10 rounded-full object-cover" />
          )}
          <span className="text-white font-bold text-lg">{site.schoolName}</span>
        </div>
        <div className="hidden md:flex gap-6 text-white/90 text-sm font-medium">
          <a href="#about" className="hover:text-white">About</a>
          <a href="#gallery" className="hover:text-white">Gallery</a>
          {config.admissionsOpen && <a href="#admissions" className="hover:text-white">Admissions</a>}
          <a href="#contact" className="hover:text-white">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection site={site} themeColor={themeColor} section={sectionMap['hero']} />

      {/* About */}
      {config.aboutText && (
        <section id="about" className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            {sectionMap['about']?.title ?? 'About Us'}
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{config.aboutText}</p>
          {(config.visionText || config.missionText) && (
            <div className="mt-10 grid md:grid-cols-2 gap-6">
              {config.visionText && (
                <div className="rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-700 mb-2">Our Vision</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{config.visionText}</p>
                </div>
              )}
              {config.missionText && (
                <div className="rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-700 mb-2">Our Mission</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{config.missionText}</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">
              {sectionMap['gallery']?.title ?? 'Photo Gallery'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((item) => (
                <div key={item.id} className="rounded-xl overflow-hidden aspect-square">
                  <img
                    src={item.imageUrl}
                    alt={item.caption ?? ''}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Photo'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admissions */}
      {config.admissionsOpen && (
        <AdmissionsSection slug={slug} config={config} section={sectionMap['admissions']} themeColor={themeColor} />
      )}

      {/* Contact */}
      <section id="contact" className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {sectionMap['contact']?.title ?? 'Contact Us'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3 text-sm text-slate-600">
            {config.schoolAddress && <p>📍 {config.schoolAddress}, {config.schoolCity}</p>}
            {config.schoolPhone && <p>📞 {config.schoolPhone}</p>}
            {config.schoolEmail && <p>✉️ {config.schoolEmail}</p>}
          </div>
          <div className="flex gap-4">
            {config.facebookUrl && <SocialLink href={config.facebookUrl} label="Facebook" />}
            {config.instagramUrl && <SocialLink href={config.instagramUrl} label="Instagram" />}
            {config.youtubeUrl && <SocialLink href={config.youtubeUrl} label="YouTube" />}
            {config.twitterUrl && <SocialLink href={config.twitterUrl} label="Twitter/X" />}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 text-center text-white/80 text-sm"
        style={{ backgroundColor: themeColor }}
      >
        © {new Date().getFullYear()} {site.schoolName}. Powered by CloudCampus.
      </footer>
    </div>
  )
}

// ---- Sub-components ----

function HeroSection({
  site,
  themeColor,
  section,
}: {
  site: PublicWebsiteData
  themeColor: string
  section?: WebsiteSection
}) {
  const bgStyle = site.config.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${site.config.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: themeColor }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6" style={bgStyle}>
      <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow mb-4">
        {section?.title ?? site.schoolName}
      </h1>
      {(section?.subtitle ?? site.config.schoolTagline) && (
        <p className="text-lg md:text-xl text-white/90 max-w-2xl">
          {section?.subtitle ?? site.config.schoolTagline}
        </p>
      )}
      {site.config.admissionsOpen && (
        <a
          href="#admissions"
          className="mt-8 px-8 py-3 rounded-full font-semibold text-white border-2 border-white hover:bg-white/10 transition-colors"
        >
          Apply for Admissions →
        </a>
      )}
    </div>
  )
}

function AdmissionsSection({
  slug,
  config,
  section,
  themeColor,
}: {
  slug: string
  config: PublicWebsiteData['config']
  section?: WebsiteSection
  themeColor: string
}) {
  const [form, setForm] = useState<AdmissionLeadRequest>({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    studentName: '',
    applyingClass: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: (payload: AdmissionLeadRequest) => submitAdmissionLead(slug, payload),
    onSuccess: () => setSubmitted(true),
  })

  return (
    <section id="admissions" className="py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {section?.title ?? 'Admissions'}
        </h2>
        {config.admissionInfo && (
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">{config.admissionInfo}</p>
        )}

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <p className="text-emerald-700 font-semibold text-lg">Enquiry submitted!</p>
            <p className="text-emerald-600 text-sm mt-2">
              Our team will contact you shortly. Thank you for your interest.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate(form)
            }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <AField
                label="Parent / Guardian Name *"
                value={form.parentName}
                onChange={(v) => setForm((p) => ({ ...p, parentName: v }))}
                required
              />
              <AField
                label="Phone Number *"
                value={form.parentPhone}
                onChange={(v) => setForm((p) => ({ ...p, parentPhone: v }))}
                required
              />
              <AField
                label="Email"
                value={form.parentEmail}
                onChange={(v) => setForm((p) => ({ ...p, parentEmail: v }))}
                type="email"
              />
              <AField
                label="Student Name *"
                value={form.studentName}
                onChange={(v) => setForm((p) => ({ ...p, studentName: v }))}
                required
              />
              <AField
                label="Class Applying For"
                value={form.applyingClass}
                onChange={(v) => setForm((p) => ({ ...p, applyingClass: v }))}
              />
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Message (Optional)
              </span>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              />
            </label>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-8 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {mutation.isPending ? 'Submitting…' : 'Submit Enquiry'}
            </button>
            {mutation.isError && (
              <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

function AField({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  )
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
    >
      {label}
    </a>
  )
}

function PageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-14 bg-slate-200" />
      <div className="h-80 bg-slate-100" />
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  )
}
