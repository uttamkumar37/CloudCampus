import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyChildren } from '../api/parentApi';

function AttendanceBar({ pct }: { pct: number }) {
  const color =
    pct >= 85 ? 'bg-green-500' :
    pct >= 70 ? 'bg-amber-400' :
    'bg-red-400';

  return (
    <div className="mt-2">
      <div className="mb-0.5 flex justify-between text-xs text-gray-500">
        <span>Attendance</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function ParentDashboardPage() {
  const navigate = useNavigate();

  const { data: children = [], isLoading, isError } = useQuery({
    queryKey: ['parent-children'],
    queryFn: getMyChildren,
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load children. Try refreshing.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Children</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {children.length} linked student{children.length !== 1 ? 's' : ''}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400">No children linked to your account.</p>
          <p className="mt-1 text-xs text-gray-300">Contact your school administrator to link your child.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <button
              key={child.studentId}
              onClick={() => navigate(`/parent/children/${child.studentId}`)}
              className="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              {/* Avatar */}
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                {child.firstName.charAt(0)}{child.lastName.charAt(0)}
              </div>

              <div className="font-semibold text-gray-900">
                {child.firstName} {child.lastName}
              </div>
              {child.studentNumber && (
                <div className="text-xs text-gray-400">#{child.studentNumber}</div>
              )}
              <div className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 capitalize">
                {child.relationship.toLowerCase()}
              </div>

              <AttendanceBar pct={child.attendancePct} />

              <div className="mt-3 text-xs text-gray-400">
                {child.presentCount} of {child.totalSessions} sessions present
              </div>

              <div className="mt-3 text-xs font-medium text-emerald-600 group-hover:underline">
                View details →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
