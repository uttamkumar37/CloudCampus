import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTeacherAssignment, listMyAssignments } from '../api/teacherAssignmentApi';
import type { AssignmentStatus } from '../api/teacherAssignmentApi';
import { getTeacherWorkOptions } from '../api/teacherWorkOptionsApi';
import type { AssignmentCreateRequest } from '@/features/assignments/types/assignment';
import { PageSpinner, useToast } from '@/shared/ui';

const STATUS_BADGE: Record<AssignmentStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  CLOSED:    'bg-red-100 text-red-700',
};

interface FormState {
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: string;
  publishImmediately: boolean;
}

const EMPTY_FORM: FormState = {
  academicYearId: '',
  classId: '',
  sectionId: '',
  subjectId: '',
  title: '',
  description: '',
  dueDate: '',
  maxMarks: '',
  publishImmediately: false,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function isOverdue(dueDate: string, status: AssignmentStatus) {
  return status === 'PUBLISHED' && new Date(dueDate) < new Date();
}

export default function TeacherAssignmentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const size = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['teacher-assignments', page],
    queryFn: () => listMyAssignments(page, size),
  });

  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['teacher-work-options'],
    queryFn: getTeacherWorkOptions,
    enabled: showCreate,
  });

  const filteredClasses = useMemo(
    () => (options?.classes ?? []).filter((c) => c.academicYearId === form.academicYearId),
    [form.academicYearId, options?.classes],
  );

  const filteredSections = useMemo(
    () => (options?.sections ?? []).filter((s) => s.classId === form.classId),
    [form.classId, options?.sections],
  );

  const createMutation = useMutation({
    mutationFn: (body: AssignmentCreateRequest) => createTeacherAssignment(body),
    onSuccess: () => {
      success('Assignment created successfully');
      setForm(EMPTY_FORM);
      setFormError('');
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toastError('Failed to create assignment. Please try again.');
      setFormError(err?.response?.data?.error?.message ?? 'Failed to create assignment');
    },
  });

  const items      = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / size);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'academicYearId') {
        next.classId = '';
        next.sectionId = '';
      }
      if (key === 'classId') next.sectionId = '';
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!form.academicYearId || !form.classId || !form.subjectId || !form.title || !form.dueDate) {
      setFormError('Academic year, class, subject, title, and due date are required');
      return;
    }
    createMutation.mutate({
      academicYearId: form.academicYearId,
      classId: form.classId,
      sectionId: form.sectionId || undefined,
      subjectId: form.subjectId,
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate,
      maxMarks: form.maxMarks ? Number(form.maxMarks) : undefined,
      publishImmediately: form.publishImmediately,
    });
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Assignments</h2>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((open) => !open)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showCreate ? 'Close' : 'New Assignment'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {formError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
          {optionsLoading && <PageSpinner />}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Academic Year *
              <select
                value={form.academicYearId}
                onChange={(event) => set('academicYearId', event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select academic year</option>
                {(options?.academicYears ?? []).map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Subject *
              <select
                value={form.subjectId}
                onChange={(event) => set('subjectId', event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select subject</option>
                {(options?.subjects ?? []).map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Class *
              <select
                value={form.classId}
                onChange={(event) => set('classId', event.target.value)}
                disabled={!form.academicYearId}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                <option value="">Select class</option>
                {filteredClasses.map((classRoom) => (
                  <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Section
              <select
                value={form.sectionId}
                onChange={(event) => set('sectionId', event.target.value)}
                disabled={!form.classId}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                <option value="">All sections</option>
                {filteredSections.map((section) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Title *
            <input
              type="text"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              maxLength={200}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Instructions
            <textarea
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Due Date *
              <input
                type="date"
                value={form.dueDate}
                min={tomorrow()}
                onChange={(event) => set('dueDate', event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Max Marks
              <input
                type="number"
                min={1}
                step="0.5"
                value={form.maxMarks}
                onChange={(event) => set('maxMarks', event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="flex items-center gap-3 pt-6 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.publishImmediately}
                onChange={(event) => set('publishImmediately', event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Publish immediately
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Saving...' : form.publishImmediately ? 'Publish Assignment' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFormError('');
                setShowCreate(false);
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <PageSpinner />}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load assignments. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
          No assignments found.
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Max Marks</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Submissions</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Graded</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((a) => (
                <tr key={a.assignmentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{a.title}</div>
                    {a.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">{a.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {formatDate(a.dueDate)}
                    {isOverdue(a.dueDate, a.status) && (
                      <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {a.maxMarks ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {a.submissionCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      a.gradedCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {a.gradedCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/teacher/assignments/${a.assignmentId}/submissions`)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
