import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag';
import { useBranding } from '@/shared/hooks/useBranding';
import { listMySchoolsApi, switchSchoolApi } from '../api/schoolAccessApi';

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
  { label: 'Students',         to: '/school-admin/students',         feature: 'STUDENT_MANAGEMENT' },
  { label: 'Promote Students', to: '/school-admin/students/promote', feature: 'STUDENT_MANAGEMENT' },
  { label: 'Staff', to: '/school-admin/staff', feature: 'TEACHER_MANAGEMENT' },
  { label: 'Staff Attendance', to: '/school-admin/staff-attendance', feature: 'ATTENDANCE' },
  { label: 'Leave Requests',  to: '/school-admin/leave-requests',  feature: 'TEACHER_MANAGEMENT' },
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
  { label: 'Website', to: '/school-admin/website', feature: 'WEBSITE_BUILDER' },
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
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate  = useNavigate();
  const branding  = useBranding();

  const { data: mySchools } = useQuery({
    queryKey: ['my-schools'],
    queryFn:  listMySchoolsApi,
    enabled:  user?.role === 'SCHOOL_ADMIN',
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: switchSchool, isPending: isSwitching } = useMutation({
    mutationFn: switchSchoolApi,
    onSuccess: (res) => {
      useAuthStore.setState((s) => ({
        accessToken: res.accessToken,
        user: s.user ? { ...s.user, schoolId: res.schoolId } : s.user,
      }));
      // Reload to flush all cached school-scoped queries.
      window.location.replace('/school-admin/dashboard');
    },
  });

  const multiSchool = mySchools && mySchools.length > 1;

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
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="School logo"
              className="h-8 max-w-[140px] object-contain"
            />
          ) : (
            <span className="text-base font-bold text-blue-700">CloudCampus</span>
          )}
        </div>

        {/* School switcher — only rendered when user has access to 2+ schools */}
        {multiSchool && (
          <div className="border-b border-gray-100 px-3 py-2">
            <select
              value={user?.schoolId ?? ''}
              disabled={isSwitching}
              onChange={(e) => switchSchool(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              aria-label="Active school"
            >
              {mySchools.map((s) => (
                <option key={s.schoolId} value={s.schoolId}>
                  {s.schoolName}
                </option>
              ))}
            </select>
          </div>
        )}

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
          <Link
            to="/change-password"
            className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Change Password
          </Link>
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
