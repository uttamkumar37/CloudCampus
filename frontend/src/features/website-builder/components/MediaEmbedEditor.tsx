import { useState } from 'react'

interface MediaSettings {
  // YouTube
  youtubeEnabled: boolean
  youtubeChannelUrl: string
  youtubePlaylistId: string
  youtubeVideoIds: string
  // Google Reviews
  googleReviewsEnabled: boolean
  googlePlaceId: string
  googleReviewsCount: number
  googleRating: number
  // Instagram feed
  instagramEnabled: boolean
  instagramAccessToken: string
  instagramHandle: string
  instagramPostCount: number
  // School map
  mapEnabled: boolean
  mapEmbedUrl: string
  mapAddress: string
  mapLatLng: string
  // Video testimonials
  videoTestimonialsEnabled: boolean
  videoUrls: string
  // Ticker
  tickerEnabled: boolean
  tickerText: string
  tickerSpeed: 'slow' | 'normal' | 'fast'
}

const EMPTY: MediaSettings = {
  youtubeEnabled: false, youtubeChannelUrl: '', youtubePlaylistId: '', youtubeVideoIds: '',
  googleReviewsEnabled: false, googlePlaceId: '', googleReviewsCount: 0, googleRating: 0,
  instagramEnabled: false, instagramAccessToken: '', instagramHandle: '', instagramPostCount: 9,
  mapEnabled: false, mapEmbedUrl: '', mapAddress: '', mapLatLng: '',
  videoTestimonialsEnabled: false, videoUrls: '',
  tickerEnabled: false, tickerText: '', tickerSpeed: 'normal',
}

function load(): MediaSettings { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem('wb_media_embeds') ?? '{}') } } catch { return EMPTY } }
function save(s: MediaSettings) { localStorage.setItem('wb_media_embeds', JSON.stringify(s)) }

type Tab = 'youtube' | 'reviews' | 'instagram' | 'map' | 'video' | 'ticker'

export function MediaEmbedEditor() {
  const [tab, setTab] = useState<Tab>('youtube')
  const [s, setS] = useState<MediaSettings>(load)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof MediaSettings>(k: K, v: MediaSettings[K]) { setS((p) => ({ ...p, [k]: v })) }
  function handleSave() { save(s); setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const TABS = [
    { key: 'youtube' as Tab, icon: '▶️', label: 'YouTube', on: s.youtubeEnabled },
    { key: 'reviews' as Tab, icon: '⭐', label: 'Google Reviews', on: s.googleReviewsEnabled },
    { key: 'instagram' as Tab, icon: '📸', label: 'Instagram Feed', on: s.instagramEnabled },
    { key: 'map' as Tab, icon: '🗺️', label: 'School Map', on: s.mapEnabled },
    { key: 'video' as Tab, icon: '🎥', label: 'Video Testimonials', on: s.videoTestimonialsEnabled },
    { key: 'ticker' as Tab, icon: '📡', label: 'News Ticker', on: s.tickerEnabled },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Media Embeds
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Embed videos, maps, reviews, and social feeds on your school website.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${tab === t.key ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-100'}`}>
            {t.icon} {t.label}
            <span className={`w-1.5 h-1.5 rounded-full ${t.on ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </button>
        ))}
      </div>

      {/* YouTube */}
      {tab === 'youtube' && (
        <Section title="YouTube Channel & Videos" desc="Show your school's YouTube channel, playlists, or individual videos." enabled={s.youtubeEnabled} onToggle={() => set('youtubeEnabled', !s.youtubeEnabled)}>
          <div className="space-y-3">
            <F label="YouTube Channel URL"><input className="cc-input" placeholder="https://youtube.com/@yourschool" value={s.youtubeChannelUrl} onChange={(e) => set('youtubeChannelUrl', e.target.value)} /></F>
            <F label="Playlist ID (optional)" hint="Show a specific playlist of school videos"><input className="cc-input font-mono" placeholder="PLxxxx… from YouTube URL" value={s.youtubePlaylistId} onChange={(e) => set('youtubePlaylistId', e.target.value)} /></F>
            <F label="Featured Video IDs (comma-separated)" hint="e.g. dQw4w9WgXcQ, abc123 — shown as video cards">
              <textarea className="cc-input resize-y font-mono text-xs" rows={3} placeholder="dQw4w9WgXcQ, abc123xyz" value={s.youtubeVideoIds} onChange={(e) => set('youtubeVideoIds', e.target.value)} />
            </F>
            {s.youtubeVideoIds && (
              <div className="grid grid-cols-3 gap-2">
                {s.youtubeVideoIds.split(',').slice(0, 3).map((id) => id.trim()).filter(Boolean).map((id) => (
                  <div key={id} className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Google Reviews */}
      {tab === 'reviews' && (
        <Section title="Google Reviews Widget" desc="Display your school's Google reviews automatically on your website." enabled={s.googleReviewsEnabled} onToggle={() => set('googleReviewsEnabled', !s.googleReviewsEnabled)}>
          <div className="space-y-3">
            <F label="Google Place ID" hint="Get from Google Business Profile → Info → Add Place ID">
              <input className="cc-input font-mono" placeholder="ChIJxxxxxxxxxxxxx" value={s.googlePlaceId} onChange={(e) => set('googlePlaceId', e.target.value)} />
            </F>
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Overall Rating (manual)"><input className="cc-input" type="number" min={1} max={5} step={0.1} placeholder="4.8" value={s.googleRating || ''} onChange={(e) => set('googleRating', Number(e.target.value))} /></F>
              <F label="Total Review Count"><input className="cc-input" type="number" min={0} placeholder="248" value={s.googleReviewsCount || ''} onChange={(e) => set('googleReviewsCount', Number(e.target.value))} /></F>
            </div>
            {s.googleRating > 0 && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-4">
                <p className="text-4xl font-black text-amber-500">{s.googleRating}</p>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((n) => <span key={n} className={`text-lg ${n <= Math.round(s.googleRating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{s.googleReviewsCount} Google reviews</p>
                </div>
                <span className="ml-auto text-xs text-slate-400">Live preview</span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Instagram */}
      {tab === 'instagram' && (
        <Section title="Instagram Feed" desc="Show your school's latest Instagram posts on the website." enabled={s.instagramEnabled} onToggle={() => set('instagramEnabled', !s.instagramEnabled)}>
          <div className="space-y-3">
            <F label="Instagram Handle"><div className="flex items-center gap-2"><span className="text-slate-400">@</span><input className="cc-input" placeholder="yourschoolname" value={s.instagramHandle} onChange={(e) => set('instagramHandle', e.target.value)} /></div></F>
            <F label="Access Token" hint="Generate from Meta Business Suite → Instagram Basic Display API">
              <input className="cc-input font-mono text-xs" placeholder="IGxx…" value={s.instagramAccessToken} onChange={(e) => set('instagramAccessToken', e.target.value)} />
            </F>
            <F label="Number of Posts to Display">
              <select className="cc-input appearance-none" value={s.instagramPostCount} onChange={(e) => set('instagramPostCount', Number(e.target.value))}>
                {[6, 9, 12, 15, 18].map((n) => <option key={n} value={n}>{n} posts</option>)}
              </select>
            </F>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700">
              <p className="font-semibold mb-1">How to get the Access Token</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <strong>developers.facebook.com</strong></li>
                <li>Create app → Add Instagram Basic Display product</li>
                <li>Generate a User Token for your school's Instagram</li>
                <li>Paste the long-lived token above</li>
              </ol>
            </div>
          </div>
        </Section>
      )}

      {/* School Map */}
      {tab === 'map' && (
        <Section title="Interactive School Map" desc="Embed a Google Maps or custom map showing your school location." enabled={s.mapEnabled} onToggle={() => set('mapEnabled', !s.mapEnabled)}>
          <div className="space-y-3">
            <F label="Google Maps Embed URL" hint='Go to Google Maps → Share → Embed a map → Copy the src="…" URL'>
              <input className="cc-input" placeholder="https://www.google.com/maps/embed?pb=…" value={s.mapEmbedUrl} onChange={(e) => set('mapEmbedUrl', e.target.value)} />
            </F>
            <F label="Full Address (for text display)">
              <input className="cc-input" placeholder="123 School Lane, Mumbai 400001" value={s.mapAddress} onChange={(e) => set('mapAddress', e.target.value)} />
            </F>
            <F label="Lat, Lng (optional — for custom pins)">
              <input className="cc-input font-mono" placeholder="19.0760, 72.8777" value={s.mapLatLng} onChange={(e) => set('mapLatLng', e.target.value)} />
            </F>
            {s.mapEmbedUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 h-48">
                <iframe src={s.mapEmbedUrl} className="w-full h-full" title="School map preview" loading="lazy" />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Video Testimonials */}
      {tab === 'video' && (
        <Section title="Video Testimonials" desc="Embed YouTube video testimonials from parents and alumni." enabled={s.videoTestimonialsEnabled} onToggle={() => set('videoTestimonialsEnabled', !s.videoTestimonialsEnabled)}>
          <div className="space-y-3">
            <F label="YouTube Video IDs (one per line)" hint="e.g. dQw4w9WgXcQ — the ID from the YouTube URL after ?v=">
              <textarea className="cc-input resize-y font-mono text-xs" rows={5} placeholder={"dQw4w9WgXcQ\nabc123xyz\nxyz789abc"} value={s.videoUrls} onChange={(e) => set('videoUrls', e.target.value)} />
            </F>
            {s.videoUrls && (
              <div className="grid sm:grid-cols-2 gap-3">
                {s.videoUrls.split('\n').slice(0, 4).map((id) => id.trim()).filter(Boolean).map((id) => (
                  <div key={id} className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <iframe src={`https://www.youtube.com/embed/${id}`} className="w-full h-full" title={`Video ${id}`} allowFullScreen loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Ticker */}
      {tab === 'ticker' && (
        <Section title="Scrolling News Ticker" desc="Show a horizontal scrolling ticker at the top of your website." enabled={s.tickerEnabled} onToggle={() => set('tickerEnabled', !s.tickerEnabled)}>
          <div className="space-y-3">
            <F label="Ticker Content" hint="Separate multiple items with |">
              <textarea className="cc-input resize-y" rows={3} placeholder={"📢 Admissions open for 2026-27! | 🏆 Ranked #1 School in the district | 📅 Annual Day on 15th March — Register Now"} value={s.tickerText} onChange={(e) => set('tickerText', e.target.value)} />
            </F>
            <F label="Scroll Speed">
              <div className="flex gap-3">
                {(['slow', 'normal', 'fast'] as const).map((sp) => (
                  <button key={sp} onClick={() => set('tickerSpeed', sp)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${s.tickerSpeed === sp ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                    {sp}
                  </button>
                ))}
              </div>
            </F>
            {s.tickerEnabled && s.tickerText && (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <p className="text-[10px] bg-slate-50 text-slate-400 px-3 py-1 font-semibold uppercase tracking-wider">Preview</p>
                <div className="bg-sky-600 text-white text-sm py-2 px-4 overflow-hidden whitespace-nowrap">
                  <span className="inline-block">{s.tickerText.split('|').join('   •   ')}</span>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Save Embed Settings
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}

function Section({ title, desc, enabled, onToggle, children }: { title: string; desc: string; enabled: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${enabled ? 'border-sky-200 bg-sky-50/40' : 'border-slate-200 bg-slate-50'}`}>
        <div>
          <p className="font-semibold text-slate-700">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${enabled ? 'bg-sky-500' : 'bg-slate-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {enabled && <div className="pl-1">{children}</div>}
    </div>
  )
}
function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="field-label">{label}</label>{hint && <p className="text-xs text-slate-400">{hint}</p>}{children}</div>
}
