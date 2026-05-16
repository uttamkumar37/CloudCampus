import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPrompts, activatePrompt, deactivatePrompt } from '../api/promptApi';
import type { PromptTemplate } from '../api/promptApi';

function groupByKey(prompts: PromptTemplate[]): Map<string, PromptTemplate[]> {
  const map = new Map<string, PromptTemplate[]>();
  for (const p of prompts) {
    const group = map.get(p.promptKey) ?? [];
    group.push(p);
    map.set(p.promptKey, group);
  }
  return map;
}

export function PromptListPage() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['ai-prompts'],
    queryFn:  () => listPrompts(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
    setError(null);
  };

  const onMutationError = (err: unknown) => {
    setError(
      (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Operation failed',
    );
  };

  const activateMutation   = useMutation({ mutationFn: (id: string) => activatePrompt(id),   onSuccess: invalidate, onError: onMutationError });
  const deactivateMutation = useMutation({ mutationFn: (id: string) => deactivatePrompt(id), onSuccess: invalidate, onError: onMutationError });

  const grouped = groupByKey(prompts);
  const isBusy  = activateMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">AI Prompt Registry</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Versioned prompt templates. Activate a version to make it live.
          </p>
        </div>
        <button
          onClick={() => navigate('/super-admin/ai/prompts/new')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Prompt
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-2 font-semibold underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : grouped.size === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">No prompt templates yet.</p>
          <button
            onClick={() => navigate('/super-admin/ai/prompts/new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create your first prompt
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([key, versions]) => {
            const active = versions.find((v) => v.active);
            return (
              <div key={key} className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {key}
                  </code>
                  {active ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      v{active.version} active
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      no active version
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{versions.length} version{versions.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="divide-y divide-gray-50">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{v.name}</span>
                          <span className="text-xs text-gray-400">v{v.version}</span>
                          {v.active && (
                            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        {v.description && (
                          <p className="mt-0.5 text-xs text-gray-400 truncate">{v.description}</p>
                        )}
                        <p className="mt-1 line-clamp-1 font-mono text-xs text-gray-500">
                          {v.template.substring(0, 120)}…
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => navigate(`/super-admin/ai/prompts/${v.id}`)}
                          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          View
                        </button>
                        {v.active ? (
                          <button
                            onClick={() => deactivateMutation.mutate(v.id)}
                            disabled={isBusy}
                            className="rounded border border-orange-200 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => activateMutation.mutate(v.id)}
                            disabled={isBusy}
                            className="rounded border border-green-200 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-60"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
