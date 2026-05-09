import { useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'

type AssetCondition = 'GOOD' | 'FAIR' | 'POOR' | 'DISPOSED'
type InventoryTab = 'assets' | 'stock'

interface Asset {
  id: string
  name: string
  category: string
  assetCode: string
  location: string
  assignedTo: string
  purchaseDate: string
  purchaseCost: number
  condition: AssetCondition
  note: string
}

interface StockItem {
  id: string
  name: string
  category: string
  unit: string
  currentQty: number
  minQty: number
  lastRestocked: string
}

const CONDITION_STYLE: Record<AssetCondition, string> = {
  GOOD: 'bg-emerald-100 text-emerald-700',
  FAIR: 'bg-amber-100 text-amber-700',
  POOR: 'bg-rose-100 text-rose-700',
  DISPOSED: 'bg-slate-100 text-slate-500',
}

const today = new Date().toISOString().slice(0, 10)

export function InventoryPage() {
  const [tab, setTab] = useState<InventoryTab>('assets')

  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Dell Laptop', category: 'Electronics', assetCode: 'EL-001', location: 'Staff Room', assignedTo: 'Mrs. Sharma', purchaseDate: '2024-06-01', purchaseCost: 55000, condition: 'GOOD', note: '' },
    { id: '2', name: 'Projector', category: 'Electronics', assetCode: 'EL-002', location: 'Class 9A', assignedTo: '', purchaseDate: '2023-08-15', purchaseCost: 38000, condition: 'FAIR', note: 'Lamp due for replacement' },
    { id: '3', name: 'Office Chair', category: 'Furniture', assetCode: 'FN-001', location: 'Principal Office', assignedTo: 'Principal', purchaseDate: '2022-01-10', purchaseCost: 8500, condition: 'GOOD', note: '' },
  ])
  const [aForm, setAForm] = useState({ name: '', category: 'Electronics', assetCode: '', location: '', assignedTo: '', purchaseDate: today, purchaseCost: 0, condition: 'GOOD' as AssetCondition, note: '' })
  const [showAForm, setShowAForm] = useState(false)
  const [filterCondition, setFilterCondition] = useState<AssetCondition | 'ALL'>('ALL')

  const [stock, setStock] = useState<StockItem[]>([
    { id: '1', name: 'A4 Paper Reams', category: 'Stationery', unit: 'Ream', currentQty: 45, minQty: 20, lastRestocked: '2026-05-01' },
    { id: '2', name: 'Whiteboard Markers', category: 'Stationery', unit: 'Box', currentQty: 8, minQty: 10, lastRestocked: '2026-04-15' },
    { id: '3', name: 'Chalk', category: 'Stationery', unit: 'Box', currentQty: 25, minQty: 15, lastRestocked: '2026-05-01' },
    { id: '4', name: 'Cleaning Liquid', category: 'Housekeeping', unit: 'Litre', currentQty: 12, minQty: 20, lastRestocked: '2026-04-20' },
  ])
  const [sForm, setSForm] = useState({ name: '', category: 'Stationery', unit: 'Piece', currentQty: 0, minQty: 5 })
  const [showSForm, setShowSForm] = useState(false)

  const totalAssetValue = assets.filter((a) => a.condition !== 'DISPOSED').reduce((s, a) => s + a.purchaseCost, 0)
  const lowStock = stock.filter((s) => s.currentQty <= s.minQty).length

  const visibleAssets = filterCondition === 'ALL' ? assets : assets.filter((a) => a.condition === filterCondition)

  const handleAddAsset = (e: FormEvent) => {
    e.preventDefault()
    if (!aForm.name.trim()) return
    setAssets((prev) => [{ id: crypto.randomUUID(), ...aForm, purchaseCost: Number(aForm.purchaseCost) }, ...prev])
    setAForm((p) => ({ ...p, name: '', assetCode: '', location: '', assignedTo: '', purchaseCost: 0, note: '' }))
    setShowAForm(false)
  }

  const handleAddStock = (e: FormEvent) => {
    e.preventDefault()
    if (!sForm.name.trim()) return
    setStock((prev) => [{ id: crypto.randomUUID(), ...sForm, currentQty: Number(sForm.currentQty), minQty: Number(sForm.minQty), lastRestocked: today }, ...prev])
    setSForm((p) => ({ ...p, name: '', currentQty: 0, minQty: 5 }))
    setShowSForm(false)
  }

  const restock = (id: string, qty: number) =>
    setStock((prev) => prev.map((s) => s.id === id ? { ...s, currentQty: s.currentQty + qty, lastRestocked: today } : s))

  return (
    <section className="space-y-6">
      <PageHeader
        title="Inventory & Assets"
        subtitle="Track school physical assets and consumable stock levels."
        badge={{ label: `${assets.length} Assets`, tone: 'blue' }}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Assets</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{assets.filter((a) => a.condition !== 'DISPOSED').length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Asset Value</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">₹ {totalAssetValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stock Items</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stock.length}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 shadow-sm ${lowStock > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${lowStock > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Low Stock</p>
          <p className={`mt-1 text-2xl font-bold ${lowStock > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{lowStock}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['assets', 'stock'] as InventoryTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {t === 'stock' ? 'Consumable Stock' : 'Assets'}
          </button>
        ))}
      </div>

      {tab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'GOOD', 'FAIR', 'POOR', 'DISPOSED'] as const).map((c) => (
              <button key={c} type="button" onClick={() => setFilterCondition(c)} className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${filterCondition === c ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{c}</button>
            ))}
            <div className="flex-1" />
            <button type="button" onClick={() => setShowAForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showAForm ? 'Cancel' : '+ Add Asset'}
            </button>
          </div>
          {showAForm && (
            <Card>
              <h2 className="text-base font-semibold text-slate-950">Add Asset</h2>
              <form className="mt-3 space-y-3" onSubmit={handleAddAsset}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="text" placeholder="Asset name" value={aForm.name} onChange={(e) => setAForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Category" value={aForm.category} onChange={(e) => setAForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Asset code (e.g. EL-003)" value={aForm.assetCode} onChange={(e) => setAForm((p) => ({ ...p, assetCode: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Location" value={aForm.location} onChange={(e) => setAForm((p) => ({ ...p, location: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="text" placeholder="Assigned to (optional)" value={aForm.assignedTo} onChange={(e) => setAForm((p) => ({ ...p, assignedTo: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <input type="number" min={0} placeholder="Purchase cost (₹)" value={aForm.purchaseCost || ''} onChange={(e) => setAForm((p) => ({ ...p, purchaseCost: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Purchase Date</label>
                    <input type="date" value={aForm.purchaseDate} onChange={(e) => setAForm((p) => ({ ...p, purchaseDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <select value={aForm.condition} onChange={(e) => setAForm((p) => ({ ...p, condition: e.target.value as AssetCondition }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Poor</option><option value="DISPOSED">Disposed</option>
                  </select>
                  <input type="text" placeholder="Note (optional)" value={aForm.note} onChange={(e) => setAForm((p) => ({ ...p, note: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                </div>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Save Asset</button>
              </form>
            </Card>
          )}
          <div className="space-y-2">
            {visibleAssets.map((asset) => (
              <div key={asset.id} className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm ${asset.condition === 'POOR' ? 'border-rose-200' : asset.condition === 'DISPOSED' ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{asset.name}</p>
                    <span className="font-mono text-[10px] text-slate-400">{asset.assetCode}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{asset.category}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CONDITION_STYLE[asset.condition]}`}>{asset.condition}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{asset.location}{asset.assignedTo ? ` · Assigned: ${asset.assignedTo}` : ''} · ₹ {asset.purchaseCost.toLocaleString('en-IN')} · {asset.purchaseDate}</p>
                  {asset.note && <p className="mt-0.5 text-xs text-slate-400 italic">{asset.note}</p>}
                </div>
                <div className="flex gap-2">
                  {(['GOOD', 'FAIR', 'POOR'] as AssetCondition[]).filter((c) => c !== asset.condition).map((c) => (
                    <button key={c} type="button" onClick={() => setAssets((prev) => prev.map((a) => a.id === asset.id ? { ...a, condition: c } : a))} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition">{c}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowSForm((v) => !v)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
              {showSForm ? 'Cancel' : '+ Add Stock Item'}
            </button>
          </div>
          {showSForm && (
            <Card>
              <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleAddStock}>
                <input type="text" placeholder="Item name" value={sForm.name} onChange={(e) => setSForm((p) => ({ ...p, name: e.target.value }))} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="text" placeholder="Category" value={sForm.category} onChange={(e) => setSForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="text" placeholder="Unit (Piece, Ream, Box…)" value={sForm.unit} onChange={(e) => setSForm((p) => ({ ...p, unit: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="number" min={0} placeholder="Current qty" value={sForm.currentQty || ''} onChange={(e) => setSForm((p) => ({ ...p, currentQty: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <input type="number" min={0} placeholder="Min qty (alert threshold)" value={sForm.minQty || ''} onChange={(e) => setSForm((p) => ({ ...p, minQty: Number(e.target.value) }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <button type="submit" className="col-span-full sm:col-span-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">Add</button>
              </form>
            </Card>
          )}
          <div className="space-y-2">
            {stock.map((item) => {
              const low = item.currentQty <= item.minQty
              return (
                <div key={item.id} className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm ${low ? 'border-rose-200' : 'border-slate-200'}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{item.category}</span>
                      {low && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">LOW STOCK</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{item.currentQty} {item.unit} remaining · min {item.minQty} · restocked {item.lastRestocked}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[5, 10, 20].map((qty) => (
                      <button key={qty} type="button" onClick={() => restock(item.id, qty)} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition">+{qty}</button>
                    ))}
                    {item.currentQty > 0 && <button type="button" onClick={() => setStock((prev) => prev.map((s) => s.id === item.id ? { ...s, currentQty: Math.max(0, s.currentQty - 1) } : s))} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition">-1</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
