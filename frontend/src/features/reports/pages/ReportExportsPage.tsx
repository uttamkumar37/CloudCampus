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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withToken(async (accessToken) => {
      const response = await onRequest({ reportType, format: 'CSV' }, accessToken);
      setExports((current) => [response, ...current.filter((item) => item.id !== response.id)]);
      setMessage(`${labelFor(response.reportType)} export queued`);
    });
  }

  async function handleLoad() {
    await withToken(async (accessToken) => {
      const response = await onLoad(accessToken);
      setExports(response);
      setMessage(`${response.length} report exports loaded`);
    });
  }

  async function handleDownload(exportId: string) {
    await withToken(async (accessToken) => {
      const content = await onDownload(exportId, accessToken);
      setMessage(`Downloaded ${content.length} characters`);
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
        <button type="submit">Request export</button>
        <button type="button" onClick={handleLoad}>
          Load exports
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
                <button type="button" onClick={() => void handleDownload(item.id)}>
                  Download
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function labelFor(reportType: ReportType) {
  return reportTypeOptions.find((option) => option.value === reportType)?.label ?? reportType;
}
