import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getExam } from '../api/examApi';
import { listMarks, bulkSaveMarks } from '../api/marksApi';
import { listStudentsByClass } from '@/features/student/api/studentApi';
import type { StudentSummaryResponse } from '@/features/student/types/student';
import type { ExamSubjectResponse } from '../types/exam';

// ── Row state type ────────────────────────────────────────────────────────────

interface RowState {
  studentId: string;
  marksObtained: string; // string for input binding; parse on submit
  isAbsent: boolean;
  remarks: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MarksEntryPage() {
  const { examId, subjectEntryId } = useParams<{ examId: string; subjectEntryId: string }>();
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<RowState[]>([]);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', schoolId, examId],
    queryFn: () => getExam(schoolId, examId!),
    enabled: !!schoolId && !!examId,
  });

  // Find the specific paper in the exam
  const paper: ExamSubjectResponse | undefined = useMemo(
    () => exam?.subjects.find((s) => s.id === subjectEntryId),
    [exam, subjectEntryId],
  );

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students-by-class', paper?.classId],
    queryFn: () => listStudentsByClass(paper!.classId),
    enabled: !!paper?.classId,
  });

  const { data: existingMarks = [] } = useQuery({
    queryKey: ['marks', schoolId, examId, subjectEntryId],
    queryFn: () => listMarks(schoolId, examId!, subjectEntryId!),
    enabled: !!schoolId && !!examId && !!subjectEntryId,
  });

  // ── Initialise rows when students + existing marks are loaded ─────────────

  useEffect(() => {
    if (students.length === 0) return;

    const existingMap = new Map(existingMarks.map((m) => [m.studentId, m]));

    setRows(
      students.map((s: StudentSummaryResponse) => {
        const existing = existingMap.get(s.id);
        return {
          studentId: s.id,
          marksObtained: existing?.marksObtained != null ? String(existing.marksObtained) : '',
          isAbsent: existing?.isAbsent ?? false,
          remarks: existing?.remarks ?? '',
        };
      }),
    );
  }, [students, existingMarks]);

  // ── Save mutation ─────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: () => {
      const entries = rows.map((row) => ({
        studentId: row.studentId,
        marksObtained: row.isAbsent
          ? 0
          : row.marksObtained !== ''
          ? parseFloat(row.marksObtained)
          : null,
        isAbsent: row.isAbsent,
        remarks: row.remarks || undefined,
      }));
      return bulkSaveMarks(schoolId, examId!, subjectEntryId!, { entries });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks', schoolId, examId, subjectEntryId] });
      setSaveOk(true);
      setSaveError('');
      setTimeout(() => setSaveOk(false), 3000);
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Failed to save marks');
      setSaveOk(false);
    },
  });

  // ── Row helpers ───────────────────────────────────────────────────────────

  function updateRow(idx: number, patch: Partial<RowState>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function markAllAbsent() {
    setRows((prev) => prev.map((r) => ({ ...r, isAbsent: true, marksObtained: '0' })));
  }

  function clearAll() {
    setRows((prev) => prev.map((r) => ({ ...r, isAbsent: false, marksObtained: '', remarks: '' })));
  }

  // ── Derived stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const entered = rows.filter((r) => r.isAbsent || r.marksObtained !== '').length;
    const absent  = rows.filter((r) => r.isAbsent).length;
    const passed  = rows.filter((r) => {
      if (r.isAbsent || r.marksObtained === '' || !paper) return false;
      return parseFloat(r.marksObtained) >= paper.passingMarks;
    }).length;
    return { entered, absent, passed };
  }, [rows, paper]);

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoading = examLoading || studentsLoading;

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (!exam || !paper) return <div className="p-6 text-sm text-red-600">Paper not found.</div>;

  const studentMap = new Map(students.map((s: StudentSummaryResponse) => [s.id, s]));

  const inputCls =
    'w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100';

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-xs text-gray-500">
        <Link to="/school-admin/exams" className="text-indigo-500 hover:underline">Exams</Link>
        {' / '}
        <Link to={`/school-admin/exams/${examId}`} className="text-indigo-500 hover:underline">
          {exam.name}
        </Link>
        {' / '}
        Marks Entry
      </div>

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Marks Entry</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {exam.name} · Paper date: {paper.examDate} · Total: {paper.totalMarks} · Pass: {paper.passingMarks}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllAbsent}
            className="rounded-lg border border-orange-300 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50"
          >
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-4 flex gap-6 rounded-lg bg-indigo-50 px-5 py-3 text-sm">
        <span>
          <span className="font-semibold text-indigo-700">{rows.length}</span>
          <span className="ml-1 text-gray-500">Students</span>
        </span>
        <span>
          <span className="font-semibold text-green-700">{stats.entered}</span>
          <span className="ml-1 text-gray-500">Marks entered</span>
        </span>
        <span>
          <span className="font-semibold text-orange-700">{stats.absent}</span>
          <span className="ml-1 text-gray-500">Absent</span>
        </span>
        <span>
          <span className="font-semibold text-emerald-700">{stats.passed}</span>
          <span className="ml-1 text-gray-500">Passed</span>
        </span>
      </div>

      {/* Marks grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Roll No.</th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Marks (/{paper.totalMarks})
              </th>
              <th className="w-24 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Absent</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => {
              const student = studentMap.get(row.studentId);
              const marksNum = row.marksObtained !== '' ? parseFloat(row.marksObtained) : null;
              const isPassed = marksNum != null && marksNum >= paper.passingMarks;
              const isFailed = marksNum != null && marksNum < paper.passingMarks;

              return (
                <tr key={row.studentId} className={row.isAbsent ? 'bg-orange-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2.5 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {student ? `${student.firstName} ${student.lastName}` : row.studentId.slice(0, 8) + '…'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {student?.studentNumber ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={paper.totalMarks}
                      disabled={row.isAbsent}
                      value={row.isAbsent ? '' : row.marksObtained}
                      onChange={(e) => updateRow(idx, { marksObtained: e.target.value })}
                      className={`${inputCls} ${
                        isPassed ? 'border-green-400 bg-green-50' :
                        isFailed ? 'border-red-300 bg-red-50' : ''
                      }`}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={row.isAbsent}
                      onChange={(e) =>
                        updateRow(idx, {
                          isAbsent: e.target.checked,
                          marksObtained: e.target.checked ? '0' : '',
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => updateRow(idx, { remarks: e.target.value })}
                      className={inputCls}
                      placeholder="Optional note…"
                      maxLength={200}
                    />
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No students found for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="mt-4 flex items-center gap-4">
        <button
          disabled={saveMutation.isPending || rows.length === 0}
          onClick={() => saveMutation.mutate()}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving…' : `Save All (${rows.length} students)`}
        </button>
        <Link
          to={`/school-admin/exams/${examId}`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to exam
        </Link>

        {saveOk && (
          <span className="text-sm font-medium text-green-600">✓ Marks saved successfully</span>
        )}
        {saveError && (
          <span className="text-sm text-red-600">{saveError}</span>
        )}
      </div>
    </div>
  );
}
