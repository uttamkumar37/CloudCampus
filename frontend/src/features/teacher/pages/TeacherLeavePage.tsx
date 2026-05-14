import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyLeave,
  submitLeave,
  cancelLeave,
  type LeaveType,
  type LeaveStatus,
  type TeacherLeaveRecord,
} from '../api/teacherLeaveApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEAVE_TYPES: LeaveType[] = ['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'STUDY', 'UNPAID'];

const STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function today() { return new Date().toISOString().slice(0, 10); }

// ── Request form ──────────────────────────────────────────────────────────────

interface FormState {
  leaveType: LeaveType;
  startDate: string;
  endDate:   string;
  reason:    string;
}

function RequestForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit:   (f: FormState) => void;
  onCancel:   () => void;
  submitting: boolean;
}) {
  const t = today();
  const [form, setForm] = useState<FormState>({
    leaveType: 'CASUAL',
    startDate: t,
    endDate:   t,
    reason:    '',
  });
  const [err, setErr] = useState('');

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErr('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason.trim()) { setErr('Please provide a reason.'); return; }
    if (form.endDate < form.startDate) { setErr('End date must be on or after start date.'); return; }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
      <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">New Leave Request</h2>

      {err && <p className="text-xs text-red-600">{err}</p>}

      {/* Leave type */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">Leave Type</label>
        <div className="flex flex-wrap gap-2">
          {LEAVE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('leaveType', t)}
              className={[
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                form.leaveType === t
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => {
              set('startDate', e.target.value);
              if (e.target.value > form.endDate) set('endDate', e.target.value);
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
          <input
            type="date"
            value={form.endDate}
            min={form.startDate}
            onChange={(e) => set('endDate', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Reason</label>
        <textarea
          rows={3}
          value={form.reason}
          onChange={(e) => set('reason', e.target.value)}
          placeholder="Describe the reason for your leave…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Discard
        </button>
      </div>
    </form>
  );
}

// ── Leave row ─────────────────────────────────────────────────────────────────

function LeaveRow({ record, onCancel }: { record: TeacherLeaveRecord; onCancel: () => void }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-800">{record.leaveType.replace('_', ' ')}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{fmt(record.startDate)}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{fmt(record.endDate)}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{record.totalDays}</td>
      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-500">{record.reason}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[record.status]}`}>
          {record.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{record.reviewNotes ?? '—'}</td>
      <td className="px-4 py-3">
        {record.status === 'PENDING' && (
          <button
            onClick={onCancel}
            className="text-xs text-red-600 hover:underline"
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherLeavePage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, isError } = useQuery({
    queryKey: ['teacher-leave'],
    queryFn:  () => getMyLeave(),
  });

  const submitMutation = useMutation({
    mutationFn: submitLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-leave'] });
      setShowForm(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeave,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-leave'] }),
  });

  const pending  = records.filter((r) => r.status === 'PENDING').length;
  const approved = records.filter((r) => r.status === 'APPROVED').length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Leave</h1>
          <p className="mt-0.5 text-sm text-gray-500">View your leave requests and submit new ones</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Request Leave
          </button>
        )}
      </div>

      {/* Summary chips */}
      {records.length > 0 && (
        <div className="mb-5 flex gap-3">
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-2">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-bold text-amber-700">{pending}</p>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-2">
            <p className="text-xs text-gray-500">Approved</p>
            <p className="text-lg font-bold text-green-700">{approved}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-800">{records.length}</p>
          </div>
        </div>
      )}

      {/* Request form */}
      {showForm && (
        <div className="mb-6">
          <RequestForm
            onSubmit={(f) => submitMutation.mutate(f)}
            onCancel={() => setShowForm(false)}
            submitting={submitMutation.isPending}
          />
          {submitMutation.isError && (
            <p className="mt-2 text-sm text-red-600">Failed to submit. Please try again.</p>
          )}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
      ) : isError ? (
        <div className="py-12 text-center text-sm text-red-500">Failed to load leave requests.</div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No leave requests yet.</p>
          <p className="mt-1 text-xs text-gray-400">Click "Request Leave" to submit your first request.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Type', 'Start', 'End', 'Days', 'Reason', 'Status', 'Review Notes', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <LeaveRow
                  key={r.id}
                  record={r}
                  onCancel={() => {
                    if (confirm('Cancel this leave request?')) cancelMutation.mutate(r.id);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
