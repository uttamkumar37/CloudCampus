import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTrustModule, listTrustModules, publishTrustModule } from './experienceStudioApi';

export default function TrustPlatformManager() {
  const qc = useQueryClient();
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['sa:exp:trust-modules'],
    queryFn: listTrustModules,
  });

  const [form, setForm] = useState({
    moduleKey: 'trust-architecture-core',
    title: 'Architecture and Security Core',
    category: 'SECURITY',
  });

  const createMutation = useMutation({
    mutationFn: createTrustModule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:trust-modules'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishTrustModule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:trust-modules'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Enterprise Trust Platform</h2>
        <span className="text-sm text-slate-500">{modules.length} trust modules</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Trust Module</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={form.moduleKey} onChange={(e) => setForm({ ...form, moduleKey: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="module-key" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Module title" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })} placeholder="SECURITY" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              moduleKey: form.moduleKey,
              title: form.title,
              category: form.category,
              evidenceJson: { controls: ['JWT', 'RBAC', 'Audit trails'] },
              metricsJson: { uptime: '99.95%', incidents: 0 },
              displayJson: { priority: 1, badge: 'Verified' },
            })}
            disabled={createMutation.isPending || !form.moduleKey || !form.title}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Module'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading trust modules...</p>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{module.title}</p>
                <p className="text-xs text-slate-500">{module.moduleKey} • {module.category} • {module.status}</p>
              </div>
              {!module.published && (
                <button onClick={() => publishMutation.mutate(module.id)} className="text-sm text-emerald-700 hover:underline">Publish</button>
              )}
            </div>
          ))}
          {modules.length === 0 && <p className="text-sm text-slate-500">No trust modules yet.</p>}
        </div>
      )}
    </div>
  );
}
