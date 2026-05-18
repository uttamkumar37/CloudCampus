import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getSchoolDashboard } from '../api/schoolDashboardApi';

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-0.5 text-sm text-gray-500">{today}</p>
      </div>

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
