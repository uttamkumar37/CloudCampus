import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotices } from '../api/parentApi';

const PRIORITY_BADGE: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-gray-100 text-gray-600',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function priorityLabel(p: number) {
  if (p === 1) return 'High';
  if (p === 2) return 'Medium';
  return 'Normal';
}

export default function ParentNoticesPage() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['parent-notices', page],
    queryFn: () => getNotices(page),
  });

  const items      = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">School Notices</h1>
        <p className="mt-0.5 text-sm text-gray-500">{total} notice{total !== 1 ? 's' : ''}</p>
      </div>

      {isLoading && <div className="text-sm text-gray-400">Loading notices…</div>}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load notices. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No notices available.
        </div>
      )}

      <div className="space-y-3">
        {items.map((notice) => (
          <div key={notice.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">{notice.title}</div>
                <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>Category: {notice.category}</span>
                  <span>Published: {formatDate(notice.publishedAt)}</span>
                  {notice.expiresAt && <span>Expires: {formatDate(notice.expiresAt)}</span>}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_BADGE[notice.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                {priorityLabel(notice.priority)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
