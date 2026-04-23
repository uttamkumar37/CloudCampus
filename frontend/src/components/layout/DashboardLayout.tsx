import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/academic', label: 'Academic' },
]

function navClassName(isActive: boolean) {
  const base = 'block rounded-md px-3 py-2 text-sm font-medium transition-colors'

  if (isActive) {
    return `${base} bg-emerald-100 text-emerald-900`
  }

  return `${base} text-slate-700 hover:bg-slate-100 hover:text-slate-900`
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-4 md:border-b-0 md:border-r">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              EduTenant
            </p>
            <p className="mt-1 text-sm text-slate-600">Digital School SaaS</p>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
