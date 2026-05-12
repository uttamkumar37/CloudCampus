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
import type { AcademicYearResponse, AcademicYearStatus } from '../types/academic';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AcademicYearStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-600',
};

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
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      onClose();
    },
    onError: () => {
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
  const queryClient = useQueryClient();

  const setCurrent = useMutation({
    mutationFn: () => setCurrentAcademicYear(year.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['academic-years', year.schoolId] }),
  });

  const close = useMutation({
    mutationFn: () => closeAcademicYear(year.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['academic-years', year.schoolId] }),
  });

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">
        {year.name}
        {year.isCurrent && (
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            Current
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {year.startDate} → {year.endDate}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[year.status]}`}
        >
          {year.status}
        </span>
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
              onClick={() => close.mutate()}
              disabled={close.isPending}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Close
            </button>
          )}
        </div>
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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Academic Years</h2>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">{data.length} configured</p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New Academic Year
          </button>
        )}
      </div>

      {showForm && (
        <CreateForm schoolId={schoolId} onClose={() => setShowForm(false)} />
      )}

      {isLoading && (
        <p className="text-sm text-gray-500" role="status">
          Loading…
        </p>
      )}
      {isError && (
        <p className="text-sm text-red-600" role="alert">
          Failed to load academic years.
        </p>
      )}

      {data && data.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">No academic years yet. Create one to get started.</p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
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
      )}
    </div>
  );
}
