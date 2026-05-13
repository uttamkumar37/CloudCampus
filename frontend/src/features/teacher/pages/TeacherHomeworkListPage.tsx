import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listMyHomework } from '../api/teacherHomeworkApi';
import type { HomeworkStatus } from '../api/teacherHomeworkApi';

const STATUS_BADGE: Record<HomeworkStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  CLOSED:    'bg-red-100 text-red-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: string, status: HomeworkStatus) {
  return status === 'PUBLISHED' && new Date(dueDate) < new Date();
}

export default function TeacherHomeworkListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['teacher-homework', page],
    queryFn: () => listMyHomework(page, size),
  });

  const items      = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / size);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Homework Assignments</h2>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500">Loading…</div>
      )}
      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load homework. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
          No homework assignments found.
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Submissions</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((hw) => (
                <tr key={hw.homeworkId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{hw.title}</div>
                    {hw.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">{hw.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {formatDate(hw.dueDate)}
                    {isOverdue(hw.dueDate, hw.status) && (
                      <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[hw.status]}`}>
                      {hw.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {hw.submissionCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/teacher/homework/${hw.homeworkId}/submissions`)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      View Submissions →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
