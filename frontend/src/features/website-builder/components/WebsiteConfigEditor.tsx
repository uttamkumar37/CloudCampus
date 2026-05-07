import { useEffect, useState } from 'react'
import { useUpsertWebsiteConfig, useWebsiteConfig } from '../hooks/useWebsite'
import type { WebsiteConfig } from '../types'

const THEME_PRESETS = [
  { label: 'Emerald', value: '#059669' },
  { label: 'Sky', value: '#0284c7' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Slate', value: '#334155' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Indigo', value: '#4338ca' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Crimson', value: '#be123c' },
]

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
]

const COUNTRIES = [
  'India','United States','United Kingdom','Canada','Australia','Singapore',
  'UAE','South Africa','Nepal','Bangladesh','Sri Lanka','Other',
]

const AFFILIATION_BOARDS = ['CBSE', 'ICSE / ISC', 'IB (International Baccalaureate)', 'IGCSE (Cambridge)', 'State Board', 'NIOS', 'Other']
const MEDIUM_OPTIONS = ['English', 'Hindi', 'English & Hindi (Bilingual)', 'Regional Language', 'Other']
const SCHOOL_TYPES = ['Co-educational', 'Boys Only', 'Girls Only']

const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: THIS_YEAR - 1800 + 1 }, (_, i) => THIS_YEAR - i)

const EMPTY: WebsiteConfig = {
  schoolTagline: '',
  schoolEmail: '',
  schoolPhone: '',
  schoolAddress: '',
  schoolCity: '',
  schoolState: '',
  schoolCountry: 'India',
  schoolPincode: '',
  heroImageUrl: '',
  aboutText: '',
  visionText: '',
  missionText: '',
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  admissionsOpen: false,
  admissionInfo: '',
  themeColor: '#059669',
  logoUrl: '',
  schoolEstablishedYear: null,
  affiliationBoard: '',
  mediumOfInstruction: '',
  schoolType: '',
  studentCount: null,
  teacherCount: null,
  heroCtaText: '',
  heroCtaLink: '',
  achievementBadge: '',
  noticesText: '',
}

type AccordionKey = 'identity' | 'hero' | 'contact' | 'about' | 'stats' | 'admissions' | 'notices' | 'social'

export function WebsiteConfigEditor() {
  const { data, isLoading } = useWebsiteConfig()
  const mutation = useUpsertWebsiteConfig()
  const [form, setForm] = useState<WebsiteConfig>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [heroPreview, setHeroPreview] = useState(false)
  const [logoPreview, setLogoPreview] = useState(false)
  const [openSection, setOpenSection] = useState<AccordionKey>('identity')

  useEffect(() => {
    if (data?.data) setForm({ ...EMPTY, ...data.data })
  }, [data])

  function set(field: keyof WebsiteConfig, value: string | boolean | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    await mutation.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggle(key: AccordionKey) {
    setOpenSection((prev) => (prev === key ? ('' as AccordionKey) : key))
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 cc-skeleton-shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* ── Identity & Branding ── */}
      <Accordion
        title="Identity & Branding"
        subtitle="School name, logo, theme colour, affiliation"
        icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        open={openSection === 'identity'}
        onToggle={() => toggle('identity')}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="School Tagline" hint="Short memorable line shown below the school name">
              <input className="cc-input" placeholder="e.g. Shaping Tomorrow's Leaders" value={form.schoolTagline}
                onChange={(e) => set('schoolTagline', e.target.value)} />
            </Field>
            <Field label="Achievement Badge" hint='Shown as a glowing badge on the hero — e.g. "Top School 2025"'>
              <input className="cc-input" placeholder="e.g. Ranked #1 in City 2025" value={form.achievementBadge}
                onChange={(e) => set('achievementBadge', e.target.value)} />
            </Field>
            <Field label="Affiliation / Board">
              <select className="cc-input appearance-none" value={form.affiliationBoard}
                onChange={(e) => set('affiliationBoard', e.target.value)}>
                <option value="">— Select Board —</option>
                {AFFILIATION_BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Medium of Instruction">
              <select className="cc-input appearance-none" value={form.mediumOfInstruction}
                onChange={(e) => set('mediumOfInstruction', e.target.value)}>
                <option value="">— Select Medium —</option>
                {MEDIUM_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="School Type">
              <select className="cc-input appearance-none" value={form.schoolType}
                onChange={(e) => set('schoolType', e.target.value)}>
                <option value="">— Select Type —</option>
                {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Year Established">
              <select className="cc-input appearance-none" value={form.schoolEstablishedYear ?? ''}
                onChange={(e) => set('schoolEstablishedYear', e.target.value ? Number(e.target.value) : null)}>
                <option value="">— Select Year —</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
          </div>

          {/* Logo */}
          <Field label="School Logo URL" hint="Square or circular logo image — shown in nav bar and hero">
            <div className="flex gap-2">
              <input className="cc-input flex-1" placeholder="https://example.com/logo.png"
                value={form.logoUrl} onChange={(e) => { set('logoUrl', e.target.value); setLogoPreview(false) }} />
              {form.logoUrl && (
                <button onClick={() => setLogoPreview(v => !v)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 shrink-0">
                  {logoPreview ? 'Hide' : 'Preview'}
                </button>
              )}
            </div>
          </Field>
          {logoPreview && form.logoUrl && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={form.logoUrl} alt="Logo preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Logo' }} />
              <div>
                <p className="text-sm font-semibold text-slate-700">Logo Preview</p>
                <p className="text-xs text-slate-400 mt-0.5">This appears in the site nav bar</p>
              </div>
            </div>
          )}

          {/* Theme colour */}
          <div className="space-y-2">
            <label className="field-label">Theme Colour</label>
            <p className="text-xs text-slate-400">Applied to navbar, hero, buttons, and footer</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {THEME_PRESETS.map((p) => (
                <button key={p.value} title={p.label} onClick={() => set('themeColor', p.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.themeColor === p.value ? 'border-slate-700 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`} style={{ backgroundColor: p.value }} />
              ))}
              <label className="relative w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 overflow-hidden" title="Custom colour">
                <span className="text-slate-400 text-xs font-bold">+</span>
                <input type="color" value={form.themeColor} onChange={(e) => set('themeColor', e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </label>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded-md shadow-sm" style={{ backgroundColor: form.themeColor }} />
              <span className="text-xs font-mono text-slate-500">{form.themeColor}</span>
            </div>
          </div>
        </div>
      </Accordion>

      {/* ── Hero Banner ── */}
      <Accordion
        title="Hero Banner"
        subtitle="Background image, headline CTA button"
        icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        open={openSection === 'hero'}
        onToggle={() => toggle('hero')}
      >
        <div className="space-y-4">
          <Field label="Hero Background Image URL" hint="Best size: 1400×600px. Free images at unsplash.com">
            <div className="flex gap-2">
              <input className="cc-input flex-1" placeholder="https://images.unsplash.com/..."
                value={form.heroImageUrl} onChange={(e) => { set('heroImageUrl', e.target.value); setHeroPreview(false) }} />
              {form.heroImageUrl && (
                <button onClick={() => setHeroPreview(v => !v)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 shrink-0">
                  {heroPreview ? 'Hide' : 'Preview'}
                </button>
              )}
            </div>
          </Field>
          {heroPreview && form.heroImageUrl && (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
              <img src={form.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x400?text=Invalid+URL' }} />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4" style={{ background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))` }}>
                {form.achievementBadge && (
                  <span className="mb-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold border border-white/30">
                    ⭐ {form.achievementBadge}
                  </span>
                )}
                <p className="text-white font-bold text-2xl drop-shadow">{form.schoolTagline || 'Your School Tagline'}</p>
                {(form.heroCtaText || form.heroCtaLink) && (
                  <span className="mt-4 px-6 py-2 rounded-full border-2 border-white text-white text-sm font-semibold">
                    {form.heroCtaText || 'Apply Now →'}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CTA Button Text" hint='e.g. "Apply Now", "Explore More", "Book a Visit"'>
              <input className="cc-input" placeholder="Apply for Admissions →" value={form.heroCtaText}
                onChange={(e) => set('heroCtaText', e.target.value)} />
            </Field>
            <Field label="CTA Button Link" hint="Where the button goes — can be #admissions for the form below">
              <input className="cc-input" placeholder="#admissions or https://..." value={form.heroCtaLink}
                onChange={(e) => set('heroCtaLink', e.target.value)} />
            </Field>
          </div>
        </div>
      </Accordion>

      {/* ── School Stats ── */}
      <Accordion
        title="School Stats"
        subtitle="Students, teachers, years — shown as a stats bar"
        icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        open={openSection === 'stats'}
        onToggle={() => toggle('stats')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Total Students (approx.)" hint='Shown as "500+ Students"'>
            <input className="cc-input" type="number" placeholder="e.g. 500" min={0}
              value={form.studentCount ?? ''} onChange={(e) => set('studentCount', e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Total Teachers (approx.)" hint='Shown as "50+ Teachers"'>
            <input className="cc-input" type="number" placeholder="e.g. 50" min={0}
              value={form.teacherCount ?? ''} onChange={(e) => set('teacherCount', e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Year Established">
            <select className="cc-input appearance-none" value={form.schoolEstablishedYear ?? ''}
              onChange={(e) => set('schoolEstablishedYear', e.target.value ? Number(e.target.value) : null)}>
              <option value="">— Select Year —</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>
        {(form.studentCount || form.teacherCount || form.schoolEstablishedYear) && (
          <div className="mt-4 flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-400 w-full">Preview on public site:</p>
            {form.studentCount && <StatChip icon="👨‍🎓" label={`${form.studentCount}+ Students`} color={form.themeColor} />}
            {form.teacherCount && <StatChip icon="👩‍🏫" label={`${form.teacherCount}+ Teachers`} color={form.themeColor} />}
            {form.schoolEstablishedYear && <StatChip icon="🏆" label={`Est. ${form.schoolEstablishedYear}`} color={form.themeColor} />}
            {form.affiliationBoard && <StatChip icon="📋" label={form.affiliationBoard} color={form.themeColor} />}
          </div>
        )}
      </Accordion>

      {/* ── Contact & Location ── */}
      <Accordion
        title="Contact & Location"
        subtitle="Address, phone, email"
        icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        open={openSection === 'contact'}
        onToggle={() => toggle('contact')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email Address">
            <input className="cc-input" type="email" placeholder="school@example.com"
              value={form.schoolEmail} onChange={(e) => set('schoolEmail', e.target.value)} />
          </Field>
          <Field label="Phone Number">
            <input className="cc-input" type="tel" placeholder="+91 98765 43210"
              value={form.schoolPhone} onChange={(e) => set('schoolPhone', e.target.value)} />
          </Field>
          <Field label="Street Address" className="md:col-span-2">
            <input className="cc-input" placeholder="123 School Lane, Near Park"
              value={form.schoolAddress} onChange={(e) => set('schoolAddress', e.target.value)} />
          </Field>
          <Field label="City">
            <input className="cc-input" placeholder="Mumbai"
              value={form.schoolCity} onChange={(e) => set('schoolCity', e.target.value)} />
          </Field>
          <Field label="PIN / ZIP Code">
            <input className="cc-input" placeholder="400001"
              value={form.schoolPincode} onChange={(e) => set('schoolPincode', e.target.value)} />
          </Field>
          <Field label="Country">
            <select className="cc-input appearance-none" value={form.schoolCountry}
              onChange={(e) => { set('schoolCountry', e.target.value); set('schoolState', '') }}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="State / Province">
            {form.schoolCountry === 'India' ? (
              <select className="cc-input appearance-none" value={form.schoolState}
                onChange={(e) => set('schoolState', e.target.value)}>
                <option value="">— Select State —</option>
                {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input className="cc-input" placeholder="State / Province"
                value={form.schoolState} onChange={(e) => set('schoolState', e.target.value)} />
            )}
          </Field>
        </div>
      </Accordion>

      {/* ── About the School ── */}
      <Accordion
        title="About the School"
        subtitle="Description, vision, and mission"
        icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        open={openSection === 'about'}
        onToggle={() => toggle('about')}
      >
        <div className="space-y-4">
          <Field label="About the School" hint="Shown in the About section — school history, values, achievements">
            <textarea rows={4} className="cc-input resize-y"
              placeholder="Tell visitors about your school's history, achievements, and values…"
              value={form.aboutText} onChange={(e) => set('aboutText', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Our Vision">
              <textarea rows={3} className="cc-input resize-y"
                placeholder="What does your school aspire to become?"
                value={form.visionText} onChange={(e) => set('visionText', e.target.value)} />
            </Field>
            <Field label="Our Mission">
              <textarea rows={3} className="cc-input resize-y"
                placeholder="How do you fulfil your vision every day?"
                value={form.missionText} onChange={(e) => set('missionText', e.target.value)} />
            </Field>
          </div>
        </div>
      </Accordion>

      {/* ── Notices Board ── */}
      <Accordion
        title="Notice Board"
        subtitle="Announcements shown on the public website"
        icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        open={openSection === 'notices'}
        onToggle={() => toggle('notices')}
      >
        <Field label="Notice Board Content" hint="Each notice on a new line — dates and text. Shown in a scrollable panel on the public site.">
          <textarea rows={5} className="cc-input resize-y font-mono text-xs"
            placeholder={"📢 [2026-06-01] Parent-Teacher Meeting — Grade 8 & 9 on June 5th at 10 AM\n🏆 [2026-05-28] Congratulations to our students for winning the District Science Fair!\n📅 [2026-05-20] Summer Vacation from May 25 to June 15. School reopens June 16."}
            value={form.noticesText} onChange={(e) => set('noticesText', e.target.value)} />
        </Field>
      </Accordion>

      {/* ── Admissions ── */}
      <Accordion
        title="Admissions"
        subtitle="Open/close enquiry form and instructions"
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        open={openSection === 'admissions'}
        onToggle={() => toggle('admissions')}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Admissions Currently Open</p>
              <p className="text-xs text-slate-400 mt-0.5">Shows an enquiry form on your public website</p>
            </div>
            <button onClick={() => set('admissionsOpen', !form.admissionsOpen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.admissionsOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.admissionsOpen ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {form.admissionsOpen && (
            <Field label="Admission Instructions" hint="Shown above the enquiry form on the public site">
              <textarea rows={3} className="cc-input resize-y"
                placeholder="e.g. Admissions open for classes I–X. Last date: 30 June. Bring documents to the office."
                value={form.admissionInfo} onChange={(e) => set('admissionInfo', e.target.value)} />
            </Field>
          )}
        </div>
      </Accordion>

      {/* ── Social Links ── */}
      <Accordion
        title="Social Media"
        subtitle="Facebook, Instagram, YouTube, Twitter/X"
        icon="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        open={openSection === 'social'}
        onToggle={() => toggle('social')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/yourschool', color: '#1877F2' },
            { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/yourschool', color: '#E1306C' },
            { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@yourschool', color: '#FF0000' },
            { key: 'twitterUrl', label: 'Twitter / X', placeholder: 'https://x.com/yourschool', color: '#000000' },
          ] as const).map(({ key, label, placeholder, color }) => (
            <div key={key} className="space-y-1">
              <label className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="field-label">{label}</span>
              </label>
              <input className="cc-input" placeholder={placeholder}
                value={form[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
        </div>
      </Accordion>

      {/* Save bar */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button onClick={handleSave} disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {mutation.isPending ? (
            <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving…</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save All Changes</>
          )}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Saved successfully!
          </span>
        )}
        {mutation.isError && <span className="text-red-500 text-sm">Save failed — please try again.</span>}
      </div>
    </div>
  )
}

// ── Shared components ──

function Accordion({ title, subtitle, icon, open, onToggle, children }: {
  title: string; subtitle: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border transition-all ${open ? 'border-emerald-200 shadow-sm' : 'border-slate-200'}`}>
      <button onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${open ? 'bg-emerald-50 rounded-t-2xl' : 'hover:bg-slate-50 rounded-2xl'}`}>
        <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${open ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          <svg className={`w-5 h-5 ${open ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${open ? 'text-emerald-700' : 'text-slate-700'}`}>{title}</p>
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 pt-4 border-t border-slate-100">{children}</div>}
    </div>
  )
}

function Field({ label, hint, children, className = '' }: {
  label: string; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="field-label">{label}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  )
}

function StatChip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: color }}>
      {icon} {label}
    </span>
  )
}
