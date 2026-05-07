import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../../features/auth/hooks/useAuth'

const navigation = [
  {
    to: '/super-admin/dashboard',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="cc-nav-icon">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/super-admin/tenants',
    label: 'Tenants',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="cc-nav-icon">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: '/super-admin/users',
    label: 'Users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="cc-nav-icon">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/super-admin/subscriptions',
    label: 'Subscriptions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="cc-nav-icon">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
]

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const { logout, username } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <aside className="flex flex-col h-full bg-slate-950 p-5">
      {/* Branding */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-900/50">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">CloudCampus</p>
          <p className="text-sm font-bold text-white leading-tight">Super Admin</p>
        </div>
      </div>

      {/* Operator card */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{username ?? 'superadmin'}</p>
          <p className="text-xs text-slate-400">Platform Operator</p>
        </div>
      </div>

      <p className="mt-6 mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
        Management
      </p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `cc-nav-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
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
            navigate('/super-admin/login', { replace: true })
          }}
          className="w-full flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/8 hover:text-white transition group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 group-hover:text-white transition">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden xl:flex flex-col sticky top-0 h-screen bg-slate-950">
          {sidebar}
        </div>

        {/* Mobile top bar */}
        <div className="xl:hidden sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-xl border border-white/15 bg-white/8 p-2 text-white transition hover:bg-white/15"
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
          <p className="text-sm font-bold text-white">Super Admin Portal</p>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="xl:hidden fixed inset-0 z-50 flex">
            <div className="w-64 flex flex-col h-full">{sidebar}</div>
            <button
              type="button"
              className="flex-1 bg-black/50 backdrop-blur-sm"
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
