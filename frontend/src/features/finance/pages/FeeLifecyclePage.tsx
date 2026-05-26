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
  onCreateDemand?: (request: FeeDemandCreateRequest, accessToken: string) => Promise<FeeDemandResponse>;
  onRecordPayment?: (
    demandId: string,
    request: FeePaymentCreateRequest,
    accessToken: string,
  ) => Promise<FeeDemandResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function FeeLifecyclePage({
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateDemand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withToken(async (accessToken) => {
      const response = await onCreateDemand({
        studentId: studentId.trim(),
        description: description.trim(),
        amount: Number(amount),
        dueDate,
      }, accessToken);
      setLastDemand(response);
      setDemandId(response.id);
      setMessage('Fee demand created');
    });
  }

  async function handleRecordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withToken(async (accessToken) => {
      const response = await onRecordPayment(demandId.trim(), {
        amount: Number(paymentAmount),
        paymentMethod: paymentMethod.trim(),
        paymentReference: paymentReference.trim() || undefined,
      }, accessToken);
      setLastDemand(response);
      setMessage('Receipt issued');
    });
  }

  async function withToken(action: (accessToken: string) => Promise<void>) {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
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
        <button type="submit">Create fee demand</button>
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
          <input
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          />
        </label>
        <label>
          Reference
          <input
            name="paymentReference"
            value={paymentReference}
            onChange={(event) => setPaymentReference(event.target.value)}
          />
        </label>
        <button type="submit">Record payment</button>
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
    </section>
  );
}
