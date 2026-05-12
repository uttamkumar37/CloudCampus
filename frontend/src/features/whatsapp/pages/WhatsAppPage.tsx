import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listWhatsAppLogs,
  sendWhatsApp,
  type WhatsAppStatus,
} from '../api/whatsappApi';

// ── Schema ────────────────────────────────────────────────────────────────────

const sendSchema = z.object({
  to: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{7,14}$/, 'Must be E.164 format e.g. +919876543210'),
  templateName: z.string().min(1, 'Template name is required'),
  languageCode: z.string().optional(),
  parameters: z.string().optional(), // comma-separated values, split on submit
});

type FormValues = z.infer<typeof sendSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<WhatsAppStatus, string> = {
  QUEUED: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WhatsAppPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId) ?? '';
  const [tab, setTab] = useState<'log' | 'send'>('log');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({ resolver: zodResolver(sendSchema) });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const sendMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const params = values.parameters
        ? values.parameters
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
      return sendWhatsApp(schoolId, {
        to: values.to,
        templateName: values.templateName,
        languageCode: values.languageCode || undefined,
        parameters: params,
      });
    },
    onSuccess: () => {
      setSuccess('Message queued — check the Log tab for delivery status.');
      setError('');
      form.reset();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to queue message');
      setSuccess('');
    },
  });

  // ── Log query ─────────────────────────────────────────────────────────────
  const { data: logPage, isLoading, isError } = useQuery({
    queryKey: ['whatsapp-logs', schoolId, page],
    queryFn: () => listWhatsAppLogs(schoolId, page, pageSize),
    enabled: !!schoolId && tab === 'log',
  });

  const logs = logPage?.items ?? [];
  const total = logPage?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-semibold text-gray-800">WhatsApp Messaging</h2>
      <p className="mb-4 text-sm text-gray-500">
        Send WhatsApp Business template messages to parents and students.{' '}
        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
          E14 stub — real dispatch requires a WhatsApp BSP account
        </span>
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {([['log', 'Message Log'], ['send', 'Send Message']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors',
              tab === key
                ? 'border-b-2 border-green-600 text-green-700'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Log tab ─────────────────────────────────────────────────────── */}
      {tab === 'log' && (
        <>
          {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
          {isError && <p className="text-sm text-red-600">Failed to load message logs.</p>}
          {!isLoading && !isError && logs.length === 0 && (
            <p className="text-sm text-gray-500">No messages dispatched yet.</p>
          )}

          {logs.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Recipient', 'Template', 'Language', 'Status', 'Sent At', 'Created'].map(
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
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {log.recipient}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{log.templateName}</td>
                        <td className="px-4 py-3 text-gray-500">{log.languageCode}</td>
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

      {/* ── Send tab ─────────────────────────────────────────────────────── */}
      {tab === 'send' && (
        <div className="max-w-lg">
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <form
            onSubmit={form.handleSubmit((v) => sendMutation.mutate(v))}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Recipient Phone (E.164)
              </label>
              <input
                {...form.register('to')}
                placeholder="+919876543210"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {form.formState.errors.to && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.to.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Template Name</label>
              <input
                {...form.register('templateName')}
                placeholder="fee_reminder"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {form.formState.errors.templateName && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.templateName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Language Code{' '}
                <span className="font-normal text-gray-400">(default: en)</span>
              </label>
              <input
                {...form.register('languageCode')}
                placeholder="en_IN"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Template Variables{' '}
                <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                {...form.register('parameters')}
                placeholder="John Doe, Rs 5000, 01 Jun 2025"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter positional variable values in order, separated by commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {sendMutation.isPending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
