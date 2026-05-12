import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getStudent,
  updateStudent,
  graduateStudent,
  transferStudent,
  suspendStudent,
  reinstateStudent,
} from '../api/studentApi';
import type { StudentResponse, StudentStatus } from '../types/student';

// ── Badge ─────────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<StudentStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  GRADUATED: 'bg-blue-100 text-blue-700',
  TRANSFERRED: 'bg-yellow-100 text-yellow-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

// ── Edit form ─────────────────────────────────────────────────────────────────

const editSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  bloodGroup: z.string().max(10).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  photoUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
});

type EditValues = z.infer<typeof editSchema>;

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function EditForm({
  student,
  onCancel,
}: {
  student: StudentResponse;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth ?? '',
      gender: (student.gender as EditValues['gender']) ?? undefined,
      bloodGroup: student.bloodGroup ?? '',
      phone: student.phone ?? '',
      address: student.address ?? '',
      photoUrl: student.photoUrl ?? '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: EditValues) =>
      updateStudent(student.id, {
        ...values,
        dateOfBirth: values.dateOfBirth || undefined,
        bloodGroup: values.bloodGroup || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        photoUrl: values.photoUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', student.id] });
      onCancel();
    },
    onError: () => {
      setError('root', { message: 'Failed to save changes. Please try again.' });
    },
  });

  const busy = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5"
      noValidate
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-800">Edit Profile</h3>

      {errors.root && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            First Name <span className="text-red-500">*</span>
          </label>
          <input {...register('firstName')} className={inputCls} />
          {errors.firstName && (
            <p className="mt-0.5 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input {...register('lastName')} className={inputCls} />
          {errors.lastName && (
            <p className="mt-0.5 text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Date of Birth</label>
          <input type="date" {...register('dateOfBirth')} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Gender</label>
          <select {...register('gender')} className={inputCls}>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Blood Group</label>
          <select {...register('bloodGroup')} className={inputCls}>
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
          <input type="tel" {...register('phone')} className={inputCls} />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-gray-600">Address</label>
        <textarea {...register('address')} rows={2} className={inputCls} />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-gray-600">Photo URL</label>
        <input type="url" {...register('photoUrl')} className={inputCls} placeholder="https://…" />
        {errors.photoUrl && (
          <p className="mt-0.5 text-xs text-red-600">{errors.photoUrl.message}</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save Changes'}
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

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-1">
      <dt className="w-32 shrink-0 text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800">{value ?? '—'}</dd>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['student', id] });
  }

  const graduate = useMutation({ mutationFn: () => graduateStudent(id!), onSuccess: invalidate });
  const transfer = useMutation({ mutationFn: () => transferStudent(id!), onSuccess: invalidate });
  const suspend = useMutation({ mutationFn: () => suspendStudent(id!), onSuccess: invalidate });
  const reinstate = useMutation({ mutationFn: () => reinstateStudent(id!), onSuccess: invalidate });

  const anyPending =
    graduate.isPending || transfer.isPending || suspend.isPending || reinstate.isPending;

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }

  if (isError || !student) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Student not found or failed to load.</p>
        <button
          onClick={() => navigate('/school-admin/students')}
          className="mt-2 text-sm text-blue-600 underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/school-admin/students" className="text-blue-600 hover:underline">
          Students
        </Link>
        <span className="mx-2">/</span>
        <span>{student.firstName} {student.lastName}</span>
      </nav>

      {/* Header card */}
      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={`${student.firstName} ${student.lastName}`}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 shadow">
              {student.firstName[0]}{student.lastName[0]}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </h2>
            <p className="font-mono text-sm text-gray-500">{student.studentNumber}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[student.status]}`}
            >
              {student.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          )}
          {student.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => graduate.mutate()}
                disabled={anyPending}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Graduate
              </button>
              <button
                onClick={() => transfer.mutate()}
                disabled={anyPending}
                className="rounded-lg border border-yellow-200 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
              >
                Transfer
              </button>
              <button
                onClick={() => {
                  if (confirm('Suspend this student?')) suspend.mutate();
                }}
                disabled={anyPending}
                className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50"
              >
                Suspend
              </button>
            </>
          )}
          {student.status === 'SUSPENDED' && (
            <button
              onClick={() => reinstate.mutate()}
              disabled={anyPending}
              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              Reinstate
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <EditForm student={student} onCancel={() => setEditing(false)} />
      )}

      {/* Profile info */}
      {!editing && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Profile Details
          </h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow label="Admission Date" value={student.admissionDate} />
            <InfoRow label="Date of Birth" value={student.dateOfBirth} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Blood Group" value={student.bloodGroup} />
            <InfoRow label="Phone" value={student.phone} />
            <InfoRow label="Address" value={student.address} />
          </dl>
        </div>
      )}
    </div>
  );
}
