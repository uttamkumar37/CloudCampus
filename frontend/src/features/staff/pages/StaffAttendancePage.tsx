import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listStaffAttendance,
  markStaffAttendance,
} from '../api/staffAttendanceApi';
import type { StaffAttendanceStatus, StaffAttendanceRow } from '../api/staffAttendanceApi';

const STATUSES: StaffAttendanceStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'];

const STATUS_STYLE: Record<StaffAttendanceStatus, string> = {
  PRESENT:  'bg-green-100 text-green-700 border-green-200',
  ABSENT:   'bg-red-100 text-red-700 border-red-200',
  HALF_DAY: 'bg-amber-100 text-amber-700 border-amber-200',
  ON_LEAVE: 'bg-blue-100 text-blue-700 border-blue-200',
  HOLIDAY:  'bg-gray-100 text-gray-600 border-gray-200',
};

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function StaffAttendancePage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId ?? '');
  const [date, setDate] = useState(toDateInput(new Date()));
  const [overrides, setOverrides] = useState<Record<string, StaffAttendanceStatus>>({});
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const { data: rows = [], isLoading, isError } = useQuery<StaffAttendanceRow[]>({
    queryKey: ['staff-attendance', schoolId, date],
    queryFn: () => listStaffAttendance(schoolId, date),
    enabled: !!schoolId,
  });

  // Reset overrides when date changes or fresh data arrives
  useEffect(() => {
    setOverrides({});
    setSaved(false);
  }, [date, rows]);

  const mutation = useMutation({
    mutationFn: () => {
      const entries = rows.map((r) => ({
        staffId: r.staffId,
        status:  overrides[r.staffId] ?? r.status ?? 'ABSENT' as StaffAttendanceStatus,
        notes:   null,
      }));
      return markStaffAttendance(schoolId, { date, entries });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-attendance', schoolId, date] });
      setSaved(true);
    },
  });

  function setStatus(staffId: string, status: StaffAttendanceStatus) {
    setOverrides((prev) => ({ ...prev, [staffId]: status }));
    setSaved(false);
  }

  function effectiveStatus(row: StaffAttendanceRow): StaffAttendanceStatus {
    return overrides[row.staffId] ?? row.status ?? 'ABSENT';
  }

  const summary = STATUSES.map((s) => ({
    status: s,
    count: rows.filter((r) => effectiveStatus(r) === s).length,
  })).filter((s) => s.count > 0);

  const hasChanges = Object.keys(overrides).length > 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Staff Attendance</h1>
          <p className="mt-0.5 text-sm text-gray-500">{rows.length} staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || rows.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {saved && !hasChanges && (
        <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          Attendance saved for {date}.
        </div>
      )}
      {mutation.isError && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          Failed to save. Please try again.
        </div>
      )}

      {/* Summary chips */}
      {summary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.map((s) => (
            <span key={s.status} className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
              {s.status.replace('_', ' ')}: {s.count}
            </span>
          ))}
        </div>
      )}

      {isLoading && <div className="py-8 text-center text-sm text-gray-400">Loading…</div>}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load staff list.
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No staff members found.
        </div>
      )}

      {/* Attendance table */}
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Staff Member</th>
                <th className="px-4 py-3 text-left">Employee #</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const current = effectiveStatus(row);
                const changed = overrides[row.staffId] !== undefined
                  && overrides[row.staffId] !== row.status;
                return (
                  <tr key={row.staffId} className={changed ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.employeeNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(row.staffId, s)}
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all ${
                              current === s
                                ? STATUS_STYLE[s]
                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                            }`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark all quick actions */}
      {rows.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium">Mark all:</span>
          {(['PRESENT', 'ABSENT', 'HOLIDAY'] as StaffAttendanceStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                const bulk: Record<string, StaffAttendanceStatus> = {};
                rows.forEach((r) => { bulk[r.staffId] = s; });
                setOverrides(bulk);
                setSaved(false);
              }}
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold transition-all ${STATUS_STYLE[s]}`}
            >
              All {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
