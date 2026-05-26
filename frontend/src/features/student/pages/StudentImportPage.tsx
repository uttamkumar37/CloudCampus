import { FormEvent, useState } from 'react';

import {
  importStudents,
  inviteStudentLogin,
  queueStudentImport,
  StudentImportJobResponse,
  StudentImportResponse,
  StudentImportRow,
  StudentImportValidationResponse,
  StudentLoginInvitationResponse,
  validateStudentImport,
} from '../api/studentImportApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';
const SAMPLE_ROWS = JSON.stringify(
  [
    {
      admissionNumber: 'ADM-1001',
      fullName: 'Student Name',
      classLevelId: 'class-level-id',
      sectionId: 'section-id',
      rollNumber: '1',
      dateOfBirth: '2016-04-15',
      guardianEmail: 'guardian@example.com',
    },
  ],
  null,
  2,
);

type StudentImportPageProps = {
  onValidate?: (rows: StudentImportRow[], accessToken: string) => Promise<StudentImportValidationResponse>;
  onImport?: (rows: StudentImportRow[], accessToken: string) => Promise<StudentImportResponse>;
  onQueue?: (rows: StudentImportRow[], accessToken: string) => Promise<StudentImportJobResponse>;
  onInviteStudentLogin?: (
    studentId: string,
    email: string,
    accessToken: string,
  ) => Promise<StudentLoginInvitationResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function StudentImportPage({
  onValidate = validateStudentImport,
  onImport = importStudents,
  onQueue = queueStudentImport,
  onInviteStudentLogin = inviteStudentLogin,
  storage = globalThis.sessionStorage,
}: StudentImportPageProps) {
  const [rowsJson, setRowsJson] = useState(SAMPLE_ROWS);
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleValidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withRows(async (rows, token) => {
      const response = await onValidate(rows, token);
      setMessage(response.valid ? `${response.rowCount} rows valid` : `${response.errors.length} validation errors`);
    });
  }

  async function handleImport() {
    await withRows(async (rows, token) => {
      const response = await onImport(rows, token);
      setMessage(response.imported ? `${response.importedCount} students imported` : `${response.errors.length} import errors`);
    });
  }

  async function handleQueue() {
    await withRows(async (rows, token) => {
      const response = await onQueue(rows, token);
      setMessage(`${response.totalRecords} row import job queued`);
    });
  }

  async function handleInviteStudentLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setMessage(null);
      return;
    }
    if (!studentId.trim() || !studentEmail.trim()) {
      setError('Student ID and email are required.');
      setMessage(null);
      return;
    }

    setError(null);
    try {
      const response = await onInviteStudentLogin(studentId.trim(), studentEmail.trim(), accessToken);
      setMessage(response.invitationCreated ? 'Student login invitation created' : 'Student login already active');
    } catch {
      setError('Student login invitation failed.');
      setMessage(null);
    }
  }

  async function withRows(action: (rows: StudentImportRow[], accessToken: string) => Promise<void>) {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setMessage(null);
      return;
    }

    let rows: StudentImportRow[];
    try {
      rows = JSON.parse(rowsJson) as StudentImportRow[];
    } catch {
      setError('Student import rows must be valid JSON.');
      setMessage(null);
      return;
    }

    setError(null);
    try {
      await action(rows, accessToken);
    } catch {
      setError('Student import failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="student-import-title">
      <p className="eyebrow">STU-001</p>
      <h2 id="student-import-title">Student import</h2>

      <form className="workflow-form" onSubmit={handleValidate}>
        <label>
          Import rows
          <textarea
            name="rows"
            rows={10}
            value={rowsJson}
            onChange={(event) => setRowsJson(event.target.value)}
          />
        </label>
        <button type="submit">Validate rows</button>
        <button type="button" onClick={handleImport}>
          Import students
        </button>
        <button type="button" onClick={handleQueue}>
          Queue import job
        </button>
      </form>

      <form className="workflow-form" onSubmit={handleInviteStudentLogin}>
        <label>
          Student ID
          <input
            name="studentId"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
        </label>
        <label>
          Student login email
          <input
            name="studentEmail"
            type="email"
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
          />
        </label>
        <button type="submit">Invite student login</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}
