import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listSessionsByDate } from '../api/attendanceApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const PERIOD_LABEL: Record<number, string> = {
  0: 'Whole Day',
  1: 'Period 1',
  2: 'Period 2',
  3: 'Period 3',
  4: 'Period 4',
  5: 'Period 5',
  6: 'Period 6',
  7: 'Period 7',
  8: 'Period 8',
  9: 'Period 9',
  10: 'Period 10',
  11: 'Period 11',
  12: 'Period 12',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function AttendanceSessionListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;
  const [date, setDate] = useState(todayIso());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance-sessions', schoolId, date],
    queryFn: () => listSessionsByDate(schoolId!, date),
    enabled: !!schoolId,
  });

  if (!schoolId) {
    return (
      <div className="p-6">
        <p className="text-sm text-amber-600">
          School ID not available. Please log out and log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attendance Sessions</h2>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {data.length} session{data.length !== 1 ? 's' : ''} on {fmt(date)}
            </p>
          )}
        </div>
        <Link
          to="/school-admin/attendance/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Open Session
        </Link>
      </div>

      {/* Date picker */}
      <div className="mb-5">
        <label className="mr-2 text-sm font-medium text-gray-600">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* States */}
      {isLoading && (
        <p className="text-sm text-gray-500" role="status">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-red-600" role="alert">Failed to load sessions.</p>
      )}
      {data && data.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">No attendance sessions found for this date.</p>
      )}

      {/* Table */}
      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Class ID</th>
                <th className="px-4 py-3">Section ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-900">{fmt(s.sessionDate)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {PERIOD_LABEL[s.periodNumber] ?? `Period ${s.periodNumber}`}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {s.classId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {s.sectionId ? `${s.sectionId.slice(0, 8)}…` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.finalized ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                        Locked
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        Open
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/school-admin/attendance/sessions/${s.id}/mark`}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      {s.finalized ? 'View' : 'Mark Attendance'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
