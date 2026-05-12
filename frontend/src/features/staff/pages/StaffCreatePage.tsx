import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { createStaff } from '../api/staffApi';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  staffType: z.enum([
    'TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'LIBRARIAN',
    'LAB_ASSISTANT', 'HOSTEL_WARDEN', 'TRANSPORT_STAFF', 'ADMIN_STAFF', 'OTHER',
  ], { message: 'Staff type is required' }),
  employeeNumber: z.string().max(50).optional(),
  joiningDate: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email('Invalid email').max(200).optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  photoUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
  qualification: z.string().max(300).optional(),
  specialization: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Field helper ──────────────────────────────────────────────────────────────

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

export function StaffCreatePage() {
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
        employeeNumber: values.employeeNumber || undefined,
        joiningDate: values.joiningDate || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        photoUrl: values.photoUrl || undefined,
        qualification: values.qualification || undefined,
        specialization: values.specialization || undefined,
      };
      return createStaff(schoolId!, body);
    },
    onSuccess: (staff) => {
      navigate(`/school-admin/staff/${staff.id}`);
    },
    onError: () => {
      setError('root', { message: 'Failed to create staff record. Please try again.' });
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
        <h2 className="text-xl font-semibold text-gray-900">Add Staff Member</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Employee number is auto-generated if left blank.
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

        {/* ── Identity ───────────────────────────────────────────────────── */}
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" required error={errors.firstName?.message}>
            <input {...register('firstName')} className={inputCls} placeholder="e.g. Anita" />
          </Field>
          <Field label="Last Name" required error={errors.lastName?.message}>
            <input {...register('lastName')} className={inputCls} placeholder="e.g. Sharma" />
          </Field>
          <Field label="Staff Type" required error={errors.staffType?.message}>
            <select {...register('staffType')} className={inputCls}>
              <option value="">Select type</option>
              <option value="TEACHER">Teacher</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="VICE_PRINCIPAL">Vice Principal</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="LAB_ASSISTANT">Lab Assistant</option>
              <option value="HOSTEL_WARDEN">Hostel Warden</option>
              <option value="TRANSPORT_STAFF">Transport Staff</option>
              <option value="ADMIN_STAFF">Admin Staff</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Employee Number" error={errors.employeeNumber?.message}>
            <input
              {...register('employeeNumber')}
              className={inputCls}
              placeholder="Auto-generated if blank"
            />
          </Field>
          <Field label="Joining Date" error={errors.joiningDate?.message}>
            <input type="date" {...register('joiningDate')} className={inputCls} />
          </Field>
        </div>

        {/* ── Contact ────────────────────────────────────────────────────── */}
        <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Contact
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              {...register('email')}
              className={inputCls}
              placeholder="staff@school.edu"
            />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input type="tel" {...register('phone')} className={inputCls} placeholder="+91 …" />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Address" error={errors.address?.message}>
            <textarea {...register('address')} rows={2} className={inputCls} />
          </Field>
        </div>

        {/* ── Personal ───────────────────────────────────────────────────── */}
        <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
        </div>

        {/* ── Qualifications ─────────────────────────────────────────────── */}
        <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Qualifications
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Qualification" error={errors.qualification?.message}>
            <input
              {...register('qualification')}
              className={inputCls}
              placeholder="e.g. B.Ed, M.Sc"
            />
          </Field>
          <Field label="Specialization" error={errors.specialization?.message}>
            <input
              {...register('specialization')}
              className={inputCls}
              placeholder="e.g. Mathematics"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Photo URL" error={errors.photoUrl?.message}>
            <input
              type="url"
              {...register('photoUrl')}
              className={inputCls}
              placeholder="https://…"
            />
          </Field>
        </div>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Add Staff Member'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/school-admin/staff')}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
