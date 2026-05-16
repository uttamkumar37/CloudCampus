import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMyTimetable } from '../api/teacherTimetableApi';
import {
  getAttendanceStudents,
  takeAttendance,
  openSessionWithQr,
  type AttendanceStatus,
  type StudentMark,
  type SessionWithQrResponse,
} from '../api/teacherAttendanceApi';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

const DOW_MAP = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT:  'bg-green-100 text-green-700 border-green-200',
  ABSENT:   'bg-red-100 text-red-600 border-red-200',
  LATE:     'bg-amber-100 text-amber-700 border-amber-200',
  EXCUSED:  'bg-blue-100 text-blue-700 border-blue-200',
};

const ALL_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

interface QrPanelProps {
  slot: TimetableSlot;
  date: string;
}

function QrPanel({ slot, date }: QrPanelProps) {
  const [qr, setQr]           = useState<SessionWithQrResponse | null>(null);
  const [secondsLeft, setSecs] = useState(0);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (expiresAt: string) => {
    const ttl = Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000);
    setSecs(Math.max(0, ttl));
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const { mutate: open, isPending, isError, error } = useMutation({
    mutationFn: () => openSessionWithQr({
      classId:       slot.classId,
      sectionId:     slot.sectionId || undefined,
      academicYearId: slot.academicYearId,
      subjectId:     slot.subjectId || undefined,
      sessionDate:   date,
      periodNumber:  slot.periodNumber,
    }),
    onSuccess: (res) => {
      setQr(res);
      startCountdown(res.expiresAt);
    },
  });

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const expired = qr !== null && secondsLeft === 0;
  const errMsg = (error as { response?: { data?: { error?: { message?: string } } } })
    ?.response?.data?.error?.message ?? 'Failed to generate QR. This period may already have a session.';

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-indigo-900">QR Attendance</h3>
          <p className="text-xs text-indigo-500">Students scan to mark themselves present instantly</p>
        </div>
        <button
          onClick={() => open()}
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? 'Generating…' : qr && !expired ? 'Refresh QR' : 'Generate QR'}
        </button>
      </div>

      {isError && (
        <p className="text-xs text-red-600">{errMsg}</p>
      )}

      {qr && (
        <div className="flex flex-col items-center gap-3">
          <div className={`relative rounded-lg border-2 p-2 bg-white ${expired ? 'border-red-300' : 'border-indigo-400'}`}>
            <img
              src={`data:image/png;base64,${qr.qrBase64}`}
              alt="QR code for attendance"
              className={`h-52 w-52 ${expired ? 'opacity-30' : ''}`}
            />
            {expired && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">Expired</span>
              </div>
            )}
          </div>
          <div className={`text-sm font-semibold tabular-nums ${expired ? 'text-red-500' : secondsLeft <= 30 ? 'text-amber-600' : 'text-indigo-700'}`}>
            {expired ? 'QR expired — click Refresh QR to generate a new one' : `Expires in ${secondsLeft}s`}
          </div>
          <p className="text-xs text-indigo-400">Display this on your screen or projector</p>
        </div>
      )}
    </div>
  );
}

export default function TeacherAttendancePage() {
  const [date, setDate]         = useState(toDateStr(new Date()));
  const [selectedSlot, setSlot] = useState<TimetableSlot | null>(null);
  const [marks, setMarks]       = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved]       = useState(false);

  const { data: allSlots = [] } = useQuery({
    queryKey: ['teacher-timetable'],
    queryFn:  () => getMyTimetable(),
  });

  const dateDay = DOW_MAP[new Date(date + 'T12:00:00').getDay()] ?? '';
  const todaySlots = allSlots
    .filter((s) => s.dayOfWeek === dateDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['attendance-students', selectedSlot?.classId, selectedSlot?.sectionId],
    queryFn:  () => getAttendanceStudents(selectedSlot!.classId, selectedSlot!.sectionId),
    enabled:  !!selectedSlot,
  });

  useEffect(() => {
    if (students.length > 0) {
      const initial: Record<string, AttendanceStatus> = {};
      students.forEach((s) => { initial[s.id] = 'PRESENT'; });
      setMarks(initial);
      setSaved(false);
    }
  }, [students]);

  useEffect(() => {
    setSlot(null);
    setMarks({});
    setSaved(false);
  }, [date]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedSlot) throw new Error('No slot selected');
      const markList: StudentMark[] = students.map((s) => ({
        studentId: s.id,
        status:    marks[s.id] ?? 'ABSENT',
      }));
      return takeAttendance({
        classId:        selectedSlot.classId,
        sectionId:      selectedSlot.sectionId || undefined,
        academicYearId: selectedSlot.academicYearId,
        subjectId:      selectedSlot.subjectId || undefined,
        sessionDate:    date,
        periodNumber:   selectedSlot.periodNumber,
        marks:          markList,
      });
    },
    onSuccess: () => setSaved(true),
  });

  function setStatus(studentId: string, status: AttendanceStatus) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }

  function markAll(status: AttendanceStatus) {
    const bulk: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { bulk[s.id] = status; });
    setMarks(bulk);
    setSaved(false);
  }

  const summary = ALL_STATUSES.map((s) => ({
    status: s,
    count: Object.values(marks).filter((v) => v === s).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Take Attendance</h1>
        <p className="mt-0.5 text-sm text-gray-500">Mark student attendance for your class periods</p>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Date</label>
        <input
          type="date"
          value={date}
          max={toDateStr(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Period slots */}
      {todaySlots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          No classes scheduled for {new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long' })}.
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Select Period</p>
          <div className="flex flex-wrap gap-2">
            {todaySlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => { setSlot(slot); setSaved(false); }}
                className={[
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  selectedSlot?.id === slot.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                Period {slot.periodNumber}
                {slot.startTime ? ` · ${slot.startTime.slice(0, 5)}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR panel — shown as soon as a period is selected */}
      {selectedSlot && (
        <QrPanel slot={selectedSlot} date={date} />
      )}

      {/* Student roster — manual marking */}
      {selectedSlot && (
        <>
          {loadingStudents ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading students…</div>
          ) : students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              No active students found for this class.
            </div>
          ) : (
            <>
              {/* Summary chips */}
              {summary.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {summary.map((s) => (
                    <span key={s.status} className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.status]}`}>
                      {s.status}: {s.count}
                    </span>
                  ))}
                </div>
              )}

              {/* Mark-all shortcuts */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-xs">Mark all:</span>
                {(['PRESENT', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => markAll(s)}
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold transition-all ${STATUS_STYLES[s]}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Student list */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Roll No.</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student, idx) => {
                      const current = marks[student.id] ?? 'PRESENT';
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {student.lastName}, {student.firstName}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs font-mono">{student.studentNumber}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {ALL_STATUSES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setStatus(student.id, s)}
                                  className={[
                                    'rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all',
                                    current === s
                                      ? STATUS_STYLES[s]
                                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300',
                                  ].join(' ')}
                                >
                                  {s}
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

              {/* Save */}
              {saved && !mutation.isPending && (
                <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                  Attendance saved for Period {selectedSlot.periodNumber} on {date}.
                </div>
              )}
              {mutation.isError && (
                <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                  Failed to save attendance. This period may already have attendance recorded.
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || students.length === 0}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {mutation.isPending ? 'Saving…' : `Save Attendance (${students.length} students)`}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
