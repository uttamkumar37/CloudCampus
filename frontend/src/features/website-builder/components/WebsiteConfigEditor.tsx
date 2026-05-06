import { useEffect, useState } from 'react'
import { useUpsertWebsiteConfig, useWebsiteConfig } from '../hooks/useWebsite'
import type { WebsiteConfig } from '../types'

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
  themeColor: '#10b981',
}

export function WebsiteConfigEditor() {
  const { data, isLoading } = useWebsiteConfig()
  const mutation = useUpsertWebsiteConfig()
  const [form, setForm] = useState<WebsiteConfig>(EMPTY)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setForm({ ...EMPTY, ...data.data })
    }
  }, [data])

  function handleChange(field: keyof WebsiteConfig, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    await mutation.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) return <p className="text-slate-500 text-sm">Loading…</p>

  return (
    <div className="space-y-8">
      {/* Contact & Identity */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Contact &amp; Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tagline">
            <input value={form.schoolTagline} onChange={(e) => handleChange('schoolTagline', e.target.value)} />
          </Field>
          <Field label="Email">
            <input value={form.schoolEmail} onChange={(e) => handleChange('schoolEmail', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input value={form.schoolPhone} onChange={(e) => handleChange('schoolPhone', e.target.value)} />
          </Field>
          <Field label="Theme Colour">
            <input type="color" value={form.themeColor} onChange={(e) => handleChange('themeColor', e.target.value)}
              className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 p-1" />
          </Field>
          <Field label="Address" className="md:col-span-2">
            <input value={form.schoolAddress} onChange={(e) => handleChange('schoolAddress', e.target.value)} />
          </Field>
          <Field label="City">
            <input value={form.schoolCity} onChange={(e) => handleChange('schoolCity', e.target.value)} />
          </Field>
          <Field label="State">
            <input value={form.schoolState} onChange={(e) => handleChange('schoolState', e.target.value)} />
          </Field>
          <Field label="Country">
            <input value={form.schoolCountry} onChange={(e) => handleChange('schoolCountry', e.target.value)} />
          </Field>
          <Field label="Pincode">
            <input value={form.schoolPincode} onChange={(e) => handleChange('schoolPincode', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Hero */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Hero Section</h2>
        <Field label="Hero Image URL">
          <input value={form.heroImageUrl} onChange={(e) => handleChange('heroImageUrl', e.target.value)} />
        </Field>
      </section>

      {/* About */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">About the School</h2>
        <div className="space-y-4">
          <Field label="About Text">
            <textarea rows={4} value={form.aboutText} onChange={(e) => handleChange('aboutText', e.target.value)} />
          </Field>
          <Field label="Vision">
            <textarea rows={3} value={form.visionText} onChange={(e) => handleChange('visionText', e.target.value)} />
          </Field>
          <Field label="Mission">
            <textarea rows={3} value={form.missionText} onChange={(e) => handleChange('missionText', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Admissions */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Admissions</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.admissionsOpen}
              onChange={(e) => handleChange('admissionsOpen', e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm text-slate-700">Admissions currently open</span>
          </label>
          <Field label="Admission Info / Instructions">
            <textarea rows={3} value={form.admissionInfo} onChange={(e) => handleChange('admissionInfo', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Social */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['facebookUrl', 'twitterUrl', 'instagramUrl', 'youtubeUrl'] as const).map((key) => (
            <Field key={key} label={key.replace('Url', '').charAt(0).toUpperCase() + key.replace('Url', '').slice(1)}>
              <input value={form[key]} onChange={(e) => handleChange(key, e.target.value)} placeholder="https://" />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-emerald-600 text-sm">✓ Saved!</span>}
        {mutation.isError && <span className="text-red-500 text-sm">Save failed. Try again.</span>}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm [&_textarea]:resize-y">
        {children}
      </div>
    </label>
  )
}
