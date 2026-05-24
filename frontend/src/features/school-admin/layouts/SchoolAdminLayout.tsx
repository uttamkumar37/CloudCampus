import type React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag';
import { useBranding } from '@/shared/hooks/useBranding';
import { useRouteScopedDisclosure } from '@/shared/hooks/useRouteScopedDisclosure';
import { DemoEnvironmentBanner } from '@/shared/demo/DemoEnvironmentBanner';
import { listMySchoolsApi, switchSchoolApi } from '../api/schoolAccessApi';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

async function fetchAdminMe() {
  const { data } = await axiosInstance.get<ApiResponse<{ firstName: string; lastName: string; schoolName: string }>>('/v1/school-admin/me');
  return data.data!;
}

// ── Icon helpers ──────────────────────────────────────────────────────────────

const DashboardIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
);

const BookIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
);

const TimetableIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
);

const AttendanceIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
);

const FeesIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
);

const ChartIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
);

const ChatIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
);

const BuildingIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
);

const StarIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
);

const CogIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);

const ExamIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
);

const HomeworkIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
);

// ── Nav item definition ───────────────────────────────────────────────────────

interface NavItemDef {
  label: string;
  to: string;
  icon: React.ReactNode;
  /** If set, item is hidden when the tenant does NOT have this feature. */
  feature?: string;
}

// ── Inner component that reads one feature flag ───────────────────────────────

function NavItemLink({ item }: { item: NavItemDef }) {
  const enabled = useFeatureFlag(item.feature ?? '');
  if (item.feature && !enabled) return null;

  return (
    <NavLink
      to={item.to}
      end={item.to.endsWith('dashboard')}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// Nav items split by section
const ACADEMIC_ITEMS: NavItemDef[] = [
  { label: 'Dashboard',       to: '/school-admin/dashboard',         icon: <DashboardIcon /> },
  { label: 'Academic Years',  to: '/school-admin/academic-years',    icon: <BookIcon />,       feature: 'ACADEMIC_YEAR' },
  { label: 'Classes',         to: '/school-admin/classes',           icon: <BuildingIcon />,   feature: 'CLASS_MGMT' },
  { label: 'Sections',        to: '/school-admin/sections',          icon: <BuildingIcon />,   feature: 'CLASS_MGMT' },
  { label: 'Subjects',        to: '/school-admin/subjects',          icon: <BookIcon />,       feature: 'SUBJECT_MGMT' },
  { label: 'Departments',     to: '/school-admin/departments',       icon: <BuildingIcon />,   feature: 'DEPT_MGMT' },
  { label: 'Timetable',       to: '/school-admin/timetable',         icon: <TimetableIcon />,  feature: 'TIMETABLE' },
  { label: 'Attendance',      to: '/school-admin/attendance',        icon: <AttendanceIcon />, feature: 'ATTENDANCE' },
  { label: 'Homework',        to: '/school-admin/homework',          icon: <HomeworkIcon />,   feature: 'HOMEWORK' },
  { label: 'Assignments',     to: '/school-admin/assignments',       icon: <HomeworkIcon />,   feature: 'ASSIGNMENTS' },
  { label: 'Exams',           to: '/school-admin/exams',             icon: <ExamIcon />,       feature: 'EXAM_MANAGEMENT' },
];

const PEOPLE_ITEMS: NavItemDef[] = [
  { label: 'Students',         to: '/school-admin/students',          icon: <UsersIcon />,      feature: 'STUDENT_MANAGEMENT' },
  { label: 'Promote Students', to: '/school-admin/students/promote',  icon: <UsersIcon />,      feature: 'STUDENT_MANAGEMENT' },
  { label: 'Staff',            to: '/school-admin/staff',             icon: <UsersIcon />,      feature: 'TEACHER_MANAGEMENT' },
  { label: 'Staff Attendance', to: '/school-admin/staff-attendance',  icon: <AttendanceIcon />, feature: 'ATTENDANCE' },
  { label: 'Leave Requests',   to: '/school-admin/leave-requests',    icon: <TimetableIcon />,  feature: 'TEACHER_MANAGEMENT' },
];

const FINANCE_ITEMS: NavItemDef[] = [
  { label: 'Fees',           to: '/school-admin/fees',            icon: <FeesIcon />,  feature: 'FINANCE' },
  { label: 'Fee Collection', to: '/school-admin/fees/collection', icon: <FeesIcon />,  feature: 'FINANCE' },
];

const COMMS_ITEMS: NavItemDef[] = [
  { label: 'Notifications', to: '/school-admin/notifications', icon: <BellIcon />,    feature: 'NOTIFICATIONS' },
  { label: 'WhatsApp',      to: '/school-admin/whatsapp',      icon: <ChatIcon />,    feature: 'WHATSAPP' },
  { label: 'Notice Board',  to: '/school-admin/notices',       icon: <BellIcon />,    feature: 'NOTICE_BOARD' },
  { label: 'Reports',       to: '/school-admin/reports',       icon: <ChartIcon />,   feature: 'REPORTS' },
];

const OTHER_ITEMS: NavItemDef[] = [
  { label: 'Website',       to: '/school-admin/website',       icon: <BuildingIcon />, feature: 'WEBSITE_BUILDER' },
  { label: 'Custom Domain', to: '/school-admin/custom-domain', icon: <CogIcon />,      feature: 'WEBSITE_BUILDER' },
  { label: 'AI Copilot',    to: '/school-admin/ai-copilot',    icon: <StarIcon /> },
  { label: 'My Profile',    to: '/school-admin/profile',       icon: <UserIcon /> },
  { label: 'Settings',      to: '/school-admin/settings',      icon: <CogIcon /> },
];

// ── Layout shell ──────────────────────────────────────────────────────────────

export function SchoolAdminLayout() {
  const { isOpen: sidebarOpen, open: openSidebar, close: closeSidebar } = useRouteScopedDisclosure();
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

  const { data: adminMe } = useQuery({
    queryKey: ['school-admin-me'],
    queryFn:  fetchAdminMe,
    enabled:  user?.role === 'SCHOOL_ADMIN',
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const { mutate: switchSchool, isPending: isSwitching } = useMutation({
    mutationFn: switchSchoolApi,
    onSuccess: (res) => {
      useAuthStore.setState((s) => ({
        accessToken: res.accessToken,
        user: s.user ? { ...s.user, schoolId: res.schoolId } : s.user,
      }));
      window.location.replace('/school-admin/dashboard');
    },
  });

  const multiSchool = mySchools && mySchools.length > 1;

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  const brandLogo = branding?.logoUrl ? (
    <img src={branding.logoUrl} alt="School logo" className="h-8 max-w-[140px] object-contain" />
  ) : (
    <span className="text-base font-bold text-blue-700">CloudCampus</span>
  );

  const sidebar = (
    <nav className="flex flex-col gap-4 px-3 py-4 h-full" aria-label="School admin navigation">
      <div className="px-3 mb-2">
        {brandLogo}
        <p className="text-xs text-gray-400 mt-0.5">School Admin</p>
      </div>

      {/* School switcher */}
      {multiSchool && (
        <div className="px-1">
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

      <NavSection title="Academic">
        {ACADEMIC_ITEMS.map((item) => <NavItemLink key={item.to} item={item} />)}
      </NavSection>

      <NavSection title="People">
        {PEOPLE_ITEMS.map((item) => <NavItemLink key={item.to} item={item} />)}
      </NavSection>

      <NavSection title="Finance">
        {FINANCE_ITEMS.map((item) => <NavItemLink key={item.to} item={item} />)}
      </NavSection>

      <NavSection title="Communication">
        {COMMS_ITEMS.map((item) => <NavItemLink key={item.to} item={item} />)}
      </NavSection>

      <NavSection title="Settings">
        {OTHER_ITEMS.map((item) => <NavItemLink key={item.to} item={item} />)}
      </NavSection>

      <div className="mt-auto border-t border-gray-100 pt-4 space-y-0.5">
        <div className="px-3 pb-2 text-xs font-medium text-gray-700 truncate">
          {adminMe ? `${adminMe.firstName} ${adminMe.lastName}` : 'School Admin'}
        </div>
        <Link
          to="/change-password"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <CogIcon />
          <span>Change Password</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col border-r border-gray-200 bg-white overflow-y-auto">
        {sidebar}
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 lg:hidden overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          {brandLogo}
          <button
            onClick={closeSidebar}
            aria-label="Close navigation"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {sidebar}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 shrink-0">
          <button
            onClick={openSidebar}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <span className="text-sm font-medium text-gray-700 lg:hidden">CloudCampus</span>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {adminMe ? `${adminMe.firstName} ${adminMe.lastName}` : 'School Admin'}
              </p>
              {adminMe?.schoolName && (
                <p className="text-xs text-gray-400">{adminMe.schoolName}</p>
              )}
            </div>
            <Link
              to="/school-admin/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
              title="My Profile"
            >
              {adminMe ? `${adminMe.firstName[0]}${adminMe.lastName[0]}`.toUpperCase() : 'A'}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <DemoEnvironmentBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
