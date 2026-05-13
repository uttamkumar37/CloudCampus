import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listNotificationLogs,
  sendEmail,
  sendPush,
} from '../api/notificationApi';
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationTemplateCode,
} from '../types/notification';

// ── Zod schemas ───────────────────────────────────────────────────────────────

const TEMPLATE_CODES: NotificationTemplateCode[] = [
  'WELCOME_STUDENT',
  'FEE_RECEIPT',
  'FEE_REMINDER',
  'ATTENDANCE_ALERT',
  'GENERIC',
];

const emailSchema = z.object({
  to: z.string().min(1, 'Email is required').email('Invalid email address'),
  templateCode: z.enum(
    ['WELCOME_STUDENT', 'FEE_RECEIPT', 'FEE_REMINDER', 'ATTENDANCE_ALERT', 'GENERIC'],
    { message: 'Template is required' },
  ),
});

const pushSchema = z.object({
  userId: z.string().uuid('Must be a valid UUID'),
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  body: z.string().min(1, 'Body is required').max(500, 'Max 500 characters'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PushFormValues = z.infer<typeof pushSchema>;

// ── Badge helpers ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<NotificationStatus, string> = {
  QUEUED: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

const CHANNEL_BADGE: Record<NotificationChannel, string> = {
  EMAIL: 'bg-blue-100 text-blue-800',
  SMS: 'bg-purple-100 text-purple-800',
  PUSH: 'bg-indigo-100 text-indigo-800',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationLogPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';

  const [tab, setTab] = useState<'log' | 'email' | 'push'>('log');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // ── Email form ────────────────────────────────────────────────────────────
  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  const emailMutation = useMutation({
    mutationFn: (values: EmailFormValues) =>
      sendEmail(schoolId, { ...values, variables: {} }),
    onSuccess: () => {
      setEmailSuccess('Email queued — check the log tab for delivery status.');
      setEmailError('');
      emailForm.reset();
    },
    onError: (err: Error) => {
      setEmailError(err.message || 'Failed to queue email');
      setEmailSuccess('');
    },
  });

  // ── Push form ─────────────────────────────────────────────────────────────
  const pushForm = useForm<PushFormValues>({ resolver: zodResolver(pushSchema) });
  const [pushSuccess, setPushSuccess] = useState('');
  const [pushError, setPushError] = useState('');

  const pushMutation = useMutation({
    mutationFn: (values: PushFormValues) =>
      sendPush(schoolId, { ...values }),
    onSuccess: () => {
      setPushSuccess('Push notification queued — check the log tab for delivery status.');
      setPushError('');
      pushForm.reset();
    },
    onError: (err: Error) => {
      setPushError(err.message || 'Failed to queue push notification');
      setPushSuccess('');
    },
  });

  // ── Log query ─────────────────────────────────────────────────────────────
  const { data: logPage, isLoading, isError } = useQuery({
    queryKey: ['notification-logs', schoolId, page],
    queryFn: () => listNotificationLogs(schoolId, page, pageSize),
    enabled: !!schoolId && tab === 'log',
  });

  const logs = logPage?.items ?? [];
  const total = logPage?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Notifications</h2>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {([['log', 'Dispatch Log'], ['email', 'Send Email'], ['push', 'Send Push']] as const).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors',
                tab === key
                  ? 'border-b-2 border-blue-600 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {/* ── Log tab ─────────────────────────────────────────────────────── */}
      {tab === 'log' && (
        <>
          {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
          {isError && <p className="text-sm text-red-600">Failed to load notification logs.</p>}
          {!isLoading && !isError && logs.length === 0 && (
            <p className="text-sm text-gray-500">No notifications dispatched yet.</p>
          )}

          {logs.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Channel', 'Template', 'Recipient', 'Subject', 'Status', 'Sent At', 'Created'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_BADGE[log.channel]}`}
                          >
                            {log.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.templateCode ?? '—'}</td>
                        <td className="max-w-[180px] truncate px-4 py-3 text-gray-700">
                          {log.recipient}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">
                          {log.subject ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[log.status]}`}
                            title={log.errorMessage ?? undefined}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(log.sentAt)}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {page + 1} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Send Email tab ───────────────────────────────────────────────── */}
      {tab === 'email' && (
        <div className="max-w-lg">
          <p className="mb-4 text-sm text-gray-500">
            Send a templated email immediately. The dispatch runs asynchronously — check the Log
            tab for delivery status.
          </p>

          {emailSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {emailSuccess}
            </div>
          )}
          {emailError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{emailError}</div>
          )}

          <form
            onSubmit={emailForm.handleSubmit((v) => emailMutation.mutate(v))}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Recipient Email
              </label>
              <input
                {...emailForm.register('to')}
                type="email"
                placeholder="parent@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {emailForm.formState.errors.to && (
                <p className="mt-1 text-xs text-red-600">
                  {emailForm.formState.errors.to.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Template</label>
              <select
                {...emailForm.register('templateCode')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select template…</option>
                {TEMPLATE_CODES.map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              {emailForm.formState.errors.templateCode && (
                <p className="mt-1 text-xs text-red-600">
                  {emailForm.formState.errors.templateCode.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={emailMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {emailMutation.isPending ? 'Sending…' : 'Send Email'}
            </button>
          </form>
        </div>
      )}

      {/* ── Send Push tab ────────────────────────────────────────────────── */}
      {tab === 'push' && (
        <div className="max-w-lg">
          <p className="mb-4 text-sm text-gray-500">
            Send a push notification to all registered devices for a user. Requires Firebase to be
            configured server-side ({' '}
            <code className="rounded bg-gray-100 px-1 text-xs">APP_FIREBASE_ENABLED=true</code>
            {' '}).
          </p>

          {pushSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {pushSuccess}
            </div>
          )}
          {pushError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{pushError}</div>
          )}

          <form
            onSubmit={pushForm.handleSubmit((v) => pushMutation.mutate(v))}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">User ID (UUID)</label>
              <input
                {...pushForm.register('userId')}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {pushForm.formState.errors.userId && (
                <p className="mt-1 text-xs text-red-600">
                  {pushForm.formState.errors.userId.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                {...pushForm.register('title')}
                placeholder="Notification title"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {pushForm.formState.errors.title && (
                <p className="mt-1 text-xs text-red-600">
                  {pushForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Body</label>
              <textarea
                {...pushForm.register('body')}
                rows={3}
                placeholder="Notification message body"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {pushForm.formState.errors.body && (
                <p className="mt-1 text-xs text-red-600">
                  {pushForm.formState.errors.body.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pushMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {pushMutation.isPending ? 'Sending…' : 'Send Push'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
