import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getChildAttendance,
  getChildResults,
  getChildHomework,
  getChildTimetable,
  getChildFees,
} from '../api/parentApi';
import { DAYS_OF_WEEK } from '@/features/timetable/types/timetable';
import type { DayOfWeek, TimetableSlot } from '@/features/timetable/types/timetable';

type Tab = 'attendance' | 'homework' | 'results' | 'timetable' | 'fees';

const TABS: { key: Tab; label: string }[] = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'homework',   label: 'Homework' },
  { key: 'results',    label: 'Results' },
  { key: 'timetable',  label: 'Timetable' },
  { key: 'fees',       label: 'Fees' },
];

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function currency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// ── Attendance Tab ─────────────────────────────────────────────────────────────

function AttendanceTab({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['parent-child-attendance', studentId],
    queryFn: () => getChildAttendance(studentId),
  });

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading…</div>;
  if (isError || !data) {
    return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load attendance.</div>;
  }

  const pct = data.attendancePct;
  const color = pct >= 85 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      <div className={`text-center text-5xl font-bold ${color}`}>{pct}%</div>
      <p className="text-center text-sm text-gray-500">Attendance rate</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', value: data.present, color: 'bg-green-50 text-green-700' },
          { label: 'Absent',  value: data.absent,  color: 'bg-red-50 text-red-700' },
          { label: 'Late',    value: data.late,    color: 'bg-amber-50 text-amber-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} text-center`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
        Total sessions: {data.totalSessions}
      </div>
    </div>
  );
}

// ── Homework Tab ───────────────────────────────────────────────────────────────

function HomeworkTab({ studentId }: { studentId: string }) {
  const { data: hw = [], isLoading, isError } = useQuery({
    queryKey: ['parent-child-homework', studentId],
    queryFn: () => getChildHomework(studentId),
  });

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading…</div>;
  if (isError) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load homework.</div>;

  if (hw.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No homework assigned.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {hw.map((h) => (
        <li key={h.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium text-gray-900">{h.title}</div>
              {h.description && <div className="mt-0.5 text-sm text-gray-500">{h.description}</div>}
              <div className="mt-1 text-xs text-gray-400">Due: {formatDate(h.dueDate)}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              h.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
              h.status === 'CLOSED'    ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {h.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Results Tab ────────────────────────────────────────────────────────────────

function ResultsTab({ studentId }: { studentId: string }) {
  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['parent-child-results', studentId],
    queryFn: () => getChildResults(studentId),
  });

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading…</div>;
  if (isError) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load results.</div>;

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No exam results yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
          <tr>
            <th className="px-4 py-3 text-right">Marks</th>
            <th className="px-4 py-3 text-right">%</th>
            <th className="px-4 py-3 text-center">Grade</th>
            <th className="px-4 py-3 text-center">Rank</th>
            <th className="px-4 py-3 text-center">Passed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-right">
                {r.totalMarksObtained ?? '—'} / {r.totalMarksPossible ?? '—'}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                  {r.grade ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-gray-600">{r.rank ?? '—'}</td>
              <td className="px-4 py-3 text-center">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {r.passed ? 'Yes' : 'No'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Timetable Tab ─────────────────────────────────────────────────────────────

const MAX_PERIODS = 8;
const PERIODS = Array.from({ length: MAX_PERIODS }, (_, i) => i + 1);
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat',
};

function TimetableTab({ studentId }: { studentId: string }) {
  const { data: slots = [], isLoading, isError } = useQuery({
    queryKey: ['parent-child-timetable', studentId],
    queryFn: () => getChildTimetable(studentId),
  });

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading…</div>;
  if (isError) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load timetable.</div>;

  function slotAt(day: DayOfWeek, period: number): TimetableSlot | undefined {
    return slots.find((s) => s.dayOfWeek === day && s.periodNumber === period);
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No timetable assigned to this class yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-14 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-400">P</th>
            {DAYS_OF_WEEK.map((day) => (
              <th key={day} className="px-3 py-2 text-center text-xs font-semibold uppercase text-gray-400">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <td className="px-3 py-2 text-xs font-semibold text-gray-300">P{period}</td>
              {DAYS_OF_WEEK.map((day) => {
                const slot = slotAt(day, period);
                return (
                  <td key={day} className="px-1 py-1 text-center">
                    {slot ? (
                      <div className="inline-flex min-w-[80px] flex-col rounded-lg bg-emerald-50 px-2 py-1.5 text-left">
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {slot.subjectName ?? slot.subjectCode ?? slot.subjectId.slice(0, 8)}
                        </span>
                        {slot.startTime && (
                          <span className="text-[10px] text-emerald-400">
                            {slot.startTime.slice(0, 5)}{slot.endTime ? `–${slot.endTime.slice(0, 5)}` : ''}
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
  );
}

// ── Fees Tab ───────────────────────────────────────────────────────────────────

const FEE_STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  PAID:    'bg-green-100 text-green-700',
  WAIVED:  'bg-gray-100 text-gray-500',
  OVERDUE: 'bg-red-100 text-red-700',
};

function FeesTab({ studentId }: { studentId: string }) {
  const { data: fees = [], isLoading, isError } = useQuery({
    queryKey: ['parent-child-fees', studentId],
    queryFn: () => getChildFees(studentId),
  });

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading…</div>;
  if (isError) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load fee records.</div>;

  if (fees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No fee records found.
      </div>
    );
  }

  const totalDue     = fees.reduce((s, f) => s + f.amountDue, 0);
  const totalPaid    = fees.reduce((s, f) => s + f.amountPaid, 0);
  const totalBalance = fees.reduce((s, f) => s + f.balance, 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-3 text-center">
          <div className="text-xs font-medium text-gray-500">Total Due</div>
          <div className="mt-1 text-lg font-bold text-gray-800">{currency(totalDue)}</div>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <div className="text-xs font-medium text-green-600">Paid</div>
          <div className="mt-1 text-lg font-bold text-green-700">{currency(totalPaid)}</div>
        </div>
        <div className={`rounded-xl p-3 text-center ${totalBalance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`text-xs font-medium ${totalBalance > 0 ? 'text-red-500' : 'text-gray-500'}`}>Balance</div>
          <div className={`mt-1 text-lg font-bold ${totalBalance > 0 ? 'text-red-700' : 'text-gray-700'}`}>
            {currency(totalBalance)}
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Due</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-center">Due Date</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fees.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{f.categoryName}</td>
                <td className="px-4 py-3 text-right text-gray-700">{currency(f.amountDue)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{currency(f.amountPaid)}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{currency(f.balance)}</td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">{formatDate(f.dueDate)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FEE_STATUS_BADGE[f.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ParentChildPage() {
  const { studentId = '' } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/parent/dashboard')}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Child Details</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'attendance' && <AttendanceTab studentId={studentId} />}
        {activeTab === 'homework'   && <HomeworkTab   studentId={studentId} />}
        {activeTab === 'results'    && <ResultsTab    studentId={studentId} />}
        {activeTab === 'timetable'  && <TimetableTab  studentId={studentId} />}
        {activeTab === 'fees'       && <FeesTab        studentId={studentId} />}
      </div>
    </div>
  );
}
