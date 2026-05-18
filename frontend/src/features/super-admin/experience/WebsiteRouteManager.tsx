import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createWebsiteRoute, listWebsiteRoutes, publishWebsiteRoute } from './experienceStudioApi';

export default function WebsiteRouteManager() {
  const qc = useQueryClient();
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['sa:exp:website-routes'],
    queryFn: listWebsiteRoutes,
  });

  const [form, setForm] = useState({
    routePath: '/investors',
    audienceType: 'INVESTOR',
    title: 'Investor Narrative',
  });

  const createMutation = useMutation({
    mutationFn: createWebsiteRoute,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:website-routes'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishWebsiteRoute,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:website-routes'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dynamic Website Builder</h2>
        <span className="text-sm text-slate-500">{routes.length} route configs</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Route Configuration</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={form.routePath} onChange={(e) => setForm({ ...form, routePath: e.target.value })} placeholder="/school-owners" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.audienceType} onChange={(e) => setForm({ ...form, audienceType: e.target.value.toUpperCase() })} placeholder="SCHOOL_OWNER" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="School Owner Experience" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              routePath: form.routePath,
              audienceType: form.audienceType,
              title: form.title,
              seoJson: { title: form.title, description: `${form.title} page` },
              layoutJson: { sections: ['hero', 'metrics', 'cta'] },
              ctaJson: { primary: { label: 'Book Demo', href: '/demo' } },
            })}
            disabled={createMutation.isPending || !form.routePath || !form.title}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Route'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading route configurations...</p>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <div key={route.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{route.title}</p>
                <p className="text-xs text-slate-500">{route.routePath} • {route.audienceType} • {route.status}</p>
              </div>
              {!route.published && (
                <button onClick={() => publishMutation.mutate(route.id)} className="text-sm text-emerald-700 hover:underline">
                  Publish
                </button>
              )}
            </div>
          ))}
          {routes.length === 0 && <p className="text-sm text-slate-500">No route configurations yet.</p>}
        </div>
      )}
    </div>
  );
}
