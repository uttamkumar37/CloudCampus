import { FormEvent, useState } from 'react';

import {
  decideSchoolParentLeaveRequest,
  listSchoolParentLeaveRequests,
  ParentLeaveDecisionPayload,
  ParentLeaveRequestResponse,
} from '../api/parentLeaveRequestsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type SchoolAdminLeaveRequestsPageProps = {
  onList?: (accessToken: string) => Promise<ParentLeaveRequestResponse[]>;
  onDecide?: (
    leaveRequestId: string,
    payload: ParentLeaveDecisionPayload,
    accessToken: string,
  ) => Promise<ParentLeaveRequestResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function SchoolAdminLeaveRequestsPage({
  onList = listSchoolParentLeaveRequests,
  onDecide = decideSchoolParentLeaveRequest,
  storage = globalThis.sessionStorage,
}: SchoolAdminLeaveRequestsPageProps) {
  const [requests, setRequests] = useState<ParentLeaveRequestResponse[]>([]);
  const [decision, setDecision] = useState<ParentLeaveRequestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function requireToken() {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setRequests([]);
      return null;
    }
    return accessToken;
  }

  async function handleLoad() {
    const accessToken = requireToken();
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setRequests(await onList(accessToken));
    } catch {
      setError('Leave requests could not be loaded.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = requireToken();
    if (!accessToken) return;
    const formData = new FormData(event.currentTarget);
    const leaveRequestId = String(formData.get('leaveRequestId') ?? '');
    const payload: ParentLeaveDecisionPayload = {
      status: String(formData.get('status') ?? 'APPROVED') as ParentLeaveDecisionPayload['status'],
      adminNote: String(formData.get('adminNote') ?? ''),
    };

    setLoading(true);
    setError(null);
    try {
      const updated = await onDecide(leaveRequestId, payload, accessToken);
      setDecision(updated);
      setRequests((current) => current.map((request) => (request.id === updated.id ? updated : request)));
    } catch {
      setError('Leave request decision failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="school-leave-title">
      <p className="eyebrow">PAR-002</p>
      <h2 id="school-leave-title">Parent leave requests</h2>
      <button type="button" onClick={handleLoad} disabled={loading}>
        {loading ? 'Loading...' : 'Load requests'}
      </button>

      <form className="workflow-form" onSubmit={handleDecision}>
        <label>
          Leave request ID
          <input name="leaveRequestId" placeholder="leave-request-uuid" required />
        </label>
        <label>
          Decision
          <select name="status" defaultValue="APPROVED">
            <option value="APPROVED">Approve</option>
            <option value="REJECTED">Reject</option>
          </select>
        </label>
        <label>
          Admin note
          <textarea name="adminNote" placeholder="Optional office note" />
        </label>
        <button type="submit" disabled={loading}>
          Record decision
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {decision ? (
        <div className="form-result">
          <strong>{decision.studentName}</strong>
          <span>{decision.status} leave request for {decision.parentEmail}</span>
        </div>
      ) : null}
      {requests.length > 0 ? (
        <ul className="workflow-list">
          {requests.map((request) => (
            <li key={request.id}>
              <strong>{request.studentName}</strong>
              <span>{request.status} · {request.startDate} to {request.endDate}</span>
              <span>{request.reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
