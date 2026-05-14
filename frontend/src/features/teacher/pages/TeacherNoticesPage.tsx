import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

type NoticeCategory = 'GENERAL' | 'ACADEMIC' | 'EXAM' | 'FEE' | 'HOLIDAY' | 'CIRCULAR' | 'URGENT';

interface NoticeItem {
  id:          string;
  title:       string;
  content:     string;
  category:    NoticeCategory;
  target:      string;
  priority:    number;
  publishedAt: string | null;
  expiresAt:   string | null;
  createdAt:   string;
}

async function getTeacherNotices(page: number, category?: NoticeCategory): Promise<PageResponse<NoticeItem>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<NoticeItem>>>(
    '/v1/mobile/notices',
    { params: { page, limit: 25, ...(category ? { category } : {}) } },
  );
  return data.data!;
}

const CATEGORIES: NoticeCategory[] = ['GENERAL', 'ACADEMIC', 'EXAM', 'FEE', 'HOLIDAY', 'CIRCULAR', 'URGENT'];

const CATEGORY_BADGE: Record<NoticeCategory, string> = {
  GENERAL:  'bg-gray-100 text-gray-700',
  ACADEMIC: 'bg-blue-100 text-blue-700',
  EXAM:     'bg-purple-100 text-purple-700',
  FEE:      'bg-yellow-100 text-yellow-800',
  HOLIDAY:  'bg-green-100 text-green-700',
  CIRCULAR: 'bg-indigo-100 text-indigo-700',
  URGENT:   'bg-red-100 text-red-700',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TeacherNoticesPage() {
  const [page, setPage]       = useState(0);
  const [category, setCategory] = useState<NoticeCategory | ''>('');
  const limit = 25;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['teacher-notices', page, category],
    queryFn:  () => getTeacherNotices(page, category || undefined),
  });

  const items      = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">School Notices</h1>
        <p className="mt-0.5 text-sm text-gray-500">Published announcements from school administration</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as NoticeCategory | ''); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-gray-400">{total} notice{total !== 1 ? 's' : ''}</span>
      </div>

      {isLoading && <div className="py-12 text-center text-sm text-gray-400">Loading notices…</div>}

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
        {items.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${n.priority >= 50 ? 'border-red-200' : 'border-gray-200'}`}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[n.category]}`}>
                {n.category}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">→ {n.target}</span>
              {n.priority >= 50 && (
                <span className="text-xs font-bold text-red-600">HIGH PRIORITY</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{n.content}</p>
            <p className="mt-2 text-xs text-gray-400">
              Published {formatDate(n.publishedAt)}
              {n.expiresAt && ` · Expires ${formatDate(n.expiresAt)}`}
            </p>
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
