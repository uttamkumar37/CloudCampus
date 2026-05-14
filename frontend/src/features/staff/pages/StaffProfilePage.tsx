import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getStaff,
  updateStaff,
  markOnLeave,
  returnFromLeave,
  resignStaff,
  terminateStaff,
} from '../api/staffApi';
import { listDepartments } from '@/features/school-admin/api/departmentApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { StaffStatus, StaffType, UpdateStaffRequest } from '../types/staff';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<StaffStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  RESIGNED: 'bg-gray-100 text-gray-500',
  TERMINATED: 'bg-red-100 text-red-600',
};

const TYPE_LABEL: Record<StaffType, string> = {
  TEACHER: 'Teacher',
  PRINCIPAL: 'Principal',
  VICE_PRINCIPAL: 'Vice Principal',
  ACCOUNTANT: 'Accountant',
  LIBRARIAN: 'Librarian',
  LAB_ASSISTANT: 'Lab Assistant',
  HOSTEL_WARDEN: 'Hostel Warden',
  TRANSPORT_STAFF: 'Transport Staff',
  ADMIN_STAFF: 'Admin Staff',
  OTHER: 'Other',
};

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Edit form schema ──────────────────────────────────────────────────────────

const editSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  departmentId: z.string().optional(),
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

type EditValues = z.infer<typeof editSchema>;

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

// ── Inline info row ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value || '—'}</dd>
    </div>
  );
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({
  id,
  schoolId,
  defaultValues,
  onCancel,
}: {
  id: string;
  schoolId: string;
  defaultValues: EditValues;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', schoolId],
    queryFn:  () => listDepartments(schoolId),
    enabled:  !!schoolId,
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditValues>({ resolver: zodResolver(editSchema), defaultValues });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: EditValues) => {
      const body: UpdateStaffRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        departmentId: values.departmentId || undefined,
        joiningDate: values.joiningDate || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        photoUrl: values.photoUrl || undefined,
        qualification: values.qualification || undefined,
        specialization: values.specialization || undefined,
      };
      return updateStaff(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-member', id] });
      onCancel();
    },
    onError: () => {
      setError('root', { message: 'Failed to save changes. Please try again.' });
    },
  });

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

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="mt-4 rounded-xl border border-gray-200 bg-white p-6"
      noValidate
    >
      {errors.root && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {errors.root.message}
        </div>
      )}

      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Edit Profile
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First Name" required error={errors.firstName?.message}>
          <input {...register('firstName')} className={inputCls} />
        </Field>
        <Field label="Last Name" required error={errors.lastName?.message}>
          <input {...register('lastName')} className={inputCls} />
        </Field>
        <Field label="Department">
          <select {...register('departmentId')} className={inputCls}>
            <option value="">No department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}{d.code ? ` (${d.code})` : ''}</option>
            ))}
          </select>
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} className={inputCls} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input type="tel" {...register('phone')} className={inputCls} />
        </Field>
        <Field label="Joining Date" error={errors.joiningDate?.message}>
          <input type="date" {...register('joiningDate')} className={inputCls} />
        </Field>
        <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
          <input type="date" {...register('dateOfBirth')} className={inputCls} />
        </Field>
        <Field label="Gender" error={errors.gender?.message}>
          <select {...register('gender')} className={inputCls}>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </Field>
        <Field label="Qualification" error={errors.qualification?.message}>
          <input {...register('qualification')} className={inputCls} />
        </Field>
        <Field label="Specialization" error={errors.specialization?.message}>
          <input {...register('specialization')} className={inputCls} />
        </Field>
        <Field label="Photo URL" error={errors.photoUrl?.message}>
          <input type="url" {...register('photoUrl')} className={inputCls} />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Address" error={errors.address?.message}>
          <textarea {...register('address')} rows={2} className={inputCls} />
        </Field>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ['staff-member', id],
    queryFn: () => getStaff(id!),
    enabled: !!id,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', schoolId],
    queryFn:  () => listDepartments(schoolId),
    enabled:  !!schoolId,
  });
  const deptName = (deptId: string | null) =>
    departments.find((d) => d.id === deptId)?.name ?? deptId;

  function makeStatusMutation(
    fn: (id: string) => Promise<unknown>,
    confirmMsg: string,
  ) {
    return () => {
      if (!window.confirm(confirmMsg)) return;
      fn(id!).then(() => queryClient.invalidateQueries({ queryKey: ['staff-member', id] }));
    };
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500" role="status">Loading…</div>;
  }
  if (isError || !staff) {
    return (
      <div className="p-6 text-sm text-red-600" role="alert">
        Failed to load staff profile.
      </div>
    );
  }

  const canGoOnLeave = staff.status === 'ACTIVE';
  const canReturn = staff.status === 'ON_LEAVE';
  const canResign = staff.status === 'ACTIVE';
  const canTerminate = staff.status === 'ACTIVE' || staff.status === 'ON_LEAVE';

  const defaultEditValues: EditValues = {
    firstName: staff.firstName,
    lastName: staff.lastName,
    departmentId: staff.departmentId ?? '',
    joiningDate: staff.joiningDate ?? '',
    dateOfBirth: staff.dateOfBirth ?? '',
    gender: (staff.gender as EditValues['gender']) ?? undefined,
    phone: staff.phone ?? '',
    email: staff.email ?? '',
    address: staff.address ?? '',
    photoUrl: staff.photoUrl ?? '',
    qualification: staff.qualification ?? '',
    specialization: staff.specialization ?? '',
  };

  return (
    <div className="p-6">
      {/* ── Header card ──────────────────────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start gap-5">
          {/* Avatar */}
          {staff.photoUrl ? (
            <img
              src={staff.photoUrl}
              alt={`${staff.firstName} ${staff.lastName}`}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
          )}

          {/* Identity */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {staff.firstName} {staff.lastName}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {TYPE_LABEL[staff.staffType]} · {staff.employeeNumber}
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[staff.status]}`}
            >
              {staff.status.replace('_', ' ')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              {editing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {canGoOnLeave && (
              <button
                onClick={makeStatusMutation(
                  markOnLeave,
                  `Mark ${staff.firstName} ${staff.lastName} as On Leave?`,
                )}
                className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-700 hover:bg-yellow-100"
              >
                Mark On Leave
              </button>
            )}
            {canReturn && (
              <button
                onClick={makeStatusMutation(
                  returnFromLeave,
                  `Return ${staff.firstName} ${staff.lastName} from Leave?`,
                )}
                className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm text-green-700 hover:bg-green-100"
              >
                Return from Leave
              </button>
            )}
            {canResign && (
              <button
                onClick={makeStatusMutation(
                  resignStaff,
                  `Mark ${staff.firstName} ${staff.lastName} as Resigned?`,
                )}
                className="rounded-lg border border-gray-400 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                Resign
              </button>
            )}
            {canTerminate && (
              <button
                onClick={makeStatusMutation(
                  terminateStaff,
                  `Terminate ${staff.firstName} ${staff.lastName}? This cannot be undone.`,
                )}
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
              >
                Terminate
              </button>
            )}
            <button
              onClick={() => navigate('/school-admin/staff')}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* ── Inline edit form ─────────────────────────────────────────── */}
      {editing && (
        <EditForm
          id={staff.id}
          schoolId={schoolId}
          defaultValues={defaultEditValues}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* ── Profile details ──────────────────────────────────────────── */}
      {!editing && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Contact */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Contact Information
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              <InfoRow label="Email" value={staff.email} />
              <InfoRow label="Phone" value={staff.phone} />
              <InfoRow label="Address" value={staff.address} />
            </dl>
          </div>

          {/* Personal */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Personal Details
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              <InfoRow label="Date of Birth" value={fmt(staff.dateOfBirth)} />
              <InfoRow
                label="Gender"
                value={
                  staff.gender
                    ? staff.gender.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
                    : null
                }
              />
              <InfoRow label="Joining Date" value={fmt(staff.joiningDate)} />
            </dl>
          </div>

          {/* Qualifications */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Qualifications
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              <InfoRow label="Qualification" value={staff.qualification} />
              <InfoRow label="Specialization" value={staff.specialization} />
            </dl>
          </div>

          {/* System */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              System
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              <InfoRow label="Staff ID" value={<span className="font-mono text-xs">{staff.id}</span>} />
              <InfoRow label="Department" value={staff.departmentId ? deptName(staff.departmentId) : null} />
              <InfoRow label="Created" value={fmt(staff.createdAt)} />
              <InfoRow label="Last Updated" value={fmt(staff.updatedAt)} />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
