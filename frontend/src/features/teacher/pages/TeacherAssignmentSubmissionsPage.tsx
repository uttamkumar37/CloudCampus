import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAssignmentSubmissions, gradeSubmission } from '../api/teacherAssignmentApi';
import type { AssignmentSubmission, SubmissionStatus } from '../api/teacherAssignmentApi';

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  PENDING:   'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  LATE:      'bg-orange-100 text-orange-700',
  GRADED:    'bg-green-100 text-green-700',
};

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id: string) { return id.slice(0, 8) + '…'; }

// ── Inline grade form ─────────────────────────────────────────────────────────

function GradeForm({
  sub,
  assignmentId,
  onClose,
}: {
  sub: AssignmentSubmission;
  assignmentId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [marks,    setMarks]    = useState(sub.marksObtained?.toString() ?? '');
  const [feedback, setFeedback] = useState(sub.feedback ?? '');
  const [error,    setError]    = useState('');

  const gradeMutation = useMutation({
    mutationFn: () => gradeSubmission(assignmentId, sub.id, {
      marksObtained: parseFloat(marks),
      feedback: feedback.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignment-submissions', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!marks || isNaN(parseFloat(marks)) || parseFloat(marks) < 0) {
      setError('Enter a valid non-negative marks value.');
      return;
    }
    gradeMutation.mutate();
  }

  return (
    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Marks Obtained</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Feedback (optional)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Write feedback for the student…"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={gradeMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {gradeMutation.isPending ? 'Saving…' : 'Save Grade'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherAssignmentSubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate         = useNavigate();
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);

  const { data: submissions = [], isLoading, isError } = useQuery({
    queryKey: ['teacher-assignment-submissions', assignmentId],
    queryFn: () => listAssignmentSubmissions(assignmentId!),
    enabled: !!assignmentId,
  });

  const graded    = submissions.filter((s) => s.status === 'GRADED').length;
  const submitted = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'LATE').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Assignment Submissions</h2>
          <p className="text-sm text-gray-500">
            {submissions.length} submitted · {graded} graded · {submitted} pending grading
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
        <div className="space-y-2">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">
                      Student: {shortId(sub.studentId)}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[sub.status]}`}>
                      {sub.status}
                    </span>
                    {sub.marksObtained !== null && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {sub.marksObtained} marks
                      </span>
                    )}
                  </div>
                  {sub.textResponse && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-3">{sub.textResponse}</p>
                  )}
                  {sub.feedback && (
                    <p className="mt-1 text-xs text-gray-500 italic">Feedback: {sub.feedback}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Submitted: {formatDateTime(sub.submittedAt)}
                    {sub.gradedAt && ` · Graded: ${formatDateTime(sub.gradedAt)}`}
                  </p>
                </div>

                {(sub.status === 'SUBMITTED' || sub.status === 'LATE' || sub.status === 'GRADED') && (
                  <button
                    onClick={() => setGradingSubId(gradingSubId === sub.id ? null : sub.id)}
                    className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade'}
                  </button>
                )}
              </div>

              {gradingSubId === sub.id && (
                <GradeForm
                  sub={sub}
                  assignmentId={assignmentId!}
                  onClose={() => setGradingSubId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
