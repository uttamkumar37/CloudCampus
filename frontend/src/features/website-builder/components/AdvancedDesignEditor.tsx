import { useState } from 'react'
import type { DesignSettings } from '../types'

const STORAGE_KEY = 'wb_design_settings'

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Raleway',
  'Nunito', 'Source Sans 3', 'Playfair Display', 'Merriweather', 'Lora',
  'PT Serif', 'EB Garamond', 'Oswald', 'Work Sans', 'Rubik', 'DM Sans',
]

const EMPTY: DesignSettings = {
  fontFamily: 'Inter', headerFont: 'Inter', bodyFont: 'Inter',
  borderRadius: 'rounded', buttonStyle: 'filled', animationsEnabled: true,
  animationStyle: 'fade', darkModeEnabled: false, customCss: '',
  stickyHeaderEnabled: true, backToTopEnabled: true, pageWidth: 'normal',
  heroStyle: 'image', heroVideoUrl: '', navStyle: 'solid',
}

function load(): DesignSettings {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } } catch { return EMPTY }
}
function save(s: DesignSettings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }

type Section = 'typography' | 'layout' | 'hero' | 'effects' | 'custom'

export function AdvancedDesignEditor() {
  const [settings, setSettings] = useState<DesignSettings>(load)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState<Section>('typography')

  function set<K extends keyof DesignSettings>(field: K, value: DesignSettings[K]) {
    setSettings((p) => ({ ...p, [field]: value }))
  }
  function handleSave() { save(settings); setSaved(true); setTimeout(() => setSaved(false), 2500) }
  function toggle(k: Section) { setOpen((p) => p === k ? '' as Section : k) }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Design & Theme
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">GROWTH</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Customise fonts, layout, animations, and advanced styling for your school website.</p>
      </div>

      {/* Live preview strip */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 bg-slate-50">Live Style Preview</p>
        <div className="p-5 space-y-3" style={{ fontFamily: settings.fontFamily }}>
          <div className={`p-4 rounded-${settings.borderRadius === 'sharp' ? 'sm' : settings.borderRadius === 'very-rounded' ? '3xl' : 'xl'} bg-slate-100`}>
            <p className="font-bold text-lg text-slate-800" style={{ fontFamily: settings.headerFont }}>Springfield Academy</p>
            <p className="text-sm text-slate-500" style={{ fontFamily: settings.bodyFont }}>Shaping tomorrow's leaders with world-class education.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['filled', 'outlined', 'gradient', 'soft'].map((style) => (
              <button key={style} onClick={() => set('buttonStyle', style as DesignSettings['buttonStyle'])}
                className={`px-4 py-2 text-sm font-semibold transition-all ${
                  settings.borderRadius === 'very-rounded' ? 'rounded-full' : settings.borderRadius === 'sharp' ? 'rounded' : 'rounded-xl'
                } ${
                  settings.buttonStyle === style ? (
                    style === 'filled' ? 'bg-emerald-600 text-white' :
                    style === 'outlined' ? 'border-2 border-emerald-600 text-emerald-700' :
                    style === 'gradient' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' :
                    'bg-emerald-100 text-emerald-700'
                  ) : 'bg-slate-100 text-slate-500'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Typography */}
      <Accordion title="Typography & Fonts" subtitle="Google Fonts for headings and body text" open={open === 'typography'} onToggle={() => toggle('typography')}>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="field-label">Primary / Brand Font</label>
              <select className="cc-input appearance-none" value={settings.fontFamily}
                onChange={(e) => set('fontFamily', e.target.value)}>
                {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="field-label">Headings Font</label>
              <select className="cc-input appearance-none" value={settings.headerFont}
                onChange={(e) => set('headerFont', e.target.value)}>
                {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="field-label">Body Text Font</label>
              <select className="cc-input appearance-none" value={settings.bodyFont}
                onChange={(e) => set('bodyFont', e.target.value)}>
                {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          {/* Font preview */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[settings.fontFamily, settings.headerFont, settings.bodyFont].map((font, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">{['Brand', 'Headings', 'Body'][i]}</p>
                <p className="text-base font-bold text-slate-800 mb-1" style={{ fontFamily: font }}>Aa Bb Cc</p>
                <p className="text-xs text-slate-500" style={{ fontFamily: font }}>The quick brown fox jumps over the lazy dog.</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{font}</p>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* Layout */}
      <Accordion title="Layout & Shape" subtitle="Page width, border radius, button style" open={open === 'layout'} onToggle={() => toggle('layout')}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="field-label">Corner Style (Border Radius)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'sharp', label: 'Sharp', preview: 'rounded-sm' },
                { value: 'rounded', label: 'Rounded', preview: 'rounded-xl' },
                { value: 'very-rounded', label: 'Pill', preview: 'rounded-3xl' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => set('borderRadius', opt.value as DesignSettings['borderRadius'])}
                  className={`p-4 border text-center transition-all ${opt.preview} ${settings.borderRadius === opt.value ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-8 h-8 bg-emerald-500 mx-auto mb-2 ${opt.preview}`} />
                  <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="field-label">Page Width</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'narrow', label: 'Narrow', desc: '768px' },
                { value: 'normal', label: 'Normal', desc: '1024px' },
                { value: 'wide', label: 'Wide', desc: '1280px' },
                { value: 'full', label: 'Full', desc: '100%' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => set('pageWidth', opt.value as DesignSettings['pageWidth'])}
                  className={`p-3 border rounded-xl text-center transition-all ${settings.pageWidth === opt.value ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                  <p className="text-[10px] text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <ToggleRow title="Sticky Navigation Bar" desc="Navigation stays visible as visitors scroll down" enabled={settings.stickyHeaderEnabled} onToggle={() => set('stickyHeaderEnabled', !settings.stickyHeaderEnabled)} />
            <ToggleRow title="Back to Top Button" desc="Shows a floating button to scroll back to the top" enabled={settings.backToTopEnabled} onToggle={() => set('backToTopEnabled', !settings.backToTopEnabled)} />
            <ToggleRow title="Dark Mode Toggle" desc="Add a light/dark mode toggle on the public website" enabled={settings.darkModeEnabled} onToggle={() => set('darkModeEnabled', !settings.darkModeEnabled)} />
          </div>
        </div>
      </Accordion>

      {/* Hero */}
      <Accordion title="Hero Section Style" subtitle="Image, video, gradient, or pattern background" open={open === 'hero'} onToggle={() => toggle('hero')}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="field-label">Hero Background Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'image', label: 'Photo', icon: '🖼️', desc: 'URL image' },
                { value: 'video', label: 'Video', icon: '🎥', desc: 'YouTube/MP4' },
                { value: 'gradient', label: 'Gradient', icon: '🌈', desc: 'Auto-generated' },
                { value: 'pattern', label: 'Pattern', icon: '◼', desc: 'CSS pattern' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => set('heroStyle', opt.value as DesignSettings['heroStyle'])}
                  className={`p-4 rounded-xl border text-center transition-all ${settings.heroStyle === opt.value ? 'bg-sky-50 border-sky-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <p className="text-2xl mb-1">{opt.icon}</p>
                  <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                  <p className="text-[10px] text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {settings.heroStyle === 'video' && (
            <div className="space-y-1">
              <label className="field-label">Video URL</label>
              <input className="cc-input" placeholder="https://youtube.com/watch?v=… or .mp4 direct link" value={settings.heroVideoUrl}
                onChange={(e) => set('heroVideoUrl', e.target.value)} />
              <p className="text-xs text-slate-400">YouTube videos auto-play muted as background. MP4 links for self-hosted.</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="field-label">Navigation Style</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'transparent', label: 'Transparent', desc: 'See-through over hero' },
                { value: 'solid', label: 'Solid', desc: 'Opaque, always visible' },
                { value: 'frosted', label: 'Frosted Glass', desc: 'Blur effect' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => set('navStyle', opt.value as DesignSettings['navStyle'])}
                  className={`p-3 rounded-xl border text-center transition-all ${settings.navStyle === opt.value ? 'bg-sky-50 border-sky-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                  <p className="text-[10px] text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Accordion>

      {/* Animations */}
      <Accordion title="Animations & Effects" subtitle="Page load animations and transition style" open={open === 'effects'} onToggle={() => toggle('effects')}>
        <div className="space-y-4">
          <ToggleRow title="Enable Section Animations" desc="Sections animate in as visitors scroll down the page" enabled={settings.animationsEnabled} onToggle={() => set('animationsEnabled', !settings.animationsEnabled)} />
          {settings.animationsEnabled && (
            <div className="space-y-2">
              <label className="field-label">Animation Style</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'fade', label: 'Fade In', emoji: '✨' },
                  { value: 'slide', label: 'Slide Up', emoji: '⬆️' },
                  { value: 'zoom', label: 'Zoom In', emoji: '🔍' },
                  { value: 'bounce', label: 'Bounce', emoji: '🎾' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => set('animationStyle', opt.value as DesignSettings['animationStyle'])}
                    className={`p-3 rounded-xl border text-center transition-all ${settings.animationStyle === opt.value ? 'bg-violet-50 border-violet-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <p className="text-xl mb-1">{opt.emoji}</p>
                    <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Accordion>

      {/* Custom CSS */}
      <Accordion title="Custom CSS" subtitle="Advanced styling for power users (Elite plan)" open={open === 'custom'} onToggle={() => toggle('custom')}>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <p className="text-xs text-amber-700">Custom CSS requires the <strong>Elite plan</strong>. Changes apply to your public website. Use carefully — incorrect CSS can break the layout.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="field-label">Custom CSS</label>
              <span className="text-xs text-slate-400 font-mono">{settings.customCss.length} chars</span>
            </div>
            <textarea className="cc-input resize-y font-mono text-xs" rows={10}
              placeholder={`/* Example: Override hero height */\n.hero-section {\n  min-height: 600px;\n}\n\n/* Custom button color */\n.btn-primary {\n  background: #ff6b35;\n}`}
              value={settings.customCss}
              onChange={(e) => set('customCss', e.target.value)} />
          </div>
        </div>
      </Accordion>

      {/* Save */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Save Design Settings
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}

function Accordion({ title, subtitle, open, onToggle, children }: { title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border transition-all ${open ? 'border-emerald-200 shadow-sm' : 'border-slate-200'}`}>
      <button onClick={onToggle} className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${open ? 'bg-emerald-50 rounded-t-2xl' : 'hover:bg-slate-50 rounded-2xl'}`}>
        <div>
          <p className={`text-sm font-semibold ${open ? 'text-emerald-700' : 'text-slate-700'}`}>{title}</p>
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
      <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
