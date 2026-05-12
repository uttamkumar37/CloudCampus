import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listStaff } from '../api/staffApi';
import type { StaffStatus, StaffType } from '../types/staff';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<StaffStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  RESIGNED: 'bg-gray-100 text-gray-500',
  TERMINATED: 'bg-red-100 text-red-600',
};

const TYPE_OPTIONS: { value: StaffType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'LAB_ASSISTANT', label: 'Lab Assistant' },
  { value: 'HOSTEL_WARDEN', label: 'Hostel Warden' },
  { value: 'TRANSPORT_STAFF', label: 'Transport Staff' },
  { value: 'ADMIN_STAFF', label: 'Admin Staff' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS: { value: StaffStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'RESIGNED', label: 'Resigned' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const TYPE_LABEL: Record<StaffType, string> = {
  TEACHER: 'Teacher',
  PRINCIPAL: 'Principal',
  VICE_PRINCIPAL: 'Vice Principal',
  ACCOUNTANT: 'Accountant',
  LIBRARIAN: 'Librarian',
  LAB_ASSISTANT: 'Lab Assistant',
  HOSTEL_WARDEN: 'Hostel Warden',
  TRANSPORT_STAFF: 'Transport Staff',
  ADMIN_STAFF: 'Admin Staff',
  OTHER: 'Other',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function StaffListPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? null;

  const [search, setSearch] = useState('');
  const [type, setType] = useState<StaffType | ''>('');
  const [status, setStatus] = useState<StaffStatus | ''>('ACTIVE');
  const [committed, setCommitted] = useState<{
    search: string;
    type: StaffType | '';
    status: StaffStatus | '';
  }>({ search: '', type: '', status: 'ACTIVE' });

  function applyFilters() {
    setCommitted({ search: search.trim(), type, status });
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff', schoolId, committed.status, committed.type, committed.search],
    queryFn: () =>
      listStaff(schoolId!, {
        status: committed.status || undefined,
        type: committed.type || undefined,
        search: committed.search || undefined,
      }),
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
          <h2 className="text-xl font-semibold text-gray-900">Staff</h2>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">{data.length} records</p>
          )}
        </div>
        <Link
          to="/school-admin/staff/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Staff
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Search by name…"
          className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as StaffType | '')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StaffStatus | '')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
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
        <p className="text-sm text-red-600" role="alert">Failed to load staff.</p>
      )}
      {data && data.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">No staff match the current filter.</p>
      )}

      {/* Table */}
      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Emp No.</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Contact</th>
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{s.employeeNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABEL[s.staffType]}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="text-xs">
                      {s.email && <div>{s.email}</div>}
                      {s.phone && <div>{s.phone}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[s.status]}`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/school-admin/staff/${s.id}`}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      View
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
