import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStoryScene, listStoryScenes, publishStoryScene } from './experienceStudioApi';

export default function StorytellingManager() {
  const qc = useQueryClient();
  const { data: scenes = [], isLoading } = useQuery({
    queryKey: ['sa:exp:story-scenes'],
    queryFn: listStoryScenes,
  });

  const [form, setForm] = useState({
    sceneKey: 'story-enterprise-proof',
    title: 'Enterprise Proof Narrative',
    audienceType: 'ENTERPRISE_CUSTOMER',
    proofPoints: '99.95% uptime,ISO-ready controls,520 schools onboarded',
  });

  const createMutation = useMutation({
    mutationFn: createStoryScene,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:story-scenes'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishStoryScene,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:story-scenes'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Enterprise Storytelling System</h2>
        <span className="text-sm text-slate-500">{scenes.length} scenes</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Story Scene</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.sceneKey} onChange={(e) => setForm({ ...form, sceneKey: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="scene-key" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Scene title" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.audienceType} onChange={(e) => setForm({ ...form, audienceType: e.target.value.toUpperCase() })} placeholder="INVESTOR" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.proofPoints} onChange={(e) => setForm({ ...form, proofPoints: e.target.value })} placeholder="proof1,proof2" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              sceneKey: form.sceneKey,
              title: form.title,
              audienceType: form.audienceType,
              timelineJson: { acts: ['problem', 'proof', 'outcome', 'cta'] },
              proofPointsJson: form.proofPoints.split(',').map((x) => x.trim()).filter(Boolean),
              animationJson: { preset: 'stagger-metrics', durationMs: 2800 },
            })}
            disabled={createMutation.isPending || !form.sceneKey || !form.title}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Scene'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading story scenes...</p>
      ) : (
        <div className="space-y-3">
          {scenes.map((scene) => (
            <div key={scene.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{scene.title}</p>
                <p className="text-xs text-slate-500">{scene.sceneKey} • {scene.audienceType} • {scene.status}</p>
              </div>
              {!scene.published && (
                <button onClick={() => publishMutation.mutate(scene.id)} className="text-sm text-emerald-700 hover:underline">Publish</button>
              )}
            </div>
          ))}
          {scenes.length === 0 && <p className="text-sm text-slate-500">No story scenes yet.</p>}
        </div>
      )}
    </div>
  );
}
