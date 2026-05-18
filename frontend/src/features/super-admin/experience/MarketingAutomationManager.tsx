import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCampaign, listCampaigns, pauseCampaign, publishCampaign } from './experienceStudioApi';

export default function MarketingAutomationManager() {
  const qc = useQueryClient();
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['sa:exp:campaigns'],
    queryFn: listCampaigns,
  });

  const [form, setForm] = useState({
    name: 'School Owner Lead Nurture',
    campaignType: 'EMAIL_DRIP',
    audience: 'SCHOOL_OWNER',
    triggerType: 'SIGNUP',
  });

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:campaigns'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:campaigns'] }),
  });

  const pauseMutation = useMutation({
    mutationFn: pauseCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:campaigns'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Marketing Automation System</h2>
        <span className="text-sm text-slate-500">{campaigns.length} campaigns</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Campaign</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campaign name" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.campaignType} onChange={(e) => setForm({ ...form, campaignType: e.target.value.toUpperCase() })} placeholder="EMAIL_DRIP" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value.toUpperCase() })} placeholder="SCHOOL_OWNER" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value.toUpperCase() })} placeholder="SIGNUP" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              name: form.name,
              campaignType: form.campaignType,
              audienceFilter: { audience: form.audience },
              triggerType: form.triggerType,
              triggerConfig: { source: 'experience-studio' },
              steps: [
                { position: 1, delayMinutes: 0, actionType: 'SEND_EMAIL', actionConfig: { template: 'welcome' } },
                { position: 2, delayMinutes: 120, actionType: 'TAG_LEAD', actionConfig: { tag: 'warm' } },
              ],
            })}
            disabled={createMutation.isPending || !form.name}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading campaigns...</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{campaign.name}</p>
                <p className="text-xs text-slate-500">{campaign.campaignType} • {campaign.triggerType} • {campaign.status} • {campaign.steps.length} steps</p>
              </div>
              {campaign.status !== 'ACTIVE' && (
                <button onClick={() => publishMutation.mutate(campaign.id)} className="text-sm text-emerald-700 hover:underline">Activate</button>
              )}
              {campaign.status === 'ACTIVE' && (
                <button onClick={() => pauseMutation.mutate(campaign.id)} className="text-sm text-amber-700 hover:underline">Pause</button>
              )}
            </div>
          ))}
          {campaigns.length === 0 && <p className="text-sm text-slate-500">No campaigns yet.</p>}
        </div>
      )}
    </div>
  );
}
