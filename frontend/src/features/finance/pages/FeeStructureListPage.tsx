import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listAcademicYears } from '@/features/school-admin/api/academicYearApi';
import {
  listCategories,
  createCategory,
  deactivateCategory,
  listStructures,
} from '../api/financeApi';
import type { CreateFeeCategoryRequest } from '../types/finance';

const FREQ_LABEL: Record<string, string> = {
  ANNUAL: 'Annual',
  TERM: 'Term',
  MONTHLY: 'Monthly',
  ONE_TIME: 'One-time',
};

export default function FeeStructureListPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const qc = useQueryClient();

  const [selectedYearId, setSelectedYearId] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catError, setCatError] = useState('');

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => listAcademicYears(schoolId),
    enabled: !!schoolId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['fee-categories', schoolId],
    queryFn: () => listCategories(schoolId, false),
    enabled: !!schoolId,
  });

  const { data: structures = [], isLoading: loadingStructures } = useQuery({
    queryKey: ['fee-structures', schoolId, selectedYearId],
    queryFn: () => listStructures(schoolId, selectedYearId),
    enabled: !!schoolId && !!selectedYearId,
  });

  const createCatMutation = useMutation({
    mutationFn: (body: CreateFeeCategoryRequest) => createCategory(schoolId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-categories', schoolId] });
      setCatName('');
      setCatDesc('');
      setCatError('');
      setShowCatForm(false);
    },
    onError: (err: Error) => {
      setCatError(err.message || 'Failed to create category');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (catId: string) => deactivateCategory(catId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-categories', schoolId] });
    },
  });

  function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Category name is required');
      return;
    }
    createCatMutation.mutate({ name: catName.trim(), description: catDesc.trim() || undefined });
  }

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fee categories and define amounts per class / academic year.
          </p>
        </div>
        <Link
          to="/school-admin/fees/structures/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Fee Structure
        </Link>
      </div>

      {/* ── Fee Categories ──────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Fee Categories</h2>
          <button
            onClick={() => setShowCatForm((v) => !v)}
            className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            {showCatForm ? 'Cancel' : '+ New Category'}
          </button>
        </div>

        {showCatForm && (
          <form onSubmit={handleCatSubmit} className="mb-4 rounded-lg bg-gray-50 p-4 space-y-3">
            {catError && <p className="text-sm text-red-600">{catError}</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Tuition Fee"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createCatMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createCatMutation.isPending ? 'Saving…' : 'Save Category'}
            </button>
          </form>
        )}

        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories yet. Create one to get started.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                  cat.active
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-100 text-gray-400 line-through'
                }`}
              >
                {cat.name}
                {cat.active && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Deactivate "${cat.name}"?`)) {
                        deactivateMutation.mutate(cat.id);
                      }
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500"
                    title="Deactivate"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Fee Structures ──────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Structures</h2>
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
        </div>

        {!selectedYearId && (
          <p className="text-sm text-gray-500">Select an academic year to view structures.</p>
        )}

        {selectedYearId && loadingStructures && (
          <p className="text-sm text-gray-500">Loading…</p>
        )}

        {selectedYearId && !loadingStructures && structures.length === 0 && (
          <p className="text-sm text-gray-500">
            No fee structures for this year.{' '}
            <Link to="/school-admin/fees/structures/new" className="text-blue-600 hover:underline">
              Add one
            </Link>
            .
          </p>
        )}

        {structures.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">Class</th>
                  <th className="pb-2 pr-4 font-medium">Amount (₹)</th>
                  <th className="pb-2 pr-4 font-medium">Frequency</th>
                  <th className="pb-2 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{s.categoryName}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {s.classId ? s.classId : <span className="italic text-gray-400">All Classes</span>}
                    </td>
                    <td className="py-3 pr-4 text-gray-900">
                      {Number(s.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {FREQ_LABEL[s.frequency] ?? s.frequency}
                    </td>
                    <td className="py-3 text-gray-600">{s.dueDate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
