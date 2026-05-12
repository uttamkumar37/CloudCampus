import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import { listSubjects } from '@/features/school-admin/api/subjectApi';
import { listHomework, updateHomeworkStatus, deleteHomework } from '../api/homeworkApi';
import type { HomeworkStatus } from '../types/homework';

const STATUS_BADGE: Record<HomeworkStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  CLOSED:    'bg-red-100 text-red-600',
};

const NEXT_STATUS: Partial<Record<HomeworkStatus, HomeworkStatus>> = {
  DRAFT:     'PUBLISHED',
  PUBLISHED: 'CLOSED',
};

const NEXT_LABEL: Partial<Record<HomeworkStatus, string>> = {
  DRAFT:     'Publish',
  PUBLISHED: 'Close',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPastDue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

export default function HomeworkListPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();

  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId]               = useState('');
  const [sectionId, setSectionId]           = useState('');
  const [statusFilter, setStatusFilter]     = useState<HomeworkStatus | ''>('');
  const [page, setPage]                     = useState(0);
  const pageSize = 20;

  // ── Reference data ─────────────────────────────────────────────────────────
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', academicYearId],
    queryFn: () => listClasses(academicYearId),
    enabled: !!academicYearId,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => listSections(classId),
    enabled: !!classId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => listSubjects(schoolId),
    enabled: !!schoolId,
  });

  // ── Homework list ───────────────────────────────────────────────────────────
  const { data: hwPage, isLoading } = useQuery({
    queryKey: ['homework', schoolId, academicYearId, classId, sectionId, statusFilter, page],
    queryFn: () => listHomework(schoolId, academicYearId, {
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      status: statusFilter || undefined,
      page,
      size: pageSize,
    }),
    enabled: !!(schoolId && academicYearId),
  });

  const items = hwPage?.items ?? [];
  const total = hwPage?.total ?? 0;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: HomeworkStatus }) =>
      updateHomeworkStatus(schoolId, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homework', schoolId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHomework(schoolId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homework', schoolId] }),
  });

  // ── Filter helpers ─────────────────────────────────────────────────────────
  function subjectName(id: string) {
    return subjects.find((s) => s.id === id)?.name ?? '—';
  }

  function className(id: string) {
    return classes.find((c) => c.id === id)?.name ?? '—';
  }

  function sectionName(id: string | null) {
    if (!id) return 'All sections';
    return sections.find((s) => s.id === id)?.name ?? '—';
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Homework</h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} assignment{total !== 1 ? 's' : ''}</p>
        </div>
        {academicYearId && (
          <Link
            to="/school-admin/homework/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Assignment
          </Link>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={academicYearId}
          onChange={(e) => { setAcademicYearId(e.target.value); setClassId(''); setSectionId(''); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">— Academic Year —</option>
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.id}>{ay.name}</option>
          ))}
        </select>

        <select
          value={classId}
          onChange={(e) => { setClassId(e.target.value); setSectionId(''); setPage(0); }}
          disabled={!academicYearId}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">— Class —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sectionId}
          onChange={(e) => { setSectionId(e.target.value); setPage(0); }}
          disabled={!classId}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">— Section —</option>
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>{sec.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as HomeworkStatus | ''); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">— Status —</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* ── Empty / Loading ───────────────────────────────────────────────────── */}
      {!academicYearId ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          Select an academic year to view homework assignments.
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No assignments found. Click <strong>+ New Assignment</strong> to create one.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Subject', 'Class / Section', 'Due Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((hw) => {
                  const next = NEXT_STATUS[hw.status];
                  const pastDue = isPastDue(hw.dueDate);
                  return (
                    <tr key={hw.id} className="hover:bg-gray-50">
                      <td className="max-w-xs px-4 py-3">
                        <p className="font-medium text-gray-900 truncate">{hw.title}</p>
                        {hw.description && (
                          <p className="mt-0.5 truncate text-xs text-gray-400">{hw.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{subjectName(hw.subjectId)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {className(hw.classId)}
                        <span className="ml-1 text-gray-400">/ {sectionName(hw.sectionId)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={pastDue && hw.status === 'PUBLISHED' ? 'text-red-500 font-medium' : 'text-gray-700'}>
                          {formatDate(hw.dueDate)}
                          {pastDue && hw.status === 'PUBLISHED' && (
                            <span className="ml-1 text-xs">(overdue)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[hw.status]}`}>
                          {hw.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {next && (
                            <button
                              onClick={() => statusMutation.mutate({ id: hw.id, status: next })}
                              disabled={statusMutation.isPending}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {NEXT_LABEL[hw.status]}
                            </button>
                          )}
                          {hw.status === 'DRAFT' && (
                            <button
                              onClick={() => { if (confirm('Delete this assignment?')) deleteMutation.mutate(hw.id); }}
                              disabled={deleteMutation.isPending}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
