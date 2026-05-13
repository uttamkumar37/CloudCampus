import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listNotices, createNotice, publishNotice, deleteNotice,
} from '../api/noticeApi';
import type { NoticeCategory, NoticeTarget, NoticeCreateRequest } from '../api/noticeApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: NoticeCategory[] = ['GENERAL','ACADEMIC','EXAM','FEE','HOLIDAY','CIRCULAR','URGENT'];
const TARGETS: NoticeTarget[]       = ['ALL','STUDENT','PARENT','TEACHER','STAFF'];

const CATEGORY_BADGE: Record<NoticeCategory, string> = {
  GENERAL:  'bg-gray-100 text-gray-700',
  ACADEMIC: 'bg-blue-100 text-blue-700',
  EXAM:     'bg-purple-100 text-purple-700',
  FEE:      'bg-yellow-100 text-yellow-800',
  HOLIDAY:  'bg-green-100 text-green-700',
  CIRCULAR: 'bg-indigo-100 text-indigo-700',
  URGENT:   'bg-red-100 text-red-700',
};

const EMPTY_FORM: NoticeCreateRequest = {
  title: '', content: '', category: 'GENERAL', target: 'ALL',
  priority: 0, expiresAt: null, publishImmediately: false,
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Create panel ──────────────────────────────────────────────────────────────

function CreatePanel({ schoolId, onClose }: { schoolId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<NoticeCreateRequest>(EMPTY_FORM);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (body: NoticeCreateRequest) => createNotice(schoolId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices', schoolId] });
      onClose();
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      setError(err?.response?.data?.error?.message ?? 'Failed to create notice');
    },
  });

  function set<K extends keyof NoticeCreateRequest>(k: K, v: NoticeCreateRequest[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }
    mutation.mutate(form);
  }

  return (
    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
      <h2 className="mb-4 text-sm font-semibold text-blue-800">New Notice</h2>
      {error && <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text" value={form.title} maxLength={300} required
          onChange={(e) => set('title', e.target.value)}
          placeholder="Notice title *"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          value={form.content} rows={4} required
          onChange={(e) => set('content', e.target.value)}
          placeholder="Notice content *"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value as NoticeCategory)}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Target</label>
            <select value={form.target} onChange={(e) => set('target', e.target.value as NoticeTarget)}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Priority (0–100)</label>
            <input type="number" value={form.priority} min={0} max={100}
              onChange={(e) => set('priority', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Expires on</label>
            <input type="date" value={form.expiresAt?.slice(0, 10) ?? ''}
              onChange={(e) => set('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.publishImmediately}
              onChange={(e) => set('publishImmediately', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600" />
            Publish immediately
          </label>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={mutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {mutation.isPending ? 'Saving…' : form.publishImmediately ? 'Publish Notice' : 'Save as Draft'}
          </button>
          <button type="button" onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NoticeBoardPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate]       = useState(false);
  const [filterCategory, setFilterCategory] = useState<NoticeCategory | ''>('');
  const [filterPublished, setFilterPublished] = useState<'' | 'true' | 'false'>('');

  const { data, isLoading } = useQuery({
    queryKey: ['notices', schoolId, filterCategory, filterPublished],
    queryFn: () => listNotices(schoolId, {
      category:  filterCategory  || undefined,
      published: filterPublished === '' ? undefined : filterPublished === 'true',
      size: 50,
    }),
    enabled: !!schoolId,
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishNotice(schoolId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices', schoolId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotice(schoolId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices', schoolId] }),
  });

  const notices = data?.items ?? [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notice Board</h1>
          <p className="mt-0.5 text-sm text-gray-500">Publish announcements for students, parents, and staff</p>
        </div>
        {!showCreate && (
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + New Notice
          </button>
        )}
      </div>

      {/* Create panel */}
      {showCreate && <CreatePanel schoolId={schoolId} onClose={() => setShowCreate(false)} />}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as NoticeCategory | '')}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPublished} onChange={(e) => setFilterPublished(e.target.value as '' | 'true' | 'false')}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All statuses</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>
        <span className="self-center text-xs text-gray-400">
          {notices.length} notice{notices.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
      ) : notices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-400">
          No notices found.{' '}
          <button onClick={() => setShowCreate(true)} className="text-blue-600 hover:underline">
            Create the first one.
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id}
              className={`rounded-xl border bg-white p-4 ${n.priority >= 50 ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[n.category]}`}>
                      {n.category}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      → {n.target}
                    </span>
                    {!n.published && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        DRAFT
                      </span>
                    )}
                    {n.priority >= 50 && (
                      <span className="text-xs font-bold text-red-600">HIGH PRIORITY</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{n.content}</p>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Posted {formatDate(n.createdAt)}
                    {n.publishedAt && ` · Published ${formatDate(n.publishedAt)}`}
                    {n.expiresAt && ` · Expires ${formatDate(n.expiresAt)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!n.published && (
                    <button
                      onClick={() => publishMutation.mutate(n.id)}
                      disabled={publishMutation.isPending}
                      className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50">
                      Publish
                    </button>
                  )}
                  {!n.published && (
                    <button
                      onClick={() => { if (confirm('Delete this draft notice?')) deleteMutation.mutate(n.id); }}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
