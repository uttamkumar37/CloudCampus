import { FormEvent, useState } from 'react';

import {
  createFeeDemand,
  FeeDemandCreateRequest,
  FeeDemandResponse,
  FeePaymentCreateRequest,
  recordFeePayment,
} from '../api/feeApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type FeeLifecyclePageProps = {
  loginRequiredMessage?: string;
  onCreateDemand?: (request: FeeDemandCreateRequest, accessToken: string) => Promise<FeeDemandResponse>;
  onRecordPayment?: (
    demandId: string,
    request: FeePaymentCreateRequest,
    accessToken: string,
  ) => Promise<FeeDemandResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

type PendingPayment = {
  demandId: string;
  request: FeePaymentCreateRequest;
};

export function FeeLifecyclePage({
  loginRequiredMessage = 'School Admin login is required.',
  onCreateDemand = createFeeDemand,
  onRecordPayment = recordFeePayment,
  storage = globalThis.sessionStorage,
}: FeeLifecyclePageProps) {
  const [studentId, setStudentId] = useState('');
  const [description, setDescription] = useState('Term 1 fee');
  const [amount, setAmount] = useState('1');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [demandId, setDemandId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [lastDemand, setLastDemand] = useState<FeeDemandResponse | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [status, setStatus] = useState<'idle' | 'creating' | 'recording'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateDemand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withToken(async (accessToken) => {
      setStatus('creating');
      try {
        const response = await onCreateDemand({
          studentId: studentId.trim(),
          description: description.trim(),
          amount: Number(amount),
          dueDate,
        }, accessToken);
        setLastDemand(response);
        setDemandId(response.id);
        setMessage('Fee demand created');
      } finally {
        setStatus('idle');
      }
    });
  }

  function handleRecordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!demandId.trim()) {
      setError('Demand ID is required before recording a payment.');
      return;
    }
    setError(null);
    setPendingPayment({
      demandId: demandId.trim(),
      request: {
        amount: Number(paymentAmount),
        paymentMethod: paymentMethod.trim(),
        paymentReference: paymentReference.trim() || undefined,
      },
    });
  }

  async function confirmRecordPayment() {
    if (!pendingPayment) return;
    await withToken(async (accessToken) => {
      setStatus('recording');
      try {
        const response = await onRecordPayment(pendingPayment.demandId, pendingPayment.request, accessToken);
        setLastDemand(response);
        setMessage('Receipt issued');
        setPendingPayment(null);
      } finally {
        setStatus('idle');
      }
    });
  }

  async function withToken(action: (accessToken: string) => Promise<void>) {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError(loginRequiredMessage);
      setMessage(null);
      return;
    }

    setError(null);
    try {
      await action(accessToken);
    } catch {
      setError('Fee request failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="fee-lifecycle-title">
      <p className="eyebrow">FEE-001</p>
      <h2 id="fee-lifecycle-title">Fee lifecycle</h2>

      <form className="workflow-form" onSubmit={handleCreateDemand}>
        <label>
          Student ID
          <input
            name="studentId"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
        </label>
        <label>
          Description
          <input
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          Amount
          <input
            min="0.01"
            name="amount"
            step="0.01"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <label>
          Due date
          <input
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>
        <button disabled={status !== 'idle'} type="submit">{status === 'creating' ? 'Creating...' : 'Create fee demand'}</button>
      </form>

      <form className="workflow-form" onSubmit={handleRecordPayment}>
        <label>
          Demand ID
          <input
            name="demandId"
            value={demandId}
            onChange={(event) => setDemandId(event.target.value)}
          />
        </label>
        <label>
          Payment amount
          <input
            min="0.01"
            name="paymentAmount"
            step="0.01"
            type="number"
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(event.target.value)}
          />
        </label>
        <label>
          Method
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank transfer">Bank transfer</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online</option>
          </select>
        </label>
        <label>
          Reference
          <input
            name="paymentReference"
            value={paymentReference}
            onChange={(event) => setPaymentReference(event.target.value)}
          />
        </label>
        <button disabled={status !== 'idle'} type="submit">Record payment</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}

      {lastDemand ? (
        <ul className="compact-list" aria-label="Fee demand summary">
          <li>
            <span>{lastDemand.description}</span>
            <span>{lastDemand.status}</span>
            <span>{lastDemand.amountPaid}/{lastDemand.amountDue}</span>
            <span>{lastDemand.payments.length} receipts</span>
          </li>
        </ul>
      ) : null}

      {pendingPayment ? (
        <FeePaymentConfirmDialog
          busy={status === 'recording'}
          demandId={pendingPayment.demandId}
          onCancel={() => setPendingPayment(null)}
          onConfirm={() => void confirmRecordPayment()}
          payment={pendingPayment.request}
        />
      ) : null}
    </section>
  );
}

function FeePaymentConfirmDialog({
  busy,
  demandId,
  onCancel,
  onConfirm,
  payment,
}: {
  busy: boolean;
  demandId: string;
  onCancel: () => void;
  onConfirm: () => void;
  payment: FeePaymentCreateRequest;
}) {
  return (
    <div className="school-admin-confirm" role="presentation">
      <button aria-label="Close payment confirmation" className="school-admin-confirm-scrim" onClick={onCancel} type="button" />
      <section aria-labelledby="fee-payment-confirm-title" aria-modal="true" className="school-admin-confirm-panel" role="dialog">
        <div>
          <p className="eyebrow">Confirm payment</p>
          <h3 id="fee-payment-confirm-title">Record payment?</h3>
          <span>
            This will record {payment.amount} against demand {demandId} and may issue a receipt for the active school.
          </span>
        </div>
        <div className="school-admin-confirm-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy} onClick={onConfirm} type="button">{busy ? 'Recording...' : 'Record payment'}</button>
        </div>
      </section>
    </div>
  );
}
