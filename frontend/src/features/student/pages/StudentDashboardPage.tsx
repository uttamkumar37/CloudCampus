import { useQuery } from '@tanstack/react-query';
import { getMyHomework, getMyAssignments, getMyNotices } from '../api/studentPortalApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: homework = [] } = useQuery({
    queryKey: ['student-homework'],
    queryFn: getMyHomework,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: getMyAssignments,
  });

  const { data: noticesPage } = useQuery({
    queryKey: ['student-notices', 0],
    queryFn: () => getMyNotices(0),
  });

  const pendingAssignments = assignments.filter((a) => !a.submitted).length;
  const noticeCount        = noticesPage?.total ?? 0;

  const stats = [
    { label: 'Homework Items', value: homework.length, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Assignments Pending', value: pendingAssignments, color: 'bg-amber-50 text-amber-700' },
    { label: 'Notices', value: noticeCount, color: 'bg-green-50 text-green-700' },
  ];

  const recentHomework    = homework.slice(0, 3);
  const recentAssignments = assignments.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {user?.userId ?? 'Student'}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Here's what's on your plate today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="mt-0.5 text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Homework */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Homework</h2>
          {recentHomework.length === 0 ? (
            <p className="text-sm text-gray-400">No homework assigned.</p>
          ) : (
            <ul className="space-y-2">
              {recentHomework.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 truncate">{h.title}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    h.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {h.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Assignments */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Assignments</h2>
          {recentAssignments.length === 0 ? (
            <p className="text-sm text-gray-400">No assignments yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentAssignments.map((a) => (
                <li key={a.assignmentId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 truncate">{a.title}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.submitted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {a.submitted ? 'Submitted' : 'Pending'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
