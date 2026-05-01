import { PageHeader } from '../../../components/ui/PageHeader'
import { useCurrentProfile } from '../../auth/hooks/useCurrentProfile'

export function ProfilePage() {
  const q = useCurrentProfile()

  if (q.isLoading) {
    return (
      <section className="space-y-4">
        <PageHeader title="Profile" subtitle="Loading your account…" />
        <div className="h-32 animate-pulse rounded-[28px] border border-slate-200 bg-white/80" />
      </section>
    )
  }

  if (q.isError || !q.data?.success || !q.data.data) {
    return (
      <section className="space-y-4">
        <PageHeader title="Profile" subtitle="Could not load profile." />
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Try signing in again or confirm that your school workspace is selected.
        </div>
      </section>
    )
  }

  const p = q.data.data

  return (
    <section className="space-y-6">
      <PageHeader title="My profile" subtitle="Unified CloudCampus account for this school." />
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{p.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{p.username}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-800">{p.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</dt>
            <dd className="mt-1 text-slate-800">{p.role}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">School</dt>
            <dd className="mt-1 text-slate-800">{p.schoolName ?? 'CloudCampus Platform'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</dt>
            <dd className="mt-1 text-slate-600">{p.tenantSlug ? `/${p.tenantSlug}` : 'platform'}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
