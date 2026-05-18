import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const NAV_ITEMS = [
  { label: 'Dashboard',    to: '/super-admin/dashboard' },
  { label: 'Tenants',      to: '/super-admin/tenants' },
  { label: 'Analytics',    to: '/super-admin/analytics' },
  { label: 'Comparison',   to: '/super-admin/comparison' },
  { label: 'AI Prompts',   to: '/super-admin/ai/prompts' },
  { label: 'Knowledge Base', to: '/super-admin/ai/knowledge' },
  { label: 'AI Usage',       to: '/super-admin/ai/usage' },
  { label: 'Experience Studio', to: '/super-admin/experience' },
];

export function SuperAdminLayout() {
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate  = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-100 px-4">
          <div>
            <p className="text-sm font-bold text-blue-700">CloudCampus</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-3" aria-label="Super admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
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
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <div className="mb-2 truncate px-1 text-xs text-gray-400">{user?.userId ?? ''}</div>
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

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
          <h1 className="text-sm font-medium text-gray-500">Super Admin Console</h1>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
