import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { admitStudent } from '../api/studentApi';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  admissionDate: z.string().optional(),
  studentNumber: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  bloodGroup: z.string().max(10).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  photoUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// ── Field helpers ─────────────────────────────────────────────────────────────

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
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentAdmitPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        ...values,
        // Strip empty optional strings → undefined
        admissionDate: values.admissionDate || undefined,
        studentNumber: values.studentNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        bloodGroup: values.bloodGroup || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        photoUrl: values.photoUrl || undefined,
      };
      return admitStudent(schoolId!, body);
    },
    onSuccess: (student) => {
      navigate(`/school-admin/students/${student.id}`);
    },
    onError: () => {
      setError('root', { message: 'Failed to admit student. Please try again.' });
    },
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

  const busy = isSubmitting || isPending;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admit Student</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Fill in the required fields. Student number is auto-generated if left blank.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6"
        noValidate
      >
        {errors.root && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {errors.root.message}
          </div>
        )}

        {/* ── Basic identity ─────────────────────────────────────────────── */}
        <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" required error={errors.firstName?.message}>
            <input {...register('firstName')} className={inputCls} placeholder="e.g. Priya" />
          </Field>
          <Field label="Last Name" required error={errors.lastName?.message}>
            <input {...register('lastName')} className={inputCls} placeholder="e.g. Sharma" />
          </Field>
          <Field label="Admission Date" error={errors.admissionDate?.message}>
            <input type="date" {...register('admissionDate')} className={inputCls} />
          </Field>
          <Field
            label="Student Number"
            error={errors.studentNumber?.message}
          >
            <input
              {...register('studentNumber')}
              className={inputCls}
              placeholder="Auto-generated if blank"
            />
          </Field>
        </div>

        {/* ── Personal details ───────────────────────────────────────────── */}
        <h3 className="mb-3 mt-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
            <input type="date" {...register('dateOfBirth')} className={inputCls} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <select {...register('gender')} className={inputCls}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </Field>
          <Field label="Blood Group" error={errors.bloodGroup?.message}>
            <select {...register('bloodGroup')} className={inputCls}>
              <option value="">Select blood group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input
              type="tel"
              {...register('phone')}
              className={inputCls}
              placeholder="+91 9876543210"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Address" error={errors.address?.message}>
            <textarea
              {...register('address')}
              rows={2}
              className={inputCls}
              placeholder="Residential address"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Photo URL" error={errors.photoUrl?.message}>
            <input
              {...register('photoUrl')}
              className={inputCls}
              placeholder="https://…"
              type="url"
            />
          </Field>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Admit Student'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/school-admin/students')}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
