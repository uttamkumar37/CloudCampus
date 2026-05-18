import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  activateDepartment,
  type DepartmentResponse,
  type DepartmentRequest,
} from '../api/departmentApi';

// ── Validation ────────────────────────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(1, 'Name is required').max(150),
  code:        z.string().max(20).regex(/^[A-Z0-9_]*$/, 'Uppercase letters, digits, underscores only').or(z.literal('')).optional(),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Create / Edit form ────────────────────────────────────────────────────────

function DepartmentForm({
  schoolId,
  editing,
  onClose,
}: {
  schoolId: string;
  editing:  DepartmentResponse | null;
  onClose:  () => void;
}) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        editing?.name        ?? '',
      code:        editing?.code        ?? '',
      description: editing?.description ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const body: DepartmentRequest = {
        name:        values.name,
        code:        values.code || null,
        description: values.description || null,
      };
      return editing
        ? updateDepartment(editing.id, body)
        : createDepartment(schoolId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });
      onClose();
    },
    onError: () => {
      setError('root', { message: 'Failed to save department. Please try again.' });
    },
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">
        {editing ? 'Edit Department' : 'New Department'}
      </h3>

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
            placeholder="e.g. Science"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
          <input
            {...register('code')}
            placeholder="e.g. SCI"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.code && <p className="mt-0.5 text-xs text-red-600">{errors.code.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
          <input
            {...register('description')}
            placeholder="Optional description"
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
          {busy ? 'Saving…' : editing ? 'Update' : 'Create'}
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

export function DepartmentListPage() {
  const user     = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const queryClient = useQueryClient();

  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<DepartmentResponse | null>(null);
  const [showAll,   setShowAll]   = useState(false);

  const { data: departments = [], isLoading, isError } = useQuery({
    queryKey: ['departments', schoolId, showAll],
    queryFn:  () => listDepartments(schoolId!, !showAll),
    enabled:  !!schoolId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });

  const deactivateMutation = useMutation({ mutationFn: deactivateDepartment, onSuccess: invalidate });
  const activateMutation   = useMutation({ mutationFn: activateDepartment,   onSuccess: invalidate });

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(dept: DepartmentResponse) {
    setEditing(dept);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  if (!schoolId) {
    return (
      <div className="p-6">
        <p className="text-sm text-amber-600">
          School ID not available in session. Please log out and log in again.
        </p>
      </div>
    );
  }

  const activeDepts   = departments.filter((d) => d.isActive).length;
  const inactiveDepts = departments.filter((d) => !d.isActive).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
          {departments.length > 0 && (
            <p className="mt-0.5 text-sm text-gray-500">
              {activeDepts} active{inactiveDepts > 0 ? `, ${inactiveDepts} inactive` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show inactive
          </label>
          {!showForm && (
            <button
              onClick={openCreate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Department
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <DepartmentForm
          schoolId={schoolId}
          editing={editing}
          onClose={closeForm}
        />
      )}

      {/* States */}
      {isLoading && <p className="text-sm text-gray-500" role="status">Loading…</p>}
      {isError   && <p className="text-sm text-red-600"  role="alert">Failed to load departments.</p>}

      {!isLoading && departments.length === 0 && (
        <p className="text-sm text-gray-500">No departments yet. Create one to get started.</p>
      )}

      {/* Table */}
      {departments.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className={[
                    'border-b border-gray-100 last:border-0',
                    dept.isActive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-70',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                  <td className="px-4 py-3">
                    {dept.code
                      ? <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">{dept.code}</span>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {dept.description ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={[
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      dept.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500',
                    ].join(' ')}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(dept)}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      {dept.isActive ? (
                        <button
                          onClick={() => deactivateMutation.mutate(dept.id)}
                          disabled={deactivateMutation.isPending}
                          className="rounded px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateMutation.mutate(dept.id)}
                          disabled={activateMutation.isPending}
                          className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                    </div>
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
