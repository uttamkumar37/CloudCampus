import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useTenantDashboardSummary } from '../../features/dashboard/hooks/useTenantDashboardSummary'
import { useAuth } from '../../features/auth/hooks/useAuth'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { to: '/student/learning', label: 'My Learning', roles: ['STUDENT'] },
  { to: '/parent/learning', label: 'Family Learning', roles: ['PARENT'] },
  { to: '/students', label: 'Students', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/teachers', label: 'Teachers', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/academic', label: 'Academic', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/bulk-upload', label: 'Bulk Operations', roles: ['SCHOOL_ADMIN'] },
  { to: '/homework', label: 'Homework', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/timetable', label: 'Timetable', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/attendance', label: 'Attendance', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/fees', label: 'Fees', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { to: '/marks', label: 'Marks', roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/parent-links', label: 'Parent Links', roles: ['SCHOOL_ADMIN'] },
  { to: '/my-children', label: 'My children', roles: ['PARENT'] },
  { to: '/profile', label: 'Profile', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
]

function navClassName(isActive: boolean) {
  const base = 'block rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200'

  if (isActive) {
    return `${base} bg-white text-slate-950 shadow-[0_16px_45px_-26px_rgba(15,23,42,0.55)]`
  }

  return `${base} text-slate-200 hover:bg-white/10 hover:text-white`
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const { logout, role, username, schoolName } = useAuth()
  const summaryQuery = useTenantDashboardSummary()
  const branding = summaryQuery.data?.data.branding
  const primaryColor = branding?.primaryColor ?? '#0f766e'

  const visibleNavigation = navigation.filter((item) => role && item.roles.includes(role))

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(255,255,255,0.10), transparent 35%), radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 25%)',
      }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[300px_1fr]">
        <aside
          className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="rounded-[28px] bg-black/15 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.schoolName}
                  className="h-14 w-14 rounded-2xl border border-white/25 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-white">
                  {branding?.schoolName?.slice(0, 2).toUpperCase() ?? 'CC'}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  CloudCampus
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {branding?.schoolName ?? schoolName ?? 'School Workspace'}
                </p>
                <p className="text-sm text-white/75">Connected school workspace</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Signed in as</p>
              <p className="mt-2 text-base font-semibold text-white">{username ?? 'User'}</p>
              <p className="text-sm text-white/75">{role?.replace('_', ' ')}</p>
            </div>

            <nav className="mt-8 space-y-2">
              {visibleNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navClassName(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
              className="mt-8 w-full rounded-2xl border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="px-4 py-6 md:px-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
