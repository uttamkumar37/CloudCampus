import { FormEvent, useState } from 'react';

import {
  createParentLeaveRequest,
  listParentLeaveRequests,
  ParentLeaveRequestCreatePayload,
  ParentLeaveRequestResponse,
} from '../api/parentLeaveRequestsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type ParentLeaveRequestsPageProps = {
  onCreate?: (
    studentId: string,
    payload: ParentLeaveRequestCreatePayload,
    accessToken: string,
  ) => Promise<ParentLeaveRequestResponse>;
  onList?: (studentId: string, accessToken: string) => Promise<ParentLeaveRequestResponse[]>;
  storage?: Pick<Storage, 'getItem'>;
};

export function ParentLeaveRequestsPage({
  onCreate = createParentLeaveRequest,
  onList = listParentLeaveRequests,
  storage = globalThis.sessionStorage,
}: ParentLeaveRequestsPageProps) {
  const [requests, setRequests] = useState<ParentLeaveRequestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const studentId = String(formData.get('studentId') ?? '');
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

    setSubmitting(true);
    setError(null);
    try {
      const created = await onCreate(studentId, payload, accessToken);
      const latest = await onList(studentId, accessToken);
      setRequests(latest.length > 0 ? latest : [created]);
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
          Student ID
          <input name="studentId" placeholder="linked-student-uuid" required />
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Request leave'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {requests.length > 0 ? (
        <div className="form-result">
          <strong>{requests[0].studentName}</strong>
          <span>{requests[0].status} leave request from {requests[0].startDate} to {requests[0].endDate}</span>
        </div>
      ) : null}
    </section>
  );
}
