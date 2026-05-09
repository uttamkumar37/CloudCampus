import { PageHeader } from '../../../components/ui/PageHeader'
import { useCurrentProfile } from '../../auth/hooks/useCurrentProfile'

const ROLE_LABELS: Record<string, string> = {
  SCHOOL_ADMIN: 'School Administrator',
  TEACHER:      'Teacher',
  STUDENT:      'Student',
  PARENT:       'Parent',
  SUPER_ADMIN:  'Super Administrator',
}

const ROLE_COLORS: Record<string, string> = {
  SCHOOL_ADMIN: 'bg-violet-100 text-violet-700',
  TEACHER:      'bg-sky-100 text-sky-700',
  STUDENT:      'bg-emerald-100 text-emerald-700',
  PARENT:       'bg-amber-100 text-amber-700',
  SUPER_ADMIN:  'bg-rose-100 text-rose-700',
}

function avatarInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function avatarColor(name: string) {
  const colors = [
    '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981',
    '#f43f5e', '#06b6d4', '#a855f7', '#22c55e',
  ]
  let h = 0
  for (const ch of name) h = (h << 5) - h + ch.charCodeAt(0)
  return colors[Math.abs(h) % colors.length]
}

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export function ProfilePage() {
  const q = useCurrentProfile()

  if (q.isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader title="My Profile" subtitle="Loading your account…" />
        <div className="cc-skeleton-shimmer h-64 rounded-2xl" />
      </section>
    )
  }

  if (q.isError || !q.data?.success || !q.data.data) {
    return (
      <section className="space-y-4">
        <PageHeader title="My Profile" />
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Could not load profile. Try signing in again.
        </div>
      </section>
    )
  }

  const p = q.data.data
  const color = avatarColor(p.fullName)
  const initials = avatarInitials(p.fullName)
  const roleLabel = ROLE_LABELS[p.role] ?? p.role
  const roleBadge = ROLE_COLORS[p.role] ?? 'bg-slate-100 text-slate-700'
  const accountReady = Boolean(p.email && p.username)

  const fields: Array<{ label: string; value: string }> = [
    { label: 'Full name',  value: p.fullName },
    { label: 'Username',   value: p.username },
    { label: 'Email',      value: p.email || '—' },
    { label: 'School',     value: p.schoolName ?? 'CloudCampus Platform' },
    { label: 'Workspace',  value: p.tenantSlug ? `/${p.tenantSlug}` : 'platform' },
  ]

  return (
    <section className="space-y-6 max-w-2xl">
      <PageHeader
        title="My Profile"
        subtitle="Your CloudCampus account details for this school workspace."
      />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Account Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{roleLabel}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {accountReady ? 'Your account is active and ready for the current school workspace.' : 'Your account details need attention from the school administrator.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Role" value={roleLabel} tone="text-sky-700" />
            <SnapshotStat label="Workspace" value={p.tenantSlug ? `/${p.tenantSlug}` : 'Platform'} tone="text-violet-700" />
            <SnapshotStat label="Email" value={p.email ? 'Set' : 'Missing'} tone="text-emerald-700" />
            <SnapshotStat label="Username" value={p.username ? 'Set' : 'Missing'} tone="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Account Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Quick checks for identity completeness, workspace binding, and role context.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="School" value={p.schoolName ? 'Assigned' : 'Platform'} tone="text-slate-700" />
            <SnapshotStat label="Tenant" value={p.tenantSlug ? 'Bound' : 'Open'} tone="text-violet-700" />
            <SnapshotStat label="Account" value={accountReady ? 'Ready' : 'Needs Fix'} tone="text-emerald-700" />
            <SnapshotStat label="Role" value={roleLabel} tone="text-sky-700" />
          </div>
        </div>
      </div>

      {/* Avatar + role card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-md"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-900 truncate">{p.fullName}</h2>
          <p className="text-sm text-slate-500 mt-0.5">@{p.username}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold ${roleBadge}`}>
              {roleLabel}
            </span>
            {p.schoolName && (
              <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600">
                {p.schoolName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-5">Account Details</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-800 truncate">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span>Your account is managed by your school administrator. Contact them to update your credentials or role.</span>
      </div>
    </section>
  )
}
