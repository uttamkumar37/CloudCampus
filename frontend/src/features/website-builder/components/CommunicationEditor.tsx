import { useState } from 'react'
import type { CommunicationSettings } from '../types'

const STORAGE_KEY = 'wb_communication'

const EMPTY: CommunicationSettings = {
  whatsappEnabled: false, whatsappNumber: '', whatsappMessage: 'Hello! I have an enquiry about admissions.',
  whatsappPosition: 'bottom-right',
  liveChatEnabled: false, liveChatProvider: 'tawk', liveChatWidgetId: '',
  newsletterEnabled: false, newsletterProvider: 'mailchimp', newsletterApiKey: '', newsletterListId: '',
  newsletterPlaceholder: 'Enter your email to get school updates',
  pushNotificationsEnabled: false,
  announcementBarEnabled: false, announcementBarText: '', announcementBarColor: '#059669', announcementBarLink: '',
}

function load(): CommunicationSettings {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } } catch { return EMPTY }
}
function save(s: CommunicationSettings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }

type Tab = 'whatsapp' | 'chat' | 'newsletter' | 'notifications' | 'banner'

export function CommunicationEditor() {
  const [settings, setSettings] = useState<CommunicationSettings>(load)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<Tab>('whatsapp')

  function set(field: keyof CommunicationSettings, value: string | boolean) {
    setSettings((p) => ({ ...p, [field]: value }))
  }
  function handleSave() {
    save(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const TABS: { key: Tab; label: string; icon: string; enabled: boolean }[] = [
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', enabled: settings.whatsappEnabled },
    { key: 'chat', label: 'Live Chat', icon: '🗨️', enabled: settings.liveChatEnabled },
    { key: 'newsletter', label: 'Newsletter', icon: '📧', enabled: settings.newsletterEnabled },
    { key: 'notifications', label: 'Push Alerts', icon: '🔔', enabled: settings.pushNotificationsEnabled },
    { key: 'banner', label: 'Banner', icon: '📢', enabled: settings.announcementBarEnabled },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Communication Tools
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">PRO</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Connect with parents and prospects directly from your school website.</p>
      </div>

      {/* Quick toggles overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${tab === t.key ? 'bg-violet-50 border-violet-200' : 'bg-white border-slate-200 hover:border-violet-100'}`}>
            <span className="text-xl">{t.icon}</span>
            <span className={`text-xs font-semibold ${tab === t.key ? 'text-violet-700' : 'text-slate-700'}`}>{t.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
              {t.enabled ? 'ON' : 'OFF'}
            </span>
          </button>
        ))}
      </div>

      {/* WhatsApp */}
      {tab === 'whatsapp' && (
        <div className="space-y-4">
          <ToggleCard
            title="WhatsApp Chat Button" desc="Show a floating WhatsApp button on your public website. Parents can click to instantly message you."
            enabled={settings.whatsappEnabled} onToggle={() => set('whatsappEnabled', !settings.whatsappEnabled)}
            icon="💬" color="emerald"
          />
          {settings.whatsappEnabled && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="field-label">WhatsApp Number</label>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-slate-400 shrink-0">+91</span>
                    <input className="cc-input" placeholder="98765 43210" value={settings.whatsappNumber.replace(/^\+91/, '')}
                      onChange={(e) => set('whatsappNumber', `+91${e.target.value.replace(/\D/g, '')}`)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Button Position</label>
                  <select className="cc-input appearance-none" value={settings.whatsappPosition}
                    onChange={(e) => set('whatsappPosition', e.target.value as CommunicationSettings['whatsappPosition'])}>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="field-label">Pre-filled Message</label>
                <input className="cc-input" placeholder="Hello! I want to enquire about admissions…" value={settings.whatsappMessage}
                  onChange={(e) => set('whatsappMessage', e.target.value)} />
                <p className="text-xs text-slate-400">This text auto-fills when a parent clicks the button.</p>
              </div>
              {/* Preview */}
              <div className="relative h-32 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                <p className="absolute top-2 left-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Preview</p>
                <div className={`absolute bottom-4 ${settings.whatsappPosition === 'bottom-right' ? 'right-4' : 'left-4'} w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg cursor-pointer`}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.135 1.535 5.879L0 24l6.308-1.5A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.926 0-3.72-.522-5.26-1.426l-.378-.214-3.742.891.961-3.622-.247-.388A9.785 9.785 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Chat */}
      {tab === 'chat' && (
        <div className="space-y-4">
          <ToggleCard
            title="Live Chat Widget" desc="Add a chat widget so parents can get instant answers from your team while browsing your website."
            enabled={settings.liveChatEnabled} onToggle={() => set('liveChatEnabled', !settings.liveChatEnabled)}
            icon="🗨️" color="sky"
          />
          {settings.liveChatEnabled && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="field-label">Chat Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'tawk', name: 'Tawk.to', badge: 'Free', color: 'sky' },
                    { id: 'crisp', name: 'Crisp', badge: 'Freemium', color: 'violet' },
                    { id: 'intercom', name: 'Intercom', badge: 'Paid', color: 'slate' },
                    { id: 'freshchat', name: 'Freshchat', badge: 'Freemium', color: 'emerald' },
                  ].map((p) => (
                    <button key={p.id} onClick={() => set('liveChatProvider', p.id as CommunicationSettings['liveChatProvider'])}
                      className={`p-3 rounded-xl border text-left transition-all ${settings.liveChatProvider === p.id ? 'border-sky-300 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.badge}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="field-label">Widget ID / Property ID</label>
                <input className="cc-input font-mono" placeholder="Your widget ID from the provider dashboard" value={settings.liveChatWidgetId}
                  onChange={(e) => set('liveChatWidgetId', e.target.value)} />
                <p className="text-xs text-slate-400">
                  {settings.liveChatProvider === 'tawk' && 'Find this in Tawk.to → Administration → Channels → Chat Widget → Direct Chat Link'}
                  {settings.liveChatProvider === 'crisp' && 'Find this in Crisp → Settings → Website Settings → Setup Instructions'}
                  {settings.liveChatProvider === 'intercom' && 'Find this in Intercom → Settings → Installation → Web'}
                  {settings.liveChatProvider === 'freshchat' && 'Find this in Freshchat → Settings → Web Messenger'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Newsletter */}
      {tab === 'newsletter' && (
        <div className="space-y-4">
          <ToggleCard
            title="Newsletter Subscription" desc="Add an email capture form on your school website to build a parent mailing list."
            enabled={settings.newsletterEnabled} onToggle={() => set('newsletterEnabled', !settings.newsletterEnabled)}
            icon="📧" color="amber"
          />
          {settings.newsletterEnabled && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="field-label">Email Provider</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'mailchimp', name: 'Mailchimp', badge: 'Free up to 500' },
                    { id: 'convertkit', name: 'ConvertKit', badge: 'Free up to 1000' },
                    { id: 'sendinblue', name: 'Brevo (Sendinblue)', badge: 'Free up to 300/day' },
                  ].map((p) => (
                    <button key={p.id} onClick={() => set('newsletterProvider', p.id as CommunicationSettings['newsletterProvider'])}
                      className={`p-3 rounded-xl border text-left transition-all ${settings.newsletterProvider === p.id ? 'border-amber-300 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.badge}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="field-label">API Key</label>
                  <input className="cc-input font-mono" placeholder="From your email provider dashboard" value={settings.newsletterApiKey}
                    onChange={(e) => set('newsletterApiKey', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">List / Audience ID</label>
                  <input className="cc-input font-mono" placeholder="Audience or list ID" value={settings.newsletterListId}
                    onChange={(e) => set('newsletterListId', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="field-label">Subscription Form Placeholder Text</label>
                <input className="cc-input" placeholder="Subscribe to get school updates…" value={settings.newsletterPlaceholder}
                  onChange={(e) => set('newsletterPlaceholder', e.target.value)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Push Notifications */}
      {tab === 'notifications' && (
        <div className="space-y-4">
          <ToggleCard
            title="Browser Push Notifications" desc="Send instant notifications to parents who visit your website, even after they leave."
            enabled={settings.pushNotificationsEnabled} onToggle={() => set('pushNotificationsEnabled', !settings.pushNotificationsEnabled)}
            icon="🔔" color="violet"
          />
          {settings.pushNotificationsEnabled && (
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 space-y-2">
              <p className="text-sm font-semibold text-violet-700">How push notifications work</p>
              <ul className="text-xs text-violet-600 space-y-1 list-disc list-inside">
                <li>Parents visiting your site will see a permission request</li>
                <li>If they accept, you can notify them about admissions, events, and results</li>
                <li>Works on desktop and mobile browsers</li>
                <li>Uses Firebase Cloud Messaging (free)</li>
              </ul>
              <div className="space-y-1 mt-3">
                <label className="field-label">Firebase Vapid Key</label>
                <input className="cc-input font-mono text-xs" placeholder="Your Firebase Web Push certificate key" />
                <p className="text-xs text-slate-400">Get this from Firebase Console → Project Settings → Cloud Messaging</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Announcement Banner */}
      {tab === 'banner' && (
        <div className="space-y-4">
          <ToggleCard
            title="Announcement Banner" desc="Show a slim banner at the top of your website for important announcements — admissions, holidays, results."
            enabled={settings.announcementBarEnabled} onToggle={() => set('announcementBarEnabled', !settings.announcementBarEnabled)}
            icon="📢" color="rose"
          />
          {settings.announcementBarEnabled && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="field-label">Announcement Text</label>
                <input className="cc-input" placeholder="Admissions open for 2026-27! Last date: March 31. Apply Now →" value={settings.announcementBarText}
                  onChange={(e) => set('announcementBarText', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="field-label">Banner Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.announcementBarColor}
                      onChange={(e) => set('announcementBarColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0" />
                    <span className="text-xs font-mono text-slate-500">{settings.announcementBarColor}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Link (optional)</label>
                  <input className="cc-input" placeholder="#admissions or https://…" value={settings.announcementBarLink}
                    onChange={(e) => set('announcementBarLink', e.target.value)} />
                </div>
              </div>
              {settings.announcementBarText && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-3 py-1 bg-slate-50">Preview</p>
                  <div className="py-2.5 px-4 text-center text-sm font-medium text-white" style={{ backgroundColor: settings.announcementBarColor }}>
                    {settings.announcementBarText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Save Communication Settings
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}

function ToggleCard({ title, desc, enabled, onToggle, icon, color }: { title: string; desc: string; enabled: boolean; onToggle: () => void; icon: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200', sky: 'bg-sky-50 border-sky-200',
    amber: 'bg-amber-50 border-amber-200', violet: 'bg-violet-50 border-violet-200',
    rose: 'bg-rose-50 border-rose-200',
  }
  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${enabled ? colors[color] : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-semibold text-slate-700">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 mt-0.5 ${enabled ? 'bg-violet-500' : 'bg-slate-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
