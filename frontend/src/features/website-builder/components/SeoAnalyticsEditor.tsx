import { useState } from 'react'
import type { SeoSettings } from '../types'

const STORAGE_KEY = 'wb_seo_settings'

const EMPTY: SeoSettings = {
  metaTitle: '', metaDescription: '', ogImageUrl: '',
  googleAnalyticsId: '', facebookPixelId: '',
  googleSearchConsoleToken: '', schemaOrgEnabled: true,
  sitemapEnabled: true, keywords: '', robotsTxt: 'User-agent: *\nAllow: /',
  canonicalUrl: '',
}

function load(): SeoSettings {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } } catch { return EMPTY }
}
function save(s: SeoSettings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }

type Accordion = 'meta' | 'tracking' | 'schema' | 'advanced'

export function SeoAnalyticsEditor() {
  const [settings, setSettings] = useState<SeoSettings>(load)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState<Accordion>('meta')

  function set(field: keyof SeoSettings, value: string | boolean) {
    setSettings((p) => ({ ...p, [field]: value }))
  }
  function handleSave() {
    save(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  function toggle(k: Accordion) { setOpen((p) => (p === k ? '' as Accordion : k)) }

  const titleLen = settings.metaTitle.length
  const descLen = settings.metaDescription.length

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          SEO & Analytics
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Optimise your school website for search engines and track visitor analytics.</p>
      </div>

      {/* SEO health checklist */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">SEO Health Check</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { label: 'Meta title set', ok: settings.metaTitle.length > 0 },
            { label: 'Meta description set', ok: settings.metaDescription.length > 0 },
            { label: 'OG image configured', ok: settings.ogImageUrl.length > 0 },
            { label: 'Keywords defined', ok: settings.keywords.length > 0 },
            { label: 'Google Analytics connected', ok: settings.googleAnalyticsId.length > 0 },
            { label: 'Schema.org markup enabled', ok: settings.schemaOrgEnabled },
            { label: 'Sitemap enabled', ok: settings.sitemapEnabled },
            { label: 'Canonical URL set', ok: settings.canonicalUrl.length > 0 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              {item.ok ? (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              )}
              <span className={`text-xs ${item.ok ? 'text-slate-600' : 'text-slate-400'}`}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${[settings.metaTitle, settings.metaDescription, settings.ogImageUrl, settings.keywords, settings.googleAnalyticsId].filter(Boolean).length / 5 * 100}%` }} />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {[settings.metaTitle, settings.metaDescription, settings.ogImageUrl, settings.keywords, settings.googleAnalyticsId].filter(Boolean).length}/5 complete
          </span>
        </div>
      </div>

      {/* Meta Tags */}
      <SeoAccordion title="Meta Tags & Preview" subtitle="Title, description, Open Graph image" open={open === 'meta'} onToggle={() => toggle('meta')}>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="field-label">Meta Title</label>
              <span className={`text-xs font-mono ${titleLen > 60 ? 'text-rose-500' : titleLen > 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                {titleLen}/60
              </span>
            </div>
            <input className="cc-input" placeholder="Best CBSE School in Mumbai | Springfield Academy" value={settings.metaTitle}
              onChange={(e) => set('metaTitle', e.target.value)} />
            <p className="text-xs text-slate-400">Appears as the blue clickable link in Google search results. Keep under 60 characters.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="field-label">Meta Description</label>
              <span className={`text-xs font-mono ${descLen > 160 ? 'text-rose-500' : descLen > 140 ? 'text-amber-500' : 'text-slate-400'}`}>
                {descLen}/160
              </span>
            </div>
            <textarea className="cc-input resize-y" rows={3}
              placeholder="Springfield Academy is a CBSE school offering world-class education in Mumbai. Admissions open for 2026-27."
              value={settings.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
            <p className="text-xs text-slate-400">Shown below the title in search results. Keep between 120–160 characters.</p>
          </div>
          <div className="space-y-1">
            <label className="field-label">Open Graph Image URL</label>
            <input className="cc-input" placeholder="https://… (1200×630px recommended for social sharing)" value={settings.ogImageUrl}
              onChange={(e) => set('ogImageUrl', e.target.value)} />
            <p className="text-xs text-slate-400">Image shown when your website is shared on WhatsApp, Facebook, Twitter, etc.</p>
          </div>
          <div className="space-y-1">
            <label className="field-label">Canonical URL</label>
            <input className="cc-input" placeholder="https://www.yourschool.com" value={settings.canonicalUrl}
              onChange={(e) => set('canonicalUrl', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="field-label">Target Keywords</label>
            <input className="cc-input" placeholder="CBSE school Mumbai, best school Andheri, top school Mumbai" value={settings.keywords}
              onChange={(e) => set('keywords', e.target.value)} />
            <p className="text-xs text-slate-400">Comma-separated keywords. Helps inform your content strategy.</p>
          </div>

          {/* Google search preview */}
          {(settings.metaTitle || settings.metaDescription) && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Google Search Preview</p>
              <p className="text-sm text-blue-700 font-medium leading-tight">{settings.metaTitle || 'Your School Name'}</p>
              <p className="text-xs text-emerald-700">{settings.canonicalUrl || 'https://yourschool.com'}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{settings.metaDescription || 'Your school description will appear here…'}</p>
            </div>
          )}
        </div>
      </SeoAccordion>

      {/* Tracking & Analytics */}
      <SeoAccordion title="Analytics & Tracking" subtitle="Google Analytics, Facebook Pixel, Search Console" open={open === 'tracking'} onToggle={() => toggle('tracking')}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="field-label flex items-center gap-2">
              Google Analytics 4
              {settings.googleAnalyticsId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Connected</span>}
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-400 font-mono shrink-0">G-</span>
              <input className="cc-input font-mono" placeholder="XXXXXXXXXX" value={settings.googleAnalyticsId.replace(/^G-/, '')}
                onChange={(e) => set('googleAnalyticsId', e.target.value ? `G-${e.target.value.replace(/^G-/, '')}` : '')} />
            </div>
            <p className="text-xs text-slate-400">Track page views, traffic sources, and visitor behaviour. Free tool from Google.</p>
          </div>
          <div className="space-y-1">
            <label className="field-label flex items-center gap-2">
              Facebook Pixel ID
              {settings.facebookPixelId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">Connected</span>}
            </label>
            <input className="cc-input font-mono" placeholder="1234567890123456" value={settings.facebookPixelId}
              onChange={(e) => set('facebookPixelId', e.target.value)} />
            <p className="text-xs text-slate-400">Track Facebook and Instagram ad conversions. Required for retargeting ads.</p>
          </div>
          <div className="space-y-1">
            <label className="field-label">Google Search Console Verification Token</label>
            <input className="cc-input font-mono" placeholder="abc123xyz..." value={settings.googleSearchConsoleToken}
              onChange={(e) => set('googleSearchConsoleToken', e.target.value)} />
            <p className="text-xs text-slate-400">Verify your website with Google Search Console to monitor search performance.</p>
          </div>

          {/* Integration tips */}
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            {[
              { title: 'Google Analytics', desc: 'See how many parents visit your site daily', icon: '📊', color: 'bg-blue-50 border-blue-100' },
              { title: 'Facebook Pixel', desc: 'Measure ROI of admission campaigns', icon: '📱', color: 'bg-indigo-50 border-indigo-100' },
              { title: 'Search Console', desc: 'Find which keywords bring parents to you', icon: '🔍', color: 'bg-green-50 border-green-100' },
            ].map((tip) => (
              <div key={tip.title} className={`rounded-xl border p-3 ${tip.color}`}>
                <p className="text-lg mb-1">{tip.icon}</p>
                <p className="text-xs font-semibold text-slate-700">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SeoAccordion>

      {/* Schema & Sitemap */}
      <SeoAccordion title="Schema & Sitemap" subtitle="Structured data and automated sitemap" open={open === 'schema'} onToggle={() => toggle('schema')}>
        <div className="space-y-4">
          <div className="space-y-3">
            <ToggleRow
              title="Schema.org Education Markup"
              desc="Helps Google understand your school as an educational organization. Can improve search ranking and show rich results."
              enabled={settings.schemaOrgEnabled}
              onToggle={() => set('schemaOrgEnabled', !settings.schemaOrgEnabled)}
            />
            <ToggleRow
              title="Auto-generate XML Sitemap"
              desc="Automatically creates a sitemap.xml file that Google uses to index all your pages faster."
              enabled={settings.sitemapEnabled}
              onToggle={() => set('sitemapEnabled', !settings.sitemapEnabled)}
            />
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-700">
            <p className="font-semibold mb-1">Why this matters</p>
            <p className="text-xs">Schools with proper schema markup get up to 30% more clicks in Google search results because Google can show your school's details (rating, address, type) directly in search results.</p>
          </div>
        </div>
      </SeoAccordion>

      {/* Advanced */}
      <SeoAccordion title="Advanced SEO" subtitle="Robots.txt and technical settings" open={open === 'advanced'} onToggle={() => toggle('advanced')}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="field-label">robots.txt Content</label>
            <textarea className="cc-input resize-y font-mono text-xs" rows={5} value={settings.robotsTxt}
              onChange={(e) => set('robotsTxt', e.target.value)} />
            <p className="text-xs text-slate-400">Controls which parts of your site search engines can crawl. Default is fine for most schools.</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-1">SEO Tips for Schools</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Use city + board name in your title: "Top CBSE School in [City]"</li>
              <li>Create a blog with news and achievements to attract organic search traffic</li>
              <li>Add your school to Google Business Profile for local search visibility</li>
              <li>Get listed in Shiksha.com, Justdial, and local school directories</li>
            </ul>
          </div>
        </div>
      </SeoAccordion>

      {/* Save */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Save SEO Settings
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}

function SeoAccordion({ title, subtitle, open, onToggle, children }: { title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border transition-all ${open ? 'border-amber-200 shadow-sm' : 'border-slate-200'}`}>
      <button onClick={onToggle} className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${open ? 'bg-amber-50 rounded-t-2xl' : 'hover:bg-slate-50 rounded-2xl'}`}>
        <div>
          <p className={`text-sm font-semibold ${open ? 'text-amber-700' : 'text-slate-700'}`}>{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-5 pb-5 pt-4 border-t border-slate-100">{children}</div>}
    </div>
  )
}

function ToggleRow({ title, desc, enabled, onToggle }: { title: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${enabled ? 'bg-amber-500' : 'bg-slate-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
