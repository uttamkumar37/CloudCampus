import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import { listSubjects } from '@/features/school-admin/api/subjectApi';
import { listAssignments, updateAssignmentStatus, deleteAssignment } from '../api/assignmentApi';
import type { AssignmentStatus } from '../types/assignment';

const STATUS_BADGE: Record<AssignmentStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-blue-100 text-blue-700',
  CLOSED:    'bg-red-100 text-red-600',
};

const NEXT_STATUS: Partial<Record<AssignmentStatus, AssignmentStatus>> = {
  DRAFT:     'PUBLISHED',
  PUBLISHED: 'CLOSED',
};

const NEXT_LABEL: Partial<Record<AssignmentStatus, string>> = {
  DRAFT:     'Publish',
  PUBLISHED: 'Close',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AssignmentListPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();

  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId]               = useState('');
  const [sectionId, setSectionId]           = useState('');
  const [statusFilter, setStatusFilter]     = useState<AssignmentStatus | ''>('');
  const [page, setPage]                     = useState(0);
  const pageSize = 20;

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

  const { data: aPage, isLoading } = useQuery({
    queryKey: ['assignments', schoolId, academicYearId, classId, sectionId, statusFilter, page],
    queryFn: () => listAssignments(schoolId, academicYearId, {
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      status: statusFilter || undefined,
      page,
      size: pageSize,
    }),
    enabled: !!(schoolId && academicYearId),
  });

  const items = aPage?.items ?? [];
  const total = aPage?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignmentStatus }) =>
      updateAssignmentStatus(schoolId, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments', schoolId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAssignment(schoolId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments', schoolId] }),
  });

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';
  const className   = (id: string) => classes.find((c) => c.id === id)?.name ?? '—';
  const sectionName = (id: string | null) =>
    id ? sections.find((s) => s.id === id)?.name ?? '—' : 'All sections';

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Assignments</h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} assignment{total !== 1 ? 's' : ''}</p>
        </div>
        {academicYearId && (
          <Link
            to="/school-admin/assignments/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Assignment
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select value={academicYearId}
          onChange={(e) => { setAcademicYearId(e.target.value); setClassId(''); setSectionId(''); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">— Academic Year —</option>
          {academicYears.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
        </select>

        <select value={classId}
          onChange={(e) => { setClassId(e.target.value); setSectionId(''); setPage(0); }}
          disabled={!academicYearId}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50">
          <option value="">— Class —</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={sectionId}
          onChange={(e) => { setSectionId(e.target.value); setPage(0); }}
          disabled={!classId}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50">
          <option value="">— Section —</option>
          {sections.map((sec) => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
        </select>

        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as AssignmentStatus | ''); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">— Status —</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {!academicYearId ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          Select an academic year to view assignments.
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No assignments found.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Subject', 'Class / Section', 'Due Date', 'Max Marks', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((a) => {
                  const next = NEXT_STATUS[a.status];
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="max-w-xs px-4 py-3">
                        <Link
                          to={`/school-admin/assignments/${a.id}`}
                          className="font-medium text-blue-600 hover:underline truncate block"
                        >
                          {a.title}
                        </Link>
                        {a.description && (
                          <p className="mt-0.5 truncate text-xs text-gray-400">{a.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{subjectName(a.subjectId)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {className(a.classId)}
                        <span className="ml-1 text-gray-400">/ {sectionName(a.sectionId)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(a.dueDate)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {a.maxMarks != null ? a.maxMarks : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {next && (
                            <button
                              onClick={() => statusMutation.mutate({ id: a.id, status: next })}
                              disabled={statusMutation.isPending}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {NEXT_LABEL[a.status]}
                            </button>
                          )}
                          {a.status === 'DRAFT' && (
                            <button
                              onClick={() => { if (confirm('Delete this assignment?')) deleteMutation.mutate(a.id); }}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
