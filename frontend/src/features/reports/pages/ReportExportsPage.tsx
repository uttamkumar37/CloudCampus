import { FormEvent, useState } from 'react';

import {
  ReportExportRequest,
  ReportExportResponse,
  ReportType,
  downloadReportExport,
  listReportExports,
  requestReportExport,
} from '../api/reportExportsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type ReportExportsPageProps = {
  onRequest?: (request: ReportExportRequest, accessToken: string) => Promise<ReportExportResponse>;
  onLoad?: (accessToken: string) => Promise<ReportExportResponse[]>;
  onDownload?: (exportId: string, accessToken: string) => Promise<string>;
  storage?: Pick<Storage, 'getItem'>;
};

const reportTypeOptions: Array<{ value: ReportType; label: string }> = [
  { value: 'STUDENT_DIRECTORY', label: 'Student directory' },
  { value: 'FEE_DEMANDS', label: 'Fee demands' },
];

export function ReportExportsPage({
  onRequest = requestReportExport,
  onLoad = listReportExports,
  onDownload = downloadReportExport,
  storage = globalThis.sessionStorage,
}: ReportExportsPageProps) {
  const [reportType, setReportType] = useState<ReportType>('STUDENT_DIRECTORY');
  const [exports, setExports] = useState<ReportExportResponse[]>([]);
  const [pendingExport, setPendingExport] = useState<ReportExportRequest | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'loading' | 'downloading'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingExport({ reportType, format: 'CSV' });
  }

  async function confirmRequest() {
    if (!pendingExport) return;
    await withToken(async (accessToken) => {
      setStatus('requesting');
      try {
        const response = await onRequest(pendingExport, accessToken);
        setExports((current) => [response, ...current.filter((item) => item.id !== response.id)]);
        setMessage(`${labelFor(response.reportType)} export queued`);
        setPendingExport(null);
      } finally {
        setStatus('idle');
      }
    });
  }

  async function handleLoad() {
    await withToken(async (accessToken) => {
      setStatus('loading');
      try {
        const response = await onLoad(accessToken);
        setExports(response);
        setMessage(`${response.length} report exports loaded`);
      } finally {
        setStatus('idle');
      }
    });
  }

  async function handleDownload(exportId: string) {
    await withToken(async (accessToken) => {
      setStatus('downloading');
      try {
        const content = await onDownload(exportId, accessToken);
        setMessage(`Downloaded ${content.length} characters`);
      } finally {
        setStatus('idle');
      }
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
      setError('Report export request failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="report-exports-title">
      <p className="eyebrow">REP-001</p>
      <h2 id="report-exports-title">Report exports</h2>

      <form className="workflow-form" onSubmit={handleRequest}>
        <label>
          Report type
          <select
            name="reportType"
            value={reportType}
            onChange={(event) => setReportType(event.target.value as ReportType)}
          >
            {reportTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button disabled={status !== 'idle'} type="submit">Request export</button>
        <button disabled={status !== 'idle'} type="button" onClick={handleLoad}>
          {status === 'loading' ? 'Loading exports...' : 'Load exports'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}

      {exports.length > 0 ? (
        <ul className="compact-list" aria-label="Report export list">
          {exports.map((item) => (
            <li key={item.id}>
              <span>{labelFor(item.reportType)}</span>
              <span>{item.status}</span>
              <span>{item.fileName ?? 'pending file'}</span>
              {item.status === 'COMPLETED' ? (
                <button disabled={status !== 'idle'} type="button" onClick={() => void handleDownload(item.id)}>
                  {status === 'downloading' ? 'Downloading...' : 'Download'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {pendingExport ? (
        <ReportExportConfirmDialog
          busy={status === 'requesting'}
          detail={`${labelFor(pendingExport.reportType)} will be queued as a CSV export for the active school.`}
          onCancel={() => setPendingExport(null)}
          onConfirm={() => void confirmRequest()}
        />
      ) : null}
    </section>
  );
}

function labelFor(reportType: ReportType) {
  return reportTypeOptions.find((option) => option.value === reportType)?.label ?? reportType;
}

function ReportExportConfirmDialog({
  busy,
  detail,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  detail: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="school-admin-confirm" role="presentation">
      <button aria-label="Close report export confirmation" className="school-admin-confirm-scrim" onClick={onCancel} type="button" />
      <section aria-labelledby="report-export-confirm-title" aria-modal="true" className="school-admin-confirm-panel" role="dialog">
        <div>
          <p className="eyebrow">Confirm export</p>
          <h3 id="report-export-confirm-title">Queue report export?</h3>
          <span>{detail}</span>
        </div>
        <div className="school-admin-confirm-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy} onClick={onConfirm} type="button">{busy ? 'Queueing...' : 'Queue export'}</button>
        </div>
      </section>
    </div>
  );
}
