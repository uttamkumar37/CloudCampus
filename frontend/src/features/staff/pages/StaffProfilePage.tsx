import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getStaff,
  updateStaff,
  markOnLeave,
  returnFromLeave,
  resignStaff,
  terminateStaff,
} from '../api/staffApi';
import { getStaffProfile360 } from '../api/staffProfile360Api';
import { listDepartments } from '@/features/school-admin/api/departmentApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { StaffStatus, StaffType, UpdateStaffRequest } from '../types/staff';
import type {
  StaffInsight,
  StaffProfile360Response,
  StaffProfileSectionResponse,
  StaffRisk,
  StaffTimelineItemResponse,
} from '../api/staffProfile360Api';

const STATUS_BADGE: Record<StaffStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  ON_LEAVE: 'bg-amber-100 text-amber-700 ring-amber-200',
  RESIGNED: 'bg-slate-100 text-slate-600 ring-slate-200',
  TERMINATED: 'bg-rose-100 text-rose-700 ring-rose-200',
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

const SECTION_ORDER = [
  'overview',
  'personal',
  'employment',
  'qualification',
  'performance',
  'attendance',
  'skills',
  'payroll',
  'documents',
  'communication',
  'health',
  'ai',
];

const SEVERITY_TONE: Record<string, string> = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-800',
  HIGH: 'border-rose-200 bg-rose-50 text-rose-800',
  INFO: 'border-sky-200 bg-sky-50 text-sky-800',
};

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
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500';

function fmt(iso: string | null | undefined) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function pretty(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.map((v) => pretty(v)).join(', ') : '-';
  if (typeof value === 'object') return '-';
  return String(value).replaceAll('_', ' ');
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function mapArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((v): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)) : [];
}

function findSection(profile: StaffProfile360Response | undefined, key: string) {
  return profile?.sections.find((section) => section.key === key);
}

function Chip({ children, tone = 'slate' }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    green: 'bg-green-50 text-green-700 ring-green-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${tones[tone] ?? tones.slate}`}>
      {children}
    </span>
  );
}

function ProgressRing({ value, size = 'lg' }: { value: number; size?: 'sm' | 'lg' }) {
  const bounded = Math.max(0, Math.min(100, value));
  const dims = size === 'sm' ? 'h-14 w-14 text-sm' : 'h-24 w-24 text-xl';
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full ${dims} font-bold text-slate-900`}
      style={{
        background: `conic-gradient(#0891b2 ${bounded * 3.6}deg, #e2e8f0 0deg)`,
      }}
      aria-label={`Completion ${bounded}%`}
    >
      <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-white">
        {bounded}%
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

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
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-0.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

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
    queryFn: () => listDepartments(schoolId),
    enabled: !!schoolId,
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
      queryClient.invalidateQueries({ queryKey: ['staff-profile-360', id] });
      onCancel();
    },
    onError: () => {
      setError('root', { message: 'Failed to save changes. Please try again.' });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v))}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      noValidate
    >
      {errors.root && (
        <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {errors.root.message}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function StaffHeader({
  staff,
  profile,
  onEdit,
  onBack,
  actions,
}: {
  staff: Awaited<ReturnType<typeof getStaff>>;
  profile?: StaffProfile360Response;
  onEdit: () => void;
  onBack: () => void;
  actions: React.ReactNode;
}) {
  const header = profile?.header ?? {};
  const badges = mapArray(header.badges);
  const fullName = stringValue(header.fullName) ?? `${staff.firstName} ${staff.lastName}`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {staff.photoUrl ? (
            <img
              src={staff.photoUrl}
              alt={fullName}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-cyan-50"
            />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-cyan-100 text-2xl font-bold text-cyan-800 ring-4 ring-cyan-50">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold text-slate-950">{fullName}</h1>
              <Chip tone="blue">{TYPE_LABEL[staff.staffType]}</Chip>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_BADGE[staff.status]}`}>
                {pretty(staff.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {pretty(header.employeeId ?? staff.employeeNumber)} | {pretty(header.department)} | {pretty(header.campus)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Chip key={`${pretty(badge.label)}-${index}`} tone={stringValue(badge.tone)}>
                  {pretty(badge.label)}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            onClick={onEdit}
            className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            Edit Profile
          </button>
          {actions}
          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="AI Score" value={numberValue(header.aiPerformanceScore)} sub="performance index" />
        <StatCard label="Experience" value={pretty(header.experience)} sub={fmt(staff.joiningDate)} />
        <StatCard label="Attendance" value={pretty(header.attendanceStreak)} sub="workforce consistency" />
        <StatCard label="Payroll" value={pretty(header.payrollStatus)} sub="restricted summary" />
        <StatCard label="Last Active" value={fmt(stringValue(header.lastActive) ?? staff.updatedAt)} sub="profile update" />
      </div>
    </section>
  );
}

function SidebarTabs({
  sections,
  active,
  onChange,
  role,
}: {
  sections: StaffProfileSectionResponse[];
  active: string;
  onChange: (key: string) => void;
  role: string;
}) {
  const visible = SECTION_ORDER
    .map((key) => key === 'overview' ? undefined : sections.find((section) => section.key === key))
    .filter((section): section is StaffProfileSectionResponse => !!section);

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-4">
      <button
        onClick={() => onChange('overview')}
        className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold ${active === 'overview' ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700 hover:bg-slate-50'}`}
      >
        Overview
        <span className="text-xs text-slate-400">{role}</span>
      </button>
      {visible.map((section) => (
        <button
          key={section.key}
          onClick={() => onChange(section.key)}
          className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${active === section.key ? 'bg-cyan-50 font-semibold text-cyan-800' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          <span className="truncate">{section.title}</span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{section.completionPercent}%</span>
        </button>
      ))}
    </aside>
  );
}

function CompletionPanel({ profile }: { profile: StaffProfile360Response }) {
  const missing = Array.isArray(profile.completion.missingFields) ? profile.completion.missingFields.map(String) : [];
  const suggestions = Array.isArray(profile.completion.suggestedActions) ? profile.completion.suggestedActions.map(String) : [];
  const warnings = Array.isArray(profile.completion.hrWarnings) ? profile.completion.hrWarnings.map(String) : [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <ProgressRing value={profile.profileCompletionPercent} />
        <div>
          <h2 className="text-lg font-bold text-slate-950">Profile Completion</h2>
          <p className="mt-1 text-sm text-slate-600">{warnings.length ? warnings[0] : 'Core workforce profile is ready for review.'}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <ListBlock title="Missing Fields" items={missing} empty="No missing fields detected." />
        <ListBlock title="Suggested Actions" items={suggestions} empty="No suggested actions." />
        <ListBlock title="HR Warnings" items={warnings} empty="No HR warnings." />
      </div>
    </div>
  );
}

function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 6).map((item) => (
            <li key={item} className="text-sm text-slate-700">{pretty(item)}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </div>
  );
}

function InsightCards({ insights }: { insights: StaffInsight[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => (
        <div key={`${insight.category}-${insight.title}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-950">{insight.title}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERITY_TONE[insight.severity] ?? SEVERITY_TONE.INFO}`}>
              {pretty(insight.severity)}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{insight.summary}</p>
          <p className="mt-3 text-sm font-medium text-slate-800">{insight.recommendation}</p>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${Math.max(0, Math.min(100, insight.confidence))}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{insight.confidence}% confidence</p>
        </div>
      ))}
    </div>
  );
}

function RiskMatrix({ risks }: { risks: StaffRisk[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {risks.map((risk) => (
        <div key={risk.label} className={`rounded-lg border p-4 ${SEVERITY_TONE[risk.severity] ?? SEVERITY_TONE.INFO}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{risk.label}</h3>
            <span className="text-xs font-bold">{pretty(risk.severity)}</span>
          </div>
          <p className="mt-3 text-sm">{risk.explanation}</p>
          <p className="mt-3 text-sm font-semibold">{risk.suggestedHrAction}</p>
        </div>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: StaffTimelineItemResponse[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950">Activity Timeline</h2>
        <Chip>Latest {items.length}</Chip>
      </div>
      {items.length ? (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex gap-3">
              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-cyan-600 ring-4 ring-cyan-100" />
              <div className="min-w-0 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <Chip tone="blue">{item.type}</Chip>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                <p className="mt-1 text-xs text-slate-500">{fmt(item.occurredAt)} | {item.visibility}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No activity has been captured yet.</p>
      )}
    </div>
  );
}

function AnalyticsPanel({ profile }: { profile: StaffProfile360Response }) {
  const chartData = mapArray(profile.performanceAnalytics.monthlyProductivity).map((row) => ({
    label: pretty(row.label),
    value: numberValue(row.value),
  }));
  const colors = ['#0891b2', '#0f766e', '#7c3aed', '#ea580c'];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Performance Analytics</h2>
      <div className="mt-4 h-72">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((row, index) => (
                  <Cell key={row.label} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-lg bg-slate-50 text-sm text-slate-500">
            No performance data available.
          </div>
        )}
      </div>
    </div>
  );
}

function SectionDetail({ section }: { section: StaffProfileSectionResponse }) {
  const rows = Object.entries(section.data);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{section.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Chip tone={section.editable ? 'emerald' : 'slate'}>{section.editable ? 'Editable' : 'Read only'}</Chip>
          <ProgressRing value={section.completionPercent} size="sm" />
        </div>
      </div>
      <dl className="mt-5 grid gap-3 md:grid-cols-2">
        {rows.map(([key, value]) => (
          <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{pretty(key)}</dt>
            <dd className="mt-2 break-words text-sm font-medium text-slate-900">
              {Array.isArray(value) && value.length && typeof value[0] === 'object'
                ? `${value.length} record(s)`
                : pretty(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 p-6" role="status">
      <div className="h-36 animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <div className="h-80 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-80 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? '';

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ['staff-member', id],
    queryFn: () => getStaff(id!),
    enabled: !!id,
  });

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ['staff-profile-360', id],
    queryFn: () => getStaffProfile360(id!),
    enabled: !!id,
  });

  const defaultEditValues: EditValues | null = useMemo(() => {
    if (!staff) return null;
    return {
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
  }, [staff]);

  const statusMutation = useMutation({
    mutationFn: ({ fn }: { fn: (id: string) => Promise<unknown> }) => fn(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-member', id] });
      queryClient.invalidateQueries({ queryKey: ['staff-profile-360', id] });
    },
  });

  function confirmStatus(fn: (id: string) => Promise<unknown>, message: string) {
    if (!window.confirm(message)) return;
    statusMutation.mutate({ fn });
  }

  if (isLoading || isProfileLoading) return <Skeleton />;

  if (isError || !staff) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          Failed to load staff profile.
        </div>
      </div>
    );
  }

  const canGoOnLeave = staff.status === 'ACTIVE';
  const canReturn = staff.status === 'ON_LEAVE';
  const canResign = staff.status === 'ACTIVE';
  const canTerminate = staff.status === 'ACTIVE' || staff.status === 'ON_LEAVE';
  const selectedSection = activeSection === 'overview' ? undefined : findSection(profile, activeSection);

  return (
    <div className="min-h-full bg-slate-50 p-4 text-slate-900 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <StaffHeader
          staff={staff}
          profile={profile}
          onEdit={() => setEditing((v) => !v)}
          onBack={() => navigate('/school-admin/staff')}
          actions={(
            <>
              {canGoOnLeave && (
                <button
                  onClick={() => confirmStatus(markOnLeave, `Mark ${staff.firstName} ${staff.lastName} as On Leave?`)}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                >
                  Mark Leave
                </button>
              )}
              {canReturn && (
                <button
                  onClick={() => confirmStatus(returnFromLeave, `Return ${staff.firstName} ${staff.lastName} from Leave?`)}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  Return
                </button>
              )}
              {canResign && (
                <button
                  onClick={() => confirmStatus(resignStaff, `Mark ${staff.firstName} ${staff.lastName} as Resigned?`)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Resign
                </button>
              )}
              {canTerminate && (
                <button
                  onClick={() => confirmStatus(terminateStaff, `Terminate ${staff.firstName} ${staff.lastName}? This cannot be undone.`)}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Terminate
                </button>
              )}
            </>
          )}
        />

        {editing && defaultEditValues && (
          <EditForm
            id={staff.id}
            schoolId={schoolId}
            defaultValues={defaultEditValues}
            onCancel={() => setEditing(false)}
          />
        )}

        {isProfileError || !profile ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="alert">
            The 360 workforce profile could not be loaded. Existing staff actions remain available.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
            <SidebarTabs
              sections={profile.sections}
              active={activeSection}
              onChange={setActiveSection}
              role={user?.role ?? 'SCHOOL_ADMIN'}
            />
            <main className="min-w-0 space-y-5">
              {activeSection === 'overview' ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Assignments" value={numberValue(profile.quickStats.assignments)} sub="created by staff account" />
                    <StatCard label="Homework" value={numberValue(profile.quickStats.homework)} sub="assigned work" />
                    <StatCard label="Leave Requests" value={numberValue(profile.quickStats.leaveRequests)} sub="HR activity" />
                    <StatCard label="Workload" value={`${numberValue(profile.quickStats.workloadScore)}%`} sub="AI workload index" />
                  </div>
                  <CompletionPanel profile={profile} />
                  <InsightCards insights={profile.aiInsights} />
                  <AnalyticsPanel profile={profile} />
                  <RiskMatrix risks={profile.riskProfile} />
                  <Timeline items={profile.timeline} />
                </>
              ) : selectedSection ? (
                <SectionDetail section={selectedSection} />
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                  Section is not available for this staff profile.
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
