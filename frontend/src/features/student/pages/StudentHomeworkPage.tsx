import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyHomework, submitHomework } from '../api/studentPortalApi';
import type { HomeworkResponse } from '../api/studentPortalApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

function isConflictError(error: unknown) {
  const candidate = error as { response?: { status?: number } };
  return candidate.response?.status === 409;
}

function SubmitForm({
  homework,
  onClose,
}: {
  homework: HomeworkResponse;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [alreadyDone, setAlreadyDone] = useState(false);
  const qc = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => submitHomework(homework.id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-homework'] });
      onClose();
    },
    onError: (err: unknown) => {
      if (isConflictError(err)) setAlreadyDone(true);
    },
  });

  if (alreadyDone) {
    return (
      <div className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Already submitted. <button onClick={onClose} className="underline">Close</button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 space-y-3">
      <p className="text-xs font-medium text-indigo-700">Submit for: {homework.title}</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes or comments (optional)…"
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
      {isError && !alreadyDone && (
        <p className="text-xs text-red-600">Failed to submit. Please try again.</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => mutate()}
          disabled={isPending}
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

export default function StudentHomeworkPage() {
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data: homework = [], isLoading, isError } = useQuery({
    queryKey: ['student-homework'],
    queryFn: getMyHomework,
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load homework. Try refreshing.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Homework</h1>
        <p className="mt-0.5 text-sm text-gray-500">{homework.length} assigned</p>
      </div>

      {homework.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No homework assigned yet.
        </div>
      )}

      <div className="space-y-3">
        {homework.map((hw) => (
          <div key={hw.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{hw.title}</div>
                {hw.description && (
                  <div className="mt-0.5 text-sm text-gray-500">{hw.description}</div>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span>Due: {formatDate(hw.dueDate)}</span>
                  {isOverdue(hw.dueDate) && hw.status === 'PUBLISHED' && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-600">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  hw.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  hw.status === 'CLOSED'    ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {hw.status}
                </span>
                {hw.status === 'PUBLISHED' && submittingId !== hw.id && (
                  <button
                    onClick={() => setSubmittingId(hw.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>

            {submittingId === hw.id && (
              <SubmitForm
                homework={hw}
                onClose={() => setSubmittingId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
