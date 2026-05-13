import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { generateResults, listResults } from '../api/resultApi';
import type { ExamResultResponse } from '../types/result';

const GRADE_COLOURS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-800',
  A:   'bg-green-100 text-green-800',
  B:   'bg-blue-100 text-blue-800',
  C:   'bg-yellow-100 text-yellow-800',
  D:   'bg-orange-100 text-orange-800',
  F:   'bg-red-100 text-red-800',
};

export default function ResultsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const { data: results = [], isLoading } = useQuery<ExamResultResponse[]>({
    queryKey: ['exam-results', schoolId, examId],
    queryFn:  () => listResults(schoolId, examId!),
    enabled:  !!schoolId && !!examId,
  });

  const [generating, setGenerating] = useState(false);
  const generateMutation = useMutation({
    mutationFn: () => generateResults(schoolId, examId!),
    onMutate:   () => setGenerating(true),
    onSettled:  () => setGenerating(false),
    onSuccess:  () =>
      queryClient.invalidateQueries({ queryKey: ['exam-results', schoolId, examId] }),
  });

  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.length - passCount;
  const avg =
    results.length > 0
      ? (results.reduce((s, r) => s + r.percentage, 0) / results.length).toFixed(1)
      : '—';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/school-admin/exams" className="hover:underline">
          Exams
        </Link>{' '}
        /{' '}
        <Link to={`/school-admin/exams/${examId}`} className="hover:underline">
          Exam Detail
        </Link>{' '}
        / Results
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? 'Generating…' : results.length > 0 ? 'Re-generate Results' : 'Generate Results'}
        </button>
      </div>

      {/* Summary bar */}
      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            <p className="text-xs text-gray-500 mt-1">Students</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passCount}</p>
            <p className="text-xs text-gray-500 mt-1">Passed</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failCount}</p>
            <p className="text-xs text-gray-500 mt-1">Failed</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{avg}%</p>
            <p className="text-xs text-gray-500 mt-1">Class Avg</p>
          </div>
        </div>
      )}

      {/* Results table */}
      {isLoading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl">
          <p className="text-gray-500 mb-4">No results yet. Click "Generate Results" to compute.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Rank</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Student ID</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Marks Obtained</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Total Marks</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Percentage</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Grade</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    #{r.rank ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {r.studentId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {r.totalMarksObtained.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {r.totalMarksPossible.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {r.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLOURS[r.grade] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {r.passed ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/school-admin/exams/${examId}/results/students/${r.studentId}`,
                        )
                      }
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Report Card
                    </button>
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
