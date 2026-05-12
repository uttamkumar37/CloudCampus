import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listExams } from '@/features/exam/api/examApi';
import {
  getAttendanceReport,
  getFeeReport,
  getPerformanceReport,
} from '../api/reportApi';

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab = 'attendance' | 'fees' | 'performance';

const TABS: { id: Tab; label: string }[] = [
  { id: 'attendance',  label: 'Attendance'   },
  { id: 'fees',        label: 'Fee Collection' },
  { id: 'performance', label: 'Performance'  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(val: number) {
  return `${val.toFixed(1)}%`;
}

function currency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function shortId(id: string) {
  return id.slice(0, 8) + '…';
}

// ── Attendance tab ────────────────────────────────────────────────────────────

function AttendanceTab({ schoolId }: { schoolId: string }) {
  const [academicYearId, setAcademicYearId] = useState('');
  const [run, setRun] = useState(false);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-attendance', schoolId, academicYearId],
    queryFn: () => getAttendanceReport(schoolId, academicYearId),
    enabled: run && !!academicYearId,
  });

  function handleRun() { setRun(true); }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Academic Year</label>
          <select value={academicYearId} onChange={(e) => { setAcademicYearId(e.target.value); setRun(false); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select year</option>
            {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </div>
        <button onClick={handleRun} disabled={!academicYearId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          Run Report
        </button>
      </div>

      {isLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
      {isError && <div className="py-6 text-center text-sm text-red-500">Failed to load report.</div>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Sessions',  value: data.totalSessions },
              { label: 'Students Tracked', value: data.rows.length },
              { label: 'Avg Attendance',
                value: data.rows.length
                  ? pct(data.rows.reduce((s, r) => s + r.attendancePercentage, 0) / data.rows.length)
                  : '—' },
              { label: 'Below 75%',
                value: data.rows.filter((r) => r.attendancePercentage < 75).length },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="mt-0.5 text-lg font-semibold text-gray-800">{c.value}</p>
              </div>
            ))}
          </div>

          {data.rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              No attendance records found for this academic year.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Student ID', 'Sessions', 'Present', 'Absent', 'Late', 'Excused', 'Attendance %'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((r) => (
                    <tr key={r.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{shortId(r.studentId)}</td>
                      <td className="px-4 py-3 text-gray-700">{r.totalSessions}</td>
                      <td className="px-4 py-3 text-green-700">{r.presentCount}</td>
                      <td className="px-4 py-3 text-red-600">{r.absentCount}</td>
                      <td className="px-4 py-3 text-orange-600">{r.lateCount}</td>
                      <td className="px-4 py-3 text-gray-500">{r.excusedCount}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${r.attendancePercentage < 75 ? 'text-red-600' : 'text-green-700'}`}>
                          {pct(r.attendancePercentage)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Fee Collection tab ────────────────────────────────────────────────────────

function FeeTab({ schoolId }: { schoolId: string }) {
  const [academicYearId, setAcademicYearId] = useState('');
  const [run, setRun] = useState(false);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-fees', schoolId, academicYearId],
    queryFn: () => getFeeReport(schoolId, academicYearId),
    enabled: run && !!academicYearId,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Academic Year</label>
          <select value={academicYearId} onChange={(e) => { setAcademicYearId(e.target.value); setRun(false); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select year</option>
            {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </div>
        <button onClick={() => setRun(true)} disabled={!academicYearId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          Run Report
        </button>
      </div>

      {isLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
      {isError && <div className="py-6 text-center text-sm text-red-500">Failed to load report.</div>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Records',    value: data.totalRecords },
              { label: 'Total Due',        value: currency(data.totalAmountDue) },
              { label: 'Total Collected',  value: currency(data.totalAmountPaid) },
              { label: 'Collection Rate',  value: pct(data.collectionRate) },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="mt-0.5 text-lg font-semibold text-gray-800">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Pending / Overdue', value: data.pendingCount,  color: 'text-red-600' },
              { label: 'Partial',           value: data.partialCount,  color: 'text-orange-600' },
              { label: 'Paid',              value: data.paidCount,     color: 'text-green-700' },
              { label: 'Waived',            value: data.waivedCount,   color: 'text-gray-500' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className={`mt-0.5 text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Performance tab ───────────────────────────────────────────────────────────

function PerformanceTab({ schoolId }: { schoolId: string }) {
  const [academicYearId, setAcademicYearId] = useState('');
  const [examId, setExamId] = useState('');
  const [run, setRun] = useState(false);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: examPage } = useQuery({
    queryKey: ['exams', schoolId, 0, academicYearId],
    queryFn: () => listExams(schoolId, 0, 100, academicYearId || undefined),
    enabled: !!schoolId,
  });

  const exams = examPage?.items ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['report-performance', schoolId, examId],
    queryFn: () => getPerformanceReport(schoolId, examId),
    enabled: run && !!examId,
  });

  const GRADE_COLOR: Record<string, string> = {
    'A+': 'text-green-700', A: 'text-green-600', B: 'text-blue-600',
    C: 'text-yellow-700', D: 'text-orange-600', F: 'text-red-600',
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Academic Year (filter)</label>
          <select value={academicYearId} onChange={(e) => { setAcademicYearId(e.target.value); setExamId(''); setRun(false); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">All years</option>
            {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Exam *</label>
          <select value={examId} onChange={(e) => { setExamId(e.target.value); setRun(false); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px]">
            <option value="">Select exam</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <button onClick={() => setRun(true)} disabled={!examId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          Run Report
        </button>
      </div>

      {isLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
      {isError && <div className="py-6 text-center text-sm text-red-500">Failed to load report. Ensure results have been generated for this exam.</div>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Students',     value: data.totalStudents },
              { label: 'Passed',       value: data.passedCount, extra: 'text-green-700' },
              { label: 'Failed',       value: data.failedCount, extra: 'text-red-600' },
              { label: 'Class Average', value: pct(Number(data.classAverage)) },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className={`mt-0.5 text-lg font-semibold ${c.extra ?? 'text-gray-800'}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {data.rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              No results found. Generate results first from the Exams page.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Rank', 'Student ID', 'Marks', 'Percentage', 'Grade', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((r) => (
                    <tr key={r.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">{r.rank ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{shortId(r.studentId)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {Number(r.totalMarksObtained).toFixed(1)} / {Number(r.totalMarksPossible).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{pct(Number(r.percentage))}</td>
                      <td className={`px-4 py-3 font-bold ${GRADE_COLOR[r.grade] ?? 'text-gray-700'}`}>{r.grade}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const [activeTab, setActiveTab] = useState<Tab>('attendance');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500">Generate attendance, fee collection, and performance reports</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === t.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'attendance'  && <AttendanceTab  schoolId={schoolId} />}
      {activeTab === 'fees'        && <FeeTab         schoolId={schoolId} />}
      {activeTab === 'performance' && <PerformanceTab schoolId={schoolId} />}
    </div>
  );
}
