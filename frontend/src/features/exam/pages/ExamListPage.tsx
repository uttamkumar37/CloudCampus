import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listExams, updateExamStatus } from '../api/examApi';
import type { ExamStatus, ExamType } from '../types/exam';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ExamStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const TYPE_LABELS: Record<ExamType, string> = {
  UNIT_TEST: 'Unit Test',
  TERM: 'Term',
  HALF_YEARLY: 'Half-Yearly',
  ANNUAL: 'Annual',
  MOCK: 'Mock',
  PRACTICAL: 'Practical',
};

const NEXT_STATUS: Partial<Record<ExamStatus, ExamStatus>> = {
  DRAFT: 'SCHEDULED',
  SCHEDULED: 'ONGOING',
  ONGOING: 'COMPLETED',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExamListPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const queryClient = useQueryClient();

  const { data: examPage, isLoading, isError } = useQuery({
    queryKey: ['exams', schoolId, page],
    queryFn: () => listExams(schoolId, page, pageSize),
    enabled: !!schoolId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ examId, status }: { examId: string; status: ExamStatus }) =>
      updateExamStatus(schoolId, examId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams', schoolId] }),
  });

  const exams = examPage?.items ?? [];
  const total = examPage?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Examinations</h2>
          <p className="mt-0.5 text-sm text-gray-500">Create and manage exams, schedule subject papers</p>
        </div>
        <Link
          to="/school-admin/exams/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Exam
        </Link>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {isError && <p className="text-sm text-red-600">Failed to load exams.</p>}

      {!isLoading && !isError && exams.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500">No exams created yet.</p>
          <Link
            to="/school-admin/exams/create"
            className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
          >
            Create your first exam →
          </Link>
        </div>
      )}

      {exams.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Type', 'Start', 'End', 'Total Marks', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <Link
                        to={`/school-admin/exams/${exam.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {exam.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TYPE_LABELS[exam.examType]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(exam.startDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(exam.endDate)}</td>
                    <td className="px-4 py-3 text-gray-700">{exam.totalMarks}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[exam.status]}`}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/school-admin/exams/${exam.id}`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                        {NEXT_STATUS[exam.status] && (
                          <button
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({
                                examId: exam.id,
                                status: NEXT_STATUS[exam.status]!,
                              })
                            }
                            className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                          >
                            → {NEXT_STATUS[exam.status]}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {page + 1} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
