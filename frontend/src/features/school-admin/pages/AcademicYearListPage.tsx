import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listAcademicYears,
  createAcademicYear,
  setCurrentAcademicYear,
  closeAcademicYear,
} from '../api/academicYearApi';
import type { AcademicYearResponse } from '../types/academic';
import { useToast, PageHeader, Badge, PageSpinner, EmptyState, ConfirmDialog } from '@/shared/ui';

// ── Create form ───────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(2, 'Name is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

interface CreateFormProps {
  schoolId: string;
  onClose: () => void;
}

function CreateForm({ schoolId, onClose }: CreateFormProps) {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => createAcademicYear(schoolId, values),
    onSuccess: () => {
      success('Academic year created successfully');
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      onClose();
    },
    onError: () => {
      toastError('Failed to create academic year. Please try again.');
      setError('root', { message: 'Failed to create academic year. Please try again.' });
    },
  });

  const busy = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">New Academic Year</h3>

      {errors.root && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="e.g. 2025–2026"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="mt-0.5 text-xs text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endDate && (
            <p className="mt-0.5 text-xs text-red-600">{errors.endDate.message}</p>
          )}
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

// ── Row ───────────────────────────────────────────────────────────────────────

function YearRow({ year }: { year: AcademicYearResponse }) {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const setCurrent = useMutation({
    mutationFn: () => setCurrentAcademicYear(year.id),
    onSuccess: () => {
      success('Academic year set as current');
      queryClient.invalidateQueries({ queryKey: ['academic-years', year.schoolId] });
    },
    onError: () => { toastError('Failed to set current academic year.'); },
  });

  const close = useMutation({
    mutationFn: (reason: string) => closeAcademicYear(year.id, reason),
    onSuccess: () => {
      success('Academic year closed');
      queryClient.invalidateQueries({ queryKey: ['academic-years', year.schoolId] });
    },
    onError: () => { toastError('Failed to close academic year.'); },
  });

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">
        {year.name}
        {year.isCurrent && (
          <Badge variant="primary" className="ml-2">Current</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {year.startDate} → {year.endDate}
      </td>
      <td className="px-4 py-3">
        <Badge variant={year.status === 'ACTIVE' ? 'success' : year.status === 'CLOSED' ? 'danger' : 'default'}>
          {year.status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {!year.isCurrent && year.status === 'ACTIVE' && (
            <button
              onClick={() => setCurrent.mutate()}
              disabled={setCurrent.isPending}
              className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              Set Current
            </button>
          )}
          {year.status !== 'CLOSED' && (
            <button
              onClick={() => setCloseConfirmOpen(true)}
              disabled={close.isPending}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Close
            </button>
          )}
        </div>
        <ConfirmDialog
          open={closeConfirmOpen}
          onClose={() => setCloseConfirmOpen(false)}
          onConfirm={(reason) => {
            if (!reason) return;
            setCloseConfirmOpen(false);
            close.mutate(reason);
          }}
          title="Close academic year?"
          description="This action cannot be undone."
          confirmLabel="Close"
          loading={close.isPending}
          reasonRequired
          reasonLabel="Reason"
          reasonPlaceholder="Enter the audit reason"
        />
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AcademicYearListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId!),
    enabled: !!schoolId,
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
        title="Academic Years"
        subtitle={data ? `${data.length} configured` : undefined}
        actions={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Academic Year
            </button>
          ) : undefined
        }
      />

      {showForm && (
        <CreateForm schoolId={schoolId} onClose={() => setShowForm(false)} />
      )}

      {isLoading && <PageSpinner />}
      {isError && (
        <p className="text-sm text-red-600" role="alert">
          Failed to load academic years.
        </p>
      )}

      {data && data.length === 0 && !isLoading && (
        <EmptyState title="No academic years" description="No academic years yet. Create one to get started." />
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((year) => (
                <YearRow key={year.id} year={year} />
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
