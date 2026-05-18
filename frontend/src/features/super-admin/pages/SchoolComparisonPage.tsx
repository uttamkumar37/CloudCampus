import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTenants, getComparisonReport } from '../api/tenantApi';
import type { SchoolComparisonRow } from '../types/tenant';

type SortKey = 'schoolName' | 'activeStudents' | 'attendanceRate' | 'feeCollectionRate';

function pct(val: number) {
  return `${val.toFixed(1)}%`;
}

function currency(val: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

function AttendanceBadge({ rate }: { rate: number }) {
  const color =
    rate >= 90 ? 'bg-green-100 text-green-700' :
    rate >= 75 ? 'bg-yellow-100 text-yellow-700' :
    rate >   0 ? 'bg-red-100 text-red-600' :
                 'bg-gray-100 text-gray-400';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {rate > 0 ? pct(rate) : '—'}
    </span>
  );
}

function FeeBadge({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? 'bg-green-100 text-green-700' :
    rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
    rate >   0 ? 'bg-red-100 text-red-600' :
                 'bg-gray-100 text-gray-400';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {rate > 0 ? pct(rate) : '—'}
    </span>
  );
}

function SortTh({
  label,
  k,
  active,
  sortAsc,
  onSort,
}: {
  label: string;
  k: SortKey;
  active: boolean;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      onClick={() => onSort(k)}
      className="cursor-pointer select-none px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
    >
      {label}{active ? (sortAsc ? ' ↑' : ' ↓') : ''}
    </th>
  );
}

export function SchoolComparisonPage() {
  const [tenantId, setTenantId] = useState('');
  const [run, setRun] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('schoolName');
  const [sortAsc, setSortAsc] = useState(true);

  const { data: tenantsPage } = useQuery({
    queryKey: ['tenants-list', 0, 200],
    queryFn: () => listTenants(0, 200),
  });
  const tenants = tenantsPage?.items ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comparison-report', tenantId],
    queryFn: () => getComparisonReport(tenantId),
    enabled: run && !!tenantId,
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = data
    ? [...data.schools].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === 'string'
          ? av.localeCompare(bv as string)
          : (av as number) - (bv as number);
        return sortAsc ? cmp : -cmp;
      })
    : [];

  const avgAttendance = sorted.length
    ? sorted.filter((r) => r.attendanceRate > 0).reduce((s, r) => s + r.attendanceRate, 0) /
      (sorted.filter((r) => r.attendanceRate > 0).length || 1)
    : 0;
  const avgFee = sorted.length
    ? sorted.filter((r) => r.feeCollectionRate > 0).reduce((s, r) => s + r.feeCollectionRate, 0) /
      (sorted.filter((r) => r.feeCollectionRate > 0).length || 1)
    : 0;
  const totalStudents = sorted.reduce((s, r) => s + r.activeStudents, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">School Comparison</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Compare attendance, fee collection, and enrolment across all schools in a tenant
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Tenant</label>
          <select
            value={tenantId}
            onChange={(e) => { setTenantId(e.target.value); setRun(false); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[220px]"
          >
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setRun(true)}
          disabled={!tenantId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Run Comparison
        </button>
      </div>

      {isLoading && <div className="py-10 text-center text-sm text-gray-400">Loading…</div>}
      {isError  && <div className="py-6 text-center text-sm text-red-500">Failed to load comparison.</div>}

      {data && (
        <div className="space-y-5">
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Schools',          value: data.totalSchools },
              { label: 'Active Students',  value: totalStudents.toLocaleString() },
              { label: 'Avg Attendance',   value: avgAttendance > 0 ? pct(avgAttendance) : '—' },
              { label: 'Avg Fee Collection', value: avgFee > 0 ? pct(avgFee) : '—' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="mt-0.5 text-lg font-semibold text-gray-800">{c.value}</p>
              </div>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              No schools found for this tenant.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <SortTh label="School" k="schoolName" active={sortKey === 'schoolName'} sortAsc={sortAsc} onSort={toggleSort} />
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Academic Year</th>
                    <SortTh label="Students" k="activeStudents" active={sortKey === 'activeStudents'} sortAsc={sortAsc} onSort={toggleSort} />
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sessions</th>
                    <SortTh label="Attendance" k="attendanceRate" active={sortKey === 'attendanceRate'} sortAsc={sortAsc} onSort={toggleSort} />
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due / Collected</th>
                    <SortTh label="Fee Rate" k="feeCollectionRate" active={sortKey === 'feeCollectionRate'} sortAsc={sortAsc} onSort={toggleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((r: SchoolComparisonRow) => (
                    <tr key={r.schoolId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{r.schoolName}</div>
                        <div className="text-xs text-gray-400">{r.schoolCode}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.academicYearName}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.activeStudents.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{r.totalSessions > 0 ? r.totalSessions : '—'}</td>
                      <td className="px-4 py-3"><AttendanceBadge rate={r.attendanceRate} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.totalDue > 0
                          ? <>{currency(r.totalPaid)} / {currency(r.totalDue)}</>
                          : '—'}
                      </td>
                      <td className="px-4 py-3"><FeeBadge rate={r.feeCollectionRate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
