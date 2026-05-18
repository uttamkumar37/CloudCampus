import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTemplate, listTemplates, publishTemplate } from './experienceStudioApi';

export default function TemplateMarketplaceManager() {
  const qc = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['sa:exp:templates'],
    queryFn: listTemplates,
  });

  const [form, setForm] = useState({
    templateKey: 'template-growth-k12',
    name: 'Growth K12 Starter',
    category: 'K12',
    tags: 'admissions,conversion,school-owner',
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:templates'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:templates'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Website Template Marketplace</h2>
        <span className="text-sm text-slate-500">{templates.length} templates</span>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Create Template</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.templateKey} onChange={(e) => setForm({ ...form, templateKey: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="template-key" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Template name" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })} placeholder="K12" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1,tag2" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          <button
            onClick={() => createMutation.mutate({
              templateKey: form.templateKey,
              name: form.name,
              category: form.category,
              tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
              schemaJson: { sections: ['hero', 'proof', 'cta'], widgets: ['lead-form'] },
              defaultBrandingJson: { brandCode: 'ENT_SKY' },
            })}
            disabled={createMutation.isPending || !form.templateKey || !form.name}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading templates...</p>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{template.name}</p>
                <p className="text-xs text-slate-500">{template.templateKey} • {template.category} • {template.status} • uses {template.usageCount}</p>
              </div>
              {!template.published && (
                <button onClick={() => publishMutation.mutate(template.id)} className="text-sm text-emerald-700 hover:underline">Publish</button>
              )}
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-slate-500">No templates yet.</p>}
        </div>
      )}
    </div>
  );
}
