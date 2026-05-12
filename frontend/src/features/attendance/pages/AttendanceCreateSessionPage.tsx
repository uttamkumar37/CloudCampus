import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import { openSession } from '../api/attendanceApi';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional(),
  sessionDate: z.string().min(1, 'Session date is required'),
  periodNumber: z.string(),
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
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AttendanceCreateSessionPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const navigate = useNavigate();

  const todayIso = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sessionDate: todayIso, periodNumber: '0' },
  });

  const selectedYearId = watch('academicYearId');
  const selectedClassId = watch('classId');

  // Load academic years
  const { data: years } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId!),
    enabled: !!schoolId,
  });

  // Load classes when year changes
  const { data: classes } = useQuery({
    queryKey: ['classes', selectedYearId],
    queryFn: () => listClasses(selectedYearId),
    enabled: !!selectedYearId,
  });

  // Reset classId / sectionId when year changes
  useEffect(() => {
    setValue('classId', '');
    setValue('sectionId', '');
  }, [selectedYearId, setValue]);

  // Load sections when class changes
  const { data: sections } = useQuery({
    queryKey: ['sections', selectedClassId],
    queryFn: () => listSections(selectedClassId),
    enabled: !!selectedClassId,
  });

  // Reset sectionId when class changes
  useEffect(() => {
    setValue('sectionId', '');
  }, [selectedClassId, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      openSession(schoolId!, {
        academicYearId: values.academicYearId,
        classId: values.classId,
        sectionId: values.sectionId || undefined,
        sessionDate: values.sessionDate,
        periodNumber: parseInt(values.periodNumber, 10) || 0,
      }),
    onSuccess: (session) => {
      navigate(`/school-admin/attendance/sessions/${session.id}/mark`);
    },
    onError: () => {
      setError('root', {
        message: 'Failed to open session. A session for this class/period/date may already exist.',
      });
    },
  });

  if (!schoolId) {
    return (
      <div className="p-6">
        <p className="text-sm text-amber-600">
          School ID not available. Please log out and log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Open Attendance Session</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Duplicate sessions (same class / period / date) will be rejected.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="max-w-lg rounded-xl border border-gray-200 bg-white p-6"
        noValidate
      >
        {errors.root && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {errors.root.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {/* Academic Year */}
          <Field label="Academic Year" required error={errors.academicYearId?.message}>
            <select {...register('academicYearId')} className={inputCls}>
              <option value="">Select year</option>
              {years?.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name ?? y.id}
                </option>
              ))}
            </select>
          </Field>

          {/* Class */}
          <Field label="Class" required error={errors.classId?.message}>
            <select {...register('classId')} className={inputCls} disabled={!selectedYearId}>
              <option value="">Select class</option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.id}
                </option>
              ))}
            </select>
          </Field>

          {/* Section (optional) */}
          <Field label="Section (optional)" error={errors.sectionId?.message}>
            <select {...register('sectionId')} className={inputCls} disabled={!selectedClassId}>
              <option value="">Whole class (no section)</option>
              {sections?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.id}
                </option>
              ))}
            </select>
          </Field>

          {/* Date */}
          <Field label="Session Date" required error={errors.sessionDate?.message}>
            <input type="date" {...register('sessionDate')} className={inputCls} />
          </Field>

          {/* Period */}
          <Field
            label="Period Number (0 = whole day, 1–12)"
            required
            error={errors.periodNumber?.message}
          >
            <select {...register('periodNumber')} className={inputCls}>
              <option value={0}>0 — Whole Day</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Period {n}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Opening…' : 'Open Session'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/school-admin/attendance')}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
