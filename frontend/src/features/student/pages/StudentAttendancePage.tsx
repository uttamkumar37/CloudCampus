import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMyAttendance } from '../api/studentPortalApi';
import type { AttendanceStatus } from '../api/studentPortalApi';
import { qrSelfMark } from '@/features/attendance/api/attendanceApi';

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT:  'bg-red-100 text-red-700',
  LATE:    'bg-amber-100 text-amber-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
};

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function StudentAttendancePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-attendance'],
    queryFn:  getMyAttendance,
  });

  const [qrToken, setQrToken] = useState('');
  const [qrSuccess, setQrSuccess] = useState(false);

  const qrMark = useMutation({
    mutationFn: () => qrSelfMark(qrToken.trim()),
    onSuccess: () => {
      setQrSuccess(true);
      setQrToken('');
    },
    onError: () => setQrSuccess(false),
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-400">Loading attendance…</div>;
  }
  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load attendance. Try refreshing.
        </div>
      </div>
    );
  }

  const { totalSessions, presentCount, absentCount, lateCount, attendancePct, recent } = data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Attendance</h1>
        <p className="mt-0.5 text-sm text-gray-500">{totalSessions} total session{totalSessions !== 1 ? 's' : ''} recorded</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryCard label="Total"     value={totalSessions} color="text-gray-800" />
        <SummaryCard label="Present"   value={presentCount}  color="text-green-600" />
        <SummaryCard label="Absent"    value={absentCount}   color="text-red-600" />
        <SummaryCard label="Late"      value={lateCount}     color="text-amber-600" />
        <SummaryCard label="Overall %" value={`${attendancePct}%`}
          color={attendancePct >= 75 ? 'text-green-600' : 'text-red-600'} />
      </div>

      {/* Percentage bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Attendance Rate</span>
          <span className={`font-bold ${attendancePct >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {attendancePct}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${attendancePct >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, attendancePct)}%` }}
          />
        </div>
        {attendancePct < 75 && (
          <p className="mt-2 text-xs text-red-600">
            Below the 75% attendance requirement.
          </p>
        )}
      </div>

      {/* QR self-check-in */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-indigo-700">Check in via QR Token</p>
        <p className="mb-3 text-xs text-indigo-500">
          Enter the token shown on your teacher's screen to mark yourself present.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={qrToken}
            onChange={(e) => { setQrToken(e.target.value); setQrSuccess(false); }}
            placeholder="Paste QR token here"
            className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() => qrMark.mutate()}
            disabled={!qrToken.trim() || qrMark.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {qrMark.isPending ? 'Marking…' : 'Mark Present'}
          </button>
        </div>
        {qrSuccess && (
          <p className="mt-2 text-xs font-medium text-green-700">
            You have been marked present successfully.
          </p>
        )}
        {qrMark.isError && (
          <p className="mt-2 text-xs font-medium text-red-700">
            Failed to mark attendance. The token may be expired or invalid.
          </p>
        )}
      </div>

      {/* Recent records */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Recent Sessions {recent.length > 0 ? `(last ${recent.length})` : ''}
        </h2>

        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
            No attendance records yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-500">P{r.period}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
