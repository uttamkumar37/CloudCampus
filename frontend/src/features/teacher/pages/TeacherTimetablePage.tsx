import { useQuery } from '@tanstack/react-query';
import { getMyTimetable } from '../api/teacherTimetableApi';
import { DAYS_OF_WEEK } from '@/features/timetable/types/timetable';
import type { DayOfWeek, TimetableSlot } from '@/features/timetable/types/timetable';

const MAX_PERIODS = 8;
const PERIODS = Array.from({ length: MAX_PERIODS }, (_, i) => i + 1);

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY:    'Mon',
  TUESDAY:   'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY:  'Thu',
  FRIDAY:    'Fri',
  SATURDAY:  'Sat',
};

export default function TeacherTimetablePage() {
  const { data: slots = [], isLoading, isError } = useQuery({
    queryKey: ['teacher-timetable'],
    queryFn:  () => getMyTimetable(),
  });

  function slotAt(day: DayOfWeek, period: number): TimetableSlot | undefined {
    return slots.find((s) => s.dayOfWeek === day && s.periodNumber === period);
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-400">Loading your timetable…</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load timetable. Make sure your staff profile is linked to your account.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My Timetable</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Your current academic year schedule — {slots.length} period{slots.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center text-sm text-gray-400">
          No timetable slots assigned to you yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Period
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400">P{period}</td>
                  {DAYS_OF_WEEK.map((day) => {
                    const slot = slotAt(day, period);
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        {slot ? (
                          <div className="inline-flex min-w-[90px] flex-col rounded-lg bg-blue-50 px-3 py-2 text-left">
                            <span className="text-xs font-semibold text-blue-800">
                              {slot.subjectName ?? slot.subjectCode ?? slot.subjectId.slice(0, 8)}
                            </span>
                            <span className="mt-0.5 text-[10px] text-blue-500">
                              {slot.classId.slice(0, 8)} / {slot.sectionId.slice(0, 8)}
                            </span>
                            {slot.startTime && (
                              <span className="text-[10px] text-gray-400">
                                {slot.startTime.slice(0, 5)}
                                {slot.endTime ? `–${slot.endTime.slice(0, 5)}` : ''}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
