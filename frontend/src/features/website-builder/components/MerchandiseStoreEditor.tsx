import { useState } from 'react'

interface MerchItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: 'Uniform' | 'Stationery' | 'Sports' | 'Books' | 'Accessories' | 'Other'
  stock: number
  available: boolean
}

interface CanteenItem {
  day: string
  breakfast: string
  lunch: string
  snack: string
}

interface PaymentSettings {
  razorpayEnabled: boolean
  razorpayKeyId: string
  stripeEnabled: boolean
  stripePublishableKey: string
  upiEnabled: boolean
  upiId: string
  offlineEnabled: boolean
}

interface BrandingSettings {
  faviconUrl: string
  appIconUrl: string
  appleTouchIconUrl: string
  custom404Enabled: boolean
  custom404Headline: string
  custom404Message: string
  custom404ButtonText: string
  custom404ButtonLink: string
}

interface LanguageSettings {
  multilingualEnabled: boolean
  defaultLanguage: string
  enabledLanguages: string[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DEFAULT_CANTEEN: CanteenItem[] = DAYS.map((day) => ({ day, breakfast: '', lunch: '', snack: '' }))
const LANGUAGES = ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'Urdu']

function loadMerch(): MerchItem[] { try { return JSON.parse(localStorage.getItem('wb_merch') ?? '[]') } catch { return [] } }
function saveMerch(items: MerchItem[]) { localStorage.setItem('wb_merch', JSON.stringify(items)) }
function loadCanteen(): CanteenItem[] { try { const d = JSON.parse(localStorage.getItem('wb_canteen') ?? '[]'); return d.length ? d : DEFAULT_CANTEEN } catch { return DEFAULT_CANTEEN } }
function loadPayments(): PaymentSettings { try { return { razorpayEnabled: false, razorpayKeyId: '', stripeEnabled: false, stripePublishableKey: '', upiEnabled: false, upiId: '', offlineEnabled: true, ...JSON.parse(localStorage.getItem('wb_payments') ?? '{}') } } catch { return { razorpayEnabled: false, razorpayKeyId: '', stripeEnabled: false, stripePublishableKey: '', upiEnabled: false, upiId: '', offlineEnabled: true } } }
function loadBranding(): BrandingSettings { try { return { faviconUrl: '', appIconUrl: '', appleTouchIconUrl: '', custom404Enabled: false, custom404Headline: "Oops! Page not found.", custom404Message: "The page you're looking for doesn't exist. Let's get you back to school!", custom404ButtonText: 'Go to Homepage', custom404ButtonLink: '/', ...JSON.parse(localStorage.getItem('wb_branding') ?? '{}') } } catch { return { faviconUrl: '', appIconUrl: '', appleTouchIconUrl: '', custom404Enabled: false, custom404Headline: "Oops! Page not found.", custom404Message: "The page you're looking for doesn't exist. Let's get you back to school!", custom404ButtonText: 'Go to Homepage', custom404ButtonLink: '/' } } }
function loadLanguage(): LanguageSettings { try { return { multilingualEnabled: false, defaultLanguage: 'English', enabledLanguages: [], ...JSON.parse(localStorage.getItem('wb_language') ?? '{}') } } catch { return { multilingualEnabled: false, defaultLanguage: 'English', enabledLanguages: [] } } }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

type Tab = 'store' | 'canteen' | 'payment' | 'branding' | 'language'

const EMPTY_ITEM: Omit<MerchItem, 'id'> = { name: '', description: '', price: 0, imageUrl: '', category: 'Other', stock: 0, available: true }

export function MerchandiseStoreEditor() {
  const [tab, setTab] = useState<Tab>('store')
  const [items, setItems] = useState<MerchItem[]>(loadMerch)
  const [canteen, setCanteen] = useState<CanteenItem[]>(loadCanteen)
  const [payments, setPayments] = useState<PaymentSettings>(loadPayments)
  const [branding, setBranding] = useState<BrandingSettings>(loadBranding)
  const [language, setLanguage] = useState<LanguageSettings>(loadLanguage)
  const [saved, setSaved] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null)
  const [itemForm, setItemForm] = useState<Omit<MerchItem, 'id'>>(EMPTY_ITEM)

  function saveAndNotify(key: string, data: unknown, setter: () => void) {
    localStorage.setItem(key, JSON.stringify(data))
    setter()
    setSaved(key)
    setTimeout(() => setSaved(null), 2500)
  }

  function saveItem() {
    if (!itemForm.name) return
    let updated: MerchItem[]
    if (editingItem?.id) {
      updated = items.map((i) => i.id === editingItem.id ? { ...i, ...itemForm } : i)
    } else {
      updated = [...items, { id: uid(), ...itemForm }]
    }
    saveMerch(updated)
    setItems(updated)
    setEditingItem(null)
    setItemForm(EMPTY_ITEM)
  }

  function deleteItem(id: string) {
    const updated = items.filter((i) => i.id !== id)
    saveMerch(updated)
    setItems(updated)
  }

  function updateCanteen(day: string, field: keyof Omit<CanteenItem, 'day'>, value: string) {
    const updated = canteen.map((c) => c.day === day ? { ...c, [field]: value } : c)
    setCanteen(updated)
  }

  function pset<K extends keyof PaymentSettings>(k: K, v: PaymentSettings[K]) { setPayments((p) => ({ ...p, [k]: v })) }
  function bset<K extends keyof BrandingSettings>(k: K, v: BrandingSettings[K]) { setBranding((p) => ({ ...p, [k]: v })) }
  function lset<K extends keyof LanguageSettings>(k: K, v: LanguageSettings[K]) { setLanguage((p) => ({ ...p, [k]: v })) }

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'store', icon: '🛍️', label: 'Merch Store' },
    { key: 'canteen', icon: '🍱', label: 'Canteen Menu' },
    { key: 'payment', icon: '💳', label: 'Payment Gateway' },
    { key: 'branding', icon: '🎨', label: 'Favicon & 404' },
    { key: 'language', icon: '🌐', label: 'Languages' },
  ]

  const CATEGORIES: MerchItem['category'][] = ['Uniform', 'Stationery', 'Sports', 'Books', 'Accessories', 'Other']
  const CAT_COLORS: Record<string, string> = {
    Uniform: 'bg-sky-100 text-sky-700', Stationery: 'bg-emerald-100 text-emerald-700',
    Sports: 'bg-rose-100 text-rose-700', Books: 'bg-amber-100 text-amber-700',
    Accessories: 'bg-violet-100 text-violet-700', Other: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          Store, Payments & Branding
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">ELITE</span>
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">School merchandise, canteen menu, payment gateways, favicon, and multilingual support.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${tab === t.key ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-100'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Merch Store */}
      {tab === 'store' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{items.length} product{items.length !== 1 ? 's' : ''} · {items.filter((i) => i.available).length} available</p>
            </div>
            <button onClick={() => { setItemForm(EMPTY_ITEM); setEditingItem({ id: '', ...EMPTY_ITEM }) }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
              + Add Product
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-3">🛍️</span>
              <p className="font-semibold text-slate-600">No products yet</p>
              <p className="text-sm text-slate-400 mt-1">Add uniforms, stationery, sports gear, and school merchandise</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div key={item.id} className={`p-4 rounded-xl border ${item.available ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                  <div className="flex gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">🛍️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[item.category]}`}>{item.category}</span>
                        <span className="text-xs text-slate-400">Stock: {item.stock}</span>
                      </div>
                      <p className="font-bold text-slate-800 mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setItemForm({ name: item.name, description: item.description, price: item.price, imageUrl: item.imageUrl, category: item.category, stock: item.stock, available: item.available }); setEditingItem(item) }}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingItem !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">{editingItem.id ? 'Edit Product' : 'New Product'}</h3>
                  <button onClick={() => setEditingItem(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-1"><label className="field-label">Product Name</label>
                    <input className="cc-input" placeholder="e.g. School Uniform (Class 1-5)" value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="field-label">Category</label>
                      <select className="cc-input appearance-none" value={itemForm.category} onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value as MerchItem['category'] }))}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1"><label className="field-label">Price (₹)</label>
                      <input className="cc-input" type="number" min={0} value={itemForm.price} onChange={(e) => setItemForm((p) => ({ ...p, price: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><label className="field-label">Stock Quantity</label>
                      <input className="cc-input" type="number" min={0} value={itemForm.stock} onChange={(e) => setItemForm((p) => ({ ...p, stock: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="space-y-1"><label className="field-label">Description</label>
                    <textarea className="cc-input resize-y" rows={2} value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} /></div>
                  <div className="space-y-1"><label className="field-label">Image URL</label>
                    <input className="cc-input" placeholder="https://…" value={itemForm.imageUrl} onChange={(e) => setItemForm((p) => ({ ...p, imageUrl: e.target.value }))} /></div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" checked={itemForm.available} onChange={(e) => setItemForm((p) => ({ ...p, available: e.target.checked }))} />
                    <span className="text-sm text-slate-700">Available for purchase</span>
                  </label>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                  <button onClick={saveItem} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">Save Product</button>
                  <button onClick={() => setEditingItem(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Canteen Menu */}
      {tab === 'canteen' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Set your weekly canteen menu. This will be displayed on your school website.</p>
          <div className="space-y-3">
            {canteen.map((day) => (
              <div key={day.day} className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-700 text-sm mb-3">{day.day}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(['breakfast', 'lunch', 'snack'] as const).map((meal) => (
                    <div key={meal} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider capitalize">{meal}</label>
                      <input className="cc-input text-sm" placeholder={meal === 'breakfast' ? 'Poha, Milk' : meal === 'lunch' ? 'Dal, Rice, Sabzi' : 'Fruit, Biscuits'}
                        value={day[meal]} onChange={(e) => updateCanteen(day.day, meal, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => saveAndNotify('wb_canteen', canteen, () => {})}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
            Save Canteen Menu
          </button>
          {saved === 'wb_canteen' && <span className="text-emerald-600 text-sm font-medium ml-3">Saved!</span>}
        </div>
      )}

      {/* Payment Gateway */}
      {tab === 'payment' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Configure payment gateways for merchandise, fee collection, and event registrations.</p>
          {([
            {
              key: 'razorpayEnabled' as const, keyId: 'razorpayKeyId' as const, label: 'Razorpay', desc: 'Recommended for India. Supports UPI, cards, net banking.',
              placeholder: 'rzp_live_xxxxxxxxxxxx', icon: '🇮🇳', color: 'sky',
            },
            {
              key: 'stripeEnabled' as const, keyId: 'stripePublishableKey' as const, label: 'Stripe', desc: 'Best for international payments.',
              placeholder: 'pk_live_xxxxxxxxxxxx', icon: '💳', color: 'violet',
            },
          ]).map(({ key, keyId, label, desc, placeholder, icon, color }) => (
            <div key={key} className={`p-4 rounded-xl border ${payments[key] ? `border-${color}-200 bg-${color}-50/40` : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">{icon} {label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <button onClick={() => pset(key, !payments[key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${payments[key] ? 'bg-sky-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${payments[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {payments[key] && (
                <div className="space-y-1">
                  <label className="field-label">Publishable / Key ID</label>
                  <input className="cc-input font-mono text-sm" placeholder={placeholder} value={payments[keyId]} onChange={(e) => pset(keyId, e.target.value)} />
                  <p className="text-xs text-slate-400">⚠️ Only use publishable/live keys here. Never share secret keys.</p>
                </div>
              )}
            </div>
          ))}

          <div className={`p-4 rounded-xl border ${payments.upiEnabled ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-slate-700 flex items-center gap-2">📱 UPI / QR Code</p>
                <p className="text-xs text-slate-400">Display a UPI ID for direct payment instructions</p>
              </div>
              <button onClick={() => pset('upiEnabled', !payments.upiEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${payments.upiEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${payments.upiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {payments.upiEnabled && (
              <div className="space-y-1">
                <label className="field-label">UPI ID</label>
                <input className="cc-input font-mono" placeholder="school@okaxis" value={payments.upiId} onChange={(e) => pset('upiId', e.target.value)} />
              </div>
            )}
          </div>

          <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${payments.offlineEnabled ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div>
              <p className="font-semibold text-slate-700">Cash / Offline Payment</p>
              <p className="text-xs text-slate-400">Show option to pay in-person at the school office</p>
            </div>
            <button onClick={() => pset('offlineEnabled', !payments.offlineEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${payments.offlineEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${payments.offlineEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <button onClick={() => saveAndNotify('wb_payments', payments, () => {})}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
            Save Payment Settings
          </button>
          {saved === 'wb_payments' && <span className="text-emerald-600 text-sm font-medium ml-3">Saved!</span>}
        </div>
      )}

      {/* Favicon & 404 */}
      {tab === 'branding' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="font-semibold text-slate-700">Favicon & App Icons</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {([
                { key: 'faviconUrl' as const, label: 'Favicon (32×32 .ico or .png)', hint: 'Shown in browser tabs' },
                { key: 'appIconUrl' as const, label: 'App Icon (192×192 .png)', hint: 'Used when added to homescreen' },
                { key: 'appleTouchIconUrl' as const, label: 'Apple Touch Icon (180×180)', hint: 'Used on iOS homescreen' },
              ]).map(({ key, label, hint }) => (
                <div key={key} className="space-y-2">
                  <div className="space-y-1">
                    <label className="field-label">{label}</label>
                    <p className="text-xs text-slate-400">{hint}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {branding[key] && (
                      <img src={branding[key]} alt="" className="w-12 h-12 rounded-lg border border-slate-200 object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <input className="cc-input text-xs" placeholder="https://…/favicon.ico" value={branding[key]} onChange={(e) => bset(key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Custom 404 Page</p>
                <p className="text-xs text-slate-400">Show a branded page when visitors hit a broken link</p>
              </div>
              <button onClick={() => bset('custom404Enabled', !branding.custom404Enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${branding.custom404Enabled ? 'bg-rose-500' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${branding.custom404Enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {branding.custom404Enabled && (
              <div className="space-y-3 pl-1">
                <div className="space-y-1">
                  <label className="field-label">Headline</label>
                  <input className="cc-input" value={branding.custom404Headline} onChange={(e) => bset('custom404Headline', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="field-label">Message</label>
                  <textarea className="cc-input resize-y" rows={2} value={branding.custom404Message} onChange={(e) => bset('custom404Message', e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="field-label">Button Text</label>
                    <input className="cc-input" value={branding.custom404ButtonText} onChange={(e) => bset('custom404ButtonText', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="field-label">Button Link</label>
                    <input className="cc-input" value={branding.custom404ButtonLink} onChange={(e) => bset('custom404ButtonLink', e.target.value)} />
                  </div>
                </div>
                <div className="p-5 bg-slate-800 rounded-xl text-center text-white">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="text-xl font-bold">{branding.custom404Headline}</p>
                  <p className="text-sm text-slate-300 mt-2">{branding.custom404Message}</p>
                  <button className="mt-4 px-5 py-2 rounded-xl bg-white text-slate-800 text-sm font-semibold">{branding.custom404ButtonText}</button>
                  <p className="text-xs text-slate-500 mt-2">Preview</p>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => saveAndNotify('wb_branding', branding, () => {})}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
            Save Branding Settings
          </button>
          {saved === 'wb_branding' && <span className="text-emerald-600 text-sm font-medium ml-3">Saved!</span>}
        </div>
      )}

      {/* Language */}
      {tab === 'language' && (
        <div className="space-y-4">
          <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${language.multilingualEnabled ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div>
              <p className="font-semibold text-slate-700">Multilingual Website</p>
              <p className="text-xs text-slate-400">Allow visitors to switch the website language</p>
            </div>
            <button onClick={() => lset('multilingualEnabled', !language.multilingualEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${language.multilingualEnabled ? 'bg-rose-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${language.multilingualEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {language.multilingualEnabled && (
            <div className="space-y-4 pl-1">
              <div className="space-y-1">
                <label className="field-label">Default Language</label>
                <select className="cc-input w-48 appearance-none" value={language.defaultLanguage} onChange={(e) => lset('defaultLanguage', e.target.value)}>
                  {['English', ...LANGUAGES].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="field-label">Additional Languages</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => {
                    const enabled = language.enabledLanguages.includes(lang)
                    return (
                      <button key={lang} onClick={() => lset('enabledLanguages', enabled ? language.enabledLanguages.filter((l) => l !== lang) : [...language.enabledLanguages, lang])}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${enabled ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200'}`}>
                        {enabled ? '✓ ' : ''}{lang}
                      </button>
                    )
                  })}
                </div>
              </div>
              {language.enabledLanguages.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Language Switcher Preview</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold">EN</span>
                    {language.enabledLanguages.map((l) => (
                      <span key={l} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer">{l.slice(0, 2).toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <p className="font-semibold mb-1">Translation Setup</p>
                <p>Content is auto-translated using Google Translate API. Add your Google Cloud Translation API key in the SEO & Analytics section for accurate translations.</p>
              </div>
            </div>
          )}

          <button onClick={() => saveAndNotify('wb_language', language, () => {})}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">
            Save Language Settings
          </button>
          {saved === 'wb_language' && <span className="text-emerald-600 text-sm font-medium ml-3">Saved!</span>}
        </div>
      )}
    </div>
  )
}
