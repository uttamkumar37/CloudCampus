import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStakeholderJourney, listStakeholderJourneys, publishStakeholderJourney } from './experienceStudioApi';

export default function StakeholderJourneyManager() {
  const qc = useQueryClient();
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['sa:exp:stakeholder-journeys'],
    queryFn: listStakeholderJourneys,
  });

  const [form, setForm] = useState({
    stakeholderType: 'INVESTOR',
    journeyKey: 'investor-default',
    name: 'Investor Experience Journey',
    conversionGoal: 'Schedule diligence walkthrough',
  });

  const createMutation = useMutation({
    mutationFn: createStakeholderJourney,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:stakeholder-journeys'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishStakeholderJourney,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:stakeholder-journeys'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Stakeholder Experience Engine</h2>
        <span className="text-sm text-slate-500">{journeys.length} journey configs</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Stakeholder Journey</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.stakeholderType} onChange={(e) => setForm({ ...form, stakeholderType: e.target.value.toUpperCase() })} placeholder="PARENT" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.journeyKey} onChange={(e) => setForm({ ...form, journeyKey: e.target.value })} placeholder="parent-onboarding" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Parent Experience" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.conversionGoal} onChange={(e) => setForm({ ...form, conversionGoal: e.target.value })} placeholder="Goal" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              stakeholderType: form.stakeholderType,
              journeyKey: form.journeyKey,
              name: form.name,
              conversionGoal: form.conversionGoal,
              narrativeJson: { hero: `${form.name} narrative`, sequence: ['problem', 'solution', 'proof', 'cta'] },
              touchpointsJson: [{ type: 'landing' }, { type: 'demo' }, { type: 'cta' }],
            })}
            disabled={createMutation.isPending || !form.stakeholderType || !form.journeyKey || !form.name}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Journey'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading stakeholder journeys...</p>
      ) : (
        <div className="space-y-3">
          {journeys.map((journey) => (
            <div key={journey.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{journey.name}</p>
                <p className="text-xs text-slate-500">{journey.stakeholderType} • {journey.journeyKey} • {journey.status}</p>
              </div>
              {!journey.published && (
                <button onClick={() => publishMutation.mutate(journey.id)} className="text-sm text-emerald-700 hover:underline">
                  Publish
                </button>
              )}
            </div>
          ))}
          {journeys.length === 0 && <p className="text-sm text-slate-500">No stakeholder journeys yet.</p>}
        </div>
      )}
    </div>
  );
}
