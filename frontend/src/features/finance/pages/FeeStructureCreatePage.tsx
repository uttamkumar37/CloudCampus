import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listCategories, createStructure } from '../api/financeApi';
import type { CreateFeeStructureRequest } from '../types/finance';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  classId: z.string().optional(),
  feeCategoryId: z.string().min(1, 'Fee category is required'),
  amount: z.string().min(1, 'Amount is required'),
  dueDate: z.string().optional(),
  frequency: z.enum(['ANNUAL', 'TERM', 'MONTHLY', 'ONE_TIME'], { message: 'Select a frequency' }),
});

type FormValues = z.infer<typeof schema>;

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function FeeStructureCreatePage() {
  const navigate = useNavigate();
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { frequency: 'ANNUAL' },
  });

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => listClasses(schoolId),
    enabled: !!schoolId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['fee-categories', schoolId],
    queryFn: () => listCategories(schoolId, true),
    enabled: !!schoolId,
  });

  const mutation = useMutation({
    mutationFn: (body: CreateFeeStructureRequest) => createStructure(schoolId, body),
    onSuccess: () => navigate('/school-admin/fees'),
    onError: (err: Error) => {
      setError('root', { message: err.message || 'Failed to create fee structure' });
    },
  });

  function onSubmit(values: FormValues) {
    const amount = parseFloat(values.amount);
    if (isNaN(amount) || amount < 0) {
      setError('amount', { message: 'Enter a valid amount' });
      return;
    }
    const body: CreateFeeStructureRequest = {
      academicYearId: values.academicYearId,
      classId: values.classId || undefined,
      feeCategoryId: values.feeCategoryId,
      amount,
      dueDate: values.dueDate || undefined,
      frequency: values.frequency,
    };
    mutation.mutate(body);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Fee Structure</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define the amount charged for a fee category in an academic year.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-gray-200 bg-white p-6 space-y-5"
      >
        {errors.root && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <Field label="Academic Year" required error={errors.academicYearId?.message}>
          <select {...register('academicYearId')} className={inputCls}>
            <option value="">Select academic year…</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Class" error={errors.classId?.message}>
          <select {...register('classId')} className={inputCls}>
            <option value="">All Classes (school-wide)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fee Category" required error={errors.feeCategoryId?.message}>
          <select {...register('feeCategoryId')} className={inputCls}>
            <option value="">Select category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">
              No active categories. Add one on the Fee Structures page first.
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Amount (₹)" required error={errors.amount?.message}>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount')}
              placeholder="e.g. 12000"
              className={inputCls}
            />
          </Field>

          <Field label="Frequency" required error={errors.frequency?.message}>
            <select {...register('frequency')} className={inputCls}>
              <option value="ANNUAL">Annual</option>
              <option value="TERM">Per Term</option>
              <option value="MONTHLY">Monthly</option>
              <option value="ONE_TIME">One-time</option>
            </select>
          </Field>
        </div>

        <Field label="Due Date" error={errors.dueDate?.message}>
          <input type="date" {...register('dueDate')} className={inputCls} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving…' : 'Save Structure'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/school-admin/fees')}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
