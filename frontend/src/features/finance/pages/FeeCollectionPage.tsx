import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import { listRecordsBySchool } from '../api/financeApi';
import type { FeeStatus } from '../types/finance';

const STATUS_BADGE: Record<FeeStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARTIAL: 'bg-orange-100 text-orange-700',
  PAID: 'bg-green-100 text-green-700',
  WAIVED: 'bg-gray-100 text-gray-500',
  OVERDUE: 'bg-red-100 text-red-700',
};

const FEE_STATUSES: FeeStatus[] = ['PENDING', 'PARTIAL', 'PAID', 'WAIVED', 'OVERDUE'];

export default function FeeCollectionPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const [selectedYearId, setSelectedYearId] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeeStatus | ''>('');

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['fee-records', schoolId, selectedYearId, statusFilter],
    queryFn: () =>
      listRecordsBySchool(schoolId, selectedYearId, statusFilter || undefined),
    enabled: !!schoolId && !!selectedYearId,
  });

  const totalDue  = records.reduce((sum, r) => sum + r.amountDue, 0);
  const totalPaid = records.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalDisc = records.reduce((sum, r) => sum + r.discount, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee Collection</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage student fee records. Click a record to collect payment.
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedYearId}
          onChange={(e) => setSelectedYearId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select academic year…</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FeeStatus | '')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {FEE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      {selectedYearId && records.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Records', value: records.length.toString() },
            {
              label: 'Total Due (₹)',
              value: totalDue.toLocaleString('en-IN'),
            },
            {
              label: 'Collected (₹)',
              value: totalPaid.toLocaleString('en-IN'),
            },
            {
              label: 'Outstanding (₹)',
              value: (totalDue - totalDisc - totalPaid).toLocaleString('en-IN'),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {!selectedYearId && (
          <div className="p-8 text-center text-sm text-gray-500">
            Select an academic year to view fee records.
          </div>
        )}

        {selectedYearId && isLoading && (
          <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
        )}

        {selectedYearId && !isLoading && records.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            No fee records found for the selected filters.
          </div>
        )}

        {records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium text-right">Due (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Paid (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Balance (₹)</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.categoryName}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.studentId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {Number(r.amountDue).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700">
                      {Number(r.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700">
                      {Number(r.balance).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.dueDate ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/school-admin/fees/records/${r.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View / Pay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
