import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getFeeRecord,
  getFeeReceipt,
  recordPayment,
  waiveFeeRecord,
  downloadFeeInvoicePdf,
} from '../api/financeApi';
import type { FeeStatus, PaymentMode, RecordPaymentRequest } from '../types/finance';

// ── Schema ────────────────────────────────────────────────────────────────────

const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  paymentDate: z.string().optional(),
  paymentMode: z.enum(
    ['CASH', 'CHEQUE', 'ONLINE', 'UPI', 'DD', 'BANK_TRANSFER'],
    { message: 'Select a payment mode' },
  ),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<FeeStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARTIAL: 'bg-orange-100 text-orange-700',
  PAID: 'bg-green-100 text-green-700',
  WAIVED: 'bg-gray-100 text-gray-500',
  OVERDUE: 'bg-red-100 text-red-700',
};

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'CHEQUE', 'ONLINE', 'UPI', 'DD', 'BANK_TRANSFER'];

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentFeeDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const qc = useQueryClient();

  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const { data: record, isLoading: loadingRecord } = useQuery({
    queryKey: ['fee-record', recordId],
    queryFn: () => getFeeRecord(recordId!),
    enabled: !!recordId,
  });

  const { data: receipt, isLoading: loadingReceipt } = useQuery({
    queryKey: ['fee-receipt', recordId],
    queryFn: () => getFeeReceipt(recordId!),
    enabled: !!recordId && showReceipt,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMode: 'CASH' },
  });

  const payMutation = useMutation({
    mutationFn: (body: RecordPaymentRequest) => recordPayment(recordId!, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fee-record', recordId] });
      qc.invalidateQueries({ queryKey: ['fee-receipt', recordId] });
      setPaymentSuccess(data.receiptNumber);
      reset();
    },
    onError: (err: Error) => {
      setError('root', { message: err.message || 'Failed to record payment' });
    },
  });

  const waiveMutation = useMutation({
    mutationFn: () => waiveFeeRecord(recordId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-record', recordId] });
      qc.invalidateQueries({ queryKey: ['fee-receipt', recordId] });
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: () => downloadFeeInvoicePdf(recordId!),
  });

  function onSubmit(values: PaymentForm) {
    const amount = parseFloat(values.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('amount', { message: 'Enter a valid amount greater than 0' });
      return;
    }
    const body: RecordPaymentRequest = {
      amount,
      paymentDate: values.paymentDate || undefined,
      paymentMode: values.paymentMode as PaymentMode,
      referenceNumber: values.referenceNumber || undefined,
      remarks: values.remarks || undefined,
    };
    payMutation.mutate(body);
  }

  if (loadingRecord) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }

  if (!record) {
    return (
      <div className="p-8 text-sm text-red-600">
        Fee record not found.{' '}
        <Link to="/school-admin/fees/collection" className="text-blue-600 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const isClosed = record.status === 'PAID' || record.status === 'WAIVED';

  return (
    <div className="space-y-6">
      {/* ── Back ───────────────────────────────────────────────────────────── */}
      <Link
        to="/school-admin/fees/collection"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        ← Fee Collection
      </Link>

      {/* ── Record header ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{record.categoryName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Student: <span className="font-mono">{record.studentId}</span>
            </p>
            {record.dueDate && (
              <p className="text-sm text-gray-500">Due: {record.dueDate}</p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE[record.status]}`}
          >
            {record.status}
          </span>
        </div>

        {/* Amounts summary */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Amount Due', value: `₹${Number(record.amountDue).toLocaleString('en-IN')}` },
            { label: 'Discount', value: `₹${Number(record.discount).toLocaleString('en-IN')}` },
            { label: 'Amount Paid', value: `₹${Number(record.amountPaid).toLocaleString('en-IN')}` },
            {
              label: 'Balance',
              value: `₹${Number(record.balance).toLocaleString('en-IN')}`,
              red: record.balance > 0,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p
                className={`mt-1 text-base font-semibold ${
                  item.red ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {!isClosed && (
            <button
              onClick={() => {
                if (window.confirm('Waive this fee record? This cannot be undone.')) {
                  waiveMutation.mutate();
                }
              }}
              disabled={waiveMutation.isPending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Waive Fee
            </button>
          )}
          <button
            onClick={() => invoiceMutation.mutate()}
            disabled={invoiceMutation.isPending}
            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            {invoiceMutation.isPending ? 'Generating…' : 'Download Invoice PDF'}
          </button>
          {invoiceMutation.isError && (
            <span className="self-center text-xs text-red-600">Failed to generate PDF.</span>
          )}
        </div>
      </div>

      {/* ── Record Payment ─────────────────────────────────────────────────── */}
      {!isClosed && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Record Payment</h2>

          {paymentSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              Payment recorded! Receipt number: <strong>{paymentSuccess}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <p className="text-sm text-red-600">{errors.root.message}</p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Amount (₹)" required error={errors.amount?.message}>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('amount')}
                  placeholder="e.g. 5000"
                  className={inputCls}
                />
              </Field>

              <Field label="Payment Date" error={errors.paymentDate?.message}>
                <input type="date" {...register('paymentDate')} className={inputCls} />
              </Field>

              <Field label="Payment Mode" required error={errors.paymentMode?.message}>
                <select {...register('paymentMode')} className={inputCls}>
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Reference / Cheque No." error={errors.referenceNumber?.message}>
                <input
                  {...register('referenceNumber')}
                  placeholder="Transaction ID, cheque number…"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Remarks" error={errors.remarks?.message}>
              <input
                {...register('remarks')}
                placeholder="Optional note"
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={payMutation.isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {payMutation.isPending ? 'Recording…' : 'Record Payment'}
            </button>
          </form>
        </div>
      )}

      {/* ── Receipt / Payment History ───────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
          <button
            onClick={() => setShowReceipt((v) => !v)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showReceipt ? 'Hide' : 'Show receipt'}
          </button>
        </div>

        {showReceipt && loadingReceipt && (
          <p className="text-sm text-gray-500">Loading…</p>
        )}

        {showReceipt && receipt && (
          receipt.payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Receipt #</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Amount (₹)</th>
                  <th className="pb-2 pr-4 font-medium">Mode</th>
                  <th className="pb-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {receipt.payments.map((p) => (
                  <tr key={p.paymentId} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-700">{p.receiptNumber}</td>
                    <td className="py-2 pr-4 text-gray-600">{p.paymentDate}</td>
                    <td className="py-2 pr-4 font-medium text-green-700">
                      {Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{p.paymentMode}</td>
                    <td className="py-2 text-gray-500">{p.referenceNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {!showReceipt && (
          <p className="text-sm text-gray-500">Click "Show receipt" to view payment transactions.</p>
        )}
      </div>
    </div>
  );
}
