import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getSchoolDashboard } from '../api/schoolDashboardApi';
import { PageHeader } from '@/shared/ui';

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent = 'text-gray-900',
  to,
  testId,
}: {
  label: string;
  value: number | string;
  accent?: string;
  to?: string;
  testId?: string;
}) {
  const inner = (
    <div
      data-testid={testId}
      className={`rounded-xl border border-gray-200 bg-white p-5 ${to ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <>{inner}</>;
}

// ── Quick action link ─────────────────────────────────────────────────────────

function QuickLink({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-950">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export function SchoolAdminDashboardPage() {
  const user     = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['school-dashboard', schoolId],
    queryFn:  () => getSchoolDashboard(schoolId),
    enabled:  !!schoolId,
  });

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const hasAlerts =
    (data?.pendingLeaveRequests ?? 0) > 0 ||
    (data?.pendingFeeRecords ?? 0) > 0;
  const setupSteps = [
    { label: 'Create classes', detail: 'Build the academic structure first.', to: '/school-admin/classes', done: (data?.totalClasses ?? 0) > 0 },
    { label: 'Admit students', detail: 'Add active students for attendance, fees, exams, and portals.', to: '/school-admin/students/admit', done: (data?.totalStudents ?? 0) > 0 },
    { label: 'Add staff', detail: 'Invite teachers and workforce users.', to: '/school-admin/staff/new', done: (data?.totalStaff ?? 0) > 0 },
    { label: 'Post first notice', detail: 'Start parent and student communication.', to: '/school-admin/notices', done: (data?.publishedNotices ?? 0) > 0 },
    { label: 'Publish timetable', detail: 'Make daily operations visible to teachers and students.', to: '/school-admin/timetable', done: false },
    { label: 'Launch school website', detail: 'Turn the public site into an admissions channel.', to: '/school-admin/website', done: false },
  ];
  const completedSetupSteps = setupSteps.filter((step) => step.done).length;
  const setupProgress = Math.round((completedSetupSteps / setupSteps.length) * 100);
  const aiRecommendations = [
    {
      title: 'Activation Focus',
      detail: setupProgress < 70
        ? 'Complete the setup checklist before scaling daily operations.'
        : 'Core setup is healthy. Start measuring parent engagement and website leads.',
      to: setupProgress < 70 ? '/school-admin/settings' : '/school-admin/website',
      tone: 'border-blue-100 bg-blue-50 text-blue-800',
    },
    {
      title: 'Operations Alert',
      detail: (data?.pendingLeaveRequests ?? 0) > 0
        ? `${data?.pendingLeaveRequests ?? 0} leave request(s) need approval to keep workflows moving.`
        : 'No leave approval backlog detected from the dashboard summary.',
      to: '/school-admin/leave-requests',
      tone: 'border-amber-100 bg-amber-50 text-amber-800',
    },
    {
      title: 'Finance Watch',
      detail: (data?.pendingFeeRecords ?? 0) > 0
        ? `${data?.pendingFeeRecords ?? 0} unpaid fee record(s) should be reviewed this week.`
        : 'Fee collection summary has no unpaid records in the current dashboard view.',
      to: '/school-admin/fees/collection',
      tone: 'border-rose-100 bg-rose-50 text-rose-800',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader title="Dashboard" subtitle={today} />

      {/* Alerts row */}
      {!isLoading && hasAlerts && (
        <div className="flex flex-wrap gap-3">
          {(data?.pendingLeaveRequests ?? 0) > 0 && (
            <Link
              to="/school-admin/leave-requests"
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:bg-amber-100"
            >
              <span className="font-bold">{data!.pendingLeaveRequests}</span>
              pending leave request{data!.pendingLeaveRequests !== 1 ? 's' : ''}
            </Link>
          )}
          {(data?.pendingFeeRecords ?? 0) > 0 && (
            <Link
              to="/school-admin/fees/collection"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 hover:bg-red-100"
            >
              <span className="font-bold">{data!.pendingFeeRecords}</span>
              unpaid fee record{data!.pendingFeeRecords !== 1 ? 's' : ''}
              {(data?.partialFeeRecords ?? 0) > 0 && (
                <span className="text-red-500">
                  {' '}(+{data!.partialFeeRecords} partial)
                </span>
              )}
            </Link>
          )}
        </div>
      )}

      {/* Primary stats */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Active Students"
            value={isLoading ? '…' : (data?.totalStudents ?? 0)}
            accent="text-blue-700"
            to="/school-admin/students"
            testId="stat-students"
          />
          <StatCard
            label="Active Staff"
            value={isLoading ? '…' : (data?.totalStaff ?? 0)}
            accent="text-indigo-700"
            to="/school-admin/staff"
            testId="stat-staff"
          />
          <StatCard
            label="Classes"
            value={isLoading ? '…' : (data?.totalClasses ?? 0)}
            accent="text-gray-900"
            to="/school-admin/classes"
            testId="stat-classes"
          />
          <StatCard
            label="Published Notices"
            value={isLoading ? '…' : (data?.publishedNotices ?? 0)}
            accent="text-green-700"
            to="/school-admin/notices"
            testId="stat-notices"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="School Activation Checklist"
          subtitle={`${completedSetupSteps} of ${setupSteps.length} launch steps completed. This keeps new schools from landing on an empty ERP.`}
        >
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-500">
              <span>Profile readiness</span>
              <span>{setupProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${setupProgress}%` }} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {setupSteps.map((step, index) => (
              <Link key={step.label} to={step.to} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                  {step.done ? '✓' : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-gray-950">{step.label}</span>
                  <span className="mt-1 block text-sm text-gray-500">{step.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="AI Operations Copilot"
          subtitle="Deterministic recommendations from current dashboard signals."
        >
          <div className="space-y-3">
            {aiRecommendations.map((item) => (
              <Link key={item.title} to={item.to} className={`block rounded-xl border p-4 transition hover:-translate-y-1 ${item.tone}`}>
                <p className="text-xs font-black uppercase tracking-wide opacity-75">{item.title}</p>
                <p className="mt-2 text-sm leading-6 opacity-90">{item.detail}</p>
              </Link>
            ))}
          </div>
          {!isLoading && !hasAlerts && (data?.totalStudents ?? 0) === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Start with classes, students, and staff. The operational alerts become more useful as real school data arrives.
            </div>
          )}
        </SectionCard>
      </div>

      {/* Fee health */}
      {!isLoading && ((data?.pendingFeeRecords ?? 0) + (data?.partialFeeRecords ?? 0)) > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Fee Health
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 max-w-sm">
            <StatCard
              label="Unpaid"
              value={data!.pendingFeeRecords}
              accent="text-red-600"
              to="/school-admin/fees/collection"
            />
            <StatCard
              label="Partial"
              value={data!.partialFeeRecords}
              accent="text-amber-600"
              to="/school-admin/fees/collection"
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <QuickLink label="Admit Student"    to="/school-admin/students/admit" />
          <QuickLink label="Add Staff"        to="/school-admin/staff/new" />
          <QuickLink label="Mark Attendance"  to="/school-admin/attendance/new" />
          <QuickLink label="Collect Fee"      to="/school-admin/fees/collection" />
          <QuickLink label="Post Notice"      to="/school-admin/notices" />
          <QuickLink label="Leave Requests"   to="/school-admin/leave-requests" />
          <QuickLink label="Timetable"        to="/school-admin/timetable" />
          <QuickLink label="Settings"         to="/school-admin/settings" />
        </div>
      </div>
    </div>
  );
}
