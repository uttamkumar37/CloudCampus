import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useTenantDashboardSummary } from '../../features/dashboard/hooks/useTenantDashboardSummary'
import { useAuth } from '../../features/auth/hooks/useAuth'

/* ── Inline icon primitives ── */
function Icon({ path, className = 'cc-nav-icon' }: { path: string | string[]; className?: string }) {
  const paths = Array.isArray(path) ? path : [path]
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

const NAV_ICONS: Record<string, string | string[]> = {
  '/dashboard':      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  '/student/learning': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  '/parent/learning': ['M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'],
  '/students':       'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  '/teachers':       ['M12 14l9-5-9-5-9 5 9 5z', 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222'],
  '/academic':       'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  '/bulk-upload':    'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
  '/homework':       'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  '/timetable':      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  '/attendance':     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  '/fees':           'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  '/marks':          'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  '/parent-links':   'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  '/website-builder':'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  '/my-children':    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  '/profile':        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
}

const navigation = [
  { to: '/dashboard',       label: 'Dashboard',       roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { to: '/student/learning',label: 'My Learning',     roles: ['STUDENT'] },
  { to: '/parent/learning', label: 'Family Learning',  roles: ['PARENT'] },
  { to: '/students',        label: 'Students',         roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/teachers',        label: 'Teachers',         roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/academic',        label: 'Academic',         roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/bulk-upload',     label: 'Bulk Operations',  roles: ['SCHOOL_ADMIN'] },
  { to: '/homework',        label: 'Homework',         roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/timetable',       label: 'Timetable',        roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/attendance',      label: 'Attendance',       roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/fees',            label: 'Fees',             roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { to: '/marks',           label: 'Marks',            roles: ['SCHOOL_ADMIN', 'TEACHER'] },
  { to: '/parent-links',    label: 'Parent Links',     roles: ['SCHOOL_ADMIN'] },
  { to: '/website-builder', label: 'Website Builder',  roles: ['SCHOOL_ADMIN'] },
  { to: '/my-children',     label: 'My Children',      roles: ['PARENT'] },
  { to: '/profile',         label: 'Profile',          roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
]

function roleLabel(role: string) {
  return {
    SCHOOL_ADMIN: 'School Admin',
    TEACHER: 'Teacher',
    STUDENT: 'Student',
    PARENT: 'Parent',
    SUPER_ADMIN: 'Super Admin',
  }[role] ?? role
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const { logout, role, username, schoolName } = useAuth()
  const summaryQuery = useTenantDashboardSummary()
  const branding = summaryQuery.data?.data.branding
  const primaryColor = branding?.primaryColor ?? '#059669'
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleNavigation = navigation.filter((item) => role && item.roles.includes(role))

  const initials = (branding?.schoolName ?? schoolName ?? 'CC')
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0] ?? '')
    .join('')
    .toUpperCase()

  const sidebar = (
    <aside
      className="flex flex-col h-full p-4 xl:p-5"
      style={{ backgroundColor: primaryColor }}
    >
      {/* School branding */}
      <div className="rounded-2xl bg-black/15 backdrop-blur-sm p-4 border border-white/10">
        <div className="flex items-center gap-3">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.schoolName}
              className="h-12 w-12 rounded-xl border border-white/20 object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="h-12 w-12 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50 leading-none">CloudCampus</p>
            <p className="mt-1.5 text-sm font-bold text-white truncate leading-tight">
              {branding?.schoolName ?? schoolName ?? 'School Workspace'}
            </p>
          </div>
        </div>
      </div>

      {/* User profile pill */}
      <div className="mt-4 rounded-2xl bg-white/8 border border-white/10 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" className="w-4.5 h-4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate leading-tight">{username ?? 'User'}</p>
          <p className="text-xs text-white/55 leading-tight mt-0.5">{role ? roleLabel(role) : ''}</p>
        </div>
      </div>

      {/* Section label */}
      <p className="mt-5 mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">
        Navigation
      </p>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {visibleNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `cc-nav-link${isActive ? ' active' : ''}`
            }
          >
            <Icon path={NAV_ICONS[item.to] ?? 'M12 6v6m0 0v6m0-6h6m-6 0H6'} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="w-full flex items-center gap-3 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 opacity-70 group-hover:opacity-100 transition">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden xl:flex flex-col sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: primaryColor }}>
          {sidebar}
        </div>

        {/* Mobile top bar */}
        <div
          className="xl:hidden sticky top-0 z-40 flex items-center gap-3 border-b border-white/15 px-4 py-3 backdrop-blur-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <p className="text-sm font-bold text-white truncate">
            {branding?.schoolName ?? schoolName ?? 'CloudCampus'}
          </p>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="xl:hidden fixed inset-0 z-50 flex">
            <div
              className="w-72 flex flex-col overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {sidebar}
            </div>
            <button
              type="button"
              className="flex-1 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            />
          </div>
        )}

        {/* Main content */}
        <main className="min-h-screen bg-slate-50">
          <div className="px-4 py-6 md:px-8 xl:px-10 xl:py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
