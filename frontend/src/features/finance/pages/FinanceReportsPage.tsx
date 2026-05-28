import { useEffect, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import {
  getFinanceCollections,
  getFinanceReportSummary,
  listFinanceReceipts,
  type FinanceCollections,
  type FinanceReceiptResponse,
  type FinanceReportSummary,
} from '../api/feeApi';

export function FinanceReportsPage() {
  const { accessToken } = useAuthState();
  const [summary, setSummary] = useState<FinanceReportSummary | null>(null);
  const [receipts, setReceipts] = useState<FinanceReceiptResponse[]>([]);
  const [collections, setCollections] = useState<FinanceCollections | null>(null);
  const [status, setStatus] = useState<'loading' | 'idle'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadReports();
  }, [accessToken]);

  async function loadReports() {
    if (!accessToken) {
      setStatus('idle');
      setError('Finance Staff login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const [summaryResponse, receiptsResponse, collectionsResponse] = await Promise.all([
        getFinanceReportSummary(accessToken),
        listFinanceReceipts(accessToken),
        getFinanceCollections(accessToken),
      ]);
      setSummary(summaryResponse);
      setReceipts(receiptsResponse.items);
      setCollections(collectionsResponse);
    } catch (caught) {
      setSummary(null);
      setReceipts([]);
      setCollections(null);
      setError(caught instanceof Error ? caught.message : 'Finance reports could not be loaded.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section className="data-surface" aria-labelledby="finance-reports-title">
      <div className="surface-toolbar">
        <div>
          <p className="eyebrow">Ready</p>
          <h3 id="finance-reports-title">Finance reports</h3>
        </div>
        <button onClick={() => void loadReports()} type="button">Refresh</button>
      </div>

      {status === 'loading' ? <div className="api-skeleton"><span /><span /><span /></div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}

      {summary ? (
        <div className="metric-grid">
          <Metric label="Demanded" value={money(summary.totalDemanded)} />
          <Metric label="Collected" value={money(summary.totalCollected)} />
          <Metric label="Outstanding" value={money(summary.totalOutstanding)} />
          <Metric label="Receipts" value={String(summary.receiptCount)} />
        </div>
      ) : null}

      {status !== 'loading' && !error && receipts.length === 0 ? (
        <div className="api-empty-state">
          <strong>No receipts yet</strong>
          <span>Recorded payments will appear here.</span>
        </div>
      ) : null}

      <div className="api-record-list" aria-label="Finance receipts">
        {receipts.map((receipt) => (
          <article key={receipt.id}>
            <strong>{receipt.receiptNumber}</strong>
            <span>{receipt.studentName} · {money(receipt.amount)} · {receipt.paymentMethod}</span>
            <span>{dateLabel(receipt.paidAt)}</span>
          </article>
        ))}
      </div>

      {collections?.items.length ? (
        <div className="api-record-list" aria-label="Collection summary">
          {collections.items.map((row) => (
            <article key={row.date}>
              <strong>{row.date}</strong>
              <span>{money(row.totalCollected)} collected</span>
              <span>{row.receiptCount} receipts</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card tone-blue">
      <span className="metric-dot" aria-hidden="true" />
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function money(value: number) {
  return new Intl.NumberFormat(undefined, {
    currency: 'USD',
    style: 'currency',
  }).format(value);
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}
