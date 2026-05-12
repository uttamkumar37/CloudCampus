import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '../api/academicYearApi';
import { listClasses } from '../api/classApi';
import { listSections, createSection, deleteSection } from '../api/sectionApi';

// ── Create form ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Section name is required').max(50),
  capacity: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
});

type FormInput = { name: string; capacity?: string };
type FormValues = z.infer<typeof schema>;

interface CreateFormProps {
  classId: string;
  onClose: () => void;
}

function CreateForm({ classId, onClose }: CreateFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema) as any });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createSection(classId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId] });
      onClose();
    },
    onError: () => {
      setError('root' as any, { message: 'Failed to create section. Please try again.' });
    },
  });

  const busy = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v as unknown as FormValues))}
      className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">New Section</h3>

      {(errors as any).root && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {(errors as any).root.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Section Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="e.g. Section A"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
          )}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function SectionListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: years, isLoading: yearsLoading } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId!),
    enabled: !!schoolId,
  });

  const effectiveYearId =
    selectedYearId ||
    years?.find((y) => y.isCurrent)?.id ||
    years?.[0]?.id ||
    '';

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => listClasses(effectiveYearId),
    enabled: !!effectiveYearId,
  });

  const effectiveClassId =
    selectedClassId || classes?.[0]?.id || '';

  const { data: sections, isLoading: sectionsLoading, isError } = useQuery({
    queryKey: ['sections', effectiveClassId],
    queryFn: () => listSections(effectiveClassId),
    enabled: !!effectiveClassId,
  });

  const del = useMutation({
    mutationFn: deleteSection,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['sections', effectiveClassId] }),
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
          <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
          {sections && (
            <p className="mt-0.5 text-sm text-gray-500">{sections.length} sections</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <select
            value={selectedYearId || effectiveYearId}
            onChange={(e) => {
              setSelectedYearId(e.target.value);
              setSelectedClassId('');
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

          {/* Class selector */}
          <select
            value={selectedClassId || effectiveClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setShowForm(false);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={classesLoading || !effectiveYearId}
          >
            {!classes?.length && (
              <option value="">No classes</option>
            )}
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {!showForm && effectiveClassId && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Section
            </button>
          )}
        </div>
      </div>

      {showForm && effectiveClassId && (
        <CreateForm classId={effectiveClassId} onClose={() => setShowForm(false)} />
      )}

      {(yearsLoading || classesLoading || sectionsLoading) && (
        <p className="text-sm text-gray-500" role="status">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-red-600" role="alert">Failed to load sections.</p>
      )}

      {!effectiveClassId && !classesLoading && effectiveYearId && (
        <p className="text-sm text-gray-500">No classes found. Add classes first.</p>
      )}

      {sections && sections.length === 0 && !sectionsLoading && effectiveClassId && (
        <p className="text-sm text-gray-500">
          No sections for this class. Create one to get started.
        </p>
      )}

      {sections && sections.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Section Name</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <tr
                  key={sec.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{sec.name}</td>
                  <td className="px-4 py-3 text-gray-600">{sec.capacity ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm('Delete this section? This cannot be undone.'))
                          del.mutate(sec.id);
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
