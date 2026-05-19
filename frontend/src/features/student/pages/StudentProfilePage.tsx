import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getStudent,
  updateStudent,
  graduateStudent,
  transferStudent,
  suspendStudent,
  reinstateStudent,
  listParentLinks,
  addParentLink,
  removeParentLink,
  type Relationship,
  type ParentLinkResponse,
} from '../api/studentApi';
import {
  getStudentProfile360,
  updateStudentProfile360Section,
  type ProfileSectionResponse,
  type StudentProfile360Response,
  type TimelineItemResponse,
} from '../api/studentProfile360Api';
import {
  listStudentDocuments,
  uploadStudentDocument,
  getPresignedUrl,
  deleteStudentDocument,
  type StudentDocumentResponse,
} from '../api/studentDocumentApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { StudentResponse } from '../types/student';

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

// ── Parent links section ──────────────────────────────────────────────────────

const RELATIONSHIPS: Relationship[] = ['FATHER', 'MOTHER', 'GUARDIAN'];

function ParentLinksSection({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [parentUserId, setParentUserId] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('GUARDIAN');
  const [makePrimary, setMakePrimary] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['parent-links', studentId],
    queryFn:  () => listParentLinks(studentId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['parent-links', studentId] });

  const addMutation = useMutation({
    mutationFn: () => addParentLink(studentId, { parentUserId, relationship, makePrimary }),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setParentUserId('');
      setRelationship('GUARDIAN');
      setMakePrimary(false);
      setFormError('');
    },
    onError: (e: { response?: { data?: { error?: string } } }) => {
      setFormError(e?.response?.data?.error ?? 'Failed to add parent link.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (linkId: string) => removeParentLink(linkId),
    onSuccess: invalidate,
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!parentUserId.trim()) { setFormError('Parent User ID is required.'); return; }
    setFormError('');
    addMutation.mutate();
  }

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Parent / Guardian Links
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            + Add Parent
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
          {formError && (
            <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{formError}</p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Parent User ID <span className="text-red-500">*</span>
              </label>
              <input
                value={parentUserId}
                onChange={(e) => setParentUserId(e.target.value)}
                placeholder="UUID of parent user"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={makePrimary}
                  onChange={(e) => setMakePrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                Set as primary
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding…' : 'Add Link'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(''); }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      {!isLoading && links.length === 0 && (
        <p className="text-sm text-gray-400">No parents linked. Use the button above to add one.</p>
      )}

      {links.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-2.5 text-left">Parent User ID</th>
                <th className="px-4 py-2.5 text-left">Relationship</th>
                <th className="px-4 py-2.5 text-left">Primary</th>
                <th className="px-4 py-2.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {links.map((link: ParentLinkResponse) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {link.parentUserId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {link.relationship.charAt(0) + link.relationship.slice(1).toLowerCase()}
                  </td>
                  <td className="px-4 py-3">
                    {link.isPrimary && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm('Remove this parent link?')) removeMutation.mutate(link.id);
                      }}
                      disabled={removeMutation.isPending}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
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

// ── Document types ────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  'BIRTH_CERTIFICATE',
  'TRANSFER_CERTIFICATE',
  'AADHAAR_CARD',
  'CASTE_CERTIFICATE',
  'INCOME_CERTIFICATE',
  'MEDICAL_CERTIFICATE',
  'PASSPORT',
  'PHOTOGRAPH',
  'OTHER',
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Student 360 dashboard helpers ───────────────────────────────────────────

const PROFILE_TABS = [
  ['overview', 'Overview'],
  ['personal', 'Personal Details'],
  ['identity', 'Identity'],
  ['contact', 'Contact & Address'],
  ['guardians', 'Parents/Guardians'],
  ['academics', 'Academic Records'],
  ['attendance', 'Attendance Analytics'],
  ['health', 'Health & Medical'],
  ['behavior', 'Behavior & Counseling'],
  ['interests', 'Interests'],
  ['skills', 'Skills & Career'],
  ['finance', 'Fees & Finance'],
  ['transport', 'Transport & Hostel'],
  ['documents', 'Documents Vault'],
  ['achievements', 'Achievements'],
  ['communication', 'Communication'],
  ['ai', 'AI Insights'],
] as const;

const SIMPLE_EDIT_SECTIONS = new Set(['personal', 'identity', 'contact', 'interests', 'skills', 'transport', 'ai']);

const ADD_RECORD_FIELDS: Record<string, { name: string; label: string; type?: 'date' | 'textarea' }[]> = {
  health: [
    { name: 'conditionName', label: 'Condition / Allergy' },
    { name: 'severity', label: 'Severity' },
    { name: 'medication', label: 'Medication', type: 'textarea' },
    { name: 'doctorContact', label: 'Doctor Contact' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  behavior: [
    { name: 'category', label: 'Category' },
    { name: 'severity', label: 'Severity' },
    { name: 'summary', label: 'Summary', type: 'textarea' },
    { name: 'actionTaken', label: 'Action Taken', type: 'textarea' },
    { name: 'counselorNotes', label: 'Counselor Notes', type: 'textarea' },
  ],
  achievements: [
    { name: 'title', label: 'Title' },
    { name: 'category', label: 'Category' },
    { name: 'awardedOn', label: 'Awarded On', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'evidenceUrl', label: 'Evidence URL' },
  ],
  communication: [
    { name: 'channel', label: 'Channel' },
    { name: 'direction', label: 'Direction' },
    { name: 'subject', label: 'Subject' },
    { name: 'summary', label: 'Summary', type: 'textarea' },
  ],
};

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function sectionByKey(profile: StudentProfile360Response | undefined, key: string) {
  return profile?.sections.find((section) => section.key === key);
}

function quickStat(profile: StudentProfile360Response | undefined, key: string) {
  return displayValue(profile?.quickStats?.[key]);
}

function StatCard({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'green' | 'amber' | 'rose' }) {
  const tones = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    green: 'border-green-100 bg-green-50 text-green-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return fallback;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? 'S'}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

function severityClass(severity: unknown) {
  const value = asString(severity, 'INFO').toUpperCase();
  if (value === 'HIGH') return 'border-red-200 bg-red-50 text-red-700';
  if (value === 'MEDIUM' || value === 'WATCH') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (value === 'LOW' || value === 'NORMAL') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function BadgePill({ label, tone }: { label: string; tone?: string }) {
  const tones: Record<string, string> = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
  };
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone ?? 'slate'] ?? tones.slate}`}>
      {label}
    </span>
  );
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{ background: `conic-gradient(#2563eb ${clamped * 3.6}deg, #e5e7eb 0deg)` }}
        aria-label={`${label}: ${clamped}%`}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-lg font-bold text-gray-900">
          {clamped}%
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">Weighted readiness profile</p>
      </div>
    </div>
  );
}

function StudentIntelligenceHeader({
  student,
  profile,
  onEdit,
  actions,
}: {
  student: StudentResponse;
  profile?: StudentProfile360Response;
  onEdit: () => void;
  actions: React.ReactNode;
}) {
  const header = asRecord(profile?.header);
  const fullName = asString(header.fullName, `${student.firstName} ${student.lastName}`);
  const badges = asArray(header.badges).map(asRecord);
  const photoUrl = asString(header.photoUrl, student.photoUrl ?? '');

  return (
    <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white/15 text-3xl font-bold ring-4 ring-white/20">
                {initialsFromName(fullName)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold text-white">{fullName}</h2>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                  {asString(header.status, student.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-blue-100">
                Preferred: {asString(header.preferredName, student.firstName)} · Admission {asString(header.admissionNumber, student.studentNumber)}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {asString(header.className)} {asString(header.sectionName) !== '—' ? `· Section ${asString(header.sectionName)}` : ''}
                {' '}· {asString(header.academicYear)} · {asString(header.campus)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <BadgePill key={index} label={asString(badge.label)} tone={asString(badge.tone, 'slate')} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {([
              ['Blood', header.bloodGroup],
              ['Transport', header.transportStatus],
              ['Hostel', header.hostelStatus],
              ['Scholarship', header.scholarshipStatus],
              ['Streak', header.attendanceStreak],
              ['Last Active', header.lastActive ? new Date(asString(header.lastActive)).toLocaleDateString('en-IN') : '—'],
              ['AI Risk', `${asNumber(header.aiRiskScore)} / 100`],
              ['Roll No.', header.rollNumber],
            ] as Array<[string, unknown]>).map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-[11px] font-semibold uppercase text-slate-300">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-white">{asString(value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <ProgressRing value={profile?.profileCompletionPercent ?? 0} label="Profile Completion" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit Core
          </button>
          <button className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
            Add Note
          </button>
          <button className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
            Message Parent
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}

function CompletionEnginePanel({ profile }: { profile?: StudentProfile360Response }) {
  const completion = asRecord(profile?.completion);
  const missing = asArray(completion.missingFields);
  const actions = asArray(completion.suggestedActions);
  const warnings = asArray(completion.adminWarnings);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">Profile Completion Engine</h3>
        <BadgePill label={`${profile?.profileCompletionPercent ?? 0}%`} tone="blue" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">Missing Fields</p>
          <TagList values={missing.length ? missing : ['No critical missing fields']} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">Suggested Actions</p>
          <TagList values={actions.length ? actions : ['Profile looks healthy']} tone="blue" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">Admin Warnings</p>
          <TagList values={warnings.length ? warnings : ['No active warnings']} tone="amber" />
        </div>
      </div>
    </div>
  );
}

function TagList({ values, tone = 'slate' }: { values: unknown[]; tone?: string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.slice(0, 12).map((value, index) => (
        <BadgePill key={index} label={asString(value)} tone={tone} />
      ))}
    </div>
  );
}

function IntelligenceCard({ insight }: { insight: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{asString(insight.title)}</p>
          <p className="mt-1 text-xs text-gray-500">{asString(insight.summary)}</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${severityClass(insight.severity)}`}>
          {asString(insight.severity)}
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Confidence</span>
          <span>{asNumber(insight.confidence)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${asNumber(insight.confidence)}%` }} />
        </div>
      </div>
      <p className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600">{asString(insight.recommendation)}</p>
    </div>
  );
}

function AcademicAnalyticsPanel({ analytics }: { analytics?: Record<string, unknown> }) {
  const trend = asArray(analytics?.performanceTrend).map((item, index) => {
    const row = asRecord(item);
    return {
      name: `Exam ${index + 1}`,
      percentage: asNumber(row.percentage),
      rank: asNumber(row.rank),
    };
  }).reverse();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">Academic Intelligence</h3>
        <div className="flex gap-2">
          <BadgePill label={`Avg ${asString(analytics?.averagePercentage, '0')}%`} tone="blue" />
          <BadgePill label={`Readiness ${asString(analytics?.examReadinessScore, '0')}%`} tone="green" />
        </div>
      </div>
      <div className="mt-5 h-56">
        {trend.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title="No exam trend yet" body="Academic charts will appear after exam results are generated." />
        )}
      </div>
    </div>
  );
}

function RiskMatrix({ risks }: { risks?: Record<string, unknown>[] }) {
  const rows = risks ?? [];
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">Risk Management Matrix</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {rows.map((risk, index) => (
          <div key={index} className={`rounded-lg border p-4 ${severityClass(risk.severity)}`}>
            <p className="text-sm font-semibold">{asString(risk.label)}</p>
            <p className="mt-2 text-xs opacity-80">{asString(risk.explanation)}</p>
            <p className="mt-3 text-xs font-semibold">{asString(risk.recommendedIntervention)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeedPanel({
  items,
  active,
  onChange,
}: {
  items: TimelineItemResponse[];
  active: string;
  onChange: (category: string) => void;
}) {
  const categories = ['ALL', ...Array.from(new Set(items.map((item) => item.type)))];
  const filtered = active === 'ALL' ? items : items.filter((item) => item.type === active);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={[
              'rounded-full border px-3 py-1 text-xs font-semibold',
              active === category ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
            ].join(' ')}
          >
            {category}
          </button>
        ))}
      </div>
      <TimelinePanel items={filtered} />
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid h-full min-h-32 place-items-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{body}</p>
      </div>
    </div>
  );
}

function IntelligenceSummaryPanel({ title, data }: { title: string; data?: Record<string, unknown> }) {
  const record = asRecord(data);
  if (Object.keys(record).length === 0) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <div className="mt-4">
        <SectionDataGrid data={record} />
      </div>
    </div>
  );
}

function TimelinePanel({ items }: { items: TimelineItemResponse[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">No timeline events yet.</p>;
  }
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={`${item.type}-${item.id}`} className="relative pl-5">
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
          <p className="text-sm font-semibold text-gray-800">{item.title}</p>
          <p className="mt-0.5 text-xs text-gray-500">{item.summary}</p>
          <p className="mt-1 text-xs text-gray-400">
            {new Date(item.occurredAt).toLocaleString('en-IN')} · {item.type}
          </p>
        </div>
      ))}
    </div>
  );
}

function SectionDataGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key]) => key !== 'recentRecords');
  return (
    <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {key.replace(/([A-Z])/g, ' $1')}
          </dt>
          <dd className="mt-1 break-words text-sm text-gray-800">{displayValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecentRecords({ records }: { records: unknown }) {
  if (!Array.isArray(records) || records.length === 0) {
    return <p className="mt-4 text-sm text-gray-400">No recent records.</p>;
  }
  return (
    <div className="mt-4 space-y-3">
      {records.map((record, index) => (
        <div key={index} className="rounded-lg border border-gray-100 bg-white p-3">
          <SectionDataGrid data={record as Record<string, unknown>} />
        </div>
      ))}
    </div>
  );
}

function SectionEditor({
  studentId,
  section,
}: {
  studentId: string;
  section: ProfileSectionResponse;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(section.data)
        .filter(([key, value]) => !Array.isArray(value) && key !== 'recordCount')
        .map(([key, value]) => [key, value == null ? '' : String(value)]),
    ),
  );
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => updateStudentProfile360Section(studentId, section.key, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile-360', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      setEditing(false);
      setError('');
    },
    onError: () => setError('Could not save this section. Check required fields.'),
  });

  function setValue(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  if (!SIMPLE_EDIT_SECTIONS.has(section.key)) return null;

  return (
    <div className="mt-4">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit Section
        </button>
      ) : (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.keys(formData).map((key) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                {String(formData[key]).length > 80 || ['address', 'aiInsights', 'interests', 'skills', 'careerGoals'].includes(key) ? (
                  <textarea
                    rows={3}
                    value={formData[key]}
                    onChange={(e) => setValue(key, e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type={key.toLowerCase().includes('date') ? 'date' : 'text'}
                    value={formData[key]}
                    onChange={(e) => setValue(key, e.target.value)}
                    className={inputCls}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : 'Save Section'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddRecordForm({ studentId, sectionKey }: { studentId: string; sectionKey: string }) {
  const fields = ADD_RECORD_FIELDS[sectionKey];
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => updateStudentProfile360Section(studentId, sectionKey, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile-360', studentId] });
      setValues({});
      setOpen(false);
      setError('');
    },
    onError: () => setError('Could not add record. Required fields may be missing.'),
  });

  if (!fields) return null;

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          + Add Record
        </button>
      ) : (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name}>
                <span className="mb-1 block text-xs font-medium text-gray-600">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.name] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={values[field.name] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    className={inputCls}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Adding…' : 'Add'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSectionPanel({
  studentId,
  section,
}: {
  studentId: string;
  section: ProfileSectionResponse;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{section.description}</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            {section.visibility}
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {section.completionPercent}%
          </span>
        </div>
      </div>
      <SectionDataGrid data={section.data} />
      <RecentRecords records={section.data.recentRecords} />
      <SectionEditor studentId={studentId} section={section} />
      <AddRecordForm studentId={studentId} sectionKey={section.key} />
      {section.timeline.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <TimelinePanel items={section.timeline} />
        </div>
      )}
    </div>
  );
}

// ── Documents section ─────────────────────────────────────────────────────────

function DocumentsSection({ schoolId, studentId }: { schoolId: string; studentId: string }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('BIRTH_CERTIFICATE');
  const [uploadError, setUploadError] = useState('');

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['student-docs', studentId],
    queryFn:  () => listStudentDocuments(schoolId, studentId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadStudentDocument(schoolId, studentId, docType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-docs', studentId] });
      if (fileRef.current) fileRef.current.value = '';
      setUploadError('');
    },
    onError: () => setUploadError('Upload failed. Check file type and size (max 10 MB).'),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteStudentDocument(schoolId, studentId, docId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-docs', studentId] }),
  });

  const downloadMutation = useMutation({
    mutationFn: (docId: string) => getPresignedUrl(schoolId, studentId, docId),
    onSuccess: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  }

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Documents
      </h3>

      {/* Upload row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploadMutation.isPending ? 'Uploading…' : '+ Upload File'}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      {!isLoading && docs.length === 0 && (
        <p className="text-sm text-gray-400">No documents uploaded yet.</p>
      )}

      {docs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-left">File</th>
                <th className="px-4 py-2.5 text-left">Size</th>
                <th className="px-4 py-2.5 text-left">Uploaded</th>
                <th className="px-4 py-2.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map((doc: StudentDocumentResponse) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-medium text-gray-600">
                    {doc.documentType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-gray-800 truncate max-w-[200px]" title={doc.fileName}>
                    {doc.fileName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatBytes(doc.sizeBytes)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => downloadMutation.mutate(doc.id)}
                      disabled={downloadMutation.isPending}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this document?')) deleteMutation.mutate(doc.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof PROFILE_TABS)[number][0]>('overview');
  const [activeTimelineFilter, setActiveTimelineFilter] = useState('ALL');
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

  const { data: profile360, isLoading: isProfileLoading } = useQuery({
    queryKey: ['student-profile-360', id],
    queryFn: () => getStudentProfile360(id!),
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

  const activeSection = sectionByKey(profile360, activeTab);
  const lifecycleActions = (
    <>
      {student.status === 'ACTIVE' && (
        <>
          <button
            onClick={() => graduate.mutate()}
            disabled={anyPending}
            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            Graduate
          </button>
          <button
            onClick={() => transfer.mutate()}
            disabled={anyPending}
            className="rounded-lg border border-yellow-200 px-3 py-2 text-xs font-semibold text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
          >
            Transfer
          </button>
          <button
            onClick={() => {
              if (confirm('Suspend this student?')) suspend.mutate();
            }}
            disabled={anyPending}
            className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50"
          >
            Suspend
          </button>
        </>
      )}
      {student.status === 'SUSPENDED' && (
        <button
          onClick={() => reinstate.mutate()}
          disabled={anyPending}
          className="rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          Reinstate
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/school-admin/students" className="text-blue-600 hover:underline">
          Students
        </Link>
        <span className="mx-2">/</span>
        <span>{student.firstName} {student.lastName}</span>
      </nav>

      <StudentIntelligenceHeader
        student={student}
        profile={profile360}
        onEdit={() => setEditing(true)}
        actions={lifecycleActions}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Attendance" value={`${quickStat(profile360, 'attendancePercent')}%`} tone="green" />
        <StatCard label="Fee Balance" value={quickStat(profile360, 'feeBalance')} tone="amber" />
        <StatCard label="Documents" value={quickStat(profile360, 'documents')} tone="blue" />
        <StatCard label="Risk" value={displayValue(sectionByKey(profile360, 'ai')?.data.aiRiskLevel)} tone="rose" />
      </div>

      {editing && <EditForm student={student} onCancel={() => setEditing(false)} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="rounded-lg border border-gray-200 bg-white p-2 lg:sticky lg:top-4 lg:self-start">
          {PROFILE_TABS.map(([key, label]) => {
            const section = sectionByKey(profile360, key);
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition',
                  activeTab === key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                <span>{label}</span>
                {section && (
                  <span className="text-xs text-gray-400">{section.completionPercent}%</span>
                )}
              </button>
            );
          })}
        </aside>

        <section className="min-w-0">
          {isProfileLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Loading 360 profile…
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-5">
              <CompletionEnginePanel profile={profile360} />
              <RiskMatrix risks={profile360?.riskProfile} />
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <AcademicAnalyticsPanel analytics={profile360?.academicAnalytics} />
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <h3 className="text-base font-semibold text-gray-900">Engagement Mix</h3>
                  <div className="mt-5 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Documents', value: asNumber(profile360?.quickStats?.documents) },
                          { name: 'Guardians', value: asNumber(profile360?.quickStats?.guardians) },
                          { name: 'Health', value: asNumber(profile360?.quickStats?.medicalRecords) },
                          { name: 'Behavior', value: asNumber(profile360?.quickStats?.behaviorRecords) },
                          { name: 'Awards', value: asNumber(profile360?.quickStats?.achievements) },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {(profile360?.aiInsights ?? []).map((insight, index) => (
                  <IntelligenceCard key={index} insight={insight} />
                ))}
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">360 Student Modules</h3>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {profile360?.sections.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveTab(section.key as (typeof PROFILE_TABS)[number][0])}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-left hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-500">
                          {section.completionPercent}%
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{section.description}</p>
                      <p className="mt-3 text-xs font-medium text-blue-700">{section.visibility}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'guardians' ? (
            <div className="space-y-5">
              <IntelligenceSummaryPanel title="Parent & Family Intelligence" data={profile360?.parentFamily} />
              <ParentLinksSection studentId={student.id} />
            </div>
          ) : activeTab === 'documents' ? (
            <div className="space-y-5">
              <IntelligenceSummaryPanel title="Document Vault Intelligence" data={profile360?.documentVault} />
              {schoolId ? <DocumentsSection schoolId={schoolId} studentId={student.id} /> : null}
            </div>
          ) : activeTab === 'health' && activeSection ? (
            <div className="space-y-5">
              <IntelligenceSummaryPanel title="Health & Wellbeing Intelligence" data={profile360?.healthWellbeing} />
              <ProfileSectionPanel studentId={student.id} section={activeSection} />
            </div>
          ) : activeTab === 'communication' && activeSection ? (
            <div className="space-y-5">
              <IntelligenceSummaryPanel title="Communication Center" data={profile360?.communicationCenter} />
              <ProfileSectionPanel studentId={student.id} section={activeSection} />
            </div>
          ) : activeTab === 'academics' && activeSection ? (
            <div className="space-y-5">
              <AcademicAnalyticsPanel analytics={profile360?.academicAnalytics} />
              <ProfileSectionPanel studentId={student.id} section={activeSection} />
            </div>
          ) : activeTab === 'ai' && activeSection ? (
            <div className="space-y-5">
              <RiskMatrix risks={profile360?.riskProfile} />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {(profile360?.aiInsights ?? []).map((insight, index) => (
                  <IntelligenceCard key={index} insight={insight} />
                ))}
              </div>
              <ProfileSectionPanel studentId={student.id} section={activeSection} />
            </div>
          ) : activeSection ? (
            <ProfileSectionPanel studentId={student.id} section={activeSection} />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Section not available.
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 lg:sticky lg:top-4 lg:self-start">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              History
            </span>
          </div>
          <ActivityFeedPanel
            items={profile360?.timeline ?? []}
            active={activeTimelineFilter}
            onChange={setActiveTimelineFilter}
          />
        </aside>
      </div>
    </div>
  );
}
