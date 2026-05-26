import { FormEvent, useState } from 'react';

import {
  BulkJobCreateRequest,
  BulkJobResponse,
  cancelBulkJob,
  createBulkJob,
  listBulkJobs,
} from '../api/bulkJobsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type BulkJobsPageProps = {
  onCreate?: (request: BulkJobCreateRequest, accessToken: string) => Promise<BulkJobResponse>;
  onLoad?: (accessToken: string) => Promise<BulkJobResponse[]>;
  onCancel?: (bulkJobId: string, accessToken: string) => Promise<BulkJobResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function BulkJobsPage({
  onCreate = createBulkJob,
  onLoad = listBulkJobs,
  onCancel = cancelBulkJob,
  storage = globalThis.sessionStorage,
}: BulkJobsPageProps) {
  const [jobType, setJobType] = useState('STUDENT_IMPORT');
  const [totalRecords, setTotalRecords] = useState('0');
  const [inputFileReference, setInputFileReference] = useState('');
  const [jobs, setJobs] = useState<BulkJobResponse[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withToken(async (accessToken) => {
      const response = await onCreate({
        jobType,
        totalRecords: Number(totalRecords),
        inputFileReference: inputFileReference || undefined,
      }, accessToken);
      setJobs((current) => [response, ...current.filter((job) => job.id !== response.id)]);
      setMessage(`${response.jobType} queued`);
    });
  }

  async function handleLoad() {
    await withToken(async (accessToken) => {
      const response = await onLoad(accessToken);
      setJobs(response);
      setMessage(`${response.length} bulk jobs loaded`);
    });
  }

  async function handleCancel(bulkJobId: string) {
    await withToken(async (accessToken) => {
      const response = await onCancel(bulkJobId, accessToken);
      setJobs((current) => current.map((job) => (job.id === response.id ? response : job)));
      setMessage(`${response.jobType} cancelled`);
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
      setError('Bulk job request failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="bulk-jobs-title">
      <p className="eyebrow">BULK-001</p>
      <h2 id="bulk-jobs-title">Bulk jobs</h2>

      <form className="workflow-form" onSubmit={handleCreate}>
        <label>
          Job type
          <input
            name="jobType"
            value={jobType}
            onChange={(event) => setJobType(event.target.value)}
          />
        </label>
        <label>
          Total records
          <input
            min="0"
            name="totalRecords"
            type="number"
            value={totalRecords}
            onChange={(event) => setTotalRecords(event.target.value)}
          />
        </label>
        <label>
          File reference
          <input
            name="inputFileReference"
            value={inputFileReference}
            onChange={(event) => setInputFileReference(event.target.value)}
          />
        </label>
        <button type="submit">Create bulk job</button>
        <button type="button" onClick={handleLoad}>
          Load jobs
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}

      {jobs.length > 0 ? (
        <ul className="compact-list" aria-label="Bulk job list">
          {jobs.map((job) => (
            <li key={job.id}>
              <span>{job.jobType}</span>
              <span>{job.status}</span>
              <span>
                {job.processedRecords}/{job.totalRecords}
              </span>
              {!['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status) ? (
                <button type="button" onClick={() => void handleCancel(job.id)}>
                  Cancel
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
