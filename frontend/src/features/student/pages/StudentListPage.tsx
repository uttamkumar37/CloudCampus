import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listStudents, listStudentsByClass, listStudentsBySection } from '../api/studentApi';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listClasses } from '@/features/school-admin/api/classApi';
import { listSections } from '@/features/school-admin/api/sectionApi';
import type { StudentStatus } from '../types/student';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<StudentStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  GRADUATED: 'bg-blue-100 text-blue-700',
  TRANSFERRED: 'bg-yellow-100 text-yellow-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

const STATUS_OPTIONS: { value: StudentStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;

  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState<StudentStatus | ''>('');
  const [yearId, setYearId]       = useState('');
  const [classId, setClassId]     = useState('');
  const [sectionId, setSectionId] = useState('');

  const [committed, setCommitted] = useState<{
    search: string; status: StudentStatus | '';
    classId: string; sectionId: string;
  }>({ search: '', status: '', classId: '', sectionId: '' });

  function applyFilters() {
    setCommitted({ search: search.trim(), status, classId, sectionId });
  }

  // Cascading dropdowns
  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn:  () => listAcademicYears(schoolId!),
    enabled:  !!schoolId,
  });

  const effectiveYearId = yearId || years.find((y) => y.isCurrent)?.id || years[0]?.id || '';

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn:  () => listClasses(effectiveYearId),
    enabled:  !!effectiveYearId,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', classId],
    queryFn:  () => listSections(classId),
    enabled:  !!classId,
  });

  // Maps for name resolution in the table
  const classMap   = new Map(classes.map((c) => [c.id, c.name]));
  const sectionMap = new Map(sections.map((s) => [s.id, s.name]));

  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', schoolId, committed.status, committed.search, committed.classId, committed.sectionId],
    queryFn: () => {
      if (committed.sectionId) return listStudentsBySection(committed.sectionId);
      if (committed.classId)   return listStudentsByClass(committed.classId);
      return listStudents(schoolId!, {
        status: committed.status || undefined,
        search: committed.search || undefined,
      });
    },
    enabled: !!schoolId,
  });

  if (!schoolId) {
    return (
      <div className="p-6">
        <p className="text-sm text-amber-600">
          School ID not available in session. Please log out and log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">{data.length} records</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to="/school-admin/students/bulk"
            className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Bulk Import
          </Link>
          <Link
            to="/school-admin/students/admit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Admit Student
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Search by name or number…"
          className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StudentStatus | '')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={yearId || effectiveYearId}
          onChange={(e) => { setYearId(e.target.value); setClassId(''); setSectionId(''); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((y) => (
            <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' ★' : ''}</option>
          ))}
        </select>
        <select
          value={classId}
          onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!effectiveYearId}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!classId}
        >
          <option value="">All sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={applyFilters}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Search
        </button>
      </div>

      {/* States */}
      {isLoading && (
        <p className="text-sm text-gray-500" role="status">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-red-600" role="alert">Failed to load students.</p>
      )}
      {data && data.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">No students match the current filter.</p>
      )}

      {/* Table */}
      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.photoUrl ? (
                        <img
                          src={s.photoUrl}
                          alt={`${s.firstName} ${s.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{s.studentNumber}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.classId ? classMap.get(s.classId) ?? '—' : '—'}
                    {s.sectionId ? ` / ${sectionMap.get(s.sectionId) ?? '—'}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[s.status]}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/school-admin/students/${s.id}`}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      View Profile
                    </Link>
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
