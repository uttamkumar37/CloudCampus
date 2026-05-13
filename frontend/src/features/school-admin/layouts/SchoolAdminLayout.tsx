import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag';

// ── Nav item definition ───────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  /** If set, item is hidden when the tenant does NOT have this feature. */
  feature?: string;
}

// Ordered by priority. Feature-gated items are hidden until unlocked (CC-0408).
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/school-admin/dashboard' },
  { label: 'Academic Years', to: '/school-admin/academic-years', feature: 'ACADEMIC_YEAR' },
  { label: 'Classes', to: '/school-admin/classes', feature: 'CLASS_MGMT' },
  { label: 'Sections', to: '/school-admin/sections', feature: 'CLASS_MGMT' },
  { label: 'Subjects', to: '/school-admin/subjects', feature: 'SUBJECT_MGMT' },
  { label: 'Students', to: '/school-admin/students', feature: 'STUDENT_MANAGEMENT' },
  { label: 'Staff', to: '/school-admin/staff', feature: 'TEACHER_MANAGEMENT' },
  { label: 'Attendance', to: '/school-admin/attendance', feature: 'ATTENDANCE' },
  { label: 'Fees', to: '/school-admin/fees', feature: 'FINANCE' },
  { label: 'Fee Collection', to: '/school-admin/fees/collection', feature: 'FINANCE' },
  { label: 'Departments', to: '/school-admin/departments', feature: 'DEPT_MGMT' },
  { label: 'Timetable', to: '/school-admin/timetable', feature: 'TIMETABLE' },
  { label: 'Homework', to: '/school-admin/homework', feature: 'HOMEWORK' },
  { label: 'Assignments', to: '/school-admin/assignments', feature: 'ASSIGNMENTS' },
  { label: 'Exams', to: '/school-admin/exams', feature: 'EXAM_MANAGEMENT' },
  { label: 'Notifications', to: '/school-admin/notifications', feature: 'NOTIFICATIONS' },
  { label: 'WhatsApp', to: '/school-admin/whatsapp', feature: 'WHATSAPP' },
  { label: 'Notice Board', to: '/school-admin/notices', feature: 'NOTICE_BOARD' },
  { label: 'Reports', to: '/school-admin/reports', feature: 'REPORTS' },
  { label: 'Settings', to: '/school-admin/settings' },
];

// ── Inner component that reads one feature flag ───────────────────────────────
// Separated so each item only subscribes to its own flag selector.
function NavItemLink({ item }: { item: NavItem }) {
  const enabled = useFeatureFlag(item.feature ?? '');
  if (item.feature && !enabled) return null;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  );
}

// ── Layout shell ──────────────────────────────────────────────────────────────

export function SchoolAdminLayout() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-gray-100 px-4">
          <span className="text-base font-bold text-blue-700">CloudCampus</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3" aria-label="School admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </nav>

        {/* User chip */}
        <div className="border-t border-gray-100 p-3">
          <div className="mb-2 truncate px-1 text-xs text-gray-500">
            {user?.tenantId ?? '—'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-sm font-medium text-gray-500">School Admin</h1>
          <span className="text-sm text-gray-700">{user?.userId ?? ''}</span>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
