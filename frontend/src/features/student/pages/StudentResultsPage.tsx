import { useQuery } from '@tanstack/react-query';
import { getMyResults, type StudentResultSummary } from '../api/studentPortalApi';

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

function PassBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {passed ? 'Pass' : 'Fail'}
    </span>
  );
}

function ResultCard({ r }: { r: StudentResultSummary }) {
  const date = r.generatedAt
    ? new Date(r.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const barWidth = Math.min(100, r.percentage);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{r.examName}</p>
          {r.examType && (
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">{r.examType.replace(/_/g, ' ')}</p>
          )}
        </div>
        <PassBadge passed={r.passed} />
      </div>

      <div>
        <div className="flex items-end justify-between text-sm mb-1">
          <span className="text-gray-500">
            {r.totalMarksObtained} / {r.totalMarksPossible} marks
          </span>
          <span className="font-bold text-gray-900">{pct(r.percentage)}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all ${r.passed ? 'bg-green-500' : 'bg-red-400'}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        {r.grade && (
          <span>
            Grade: <span className="font-semibold text-gray-900">{r.grade}</span>
          </span>
        )}
        {r.rank != null && (
          <span>
            Rank: <span className="font-semibold text-gray-900">#{r.rank}</span>
          </span>
        )}
        <span className="ml-auto text-xs">{date}</span>
      </div>
    </div>
  );
}

export default function StudentResultsPage() {
  const { data: results = [], isLoading } = useQuery<StudentResultSummary[]>({
    queryKey: ['student-results'],
    queryFn:  getMyResults,
  });

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-400">Loading results…</div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">My Results</h2>
        <p className="text-sm text-gray-500">No exam results published yet.</p>
      </div>
    );
  }

  const passed  = results.filter((r) => r.passed).length;
  const failed  = results.length - passed;
  const avgPct  = results.reduce((s, r) => s + r.percentage, 0) / results.length;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">My Results</h2>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Exams', value: results.length, color: 'text-gray-900' },
          { label: 'Passed', value: passed, color: 'text-green-700' },
          { label: 'Failed', value: failed, color: failed > 0 ? 'text-red-600' : 'text-gray-400' },
          { label: 'Avg %', value: pct(avgPct), color: 'text-indigo-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 min-w-[100px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Result cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <ResultCard key={r.resultId} r={r} />
        ))}
      </div>
    </div>
  );
}
