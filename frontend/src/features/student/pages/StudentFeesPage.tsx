import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyFees, type StudentFeeRecord, type FeeStatus } from '../api/studentPortalApi';
import { useRazorpay } from '../hooks/useRazorpay';

function statusLabel(s: FeeStatus) {
  return { PENDING: 'Unpaid', PARTIAL: 'Partial', PAID: 'Paid', WAIVED: 'Waived', OVERDUE: 'Overdue' }[s] ?? s;
}

function statusClass(s: FeeStatus) {
  return {
    PENDING:  'bg-red-50 text-red-600',
    PARTIAL:  'bg-amber-50 text-amber-700',
    PAID:     'bg-green-50 text-green-700',
    WAIVED:   'bg-gray-100 text-gray-500',
    OVERDUE:  'bg-red-100 text-red-700',
  }[s] ?? 'bg-gray-100 text-gray-600';
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function FeeRow({ r, onPayClick }: { r: StudentFeeRecord; onPayClick: (id: string) => void }) {
  const due = new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const canPay = r.balance > 0 && r.status !== 'WAIVED' && r.status !== 'PAID';

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 text-sm font-medium text-gray-900">{r.categoryName}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{fmt(r.amountDue)}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{r.discount > 0 ? fmt(r.discount) : '—'}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{fmt(r.amountPaid)}</td>
      <td className={`py-3 px-4 text-sm font-semibold ${r.balance > 0 ? 'text-red-600' : 'text-green-700'}`}>
        {fmt(r.balance)}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">{due}</td>
      <td className="py-3 px-4">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(r.status)}`}>
          {statusLabel(r.status)}
        </span>
      </td>
      <td className="py-3 px-4">
        {canPay && (
          <button
            onClick={() => onPayClick(r.id)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Pay Online
          </button>
        )}
      </td>
    </tr>
  );
}

export default function StudentFeesPage() {
  const queryClient = useQueryClient();
  const { initiatePayment } = useRazorpay();
  const [payingId, setPayingId]   = useState<string | null>(null);
  const [payError, setPayError]   = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const { data: fees = [], isLoading } = useQuery<StudentFeeRecord[]>({
    queryKey: ['student-fees'],
    queryFn:  () => getMyFees(),
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-400">Loading fees…</div>;
  }

  const totalDue     = fees.reduce((s, r) => s + r.amountDue, 0);
  const totalPaid    = fees.reduce((s, r) => s + r.amountPaid, 0);
  const totalBalance = fees.reduce((s, r) => s + r.balance, 0);
  const hasBalance   = totalBalance > 0;

  function handlePayClick(recordId: string) {
    setPayingId(recordId);
    setPayError(null);
    setPaySuccess(false);
    initiatePayment(
      recordId,
      () => {
        setPayingId(null);
        setPaySuccess(true);
        queryClient.invalidateQueries({ queryKey: ['student-fees'] });
        setTimeout(() => setPaySuccess(false), 5000);
      },
      (msg) => {
        setPayingId(null);
        if (msg !== 'Payment cancelled.') setPayError(msg);
      },
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">My Fees</h2>

      {paySuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Payment successful! Your fee record has been updated.
        </div>
      )}
      {payError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {payError}
        </div>
      )}

      {/* Summary strip */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Total Due',  value: fmt(totalDue),     color: 'text-gray-900' },
          { label: 'Paid',       value: fmt(totalPaid),    color: 'text-green-700' },
          { label: 'Balance',    value: fmt(totalBalance), color: hasBalance ? 'text-red-600' : 'text-green-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 min-w-[130px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {fees.length === 0 ? (
        <p className="text-sm text-gray-500">No fee records found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {['Category', 'Amount Due', 'Discount', 'Paid', 'Balance', 'Due Date', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map((r) => (
                <FeeRow
                  key={r.id}
                  r={r}
                  onPayClick={handlePayClick}
                />
              ))}
            </tbody>
          </table>
          {payingId && (
            <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
              Opening payment window…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
