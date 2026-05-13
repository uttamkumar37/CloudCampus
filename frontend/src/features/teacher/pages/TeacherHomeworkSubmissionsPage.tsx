import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSubmissions, reviewSubmission } from '../api/teacherHomeworkApi';
import type { SubmissionStatus } from '../api/teacherHomeworkApi';

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  REVIEWED:  'bg-green-100 text-green-700',
};

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id: string) {
  return id.slice(0, 8) + '…';
}

export default function TeacherHomeworkSubmissionsPage() {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate       = useNavigate();
  const queryClient    = useQueryClient();

  const { data: submissions = [], isLoading, isError } = useQuery({
    queryKey: ['teacher-homework-submissions', homeworkId],
    queryFn: () => listSubmissions(homeworkId!),
    enabled: !!homeworkId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ subId }: { subId: string }) =>
      reviewSubmission(homeworkId!, subId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['teacher-homework-submissions', homeworkId] }),
  });

  const submitted = submissions.filter((s) => s.status === 'SUBMITTED').length;
  const reviewed  = submissions.filter((s) => s.status === 'REVIEWED').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/teacher/homework')}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Homework Submissions</h2>
          <p className="text-sm text-gray-500">
            {submissions.length} submitted · {reviewed} reviewed · {submitted} pending
          </p>
        </div>
      </div>

      {isLoading && <div className="text-sm text-gray-500">Loading…</div>}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load submissions.
        </div>
      )}

      {!isLoading && !isError && submissions.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
          No submissions yet.
        </div>
      )}

      {submissions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Student ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Submitted At</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Reviewed At</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {shortId(sub.studentId)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs">
                    <span className="line-clamp-2">{sub.notes ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {formatDateTime(sub.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[sub.status]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                    {formatDateTime(sub.reviewedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sub.status === 'SUBMITTED' && (
                      <button
                        onClick={() => reviewMutation.mutate({ subId: sub.id })}
                        disabled={reviewMutation.isPending}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark Reviewed
                      </button>
                    )}
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
