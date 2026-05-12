import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listSubjects } from '@/features/school-admin/api/subjectApi';
import { getAssignment, listSubmissions, updateAssignmentStatus, gradeSubmission } from '../api/assignmentApi';
import type { AssignmentStatus, AssignmentSubmission, GradeSubmissionRequest } from '../types/assignment';

const STATUS_BADGE: Record<AssignmentStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-blue-100 text-blue-700',
  CLOSED:    'bg-red-100 text-red-600',
};

const SUB_BADGE: Record<string, string> = {
  PENDING:   'bg-gray-100 text-gray-500',
  SUBMITTED: 'bg-green-100 text-green-700',
  LATE:      'bg-orange-100 text-orange-700',
  GRADED:    'bg-purple-100 text-purple-700',
};

function formatTs(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const navigate  = useNavigate();
  const queryClient = useQueryClient();

  // Grade modal state
  const [gradingSub, setGradingSub] = useState<AssignmentSubmission | null>(null);
  const [gradeForm, setGradeForm]   = useState({ marks: '', feedback: '' });
  const [gradeError, setGradeError] = useState('');

  const { data: assignment, isLoading: aLoading } = useQuery({
    queryKey: ['assignment', schoolId, assignmentId],
    queryFn: () => getAssignment(schoolId, assignmentId!),
    enabled: !!(schoolId && assignmentId),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => listSubjects(schoolId),
    enabled: !!schoolId,
  });

  const { data: submissions = [], isLoading: sLoading } = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => listSubmissions(schoolId, assignmentId!),
    enabled: !!(schoolId && assignmentId && assignment?.status !== 'DRAFT'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: AssignmentStatus) =>
      updateAssignmentStatus(schoolId, assignmentId!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignment', schoolId, assignmentId] }),
  });

  const gradeMutation = useMutation({
    mutationFn: (body: GradeSubmissionRequest) =>
      gradeSubmission(schoolId, assignmentId!, gradingSub!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
      setGradingSub(null);
      setGradeForm({ marks: '', feedback: '' });
      setGradeError('');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      setGradeError(err?.response?.data?.error?.message ?? 'Failed to grade');
    },
  });

  function handleGradeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGradeError('');
    if (!gradeForm.marks) { setGradeError('Marks are required'); return; }
    const marks = Number(gradeForm.marks);
    if (isNaN(marks) || marks < 0) { setGradeError('Invalid marks'); return; }
    if (assignment?.maxMarks != null && marks > assignment.maxMarks) {
      setGradeError(`Marks cannot exceed ${assignment.maxMarks}`);
      return;
    }
    gradeMutation.mutate({ marksObtained: marks, feedback: gradeForm.feedback || undefined });
  }

  if (aLoading) {
    return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  }

  if (!assignment) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Assignment not found.{' '}
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  const subjectLabel = subjects.find((s) => s.id === assignment.subjectId)?.name ?? '—';
  const nextStatus: AssignmentStatus | null =
    assignment.status === 'DRAFT' ? 'PUBLISHED' :
    assignment.status === 'PUBLISHED' ? 'CLOSED' : null;

  const submitted   = submissions.filter((s) => s.status !== 'PENDING').length;
  const graded      = submissions.filter((s) => s.status === 'GRADED').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="mb-2 text-xs text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{assignment.title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{subjectLabel} · Due {assignment.dueDate}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[assignment.status]}`}>
            {assignment.status}
          </span>
          {nextStatus && (
            <button
              onClick={() => statusMutation.mutate(nextStatus)}
              disabled={statusMutation.isPending}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {nextStatus === 'PUBLISHED' ? 'Publish' : 'Close'}
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-400">Max Marks</p>
          <p className="mt-0.5 font-semibold text-gray-800">{assignment.maxMarks ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Submissions</p>
          <p className="mt-0.5 font-semibold text-gray-800">{submitted} / {submissions.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Graded</p>
          <p className="mt-0.5 font-semibold text-gray-800">{graded}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Status</p>
          <p className="mt-0.5 font-semibold text-gray-800">{assignment.status}</p>
        </div>
      </div>

      {assignment.description && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Instructions</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">{assignment.description}</p>
        </div>
      )}

      {/* Submissions table */}
      {assignment.status === 'DRAFT' ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          Publish this assignment to start receiving submissions.
        </div>
      ) : sLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading submissions…</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          No submissions yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Submissions ({submissions.length})</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Student ID', 'Status', 'Submitted', 'Marks', 'Feedback', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{sub.studentId.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SUB_BADGE[sub.status]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatTs(sub.submittedAt)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {sub.marksObtained != null
                      ? `${sub.marksObtained}${assignment.maxMarks != null ? ` / ${assignment.maxMarks}` : ''}`
                      : '—'}
                  </td>
                  <td className="max-w-[160px] px-4 py-3 text-xs text-gray-500 truncate">
                    {sub.feedback ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {(sub.status === 'SUBMITTED' || sub.status === 'LATE') && (
                      <button
                        onClick={() => { setGradingSub(sub); setGradeForm({ marks: '', feedback: '' }); setGradeError(''); }}
                        className="rounded-md border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Grade
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade modal */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Grade Submission
              <span className="ml-2 font-mono text-xs text-gray-400">{gradingSub.studentId.slice(0, 8)}…</span>
            </h2>
            {gradeError && (
              <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{gradeError}</p>
            )}
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Marks{assignment.maxMarks != null ? ` (max ${assignment.maxMarks})` : ''} *
                </label>
                <input
                  type="number"
                  value={gradeForm.marks}
                  onChange={(e) => setGradeForm((f) => ({ ...f, marks: e.target.value }))}
                  min={0}
                  max={assignment.maxMarks ?? undefined}
                  step="0.5"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Feedback</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))}
                  rows={3}
                  placeholder="Optional feedback for the student…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={gradeMutation.isPending}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {gradeMutation.isPending ? 'Saving…' : 'Save Grade'}
                </button>
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
