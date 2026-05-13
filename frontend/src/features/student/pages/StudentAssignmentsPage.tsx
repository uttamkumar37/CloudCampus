import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyAssignments, submitAssignment } from '../api/studentPortalApi';
import type { AssignmentView } from '../api/studentPortalApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  LATE:      'bg-orange-100 text-orange-700',
  GRADED:    'bg-green-100 text-green-700',
};

function SubmitForm({
  assignment,
  onClose,
}: {
  assignment: AssignmentView;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const qc = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => submitAssignment(assignment.assignmentId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      onClose();
    },
  });

  return (
    <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 space-y-3">
      <p className="text-xs font-medium text-indigo-700">Your response for: {assignment.title}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your response here… (max 5000 characters)"
        rows={5}
        maxLength={5000}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
      <p className="text-right text-xs text-gray-400">{text.length}/5000</p>
      {isError && (
        <p className="text-xs text-red-600">Submission failed. Please try again.</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => mutate()}
          disabled={isPending || text.trim().length === 0}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Submitting…' : 'Submit'}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data: assignments = [], isLoading, isError } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: getMyAssignments,
  });

  const pending  = assignments.filter((a) => !a.submitted);
  const done     = assignments.filter((a) => a.submitted);

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load assignments. Try refreshing.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Assignments</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {pending.length} pending · {done.length} submitted
        </p>
      </div>

      {assignments.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No assignments published yet.
        </div>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Pending</h2>
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.assignmentId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{a.title}</div>
                    {a.description && (
                      <div className="mt-0.5 text-sm text-gray-500">{a.description}</div>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {a.dueDate && <span>Due: {formatDate(a.dueDate)}</span>}
                      {a.dueDate && isOverdue(a.dueDate) && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-600">
                          Overdue
                        </span>
                      )}
                      {a.maxMarks != null && (
                        <span>Max marks: {a.maxMarks}</span>
                      )}
                    </div>
                  </div>
                  {submittingId !== a.assignmentId && (
                    <button
                      onClick={() => setSubmittingId(a.assignmentId)}
                      className="ml-4 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Submit
                    </button>
                  )}
                </div>

                {submittingId === a.assignmentId && (
                  <SubmitForm
                    assignment={a}
                    onClose={() => setSubmittingId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Submitted</h2>
          <div className="space-y-2">
            {done.map((a) => (
              <div key={a.assignmentId} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{a.title}</div>
                    {a.submittedAt && (
                      <div className="mt-0.5 text-xs text-gray-400">
                        Submitted {formatDate(a.submittedAt)}
                      </div>
                    )}
                    {a.submissionStatus === 'GRADED' && (
                      <div className="mt-1 text-sm">
                        <span className="font-semibold text-green-700">
                          {a.marksObtained ?? '—'} / {a.maxMarks ?? '—'} marks
                        </span>
                        {a.feedback && (
                          <p className="mt-1 text-xs text-gray-600 italic">"{a.feedback}"</p>
                        )}
                      </div>
                    )}
                  </div>
                  {a.submissionStatus && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[a.submissionStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.submissionStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
