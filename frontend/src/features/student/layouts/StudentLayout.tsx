import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const NAV = [
  { label: 'Dashboard',   to: '/student/dashboard'   },
  { label: 'Homework',    to: '/student/homework'    },
  { label: 'Assignments', to: '/student/assignments' },
  { label: 'Timetable',  to: '/student/timetable'   },
  { label: 'Results',    to: '/student/results'     },
  { label: 'Fees',       to: '/student/fees'        },
  { label: 'Attendance', to: '/student/attendance'  },
  { label: 'Notices',    to: '/student/notices'     },
];

export function StudentLayout() {
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate  = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-52 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-100 px-4">
          <span className="text-base font-bold text-indigo-700">CloudCampus</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <div className="mb-1 px-1 text-xs font-medium text-gray-500">Student Portal</div>
          <div className="mb-2 truncate px-1 text-xs text-gray-400">{user?.userId ?? ''}</div>
          <Link
            to="/change-password"
            className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
          <h1 className="text-sm font-medium text-gray-500">Student Portal</h1>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
