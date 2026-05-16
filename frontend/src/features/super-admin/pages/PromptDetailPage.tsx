import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getPrompt,
  createPrompt,
  activatePrompt,
  deactivatePrompt,
  renderPrompt,
} from '../api/promptApi';
import type { RenderRequest } from '../api/promptApi';

// ── Create form schema ─────────────────────────────────────────────────────

const createSchema = z.object({
  promptKey:   z.string().min(3).regex(/^[a-z0-9][a-z0-9._-]{1,98}[a-z0-9]$/, 'Lowercase, dots, underscores, hyphens only'),
  name:        z.string().min(2).max(200),
  description: z.string().optional(),
  template:    z.string().min(1),
  variables:   z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

// ── Create page ────────────────────────────────────────────────────────────

function CreatePromptForm() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPrompt,
    onSuccess: (prompt) => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      navigate(`/super-admin/ai/prompts/${prompt.id}`);
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to create prompt',
      );
    },
  });

  return (
    <div className="p-6">
      <button onClick={() => navigate('/super-admin/ai/prompts')} className="mb-3 text-xs text-gray-400 hover:text-gray-600">
        ← Back to prompts
      </button>
      <h1 className="mb-5 text-xl font-semibold text-gray-900">New Prompt Template</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6"
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Prompt Key</label>
            <input
              {...register('promptKey')}
              placeholder="e.g. attendance.summary"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.promptKey && <p className="mt-1 text-xs text-red-600">{errors.promptKey.message}</p>}
            <p className="mt-1 text-xs text-gray-400">Lowercase alphanumeric, dots, hyphens.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <input
              {...register('name')}
              placeholder="e.g. Attendance Summary Generator"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Description (optional)</label>
          <input
            {...register('description')}
            placeholder="What does this prompt do?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Template</label>
          <p className="mb-1 text-xs text-gray-400">
            Use <code className="rounded bg-gray-100 px-1">{'{variableName}'}</code> for placeholders.
          </p>
          <textarea
            {...register('template')}
            rows={8}
            placeholder="You are a school management assistant. Summarize the attendance for {studentName} in {courseName}..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.template && <p className="mt-1 text-xs text-red-600">{errors.template.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Variables (optional)</label>
          <input
            {...register('variables')}
            placeholder='["studentName","courseName"]'
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">JSON array of expected variable names.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? 'Saving…' : 'Create Prompt'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/super-admin/ai/prompts')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Detail / Playground page ───────────────────────────────────────────────

function PromptDetail({ id }: { id: string }) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const [renderVars, setRenderVars]   = useState('{}');
  const [renderResult, setRenderResult] = useState<{ rendered: string; ai: string } | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const { data: prompt, isLoading } = useQuery({
    queryKey: ['ai-prompt', id],
    queryFn:  () => getPrompt(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ai-prompt', id] });
    queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
    setActionError(null);
  };

  const onError = (err: unknown) => {
    setActionError(
      (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Operation failed',
    );
  };

  const activateMutation   = useMutation({ mutationFn: () => activatePrompt(id),   onSuccess: invalidate, onError });
  const deactivateMutation = useMutation({ mutationFn: () => deactivatePrompt(id), onSuccess: invalidate, onError });

  const { mutate: doRender, isPending: isRendering } = useMutation({
    mutationFn: (req: RenderRequest) => renderPrompt(id, req),
    onSuccess: (res) => {
      setRenderResult({ rendered: res.renderedPrompt, ai: res.aiResponse });
      setRenderError(null);
    },
    onError: (err: unknown) => {
      setRenderError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Render failed',
      );
    },
  });

  const handleRender = () => {
    try {
      const vars = JSON.parse(renderVars) as Record<string, string>;
      doRender({ variables: vars });
    } catch {
      setRenderError('Variables must be valid JSON, e.g. {"name": "Alice"}');
    }
  };

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  if (!prompt)   return <div className="p-6 text-sm text-red-600">Prompt not found.</div>;

  const isBusy = activateMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate('/super-admin/ai/prompts')} className="text-xs text-gray-400 hover:text-gray-600">
          ← Back
        </button>
        <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
          {prompt.promptKey}
        </code>
        <span className="text-xs text-gray-400">v{prompt.version}</span>
        {prompt.active && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">ACTIVE</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => navigate('/super-admin/ai/prompts/new')}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            New Version
          </button>
          {prompt.active ? (
            <button
              onClick={() => deactivateMutation.mutate()}
              disabled={isBusy}
              className="rounded-lg border border-orange-200 px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-60"
            >
              {deactivateMutation.isPending ? 'Deactivating…' : 'Deactivate'}
            </button>
          ) : (
            <button
              onClick={() => activateMutation.mutate()}
              disabled={isBusy}
              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {activateMutation.isPending ? 'Activating…' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Template */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">{prompt.name}</h2>
            {prompt.description && <p className="mt-0.5 text-xs text-gray-400">{prompt.description}</p>}
          </div>
          <div className="p-4">
            {prompt.variables && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-400 mb-1">Expected Variables</p>
                <code className="text-xs text-gray-600">{prompt.variables}</code>
              </div>
            )}
            <pre className="overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700 whitespace-pre-wrap">
              {prompt.template}
            </pre>
          </div>
        </div>

        {/* Playground */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Render Playground</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Test this prompt with variable values. Calls the live AI provider.
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Variables (JSON)
              </label>
              <textarea
                value={renderVars}
                onChange={(e) => setRenderVars(e.target.value)}
                rows={4}
                placeholder='{"studentName": "Alice", "courseName": "Math"}'
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleRender}
              disabled={isRendering}
              className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isRendering ? 'Calling AI…' : 'Run Prompt →'}
            </button>

            {renderError && (
              <p className="text-xs text-red-600">{renderError}</p>
            )}

            {renderResult && (
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-400">Rendered Prompt</p>
                  <pre className="overflow-auto rounded-lg bg-gray-50 p-2 text-xs text-gray-600 whitespace-pre-wrap max-h-32">
                    {renderResult.rendered}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-400">AI Response</p>
                  <pre className="overflow-auto rounded-lg bg-blue-50 p-2 text-xs text-blue-800 whitespace-pre-wrap max-h-48">
                    {renderResult.ai}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Route entry point ──────────────────────────────────────────────────────

export function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (id === 'new') return <CreatePromptForm />;
  return <PromptDetail id={id!} />;
}
