import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '../api/academicYearApi';
import { listClasses, createClass, deleteClass } from '../api/classApi';

// ── Create form ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  gradeLevel: z.string().optional(),
  capacity: z.string().optional(),
});

type FormInput = { name: string; gradeLevel?: string; capacity?: string };

interface CreateFormProps {
  schoolId: string;
  academicYearId: string;
  onClose: () => void;
}

function CreateForm({ schoolId, academicYearId, onClose }: CreateFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormInput) =>
      createClass(schoolId, {
        academicYearId,
        name: values.name,
        gradeLevel: toOptionalNumber(values.gradeLevel),
        capacity: toOptionalNumber(values.capacity),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', academicYearId] });
      onClose();
    },
    onError: () => {
      setError('root', { message: 'Failed to create class. Please try again.' });
    },
  });

  const busy = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">New Class</h3>

      {errors.root && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Class Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="e.g. Grade 10"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Grade Level
          </label>
          <input
            type="number"
            min={1}
            max={13}
            {...register('gradeLevel')}
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Capacity
          </label>
          <input
            type="number"
            min={1}
            {...register('capacity')}
            placeholder="e.g. 40"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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

function toOptionalNumber(value?: string) {
  return value ? Number(value) : undefined;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ClassListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: years, isLoading: yearsLoading } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId!),
    enabled: !!schoolId,
  });

  // Default to current year on first load
  const effectiveYearId =
    selectedYearId ||
    years?.find((y) => y.isCurrent)?.id ||
    years?.[0]?.id ||
    '';

  const { data: classes, isLoading: classesLoading, isError } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => listClasses(effectiveYearId),
    enabled: !!effectiveYearId,
  });

  const del = useMutation({
    mutationFn: deleteClass,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['classes', effectiveYearId] }),
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
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Classes</h2>
          {classes && (
            <p className="mt-0.5 text-sm text-gray-500">{classes.length} classes</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Academic year selector */}
          <select
            value={selectedYearId || effectiveYearId}
            onChange={(e) => {
              setSelectedYearId(e.target.value);
              setShowForm(false);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={yearsLoading}
          >
            {years?.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
                {y.isCurrent ? ' (current)' : ''}
              </option>
            ))}
          </select>

          {!showForm && effectiveYearId && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Class
            </button>
          )}
        </div>
      </div>

      {showForm && effectiveYearId && (
        <CreateForm
          schoolId={schoolId}
          academicYearId={effectiveYearId}
          onClose={() => setShowForm(false)}
        />
      )}

      {(yearsLoading || classesLoading) && (
        <p className="text-sm text-gray-500" role="status">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-red-600" role="alert">Failed to load classes.</p>
      )}

      {!effectiveYearId && !yearsLoading && (
        <p className="text-sm text-gray-500">
          No academic years found. Create an academic year first.
        </p>
      )}

      {classes && classes.length === 0 && !classesLoading && (
        <p className="text-sm text-gray-500">
          No classes for this academic year. Create one to get started.
        </p>
      )}

      {classes && classes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Class Name</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr
                  key={cls.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {cls.gradeLevel ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cls.capacity ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm('Delete this class? This cannot be undone.'))
                          del.mutate(cls.id);
                      }}
                      disabled={del.isPending}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
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
