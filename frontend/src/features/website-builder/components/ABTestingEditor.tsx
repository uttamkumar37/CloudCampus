import { useState } from 'react'

interface HeroVariant {
  id: string
  name: string
  headline: string
  subheadline: string
  ctaText: string
  ctaColor: string
  bgStyle: 'gradient' | 'image' | 'solid' | 'pattern'
  bgValue: string
  impressions: number
  clicks: number
  isControl: boolean
}

interface Snapshot {
  id: string
  name: string
  date: string
  data: string
}

interface ScheduledPublish {
  id: string
  section: string
  goLiveAt: string
  description: string
  enabled: boolean
}

interface ChatbotSettings {
  enabled: boolean
  name: string
  greeting: string
  primaryColor: string
  position: 'bottom-right' | 'bottom-left'
  faqs: { q: string; a: string }[]
  collectLeads: boolean
  leadFields: ('name' | 'phone' | 'email' | 'class')[]
}

const DEFAULT_CHATBOT: ChatbotSettings = {
  enabled: false,
  name: 'Admissions Assistant',
  greeting: 'Hi! Welcome to our school. How can I help you today?',
  primaryColor: '#0284c7',
  position: 'bottom-right',
  faqs: [
    { q: 'What classes do you offer?', a: 'We offer classes from Nursery to Class 12 (CBSE).' },
    { q: 'When do admissions open?', a: 'Admissions for the next academic year typically open in January.' },
    { q: 'What is the fee structure?', a: 'Please visit our Fees section or contact us for detailed fee information.' },
  ],
  collectLeads: true,
  leadFields: ['name', 'phone', 'class'],
}

function loadVariants(): HeroVariant[] {
  try { return JSON.parse(localStorage.getItem('wb_ab_variants') ?? '[]') } catch { return [] }
}
function saveVariants(v: HeroVariant[]) { localStorage.setItem('wb_ab_variants', JSON.stringify(v)) }

function loadSnapshots(): Snapshot[] {
  try { return JSON.parse(localStorage.getItem('wb_snapshots') ?? '[]') } catch { return [] }
}
function saveSnapshots(s: Snapshot[]) { localStorage.setItem('wb_snapshots', JSON.stringify(s)) }

function loadScheduled(): ScheduledPublish[] {
  try { return JSON.parse(localStorage.getItem('wb_scheduled') ?? '[]') } catch { return [] }
}
function saveScheduled(s: ScheduledPublish[]) { localStorage.setItem('wb_scheduled', JSON.stringify(s)) }

function loadChatbot(): ChatbotSettings {
  try { return { ...DEFAULT_CHATBOT, ...JSON.parse(localStorage.getItem('wb_chatbot') ?? '{}') } } catch { return DEFAULT_CHATBOT }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

type Tab = 'ab' | 'history' | 'schedule' | 'chatbot'

const DEFAULT_VARIANT: Omit<HeroVariant, 'id' | 'impressions' | 'clicks' | 'isControl'> = {
  name: '', headline: '', subheadline: '', ctaText: 'Apply Now', ctaColor: '#0284c7', bgStyle: 'gradient', bgValue: 'from-sky-600 to-indigo-700',
}

export function ABTestingEditor() {
  const [tab, setTab] = useState<Tab>('ab')
  const [variants, setVariants] = useState<HeroVariant[]>(loadVariants)
  const [snapshots, setSnapshots] = useState<Snapshot[]>(loadSnapshots)
  const [scheduled, setScheduled] = useState<ScheduledPublish[]>(loadScheduled)
  const [chatbot, setChatbot] = useState<ChatbotSettings>(loadChatbot)
  const [chatbotSaved, setChatbotSaved] = useState(false)
  const [editingVariant, setEditingVariant] = useState<HeroVariant | null>(null)
  const [variantForm, setVariantForm] = useState(DEFAULT_VARIANT)
  const [newFaq, setNewFaq] = useState({ q: '', a: '' })
  const [newScheduled, setNewScheduled] = useState<Omit<ScheduledPublish, 'id'>>({ section: '', goLiveAt: '', description: '', enabled: true })
  const [snapshotName, setSnapshotName] = useState('')

  function saveVariant() {
    if (!variantForm.name) return
    let updated: HeroVariant[]
    if (editingVariant?.id) {
      updated = variants.map((v) => v.id === editingVariant.id ? { ...v, ...variantForm } : v)
    } else {
      const isFirst = variants.length === 0
      updated = [...variants, { id: uid(), impressions: 0, clicks: 0, isControl: isFirst, ...variantForm }]
    }
    saveVariants(updated)
    setVariants(updated)
    setEditingVariant(null)
    setVariantForm(DEFAULT_VARIANT)
  }

  function deleteVariant(id: string) {
    const updated = variants.filter((v) => v.id !== id)
    saveVariants(updated)
    setVariants(updated)
  }

  function setControl(id: string) {
    const updated = variants.map((v) => ({ ...v, isControl: v.id === id }))
    saveVariants(updated)
    setVariants(updated)
  }

  function simulateImpression(id: string) {
    const updated = variants.map((v) => v.id === id ? { ...v, impressions: v.impressions + Math.floor(Math.random() * 50 + 10) } : v)
    saveVariants(updated)
    setVariants(updated)
  }

  function takeSnapshot() {
    if (!snapshotName) return
    const allData = Object.keys(localStorage).filter((k) => k.startsWith('wb_')).reduce((acc, k) => ({ ...acc, [k]: localStorage.getItem(k) }), {})
    const snap: Snapshot = { id: uid(), name: snapshotName, date: new Date().toISOString(), data: JSON.stringify(allData) }
    const updated = [snap, ...snapshots].slice(0, 20)
    saveSnapshots(updated)
    setSnapshots(updated)
    setSnapshotName('')
  }

  function restoreSnapshot(snap: Snapshot) {
    if (!confirm(`Restore snapshot "${snap.name}"? Current settings will be overwritten.`)) return
    try {
      const data = JSON.parse(snap.data)
      Object.entries(data).forEach(([k, v]) => { if (typeof v === 'string') localStorage.setItem(k, v) })
      window.location.reload()
    } catch { /* ignore */ }
  }

  function deleteSnapshot(id: string) {
    const updated = snapshots.filter((s) => s.id !== id)
    saveSnapshots(updated)
    setSnapshots(updated)
  }

  function addScheduled() {
    if (!newScheduled.section || !newScheduled.goLiveAt) return
    const updated = [...scheduled, { id: uid(), ...newScheduled }]
    saveScheduled(updated)
    setScheduled(updated)
    setNewScheduled({ section: '', goLiveAt: '', description: '', enabled: true })
  }

  function deleteScheduled(id: string) {
    const updated = scheduled.filter((s) => s.id !== id)
    saveScheduled(updated)
    setScheduled(updated)
  }

  function saveChatbot(c: ChatbotSettings) {
    localStorage.setItem('wb_chatbot', JSON.stringify(c))
    setChatbot(c)
    setChatbotSaved(true)
    setTimeout(() => setChatbotSaved(false), 2500)
  }

  function addFaq() {
    if (!newFaq.q || !newFaq.a) return
    saveChatbot({ ...chatbot, faqs: [...chatbot.faqs, newFaq] })
    setNewFaq({ q: '', a: '' })
  }

  function removeFaq(i: number) {
    saveChatbot({ ...chatbot, faqs: chatbot.faqs.filter((_, idx) => idx !== i) })
  }

  function cset<K extends keyof ChatbotSettings>(k: K, v: ChatbotSettings[K]) { setChatbot((p) => ({ ...p, [k]: v })) }

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'ab', icon: '🧪', label: 'A/B Testing' },
    { key: 'history', icon: '📁', label: 'Version History' },
    { key: 'schedule', icon: '🗓️', label: 'Scheduled Publish' },
    { key: 'chatbot', icon: '🤖', label: 'AI Chatbot' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          A/B Testing & Automation
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">ELITE</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">Test hero variants, manage version history, schedule content, and configure your AI chatbot.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${tab === t.key ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-100'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* A/B Testing */}
      {tab === 'ab' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">{variants.length} variant{variants.length !== 1 ? 's' : ''} — click "Simulate" to add impressions</p>
            <button onClick={() => { setVariantForm(DEFAULT_VARIANT); setEditingVariant({ id: '', impressions: 0, clicks: 0, isControl: false, ...DEFAULT_VARIANT }) }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
              + Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-3">🧪</span>
              <p className="font-semibold text-slate-600">No hero variants yet</p>
              <p className="text-sm text-slate-400 mt-1">Create variant A (control) and variant B to start testing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((v) => {
                const ctr = v.impressions > 0 ? ((v.clicks / v.impressions) * 100).toFixed(1) : '0.0'
                return (
                  <div key={v.id} className={`p-4 rounded-xl border ${v.isControl ? 'border-violet-200 bg-violet-50/40' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{v.name}</p>
                          {v.isControl && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">CONTROL</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{v.headline}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!v.isControl && <button onClick={() => setControl(v.id)} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">Set Control</button>}
                        <button onClick={() => { setVariantForm({ name: v.name, headline: v.headline, subheadline: v.subheadline, ctaText: v.ctaText, ctaColor: v.ctaColor, bgStyle: v.bgStyle, bgValue: v.bgValue }); setEditingVariant(v) }}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Edit</button>
                        <button onClick={() => deleteVariant(v.id)} className="text-xs px-2 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-white rounded-lg border border-slate-100">
                        <p className="text-lg font-black text-slate-800">{v.impressions.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Impressions</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-slate-100">
                        <p className="text-lg font-black text-slate-800">{v.clicks.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Clicks</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-slate-100">
                        <p className={`text-lg font-black ${parseFloat(ctr) >= 3 ? 'text-emerald-600' : 'text-slate-800'}`}>{ctr}%</p>
                        <p className="text-xs text-slate-400">CTR</p>
                      </div>
                    </div>
                    <button onClick={() => simulateImpression(v.id)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium">
                      Simulate Traffic
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {editingVariant !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">{editingVariant.id ? 'Edit Variant' : 'New Variant'}</h3>
                  <button onClick={() => setEditingVariant(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-1"><label className="field-label">Variant Name</label>
                    <input className="cc-input" placeholder="Variant A — Blue Hero" value={variantForm.name} onChange={(e) => setVariantForm((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-1"><label className="field-label">Headline</label>
                    <input className="cc-input" placeholder="Nurturing Excellence Since 1985" value={variantForm.headline} onChange={(e) => setVariantForm((p) => ({ ...p, headline: e.target.value }))} /></div>
                  <div className="space-y-1"><label className="field-label">Sub-headline</label>
                    <input className="cc-input" placeholder="CBSE school with 98% board results" value={variantForm.subheadline} onChange={(e) => setVariantForm((p) => ({ ...p, subheadline: e.target.value }))} /></div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="field-label">CTA Button Text</label>
                      <input className="cc-input" placeholder="Apply Now" value={variantForm.ctaText} onChange={(e) => setVariantForm((p) => ({ ...p, ctaText: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="field-label">CTA Button Color</label>
                      <input className="cc-input" type="color" value={variantForm.ctaColor} onChange={(e) => setVariantForm((p) => ({ ...p, ctaColor: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-1"><label className="field-label">Background Style</label>
                    <select className="cc-input appearance-none" value={variantForm.bgStyle} onChange={(e) => setVariantForm((p) => ({ ...p, bgStyle: e.target.value as HeroVariant['bgStyle'] }))}>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image URL</option>
                      <option value="solid">Solid Color</option>
                      <option value="pattern">Pattern</option>
                    </select>
                  </div>
                  <div className="space-y-1"><label className="field-label">{variantForm.bgStyle === 'image' ? 'Image URL' : 'Value (e.g. #1e40af or from-sky-600 to-indigo-700)'}</label>
                    <input className="cc-input" value={variantForm.bgValue} onChange={(e) => setVariantForm((p) => ({ ...p, bgValue: e.target.value }))} /></div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                  <button onClick={saveVariant} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">Save Variant</button>
                  <button onClick={() => setEditingVariant(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version History */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="font-semibold text-slate-700 text-sm">Take a Snapshot</p>
            <div className="flex gap-3">
              <input className="cc-input flex-1" placeholder="e.g. Before Summer Redesign" value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} />
              <button onClick={takeSnapshot} disabled={!snapshotName}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 shrink-0">
                Save Snapshot
              </button>
            </div>
            <p className="text-xs text-slate-400">Snapshots save all website builder settings at this point in time. Max 20 snapshots stored.</p>
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-3">📁</span>
              <p className="font-semibold text-slate-600">No snapshots yet</p>
              <p className="text-sm text-slate-400 mt-1">Save your first snapshot before making big changes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div key={snap.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-2xl shrink-0">💾</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{snap.name}</p>
                    <p className="text-xs text-slate-400">{new Date(snap.date).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => restoreSnapshot(snap)} className="text-xs px-3 py-1.5 rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50 font-medium">Restore</button>
                    <button onClick={() => deleteSnapshot(snap.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled Publish */}
      {tab === 'schedule' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="font-semibold text-slate-700 text-sm">Schedule a Content Update</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="field-label">Section to Update</label>
                <select className="cc-input appearance-none" value={newScheduled.section} onChange={(e) => setNewScheduled((p) => ({ ...p, section: e.target.value }))}>
                  <option value="">Select section…</option>
                  {['Hero', 'Announcements Ticker', 'Events Calendar', 'Blog', 'Admissions Banner', 'Gallery', 'Fee Structure', 'Custom Banner'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="field-label">Go Live At</label>
                <input className="cc-input" type="datetime-local" value={newScheduled.goLiveAt} onChange={(e) => setNewScheduled((p) => ({ ...p, goLiveAt: e.target.value }))} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="field-label">Description (optional)</label>
                <input className="cc-input" placeholder="e.g. Show admissions open banner from Jan 1" value={newScheduled.description} onChange={(e) => setNewScheduled((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <button onClick={addScheduled} disabled={!newScheduled.section || !newScheduled.goLiveAt}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40">
              Schedule Update
            </button>
          </div>

          {scheduled.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-3">🗓️</span>
              <p className="font-semibold text-slate-600">No scheduled updates</p>
              <p className="text-sm text-slate-400 mt-1">Schedule content changes in advance</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scheduled.map((item) => {
                const isLive = new Date(item.goLiveAt) <= new Date()
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                    <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{item.section}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{isLive ? 'Live' : 'Scheduled'}</span>
                      </div>
                      {item.description && <p className="text-xs text-slate-400 truncate">{item.description}</p>}
                      <p className="text-xs text-slate-500">{new Date(item.goLiveAt).toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => deleteScheduled(item.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 shrink-0">Remove</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Chatbot */}
      {tab === 'chatbot' && (
        <div className="space-y-4">
          <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${chatbot.enabled ? 'border-violet-200 bg-violet-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div>
              <p className="font-semibold text-slate-700">AI Admissions Chatbot</p>
              <p className="text-xs text-slate-400">Answer parent questions 24/7 automatically</p>
            </div>
            <button onClick={() => saveChatbot({ ...chatbot, enabled: !chatbot.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${chatbot.enabled ? 'bg-violet-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${chatbot.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {chatbot.enabled && (
            <div className="space-y-4 pl-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="field-label">Chatbot Name</label>
                  <input className="cc-input" value={chatbot.name} onChange={(e) => cset('name', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Position</label>
                  <select className="cc-input appearance-none" value={chatbot.position} onChange={(e) => cset('position', e.target.value as ChatbotSettings['position'])}>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Primary Color</label>
                  <input className="cc-input" type="color" value={chatbot.primaryColor} onChange={(e) => cset('primaryColor', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="field-label">Greeting Message</label>
                <textarea className="cc-input resize-y" rows={2} value={chatbot.greeting} onChange={(e) => cset('greeting', e.target.value)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="field-label">FAQ Responses</label>
                  <span className="text-xs text-slate-400">{chatbot.faqs.length} configured</span>
                </div>
                {chatbot.faqs.map((faq, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700 flex-1">Q: {faq.q}</p>
                      <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 text-xs shrink-0">Remove</button>
                    </div>
                    <p className="text-xs text-slate-500">A: {faq.a}</p>
                  </div>
                ))}
                <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                  <input className="cc-input text-sm" placeholder="Question (e.g. Do you have a hostel?)" value={newFaq.q} onChange={(e) => setNewFaq((p) => ({ ...p, q: e.target.value }))} />
                  <textarea className="cc-input text-sm resize-y" rows={2} placeholder="Answer…" value={newFaq.a} onChange={(e) => setNewFaq((p) => ({ ...p, a: e.target.value }))} />
                  <button onClick={addFaq} disabled={!newFaq.q || !newFaq.a} className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-40">Add FAQ</button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Collect Leads via Chat</p>
                    <p className="text-xs text-slate-400">Ask for contact info before answering</p>
                  </div>
                  <button onClick={() => saveChatbot({ ...chatbot, collectLeads: !chatbot.collectLeads })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${chatbot.collectLeads ? 'bg-violet-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${chatbot.collectLeads ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Live preview */}
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border border-slate-200">
                <p className="absolute top-3 left-3 text-xs text-slate-400 font-medium">Chatbot Preview</p>
                <div className={`absolute ${chatbot.position === 'bottom-right' ? 'bottom-3 right-3' : 'bottom-3 left-3'}`}>
                  <div className="w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                    <div className="px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: chatbot.primaryColor }}>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">🤖</div>
                      <span className="text-white text-xs font-semibold">{chatbot.name}</span>
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-300" />
                    </div>
                    <div className="p-3">
                      <div className="bg-slate-50 rounded-xl rounded-tl-sm p-2">
                        <p className="text-xs text-slate-700">{chatbot.greeting}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => saveChatbot(chatbot)} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
                Save Chatbot Settings
              </button>
              {chatbotSaved && <span className="text-emerald-600 text-sm font-medium ml-3">Saved!</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
