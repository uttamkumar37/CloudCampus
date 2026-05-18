import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrandSystem, listBrandSystems, publishBrandSystem } from './experienceStudioApi';

export default function BrandingSystemManager() {
  const qc = useQueryClient();
  const { data: brandSystems = [], isLoading } = useQuery({
    queryKey: ['sa:exp:branding'],
    queryFn: listBrandSystems,
  });

  const [form, setForm] = useState({
    name: '',
    code: '',
    primaryColor: '#0ea5e9',
    headingFont: 'Sora',
    motionPreset: 'confident-enterprise',
  });

  const createMutation = useMutation({
    mutationFn: createBrandSystem,
    onSuccess: () => {
      setForm({ name: '', code: '', primaryColor: '#0ea5e9', headingFont: 'Sora', motionPreset: 'confident-enterprise' });
      qc.invalidateQueries({ queryKey: ['sa:exp:branding'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishBrandSystem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:branding'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Global Branding Engine</h2>
        <span className="text-sm text-slate-500">{brandSystems.length} brand packs</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Brand Pack</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enterprise Sky" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ENT_SKY" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} placeholder="Primary color" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.headingFont} onChange={(e) => setForm({ ...form, headingFont: e.target.value })} placeholder="Heading font" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              name: form.name,
              code: form.code,
              tokenJson: { colors: { primary: form.primaryColor } },
              typographyJson: { headingFont: form.headingFont },
              motionJson: { preset: form.motionPreset },
            })}
            disabled={createMutation.isPending || !form.name || !form.code}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Pack'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading brand packs...</p>
      ) : (
        <div className="space-y-3">
          {brandSystems.map((brand) => (
            <div key={brand.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{brand.name}</p>
                <p className="text-xs text-slate-500">{brand.code} • v{brand.version} • {brand.status}</p>
              </div>
              <div className="h-7 w-7 rounded-full border border-slate-200" style={{ backgroundColor: String((brand.tokenJson.colors as { primary?: string } | undefined)?.primary ?? '#cbd5e1') }} />
              {!brand.published && (
                <button
                  onClick={() => publishMutation.mutate(brand.id)}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Publish
                </button>
              )}
            </div>
          ))}
          {brandSystems.length === 0 && <p className="text-sm text-slate-500">No brand packs yet.</p>}
        </div>
      )}
    </div>
  );
}
