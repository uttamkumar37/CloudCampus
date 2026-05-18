import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPresentation, listPresentations, publishPresentation } from './experienceStudioApi';

export default function PresentationBuilderManager() {
  const qc = useQueryClient();
  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ['sa:exp:presentations'],
    queryFn: listPresentations,
  });

  const [form, setForm] = useState({
    title: 'Stakeholder Growth Deck',
    slug: 'stakeholder-growth-deck',
    audienceType: 'GENERAL',
  });

  const createMutation = useMutation({
    mutationFn: createPresentation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:presentations'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishPresentation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:presentations'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dynamic Presentation Builder</h2>
        <span className="text-sm text-slate-500">{presentations.length} decks</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Presentation</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Deck title" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="deck-slug" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.audienceType} onChange={(e) => setForm({ ...form, audienceType: e.target.value.toUpperCase() })} placeholder="INVESTOR" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={createMutation.isPending || !form.title || !form.slug || !form.audienceType}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Deck'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading presentations...</p>
      ) : (
        <div className="space-y-3">
          {presentations.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.slug} • {item.audienceType} • {item.status}</p>
              </div>
              {item.status !== 'PUBLISHED' && (
                <button onClick={() => publishMutation.mutate(item.id)} className="text-sm text-emerald-700 hover:underline">Publish</button>
              )}
            </div>
          ))}
          {presentations.length === 0 && <p className="text-sm text-slate-500">No presentations yet.</p>}
        </div>
      )}
    </div>
  );
}
