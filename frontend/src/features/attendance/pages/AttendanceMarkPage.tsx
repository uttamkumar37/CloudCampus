import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, markAttendance } from '../api/attendanceApi';
import { listStudentsBySection } from '@/features/student/api/studentApi';
import { listStudentsByClass } from '@/features/student/api/studentApi';
import type { AttendanceStatus } from '../types/attendance';
import type { StudentSummaryResponse } from '@/features/student/types/student';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const STATUS_BADGE: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-600',
  LATE: 'bg-yellow-100 text-yellow-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
};

const PERIOD_LABEL: Record<number, string> = {
  0: 'Whole Day',
};

function periodLabel(n: number) {
  return PERIOD_LABEL[n] ?? `Period ${n}`;
}

// ── Row state type ────────────────────────────────────────────────────────────

interface RowState {
  status: AttendanceStatus;
  remarks: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AttendanceMarkPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Session data
  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ['attendance-session', sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
  });

  // Students in the class/section (load once we know class/section IDs)
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-for-session', session?.classId, session?.sectionId],
    queryFn: () =>
      session?.sectionId
        ? listStudentsBySection(session.sectionId)
        : listStudentsByClass(session!.classId),
    enabled: !!session,
  });

  // Build initial row state from existing attendance records
  const initialRows = useMemo<Record<string, RowState>>(() => {
    if (!session || !students) return {};
    const map: Record<string, RowState> = {};
    students.forEach((stu) => {
      const existing = session.records.find((r) => r.studentId === stu.id);
      map[stu.id] = {
        status: existing?.status ?? 'PRESENT',
        remarks: existing?.remarks ?? '',
      };
    });
    return map;
  }, [session, students]);

  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [initialised, setInitialised] = useState(false);

  // Initialise rows once both session + students are available
  if (!initialised && Object.keys(initialRows).length > 0) {
    setRows(initialRows);
    setInitialised(true);
  }

  const { mutate, isPending, isError: saveError } = useMutation({
    mutationFn: ({ lockSession }: { lockSession: boolean }) =>
      markAttendance(sessionId!, {
        records: Object.entries(rows).map(([studentId, r]) => ({
          studentId,
          status: r.status,
          remarks: r.remarks || undefined,
        })),
        lockSession,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setRowStatus(studentId: string, status: AttendanceStatus) {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  }

  function setRowRemarks(studentId: string, remarks: string) {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  }

  function markAll(status: AttendanceStatus) {
    setRows((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (sessionLoading || studentsLoading) {
    return <div className="p-6 text-sm text-gray-500" role="status">Loading…</div>;
  }
  if (sessionError || !session) {
    return (
      <div className="p-6 text-sm text-red-600" role="alert">
        Failed to load attendance session.
      </div>
    );
  }

  const finalized = session.finalized;
  const studentList: StudentSummaryResponse[] = students ?? [];

  const presentCount = Object.values(rows).filter((r) => r.status === 'PRESENT').length;
  const absentCount = Object.values(rows).filter((r) => r.status === 'ABSENT').length;
  const lateCount = Object.values(rows).filter((r) => r.status === 'LATE').length;
  const excusedCount = Object.values(rows).filter((r) => r.status === 'EXCUSED').length;

  return (
    <div className="p-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {finalized ? 'Attendance Record' : 'Mark Attendance'}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {session.sessionDate} · {periodLabel(session.periodNumber)}
          </p>
          {finalized && (
            <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
              Locked — no further changes allowed
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/school-admin/attendance')}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* ── Summary bar ───────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-4">
        {[
          { label: 'Present', count: presentCount, cls: 'text-green-700 bg-green-50' },
          { label: 'Absent', count: absentCount, cls: 'text-red-600 bg-red-50' },
          { label: 'Late', count: lateCount, cls: 'text-yellow-700 bg-yellow-50' },
          { label: 'Excused', count: excusedCount, cls: 'text-blue-700 bg-blue-50' },
        ].map(({ label, count, cls }) => (
          <div
            key={label}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${cls}`}
          >
            {count} {label}
          </div>
        ))}
      </div>

      {/* ── Bulk actions (only if not finalised) ──────────────────────── */}
      {!finalized && studentList.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium text-gray-500">Mark all:</span>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => markAll(s)}
              className={`rounded px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[s]} hover:opacity-80`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          Failed to save attendance. Please try again.
        </div>
      )}

      {/* ── Empty ─────────────────────────────────────────────────────── */}
      {studentList.length === 0 && (
        <p className="text-sm text-gray-500">No students enrolled in this class/section.</p>
      )}

      {/* ── Student grid ──────────────────────────────────────────────── */}
      {studentList.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3 w-36">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((stu, idx) => {
                const row = rows[stu.id] ?? { status: 'PRESENT' as AttendanceStatus, remarks: '' };
                return (
                  <tr
                    key={stu.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {stu.photoUrl ? (
                          <img
                            src={stu.photoUrl}
                            alt={`${stu.firstName} ${stu.lastName}`}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                            {stu.firstName[0]}{stu.lastName[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {stu.firstName} {stu.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {stu.studentNumber}
                    </td>
                    <td className="px-4 py-3">
                      {finalized ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.status]}`}
                        >
                          {row.status}
                        </span>
                      ) : (
                        <select
                          value={row.status}
                          onChange={(e) =>
                            setRowStatus(stu.id, e.target.value as AttendanceStatus)
                          }
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {finalized ? (
                        <span className="text-xs text-gray-500">{row.remarks || '—'}</span>
                      ) : (
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => setRowRemarks(stu.id, e.target.value)}
                          placeholder="Optional remark"
                          maxLength={300}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Save / lock buttons ───────────────────────────────────────── */}
      {!finalized && studentList.length > 0 && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => mutate({ lockSession: false })}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Lock this session? No further changes will be allowed after locking.',
                )
              ) {
                mutate({ lockSession: true });
              }
            }}
            disabled={isPending}
            className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Save & Lock
          </button>
        </div>
      )}
    </div>
  );
}
