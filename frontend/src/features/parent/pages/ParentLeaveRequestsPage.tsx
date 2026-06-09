import { FormEvent, useEffect, useState } from 'react';

import {
  createParentLeaveRequest,
  listParentLeaveRequests,
  ParentLeaveRequestCreatePayload,
  ParentLeaveRequestResponse,
} from '../api/parentLeaveRequestsApi';
import { listParentChildren, type ParentChild } from '../api/parentPortalApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type ParentLeaveRequestsPageProps = {
  onCreate?: (
    studentId: string,
    payload: ParentLeaveRequestCreatePayload,
    accessToken: string,
  ) => Promise<ParentLeaveRequestResponse>;
  onChildren?: (accessToken: string) => Promise<ParentChild[]>;
  onList?: (studentId: string, accessToken: string) => Promise<ParentLeaveRequestResponse[]>;
  storage?: Pick<Storage, 'getItem'>;
};

export function ParentLeaveRequestsPage({
  onCreate = createParentLeaveRequest,
  onChildren = listParentChildren,
  onList = listParentLeaveRequests,
  storage = globalThis.sessionStorage,
}: ParentLeaveRequestsPageProps) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [requests, setRequests] = useState<ParentLeaveRequestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'idle'>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadChildren() {
      const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!accessToken) {
        if (mounted) {
          setError('Parent login is required.');
          setStatus('idle');
        }
        return;
      }
      setStatus('loading');
      try {
        const loaded = await onChildren(accessToken);
        if (!mounted) return;
        setChildren(loaded);
        const firstStudentId = loaded[0]?.studentId ?? '';
        setSelectedStudentId((current) => current || firstStudentId);
        setError(null);
      } catch {
        if (!mounted) return;
        setChildren([]);
        setSelectedStudentId('');
        setError('Linked children could not be loaded.');
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadChildren();
    return () => {
      mounted = false;
    };
  }, [onChildren, storage]);

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!accessToken || !selectedStudentId) {
        if (mounted) setRequests([]);
        return;
      }
      try {
        const loaded = await onList(selectedStudentId, accessToken);
        if (mounted) setRequests(loaded);
      } catch {
        if (mounted) {
          setRequests([]);
          setError('Leave requests could not be loaded.');
        }
      }
    }

    void loadRequests();
    return () => {
      mounted = false;
    };
  }, [onList, selectedStudentId, storage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: ParentLeaveRequestCreatePayload = {
      startDate: String(formData.get('startDate') ?? ''),
      endDate: String(formData.get('endDate') ?? ''),
      reason: String(formData.get('reason') ?? ''),
    };
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('Parent login is required.');
      setRequests([]);
      return;
    }
    if (!selectedStudentId) {
      setError('Select a linked child before submitting leave.');
      setRequests([]);
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const created = await onCreate(selectedStudentId, payload, accessToken);
      const latest = await onList(selectedStudentId, accessToken);
      setRequests(latest.length > 0 ? latest : [created]);
      setMessage('Leave request submitted.');
      form.reset();
    } catch {
      setError('Leave request could not be submitted.');
      setRequests([]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="parent-leave-title">
      <p className="eyebrow">PAR-002</p>
      <h2 id="parent-leave-title">Leave requests</h2>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          Linked child
          <select
            aria-describedby="parent-leave-child-help"
            disabled={status === 'loading' || children.length === 0 || submitting}
            onChange={(event) => {
              setSelectedStudentId(event.target.value);
              setMessage(null);
            }}
            required
            value={selectedStudentId}
          >
            <option value="" disabled>
              {status === 'loading' ? 'Loading children...' : 'Select a child'}
            </option>
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.studentName} - {child.admissionNumber}
              </option>
            ))}
          </select>
          <span id="parent-leave-child-help" className="form-hint">
            Only children linked to your parent account are available.
          </span>
        </label>
        <label>
          Start date
          <input name="startDate" required type="date" />
        </label>
        <label>
          End date
          <input name="endDate" required type="date" />
        </label>
        <label>
          Reason
          <textarea name="reason" placeholder="Brief reason for leave" required />
        </label>
        <button type="submit" disabled={submitting || children.length === 0}>
          {submitting ? 'Submitting...' : 'Request leave'}
        </button>
      </form>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-result" role="status">{message}</p> : null}
      {!error && status !== 'loading' && children.length === 0 ? (
        <div className="api-empty-state">
          <strong>No linked children</strong>
          <span>Ask the school to link your parent account before submitting leave.</span>
        </div>
      ) : null}
      {requests.length > 0 ? (
        <ul className="workflow-list" aria-label="Leave request history">
          {requests.map((request) => (
            <li key={request.id}>
              <strong>{request.studentName}</strong>
              <span>{request.status} leave request from {request.startDate} to {request.endDate}</span>
              <span>{request.reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
