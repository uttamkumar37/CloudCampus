import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getStudentResult } from '../api/resultApi';
import type { ExamResultResponse } from '../types/result';

const GRADE_COLOURS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-800',
  A:   'bg-green-100 text-green-800',
  B:   'bg-blue-100 text-blue-800',
  C:   'bg-yellow-100 text-yellow-800',
  D:   'bg-orange-100 text-orange-800',
  F:   'bg-red-100 text-red-800',
};

export default function ReportCardPage() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const { data: result, isLoading } = useQuery<ExamResultResponse>({
    queryKey: ['exam-result-student', schoolId, examId, studentId],
    queryFn:  () => getStudentResult(schoolId, examId!, studentId!),
    enabled:  !!schoolId && !!examId && !!studentId,
  });

  if (isLoading) {
    return <p className="p-8 text-gray-500 text-center">Loading…</p>;
  }

  if (!result) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Result not found. Please generate results first.</p>
        <Link
          to={`/school-admin/exams/${examId}/results`}
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          ← Back to Results
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/school-admin/exams" className="hover:underline">
          Exams
        </Link>{' '}
        /{' '}
        <Link to={`/school-admin/exams/${examId}`} className="hover:underline">
          Exam Detail
        </Link>{' '}
        /{' '}
        <Link to={`/school-admin/exams/${examId}/results`} className="hover:underline">
          Results
        </Link>{' '}
        / Report Card
      </nav>

      {/* Print button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 print:hidden"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Report card header */}
      <div className="bg-white border rounded-xl p-6 mb-4 print:shadow-none">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Report Card</h1>
            <p className="text-sm text-gray-500 mt-1">
              Student ID:{' '}
              <span className="font-mono text-gray-700">{result.studentId}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Generated: {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-3xl font-extrabold px-4 py-1 rounded-lg ${GRADE_COLOURS[result.grade] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {result.grade}
            </span>
            <p
              className={`mt-2 text-sm font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}
            >
              {result.passed ? '✓ PASSED' : '✗ FAILED'}
            </p>
          </div>
        </div>

        {/* Aggregate row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {result.totalMarksObtained.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Marks Obtained</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {result.totalMarksPossible.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Total Marks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {result.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Percentage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">#{result.rank ?? '—'}</p>
            <p className="text-xs text-gray-500">Rank</p>
          </div>
        </div>
      </div>

      {/* Per-subject breakdown */}
      {result.subjects && result.subjects.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Subject-wise Breakdown</h2>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Paper</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Total</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Obtained</th>
                <th className="text-center px-4 py-2 text-gray-500 font-medium">Absent</th>
                <th className="text-center px-4 py-2 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.subjects.map((s) => (
                <tr key={s.examSubjectId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                    {s.subjectName.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {s.totalMarks.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {s.isAbsent ? (
                      <span className="text-gray-400 italic">Absent</span>
                    ) : (
                      s.marksObtained.toFixed(1)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.isAbsent ? (
                      <span className="text-xs text-orange-600 font-medium">AB</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${s.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {s.isAbsent ? 'Fail' : s.passed ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 print:hidden">
        <Link
          to={`/school-admin/exams/${examId}/results`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Results List
        </Link>
      </div>
    </div>
  );
}
