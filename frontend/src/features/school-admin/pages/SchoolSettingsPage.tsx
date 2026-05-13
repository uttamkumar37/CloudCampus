import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  getSchoolSettings,
  updateSchoolSettings,
  type AcademicCalendarType,
  type GradingScheme,
  type SchoolSettingsRequest,
} from '../api/settingsApi';

// ── Validation ────────────────────────────────────────────────────────────────

const schema = z.object({
  timezone:            z.string().min(1).max(60),
  locale:              z.string().min(1).max(20),
  academicCalendarType: z.enum(['TERM', 'SEMESTER', 'TRIMESTER', 'QUARTER']),
  workingDaysMask:     z.number().int().min(1).max(127),
  gradingScheme:       z.enum(['PERCENTAGE', 'GRADE_LETTER', 'GPA', 'CGPA']),
  minAttendancePct:    z.number().int().min(1).max(100),
  maxClassCapacity:    z.number().int().min(1).max(500),
  allowLateAttendance: z.boolean(),
  lateCutoffMinutes:   z.number().int().min(0).max(120),
  schoolLogoUrl:       z.string().max(500).nullable(),
  primaryColor:        z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex colour e.g. #1A73E8').nullable().or(z.literal('')).transform(v => v || null),
});

type FormValues = z.infer<typeof schema>;

// ── Day picker ────────────────────────────────────────────────────────────────

const DAYS = [
  { label: 'Sun', bit: 1 },
  { label: 'Mon', bit: 2 },
  { label: 'Tue', bit: 4 },
  { label: 'Wed', bit: 8 },
  { label: 'Thu', bit: 16 },
  { label: 'Fri', bit: 32 },
  { label: 'Sat', bit: 64 },
];

function DayPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {DAYS.map((d) => {
        const checked = (value & d.bit) !== 0;
        return (
          <button
            key={d.label}
            type="button"
            onClick={() => onChange(checked ? value & ~d.bit : value | d.bit)}
            className={[
              'w-10 rounded-lg border py-1.5 text-xs font-semibold transition-colors',
              checked
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400',
            ].join(' ')}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SchoolSettingsPage() {
  const schoolId   = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['school-settings', schoolId],
    queryFn:  () => getSchoolSettings(schoolId),
    enabled:  !!schoolId,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      reset({
        timezone:            data.timezone,
        locale:              data.locale,
        academicCalendarType: data.academicCalendarType,
        workingDaysMask:     data.workingDaysMask,
        gradingScheme:       data.gradingScheme,
        minAttendancePct:    data.minAttendancePct,
        maxClassCapacity:    data.maxClassCapacity,
        allowLateAttendance: data.allowLateAttendance,
        lateCutoffMinutes:   data.lateCutoffMinutes,
        schoolLogoUrl:       data.schoolLogoUrl ?? '',
        primaryColor:        data.primaryColor ?? '',
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (body: SchoolSettingsRequest) => updateSchoolSettings(schoolId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['school-settings', schoolId], updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const allowLate   = watch('allowLateAttendance');
  const maskValue   = watch('workingDaysMask') ?? data?.workingDaysMask ?? 62;

  function onSubmit(values: FormValues) {
    mutation.mutate({
      ...values,
      schoolLogoUrl: values.schoolLogoUrl || null,
      primaryColor:  values.primaryColor  || null,
    });
  }

  if (!schoolId) return <div className="p-6 text-sm text-amber-600">School ID not available.</div>;
  if (isLoading)  return <div className="p-6 text-sm text-gray-500">Loading settings…</div>;
  if (isError)    return <div className="p-6 text-sm text-red-600">Failed to load settings.</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">School Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage operational configuration for your school</p>
        </div>
        {data && (
          <p className="text-xs text-gray-400">
            Last updated: {new Date(data.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </div>

      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      {mutation.isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to save settings. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* General */}
        <Section title="General">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Timezone" error={errors.timezone?.message}>
              <input {...register('timezone')}
                placeholder="e.g. Asia/Kolkata"
                className="input" />
            </Field>
            <Field label="Locale" error={errors.locale?.message}>
              <input {...register('locale')}
                placeholder="e.g. en-IN"
                className="input" />
            </Field>
          </div>
        </Section>

        {/* Academic */}
        <Section title="Academic">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Academic Calendar Type" error={errors.academicCalendarType?.message}>
              <select {...register('academicCalendarType')} className="input">
                {(['TERM', 'SEMESTER', 'TRIMESTER', 'QUARTER'] as AcademicCalendarType[]).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Grading Scheme" error={errors.gradingScheme?.message}>
              <select {...register('gradingScheme')} className="input">
                {(['PERCENTAGE', 'GRADE_LETTER', 'GPA', 'CGPA'] as GradingScheme[]).map((v) => (
                  <option key={v} value={v}>{v.replace('_', ' ')}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Working Days" error={errors.workingDaysMask?.message}>
            <DayPicker
              value={maskValue}
              onChange={(v) => setValue('workingDaysMask', v, { shouldValidate: true })}
            />
          </Field>
        </Section>

        {/* Attendance */}
        <Section title="Attendance">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Minimum Attendance %" error={errors.minAttendancePct?.message}>
              <input type="number" min={1} max={100}
                {...register('minAttendancePct', { valueAsNumber: true })}
                className="input" />
            </Field>
            <Field label="Max Class Capacity" error={errors.maxClassCapacity?.message}>
              <input type="number" min={1} max={500}
                {...register('maxClassCapacity', { valueAsNumber: true })}
                className="input" />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="allowLate"
              type="checkbox"
              {...register('allowLateAttendance')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="allowLate" className="text-sm font-medium text-gray-700">
              Allow late attendance marking
            </label>
          </div>

          {allowLate && (
            <Field label="Late cutoff (minutes after class start)" error={errors.lateCutoffMinutes?.message}>
              <input type="number" min={0} max={120}
                {...register('lateCutoffMinutes', { valueAsNumber: true })}
                className="input w-36" />
            </Field>
          )}
        </Section>

        {/* Branding */}
        <Section title="Branding">
          <Field label="School Logo URL (optional)" error={errors.schoolLogoUrl?.message}>
            <input {...register('schoolLogoUrl')}
              placeholder="https://cdn.example.com/logo.png"
              className="input" />
          </Field>
          <Field label="Primary Colour (optional)" error={errors.primaryColor?.message}>
            <div className="flex items-center gap-3">
              <input {...register('primaryColor')}
                placeholder="#1A73E8"
                maxLength={7}
                className="input w-36 font-mono" />
              {watch('primaryColor') && /^#[0-9A-Fa-f]{6}$/.test(watch('primaryColor') ?? '') && (
                <div
                  className="h-8 w-8 rounded-lg border border-gray-200 shadow-sm"
                  style={{ backgroundColor: watch('primaryColor') ?? '' }}
                />
              )}
            </div>
          </Field>
        </Section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {mutation.isPending ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
