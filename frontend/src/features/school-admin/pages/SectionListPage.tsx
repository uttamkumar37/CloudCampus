import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '../api/academicYearApi';
import { listClasses } from '../api/classApi';
import { listSections, createSection, deleteSection } from '../api/sectionApi';
import { useToast, PageHeader, PageSpinner, EmptyState, ConfirmDialog } from '@/shared/ui';

// ── Create form ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Section name is required').max(50),
  capacity: z.string().optional(),
});

type FormInput = { name: string; capacity?: string };

interface CreateFormProps {
  classId: string;
  onClose: () => void;
}

function CreateForm({ classId, onClose }: CreateFormProps) {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormInput) =>
      createSection(classId, {
        name: values.name,
        capacity: toOptionalNumber(values.capacity),
      }),
    onSuccess: () => {
      success('Section created successfully');
      queryClient.invalidateQueries({ queryKey: ['sections', classId] });
      onClose();
    },
    onError: () => {
      toastError('Failed to create section. Please try again.');
      setError('root', { message: 'Failed to create section. Please try again.' });
    },
  });

  const busy = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">New Section</h3>

      {errors.root && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {errors.root.message}
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

function toOptionalNumber(value?: string) {
  return value ? Number(value) : undefined;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SectionListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

  const { success: pageSuccess, error: pageError } = useToast();
  const del = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      pageSuccess('Section deleted');
      queryClient.invalidateQueries({ queryKey: ['sections', effectiveClassId] });
    },
    onError: () => { pageError('Failed to delete section.'); },
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
      <PageHeader
        title="Sections"
        subtitle={sections ? `${sections.length} sections` : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-3">
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
        }
      />

      {showForm && effectiveClassId && (
        <CreateForm classId={effectiveClassId} onClose={() => setShowForm(false)} />
      )}

      {(yearsLoading || classesLoading || sectionsLoading) && <PageSpinner />}
      {isError && (
        <p className="text-sm text-red-600" role="alert">Failed to load sections.</p>
      )}

      {!effectiveClassId && !classesLoading && effectiveYearId && (
        <p className="text-sm text-gray-500">No classes found. Add classes first.</p>
      )}

      {sections && sections.length === 0 && !sectionsLoading && effectiveClassId && (
        <EmptyState title="No sections" description="No sections for this class. Create one to get started." />
      )}

      {sections && sections.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
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
                      onClick={() => setConfirmDeleteId(sec.id)}
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
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { if (confirmDeleteId) del.mutate(confirmDeleteId); setConfirmDeleteId(null); }}
        title="Delete section"
        description="Delete this section? This cannot be undone."
        confirmLabel="Delete"
        loading={del.isPending}
      />
    </div>
  );
}
