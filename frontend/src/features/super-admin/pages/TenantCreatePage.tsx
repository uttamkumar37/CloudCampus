import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { createTenant } from '../api/tenantApi';

// ── Validation schema (mirrors backend @Pattern + @Size) ─────────────────────

const schema = z.object({
  /**
   * Backend pattern: ^[a-z0-9][a-z0-9\-]{1,62}[a-z0-9]$
   * Ensures the code:
   *  • starts and ends with a lowercase letter or digit
   *  • contains only lowercase letters, digits, and hyphens
   *  • is between 3 and 64 characters total (1 + 1–62 + 1)
   */
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(
      /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/,
      'Must be lowercase letters, digits, and hyphens; cannot start or end with a hyphen',
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters'),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

export function TenantCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      // Invalidate the tenant list so it refreshes on next visit
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      navigate('/super-admin/tenants', { replace: true });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to create tenant. Please try again.';
      setError('root', { message });
    },
  });

  const onSubmit = (values: FormValues) => mutate(values);
  const busy = isSubmitting || isPending;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Tenant</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Provision a new school tenant. A default MAIN school is created automatically.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6"
        noValidate
      >
        {/* Global error */}
        {errors.root && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {errors.root.message}
          </p>
        )}

        {/* Code */}
        <div className="mb-5">
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
            Tenant Code
          </label>
          <input
            id="code"
            type="text"
            autoComplete="off"
            placeholder="e.g. springfield-high"
            {...register('code')}
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? 'code-error' : undefined}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-400"
          />
          <p className="mt-1 text-xs text-gray-400">
            Lowercase letters, digits, hyphens — cannot start or end with a hyphen.
          </p>
          {errors.code && (
            <p id="code-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.code.message}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="mb-6">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            School / Organisation Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Springfield High School"
            {...register('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-400"
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create Tenant'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/super-admin/tenants')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
