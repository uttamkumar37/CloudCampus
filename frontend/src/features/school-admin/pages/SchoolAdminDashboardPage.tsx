import { useAuthStore } from '@/features/auth/store/useAuthStore';

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────

/**
 * CC-0401 — School Admin Dashboard shell.
 *
 * Stat cards are placeholders until the relevant backend APIs are built
 * (Academic Year, Class, Student, Staff). Each card will be replaced by
 * a real useQuery hook in its respective feature session.
 */
export function SchoolAdminDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Welcome back. Here&apos;s a snapshot of your school.
        </p>
      </div>

      {/* Tenant info banner */}
      {user?.tenantId && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">
          <p className="text-sm text-blue-700">
            Tenant: <span className="font-semibold">{user.tenantId}</span>
          </p>
        </div>
      )}

      {/* Stat cards — populated by real APIs in later sessions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Students" value="—" description="Academic year active" />
        <StatCard label="Staff" value="—" description="Active employees" />
        <StatCard label="Classes" value="—" description="Current academic year" />
        <StatCard label="Attendance Today" value="—" description="Pending setup" />
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Academic Years', href: '/school-admin/academic-years' },
            { label: 'Classes', href: '/school-admin/classes' },
            { label: 'Settings', href: '/school-admin/settings' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
