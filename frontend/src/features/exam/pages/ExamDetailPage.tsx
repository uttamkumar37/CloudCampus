import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getExam, updateExamStatus, addExamSubject, removeExamSubject } from '../api/examApi';
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

const STATUS_SEQUENCE: ExamStatus[] = ['DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED'];

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Add Subject Schema ────────────────────────────────────────────────────────

const addSubjectSchema = z.object({
  subjectId: z.string().uuid({ message: 'Valid UUID required' }),
  classId: z.string().uuid({ message: 'Valid UUID required' }),
  examDate: z.string().min(1, 'Date required'),
  totalMarks: z.string().min(1, 'Required'),
  passingMarks: z.string().min(1, 'Required'),
  startTime: z.string().optional(),
  durationMinutes: z.string().optional(),
  roomNumber: z.string().optional(),
});

type AddSubjectForm = z.infer<typeof addSubjectSchema>;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();
  const [showAddSubject, setShowAddSubject] = useState(false);

  const { data: exam, isLoading, isError } = useQuery({
    queryKey: ['exam', schoolId, examId],
    queryFn: () => getExam(schoolId, examId!),
    enabled: !!schoolId && !!examId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ExamStatus) => updateExamStatus(schoolId, examId!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam', schoolId, examId] }),
  });

  const removeMutation = useMutation({
    mutationFn: (entryId: string) => removeExamSubject(schoolId, examId!, entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam', schoolId, examId] }),
  });

  const addSubjectForm = useForm<AddSubjectForm>({
    resolver: zodResolver(addSubjectSchema),
  });

  const addSubjectMutation = useMutation({
    mutationFn: (values: AddSubjectForm) =>
      addExamSubject(schoolId, examId!, {
        subjectId: values.subjectId,
        classId: values.classId,
        examDate: values.examDate,
        totalMarks: parseFloat(values.totalMarks),
        passingMarks: parseFloat(values.passingMarks),
        startTime: values.startTime || undefined,
        durationMinutes: values.durationMinutes ? parseInt(values.durationMinutes) : undefined,
        roomNumber: values.roomNumber || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', schoolId, examId] });
      addSubjectForm.reset();
      setShowAddSubject(false);
    },
  });

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (isError || !exam) return <div className="p-6 text-sm text-red-600">Failed to load exam.</div>;

  const nextStatus = NEXT_STATUS[exam.status];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div>
          <Link to="/school-admin/exams" className="text-xs text-indigo-500 hover:underline">
            ← All Exams
          </Link>
          <h2 className="mt-1 text-xl font-semibold text-gray-800">{exam.name}</h2>
          <p className="text-sm text-gray-500">
            {TYPE_LABELS[exam.examType]} · {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[exam.status]}`}
          >
            {exam.status}
          </span>
          {nextStatus && (
            <button
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(nextStatus)}
              className="rounded-lg border border-indigo-300 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-40"
            >
              Advance → {nextStatus}
            </button>
          )}
          {exam.status !== 'CANCELLED' && exam.status !== 'COMPLETED' && (
            <button
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate('CANCELLED')}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Cancel
            </button>
          )}
          <Link
            to={`/school-admin/exams/${examId}/results`}
            className="rounded-lg border border-green-300 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50"
          >
            View Results
          </Link>
        </div>
      </div>

      {/* Status stepper */}
      <div className="mt-4 mb-6 flex items-center gap-0">
        {STATUS_SEQUENCE.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                exam.status === s
                  ? 'bg-indigo-600 text-white'
                  : STATUS_SEQUENCE.indexOf(exam.status) > i
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-1 text-xs ${
                exam.status === s ? 'font-semibold text-indigo-600' : 'text-gray-400'
              }`}
            >
              {s}
            </span>
            {i < STATUS_SEQUENCE.length - 1 && (
              <div className="mx-2 h-px w-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Details card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-400">Total Marks</dt>
            <dd className="mt-0.5 font-semibold text-gray-800">{exam.totalMarks}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Passing Marks</dt>
            <dd className="mt-0.5 font-semibold text-gray-800">{exam.passingMarks}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Academic Year</dt>
            <dd className="mt-0.5 font-mono text-xs text-gray-500">{exam.academicYearId}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Subject Papers</dt>
            <dd className="mt-0.5 font-semibold text-gray-800">{exam.subjects.length}</dd>
          </div>
        </dl>
        {exam.instructions && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <span className="font-medium">Instructions: </span>
            {exam.instructions}
          </div>
        )}
      </div>

      {/* Subject papers */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-700">Subject Papers</h3>
          {exam.status !== 'COMPLETED' && exam.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowAddSubject((v) => !v)}
              className="rounded-lg border border-indigo-300 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
            >
              {showAddSubject ? 'Cancel' : '+ Add Subject'}
            </button>
          )}
        </div>

        {/* Add subject inline form */}
        {showAddSubject && (
          <form
            onSubmit={addSubjectForm.handleSubmit((v) => addSubjectMutation.mutate(v))}
            className="border-b border-gray-200 bg-indigo-50 p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase text-indigo-700">New Paper</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Subject ID</label>
                <input {...addSubjectForm.register('subjectId')} placeholder="UUID" className={inputCls} />
                {addSubjectForm.formState.errors.subjectId && (
                  <p className="mt-0.5 text-xs text-red-600">{addSubjectForm.formState.errors.subjectId.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Class ID</label>
                <input {...addSubjectForm.register('classId')} placeholder="UUID" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Exam Date</label>
                <input type="date" {...addSubjectForm.register('examDate')} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Start Time</label>
                <input type="time" {...addSubjectForm.register('startTime')} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Duration (min)</label>
                <input type="number" {...addSubjectForm.register('durationMinutes')} placeholder="180" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Total Marks</label>
                <input type="number" step="0.5" {...addSubjectForm.register('totalMarks')} placeholder="100" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Passing Marks</label>
                <input type="number" step="0.5" {...addSubjectForm.register('passingMarks')} placeholder="35" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Room No.</label>
                <input {...addSubjectForm.register('roomNumber')} placeholder="A-101" className={inputCls} />
              </div>
            </div>
            <button
              type="submit"
              disabled={addSubjectMutation.isPending}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {addSubjectMutation.isPending ? 'Adding…' : 'Add Paper'}
            </button>
          </form>
        )}

        {/* Papers table */}
        {exam.subjects.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">No subject papers scheduled yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Subject ID', 'Class ID', 'Date', 'Start', 'Duration', 'Marks (Pass)', 'Room', ''].map((h) => (
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
              {exam.subjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.subjectId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.classId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(s.examDate)}</td>
                  <td className="px-4 py-3 text-gray-500">{s.startTime ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.durationMinutes ? `${s.durationMinutes}m` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.totalMarks} ({s.passingMarks})
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.roomNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/school-admin/exams/${examId}/subjects/${s.id}/marks`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Enter Marks
                      </Link>
                      {exam.status !== 'COMPLETED' && exam.status !== 'CANCELLED' && (
                        <button
                          disabled={removeMutation.isPending}
                          onClick={() => removeMutation.mutate(s.id)}
                          className="text-xs text-red-500 hover:underline disabled:opacity-40"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
