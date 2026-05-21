import { useMemo, useState } from 'react';
import { DAYS_OF_WEEK } from '../types/timetable';
import type { DayOfWeek, TimetableSlot } from '../types/timetable';

const MAX_PERIODS = 8;
const PERIODS = Array.from({ length: MAX_PERIODS }, (_, i) => i + 1);

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
};

const FULL_DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};

function startOfSchoolWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addWeeks(date: Date, weeks: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + weeks * 7);
  return copy;
}

function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatRange(start: Date): string {
  const end = addDays(start, 5);
  return `${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

function weekOffsetLabel(weekStart: Date, currentWeekStart: Date): string {
  const diffMs = weekStart.getTime() - currentWeekStart.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  if (diffWeeks === 0) return 'This week';
  if (diffWeeks === -1) return 'Last week';
  if (diffWeeks === 1) return 'Next week';
  return diffWeeks < 0 ? `${Math.abs(diffWeeks)} weeks ago` : `${diffWeeks} weeks ahead`;
}

export function WeeklyTimetableView({
  slots,
  emptyMessage,
  slotTone = 'indigo',
}: {
  slots: TimetableSlot[];
  emptyMessage: string;
  slotTone?: 'indigo' | 'blue' | 'emerald';
}) {
  const today = useMemo(() => new Date(), []);
  const currentWeekStart = useMemo(() => startOfSchoolWeek(today), [today]);
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const dayDates = useMemo(() => DAYS_OF_WEEK.map((_, index) => addDays(weekStart, index)), [weekStart]);
  const toneClasses = {
    indigo: 'bg-indigo-50 text-indigo-800 text-indigo-500',
    blue: 'bg-blue-50 text-blue-800 text-blue-500',
    emerald: 'bg-emerald-50 text-emerald-800 text-emerald-500',
  }[slotTone].split(' ');

  function slotAt(day: DayOfWeek, period: number): TimetableSlot | undefined {
    return slots.find((slot) => slot.dayOfWeek === day && slot.periodNumber === period);
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Selected school week</p>
          <h2 className="mt-1 text-lg font-bold text-gray-950">{weekOffsetLabel(weekStart, currentWeekStart)}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{formatRange(weekStart)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setWeekStart(addWeeks(weekStart, -1))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Last week
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(currentWeekStart)}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Next week
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Period
              </th>
              {DAYS_OF_WEEK.map((day, index) => {
                const isToday = sameDate(dayDates[index], today);
                return (
                  <th
                    key={day}
                    className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-indigo-700' : 'text-gray-500'}`}
                    title={FULL_DAY_LABELS[day]}
                  >
                    <span className="block">{DAY_LABELS[day]}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold normal-case ${isToday ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-400'}`}>
                      {formatDate(dayDates[index])}
                    </span>
                  </th>
                );
              })}
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
                        <div className={`inline-flex min-w-[90px] flex-col rounded-lg ${toneClasses[0]} px-3 py-2 text-left`}>
                          <span className={`text-xs font-semibold ${toneClasses[1]}`}>
                            {slot.subjectName ?? slot.subjectCode ?? 'Subject'}
                          </span>
                          {slot.startTime && (
                            <span className={`text-[10px] ${toneClasses[2]}`}>
                              {slot.startTime.slice(0, 5)}
                              {slot.endTime ? `-${slot.endTime.slice(0, 5)}` : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-200">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
