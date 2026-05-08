import { useState } from 'react'

interface UTMCampaign {
  id: string
  name: string
  source: string
  medium: string
  campaign: string
  content: string
  term: string
  createdAt: string
}

interface MarketingSettings {
  // Visitor counter
  visitorCounterEnabled: boolean
  visitorCounterStyle: 'badge' | 'banner' | 'popup'
  visitorCounterSeed: number
  // Google Business
  googleBusinessEnabled: boolean
  googleBusinessName: string
  googleBusinessCategory: string
  googleBusinessPhone: string
  googleBusinessWebsite: string
  googleBusinessHours: string
  // Page speed
  lazyLoadImages: boolean
  minifyAssets: boolean
  enableCaching: boolean
  enableCompression: boolean
  // School comparison widget
  comparisonEnabled: boolean
  competitorNames: string
  comparisonFeatures: string
}

const EMPTY_SETTINGS: MarketingSettings = {
  visitorCounterEnabled: false, visitorCounterStyle: 'badge', visitorCounterSeed: 12483,
  googleBusinessEnabled: false, googleBusinessName: '', googleBusinessCategory: 'School', googleBusinessPhone: '', googleBusinessWebsite: '', googleBusinessHours: '',
  lazyLoadImages: true, minifyAssets: false, enableCaching: true, enableCompression: false,
  comparisonEnabled: false, competitorNames: '', comparisonFeatures: '',
}

function loadSettings(): MarketingSettings {
  try { return { ...EMPTY_SETTINGS, ...JSON.parse(localStorage.getItem('wb_marketing') ?? '{}') } } catch { return EMPTY_SETTINGS }
}
function saveSettings(s: MarketingSettings) { localStorage.setItem('wb_marketing', JSON.stringify(s)) }

function loadCampaigns(): UTMCampaign[] {
  try { return JSON.parse(localStorage.getItem('wb_utm_campaigns') ?? '[]') } catch { return [] }
}
function saveCampaigns(c: UTMCampaign[]) { localStorage.setItem('wb_utm_campaigns', JSON.stringify(c)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

type Tab = 'utm' | 'visitor' | 'gbp' | 'speed' | 'compare'

export function MarketingToolsEditor() {
  const [tab, setTab] = useState<Tab>('utm')
  const [s, setS] = useState<MarketingSettings>(loadSettings)
  const [campaigns, setCampaigns] = useState<UTMCampaign[]>(loadCampaigns)
  const [saved, setSaved] = useState(false)
  const [newCamp, setNewCamp] = useState({ name: '', source: '', medium: 'cpc', campaign: '', content: '', term: '' })
  const [baseUrl, setBaseUrl] = useState('https://yourschool.edu.in')
  const [copied, setCopied] = useState<string | null>(null)

  function set<K extends keyof MarketingSettings>(k: K, v: MarketingSettings[K]) { setS((p) => ({ ...p, [k]: v })) }
  function handleSave() { saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2500) }

  function buildUTM(c: { source: string; medium: string; campaign: string; content: string; term: string }) {
    const p = new URLSearchParams()
    if (c.source) p.set('utm_source', c.source)
    if (c.medium) p.set('utm_medium', c.medium)
    if (c.campaign) p.set('utm_campaign', c.campaign)
    if (c.content) p.set('utm_content', c.content)
    if (c.term) p.set('utm_term', c.term)
    const qs = p.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  function addCampaign() {
    if (!newCamp.name || !newCamp.source) return
    const camp: UTMCampaign = { id: uid(), createdAt: new Date().toISOString(), ...newCamp }
    const updated = [camp, ...campaigns]
    saveCampaigns(updated)
    setCampaigns(updated)
    setNewCamp({ name: '', source: '', medium: 'cpc', campaign: '', content: '', term: '' })
  }

  function deleteCampaign(id: string) {
    const updated = campaigns.filter((c) => c.id !== id)
    saveCampaigns(updated)
    setCampaigns(updated)
  }

  function copyLink(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(text); setTimeout(() => setCopied(null), 2000) })
  }

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'utm', icon: '🔗', label: 'UTM Campaigns' },
    { key: 'visitor', icon: '👁️', label: 'Visitor Counter' },
    { key: 'gbp', icon: '🏢', label: 'Google Business' },
    { key: 'speed', icon: '⚡', label: 'Page Speed' },
    { key: 'compare', icon: '📊', label: 'School Comparison' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Marketing Tools
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">PRO</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">UTM tracking, visitor counters, Google Business, and performance tools.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${tab === t.key ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-100'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* UTM Campaign Builder */}
      {tab === 'utm' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="font-semibold text-slate-700 text-sm">Build New UTM Link</p>
            <div className="space-y-1">
              <label className="field-label">Campaign Name (internal)</label>
              <input className="cc-input" placeholder="e.g. Summer 2026 Admissions" value={newCamp.name} onChange={(e) => setNewCamp((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="field-label">Base URL</label>
              <input className="cc-input" placeholder="https://yourschool.edu.in/admissions" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="field-label">Source *</label>
                <input className="cc-input" placeholder="google, facebook, whatsapp" value={newCamp.source} onChange={(e) => setNewCamp((p) => ({ ...p, source: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="field-label">Medium *</label>
                <select className="cc-input appearance-none" value={newCamp.medium} onChange={(e) => setNewCamp((p) => ({ ...p, medium: e.target.value }))}>
                  {['cpc', 'organic', 'email', 'social', 'referral', 'banner', 'sms', 'whatsapp'].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="field-label">Campaign</label>
                <input className="cc-input" placeholder="admissions-2026" value={newCamp.campaign} onChange={(e) => setNewCamp((p) => ({ ...p, campaign: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="field-label">Content (optional)</label>
                <input className="cc-input" placeholder="hero-banner" value={newCamp.content} onChange={(e) => setNewCamp((p) => ({ ...p, content: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="field-label">Term (optional)</label>
                <input className="cc-input" placeholder="school admission" value={newCamp.term} onChange={(e) => setNewCamp((p) => ({ ...p, term: e.target.value }))} />
              </div>
            </div>
            {newCamp.source && (
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1 font-medium">Generated URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-sky-700 break-all flex-1">{buildUTM(newCamp)}</code>
                  <button onClick={() => copyLink(buildUTM(newCamp))} className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200 hover:bg-sky-100">
                    {copied === buildUTM(newCamp) ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
            <button onClick={addCampaign} disabled={!newCamp.name || !newCamp.source}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40">
              Save Campaign
            </button>
          </div>

          {campaigns.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Campaigns ({campaigns.length})</p>
              {campaigns.map((c) => {
                const url = buildUTM(c)
                return (
                  <div key={c.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {c.source && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">{c.source}</span>}
                          {c.medium && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{c.medium}</span>}
                          {c.campaign && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{c.campaign}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteCampaign(c.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                      <code className="text-xs text-slate-500 truncate flex-1">{url}</code>
                      <button onClick={() => copyLink(url)} className="shrink-0 text-xs px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                        {copied === url ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Visitor Counter */}
      {tab === 'visitor' && (
        <div className="space-y-4">
          <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${s.visitorCounterEnabled ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div>
              <p className="font-semibold text-slate-700">Real-Time Visitor Counter</p>
              <p className="text-xs text-slate-400">Show how many people are viewing your school website</p>
            </div>
            <button onClick={() => set('visitorCounterEnabled', !s.visitorCounterEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${s.visitorCounterEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${s.visitorCounterEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {s.visitorCounterEnabled && (
            <div className="space-y-4 pl-1">
              <div className="space-y-1">
                <label className="field-label">Display Style</label>
                <div className="flex gap-3">
                  {(['badge', 'banner', 'popup'] as const).map((style) => (
                    <button key={style} onClick={() => set('visitorCounterStyle', style)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${s.visitorCounterStyle === style ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="field-label">Seed Count (starting number)</label>
                <input className="cc-input w-48" type="number" min={0} value={s.visitorCounterSeed}
                  onChange={(e) => set('visitorCounterSeed', Number(e.target.value))} />
                <p className="text-xs text-slate-400">Displayed count = seed + actual visits</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-400 mb-3 font-medium">Live Preview</p>
                {s.visitorCounterStyle === 'badge' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {(s.visitorCounterSeed + 3).toLocaleString()} people viewing now
                  </div>
                )}
                {s.visitorCounterStyle === 'banner' && (
                  <div className="w-full py-2 px-4 bg-amber-500 text-white text-sm text-center font-medium rounded-xl">
                    👁️ {(s.visitorCounterSeed + 3).toLocaleString()} parents are currently browsing this school
                  </div>
                )}
                {s.visitorCounterStyle === 'popup' && (
                  <div className="inline-flex items-center gap-3 p-3 bg-white rounded-xl shadow-xl border border-slate-100 text-sm">
                    <span className="text-2xl">👋</span>
                    <div>
                      <p className="font-semibold text-slate-800">Someone just booked a visit!</p>
                      <p className="text-xs text-slate-400">{(s.visitorCounterSeed + 3).toLocaleString()} families browsing today</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google Business Profile */}
      {tab === 'gbp' && (
        <div className="space-y-4">
          <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${s.googleBusinessEnabled ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div>
              <p className="font-semibold text-slate-700">Google Business Profile Sync</p>
              <p className="text-xs text-slate-400">Keep your Google Business info consistent with your website</p>
            </div>
            <button onClick={() => set('googleBusinessEnabled', !s.googleBusinessEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${s.googleBusinessEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${s.googleBusinessEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {s.googleBusinessEnabled && (
            <div className="space-y-3 pl-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="field-label">Business Name</label>
                  <input className="cc-input" placeholder="St. Xavier's High School" value={s.googleBusinessName} onChange={(e) => set('googleBusinessName', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Category</label>
                  <select className="cc-input appearance-none" value={s.googleBusinessCategory} onChange={(e) => set('googleBusinessCategory', e.target.value)}>
                    {['School', 'Private School', 'Elementary School', 'High School', 'International School', 'Boarding School'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Phone Number</label>
                  <input className="cc-input" placeholder="+91 98765 43210" value={s.googleBusinessPhone} onChange={(e) => set('googleBusinessPhone', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Website</label>
                  <input className="cc-input" placeholder="https://yourschool.edu.in" value={s.googleBusinessWebsite} onChange={(e) => set('googleBusinessWebsite', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="field-label">Business Hours</label>
                <textarea className="cc-input resize-y" rows={3} placeholder={"Mon–Fri: 8:00 AM – 4:00 PM\nSat: 9:00 AM – 1:00 PM\nSun: Closed"} value={s.googleBusinessHours} onChange={(e) => set('googleBusinessHours', e.target.value)} />
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <p className="font-semibold mb-1">How to sync with Google Business</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Claim your school at <strong>business.google.com</strong></li>
                  <li>Verify ownership via postcard or phone</li>
                  <li>Paste your business URL in the Google Business profile → Website field</li>
                  <li>Google will pull structured data from your website automatically</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Page Speed */}
      {tab === 'speed' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Enable these optimizations to improve your Google PageSpeed score and reduce load times.</p>
          {([
            { key: 'lazyLoadImages' as const, label: 'Lazy Load Images', desc: 'Images below the fold load only when scrolled into view', impact: '+15 pts', color: 'sky' },
            { key: 'enableCaching' as const, label: 'Browser Caching', desc: 'Cache static assets for returning visitors', impact: '+10 pts', color: 'emerald' },
            { key: 'minifyAssets' as const, label: 'Minify CSS & JS', desc: 'Remove whitespace and comments from code files', impact: '+8 pts', color: 'violet' },
            { key: 'enableCompression' as const, label: 'Gzip Compression', desc: 'Compress files before sending to the browser', impact: '+12 pts', color: 'amber' },
          ]).map(({ key, label, desc, impact, color }) => (
            <div key={key} className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${s[key] ? `border-${color}-200 bg-${color}-50/40` : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-700 text-sm">{label}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s[key] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{impact}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <button onClick={() => set(key, !s[key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${s[key] ? 'bg-sky-500' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${s[key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-3">Estimated PageSpeed Score</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={[s.lazyLoadImages, s.enableCaching, s.minifyAssets, s.enableCompression].filter(Boolean).length >= 3 ? '#22c55e' : '#f59e0b'}
                    strokeWidth="3"
                    strokeDasharray={`${([s.lazyLoadImages, s.enableCaching, s.minifyAssets, s.enableCompression].filter(Boolean).length * 11 + 45)} 100`}
                    strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-slate-800">
                  {45 + [s.lazyLoadImages, s.enableCaching, s.minifyAssets, s.enableCompression].filter(Boolean).length * 11}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Enable all options for a score of <strong>89/100</strong></p>
                <p className="text-xs text-slate-400">Score improves with each optimization enabled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* School Comparison Widget */}
      {tab === 'compare' && (
        <div className="space-y-4">
          <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${s.comparisonEnabled ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div>
              <p className="font-semibold text-slate-700">School Comparison Widget</p>
              <p className="text-xs text-slate-400">Show how your school compares to others in the area</p>
            </div>
            <button onClick={() => set('comparisonEnabled', !s.comparisonEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${s.comparisonEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${s.comparisonEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {s.comparisonEnabled && (
            <div className="space-y-3 pl-1">
              <div className="space-y-1">
                <label className="field-label">Competitor School Names (comma-separated)</label>
                <input className="cc-input" placeholder="City School, Modern Academy, Global Kids" value={s.competitorNames} onChange={(e) => set('competitorNames', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="field-label">Comparison Features (one per line)</label>
                <textarea className="cc-input resize-y" rows={5} placeholder={"CBSE Board Curriculum\nSmall Class Sizes (30 students)\n24/7 Security & CCTV\nSports Complex\nAC Classrooms\nDigital Smart Boards"} value={s.comparisonFeatures} onChange={(e) => set('comparisonFeatures', e.target.value)} />
              </div>
              {s.comparisonFeatures && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-3 font-semibold text-slate-600 border border-slate-200">Feature</th>
                        <th className="p-3 font-bold text-sky-700 border border-slate-200 bg-sky-50">Your School ✓</th>
                        {s.competitorNames.split(',').slice(0, 3).map((n) => n.trim()).filter(Boolean).map((n) => (
                          <th key={n} className="p-3 font-semibold text-slate-500 border border-slate-200">{n}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.comparisonFeatures.split('\n').filter(Boolean).map((f) => (
                        <tr key={f} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-700 border border-slate-200">{f}</td>
                          <td className="p-3 text-center text-emerald-500 font-bold border border-slate-200 bg-emerald-50">✓</td>
                          {s.competitorNames.split(',').slice(0, 3).map((n) => n.trim()).filter(Boolean).map((n) => (
                            <td key={n} className="p-3 text-center text-slate-300 border border-slate-200">–</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Save Marketing Settings
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}
