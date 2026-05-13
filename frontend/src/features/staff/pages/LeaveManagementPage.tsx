import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listLeaveRequests,
  createLeaveRequest,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from '../api/leaveApi';
import type { LeaveType, LeaveStatus, LeaveRequestResponse } from '../api/leaveApi';
import { listStaff } from '../api/staffApi';

const LEAVE_TYPES: LeaveType[] = ['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'STUDY', 'UNPAID'];

const STATUS_BADGE: Record<LeaveStatus, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── New Request Form ───────────────────────────────────────────────────────────

function NewRequestForm({
  schoolId,
  onClose,
}: { schoolId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [staffId, setStaffId]     = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('SICK');
  const [startDate, setStart]     = useState('');
  const [endDate, setEnd]         = useState('');
  const [reason, setReason]       = useState('');

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff-list', schoolId],
    queryFn: () => listStaff(schoolId),
    enabled: !!schoolId,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => createLeaveRequest(schoolId, {
      staffId, leaveType, startDate, endDate, reason,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests', schoolId] });
      onClose();
    },
  });

  const canSubmit = staffId && startDate && endDate && reason.trim() && endDate >= startDate;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-900">New Leave Request</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Staff Member</label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select staff…</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.employeeNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Reason for leave…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {isError && (
        <p className="text-xs text-red-600">Failed to create. Please try again.</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => mutate()}
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Submitting…' : 'Submit Request'}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Leave Request Row ─────────────────────────────────────────────────────────

function LeaveRow({ schoolId, req }: { schoolId: string; req: LeaveRequestResponse }) {
  const qc = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing]     = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['leave-requests', schoolId] });

  const approveMutation = useMutation({
    mutationFn: () => approveLeave(schoolId, req.id, reviewNotes),
    onSuccess: () => { invalidate(); setReviewing(false); },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectLeave(schoolId, req.id, reviewNotes),
    onSuccess: () => { invalidate(); setReviewing(false); },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelLeave(schoolId, req.id),
    onSuccess: invalidate,
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{req.leaveType}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[req.status]}`}>
              {req.status}
            </span>
            <span className="text-xs text-gray-400">{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}</span>
          </div>
          <div className="mt-0.5 text-sm text-gray-600">
            {formatDate(req.startDate)} → {formatDate(req.endDate)}
          </div>
          <div className="mt-1 text-xs text-gray-500">{req.reason}</div>
          {req.reviewNotes && (
            <div className="mt-1 text-xs italic text-gray-400">Review: {req.reviewNotes}</div>
          )}
          <div className="mt-1 text-xs text-gray-300">
            Staff: {req.staffId.slice(0, 8)}… · Requested {formatDate(req.createdAt)}
          </div>
        </div>

        {req.status === 'PENDING' && (
          <div className="flex shrink-0 flex-col gap-1.5">
            {!reviewing ? (
              <>
                <button
                  onClick={() => setReviewing(true)}
                  className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Review
                </button>
                <button
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>

      {reviewing && req.status === 'PENDING' && (
        <div className="mt-2 space-y-2 border-t border-gray-100 pt-3">
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Review notes (optional)…"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-blue-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {approveMutation.isPending ? '…' : 'Approve'}
            </button>
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {rejectMutation.isPending ? '…' : 'Reject'}
            </button>
            <button
              onClick={() => setReviewing(false)}
              className="rounded-lg px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'pending' | 'all';

export default function LeaveManagementPage() {
  const schoolId = useAuthStore((s) => s.user?.schoolId ?? '');
  const [tab, setTab]           = useState<Tab>('pending');
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('');

  const { data: requests = [], isLoading, isError } = useQuery<LeaveRequestResponse[]>({
    queryKey: ['leave-requests', schoolId, tab, statusFilter],
    queryFn: () => listLeaveRequests(schoolId, {
      status: tab === 'pending' ? 'PENDING' : (statusFilter || undefined),
      size: 50,
    }),
    enabled: !!schoolId,
  });

  const pendingCount = tab === 'all'
    ? requests.filter((r) => r.status === 'PENDING').length
    : requests.length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leave Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? 'Close Form' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <NewRequestForm schoolId={schoolId} onClose={() => setShowForm(false)} />
      )}

      {/* Tabs + filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {([['pending', 'Pending'], ['all', 'All Requests']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'all' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | '')}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            {(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as LeaveStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading && <div className="py-8 text-center text-sm text-gray-400">Loading…</div>}
      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load leave requests.
        </div>
      )}

      {!isLoading && !isError && requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          {tab === 'pending' ? 'No pending leave requests.' : 'No leave requests found.'}
        </div>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <LeaveRow key={req.id} schoolId={schoolId} req={req} />
        ))}
      </div>
    </div>
  );
}
