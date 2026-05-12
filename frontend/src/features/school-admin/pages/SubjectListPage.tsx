import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listSubjects,
  createSubject,
  activateSubject,
  deactivateSubject,
} from '../api/subjectApi';

// ── Create form ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Subject name is required').max(150),
  code: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateFormProps {
  schoolId: string;
  onClose: () => void;
}

function CreateForm({ schoolId, onClose }: CreateFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => createSubject(schoolId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId] });
      onClose();
    },
    onError: () => {
      setError('root', { message: 'Failed to create subject. Please try again.' });
    },
  });

  const busy = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">New Subject</h3>

      {errors.root && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="e.g. Mathematics"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Code
          </label>
          <input
            {...register('code')}
            placeholder="e.g. MATH-10"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.code && (
            <p className="mt-0.5 text-xs text-red-600">{errors.code.message}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="Optional description"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-0.5 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SubjectListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();

  const activeOnly = !showInactive;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subjects', schoolId, activeOnly],
    queryFn: () => listSubjects(schoolId!, activeOnly),
    enabled: !!schoolId,
  });

  const activate = useMutation({
    mutationFn: activateSubject,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId] }),
  });

  const deactivate = useMutation({
    mutationFn: deactivateSubject,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId] }),
  });

  if (!schoolId) {
    return (
      <div className="p-6">
        <p className="text-sm text-amber-600">
          School ID not available in session. Please log out and log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Subjects</h2>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">{data.length} subjects</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Show inactive
          </label>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Subject
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <CreateForm schoolId={schoolId} onClose={() => setShowForm(false)} />
      )}

      {isLoading && (
        <p className="text-sm text-gray-500" role="status">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-red-600" role="alert">Failed to load subjects.</p>
      )}

      {data && data.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">
          No subjects yet. Create one to get started.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {sub.name}
                    {sub.description && (
                      <span className="ml-1 text-xs text-gray-400" title={sub.description}>
                        ℹ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono">
                    {sub.code ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        sub.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {sub.isActive ? (
                      <button
                        onClick={() => deactivate.mutate(sub.id)}
                        disabled={deactivate.isPending}
                        className="rounded px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => activate.mutate(sub.id)}
                        disabled={activate.isPending}
                        className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
