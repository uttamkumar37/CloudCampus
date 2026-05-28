import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

import {
  AcademicYearResponse,
  ClassLevelResponse,
  listAcademicYears,
  listClassLevels,
  listSections,
  SectionResponse,
} from '../../academic/api/academicApi';
import {
  importStudents,
  inviteStudentLogin,
  listStudents,
  queueStudentImport,
  StudentImportJobResponse,
  StudentImportResponse,
  StudentImportRow,
  StudentSummary,
  StudentImportValidationResponse,
  StudentLoginInvitationResponse,
  validateStudentImport,
} from '../api/studentImportApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type StudentImportDraft = {
  key: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  rollNumber: string;
  guardianEmail: string;
  guardianMobile: string;
};

type RowIssue = {
  rowNumber: number;
  field: string;
  message: string;
};

type StudentImportPageProps = {
  onLoadAcademicYears?: (accessToken: string) => Promise<AcademicYearResponse[]>;
  onLoadClassLevels?: (academicYearId: string, accessToken: string) => Promise<ClassLevelResponse[]>;
  onLoadSections?: (classLevelId: string, accessToken: string) => Promise<SectionResponse[]>;
  onLoadStudents?: (accessToken: string) => Promise<StudentSummary[]>;
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

const EMPTY_ROW: StudentImportDraft = {
  key: 'row-1',
  admissionNumber: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  rollNumber: '',
  guardianEmail: '',
  guardianMobile: '',
};

export function StudentImportPage({
  onLoadAcademicYears = listAcademicYears,
  onLoadClassLevels = listClassLevels,
  onLoadSections = listSections,
  onLoadStudents = listStudents,
  onValidate = validateStudentImport,
  onImport = importStudents,
  onQueue = queueStudentImport,
  onInviteStudentLogin = inviteStudentLogin,
  storage = globalThis.sessionStorage,
}: StudentImportPageProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [academicYearId, setAcademicYearId] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [rows, setRows] = useState<StudentImportDraft[]>([{ ...EMPTY_ROW }]);
  const [rowIssues, setRowIssues] = useState<RowIssue[]>([]);
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingScope, setLoadingScope] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedAcademicYear = useMemo(
    () => academicYears.find((year) => year.id === academicYearId),
    [academicYearId, academicYears],
  );
  const selectedClass = useMemo(
    () => classLevels.find((classLevel) => classLevel.id === classLevelId),
    [classLevelId, classLevels],
  );
  const selectedSection = useMemo(
    () => sections.find((section) => section.id === sectionId),
    [sectionId, sections],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadYears() {
      const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!accessToken) {
        setError('School Admin login is required.');
        return;
      }

      setLoadingScope(true);
      setError(null);
      try {
        const [loadedYears, loadedStudents] = await Promise.all([
          onLoadAcademicYears(accessToken),
          onLoadStudents(accessToken),
        ]);
        if (cancelled) {
          return;
        }
        setAcademicYears(loadedYears);
        setStudents(loadedStudents);
        const activeYear = loadedYears.find((year) => year.status === 'ACTIVE') ?? loadedYears[0];
        setAcademicYearId(activeYear?.id ?? '');
      } catch {
        if (!cancelled) {
          setError('Academic setup could not be loaded.');
        }
      } finally {
        if (!cancelled) {
          setLoadingScope(false);
        }
      }
    }

    void loadYears();
    return () => {
      cancelled = true;
    };
  }, [onLoadAcademicYears, onLoadStudents, storage]);

  useEffect(() => {
    let cancelled = false;
    async function loadClasses() {
      const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!accessToken || !academicYearId) {
        setClassLevels([]);
        setClassLevelId('');
        return;
      }

      setLoadingScope(true);
      setError(null);
      try {
        const loadedClasses = await onLoadClassLevels(academicYearId, accessToken);
        if (cancelled) {
          return;
        }
        setClassLevels(loadedClasses);
        setClassLevelId(loadedClasses[0]?.id ?? '');
      } catch {
        if (!cancelled) {
          setError('Classes could not be loaded for the selected academic year.');
        }
      } finally {
        if (!cancelled) {
          setLoadingScope(false);
        }
      }
    }

    void loadClasses();
    return () => {
      cancelled = true;
    };
  }, [academicYearId, onLoadClassLevels, storage]);

  useEffect(() => {
    let cancelled = false;
    async function loadClassSections() {
      const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!accessToken || !classLevelId) {
        setSections([]);
        setSectionId('');
        return;
      }

      setLoadingScope(true);
      setError(null);
      try {
        const loadedSections = await onLoadSections(classLevelId, accessToken);
        if (cancelled) {
          return;
        }
        setSections(loadedSections);
        setSectionId(loadedSections[0]?.id ?? '');
      } catch {
        if (!cancelled) {
          setError('Sections could not be loaded for the selected class.');
        }
      } finally {
        if (!cancelled) {
          setLoadingScope(false);
        }
      }
    }

    void loadClassSections();
    return () => {
      cancelled = true;
    };
  }, [classLevelId, onLoadSections, storage]);

  function updateRow(rowKey: string, field: keyof StudentImportDraft, value: string) {
    setRows((currentRows) => currentRows.map((row) => (
      row.key === rowKey ? { ...row, [field]: value } : row
    )));
    setRowIssues([]);
    setMessage(null);
  }

  function addRow() {
    setRows((currentRows) => [
      ...currentRows,
      {
        ...EMPTY_ROW,
        key: `row-${Date.now()}-${currentRows.length}`,
      },
    ]);
    setMessage(null);
  }

  function removeRow(rowKey: string) {
    setRows((currentRows) => (
      currentRows.length === 1 ? currentRows : currentRows.filter((row) => row.key !== rowKey)
    ));
    setRowIssues([]);
    setMessage(null);
  }

  async function handleValidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const preparedRows = prepareRows();
    if (!preparedRows) {
      return;
    }
    await runImportAction(async (token) => {
      const response = await onValidate(preparedRows, token);
      setRowIssues(response.errors);
      setMessage(response.valid ? `${response.rowCount} rows valid` : `${response.errors.length} validation errors found`);
    });
  }

  async function handleImport() {
    const preparedRows = prepareRows();
    if (!preparedRows) {
      return;
    }
    await runImportAction(async (token) => {
      const validation = await onValidate(preparedRows, token);
      setRowIssues(validation.errors);
      if (!validation.valid) {
        setMessage(`${validation.errors.length} validation errors found`);
        return;
      }
      const response = await onImport(preparedRows, token);
      setMessage(response.imported ? `${response.importedCount} students imported` : `${response.errors.length} import errors`);
      setRowIssues(response.errors);
      setStudents((currentStudents) => mergeStudents(currentStudents, response.students));
    });
  }

  async function handleQueue() {
    const preparedRows = prepareRows();
    if (!preparedRows) {
      return;
    }
    await runImportAction(async (token) => {
      const validation = await onValidate(preparedRows, token);
      setRowIssues(validation.errors);
      if (!validation.valid) {
        setMessage(`${validation.errors.length} validation errors found`);
        return;
      }
      const response = await onQueue(preparedRows, token);
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
      setError('Student and email are required.');
      setMessage(null);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = await onInviteStudentLogin(studentId.trim(), studentEmail.trim(), accessToken);
      setMessage(response.invitationCreated ? 'Student login invitation created' : 'Student login already active');
    } catch {
      setError('Student login invitation failed.');
      setMessage(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await readTextFromFile(file);
      const parsedRows = parseCsvRows(text);
      setRows(parsedRows.length > 0 ? parsedRows : [{ ...EMPTY_ROW }]);
      setRowIssues([]);
      setMessage(parsedRows.length > 0 ? `${parsedRows.length} rows loaded from CSV` : 'CSV file did not include student rows');
      setError(null);
    } catch {
      setError('CSV file could not be read.');
      setMessage(null);
    }
  }

  async function runImportAction(action: (accessToken: string) => Promise<void>) {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setMessage(null);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await action(accessToken);
    } catch {
      setError('Student import failed.');
      setMessage(null);
    } finally {
      setSubmitting(false);
    }
  }

  function prepareRows(): StudentImportRow[] | null {
    const localIssues: RowIssue[] = [];
    if (!academicYearId) {
      setError('Select an academic year before importing students.');
      setMessage(null);
      return null;
    }
    if (!classLevelId) {
      setError('Select a class before importing students.');
      setMessage(null);
      return null;
    }
    if (!sectionId) {
      setError('Select a section before importing students.');
      setMessage(null);
      return null;
    }

    rows.forEach((row, index) => {
      const rowNumber = index + 1;
      if (!row.admissionNumber.trim()) {
        localIssues.push({ rowNumber, field: 'admissionNumber', message: 'Admission number is required.' });
      }
      if (!row.firstName.trim()) {
        localIssues.push({ rowNumber, field: 'firstName', message: 'First name is required.' });
      }
      if (!row.lastName.trim()) {
        localIssues.push({ rowNumber, field: 'lastName', message: 'Last name is required.' });
      }
      if (!row.dateOfBirth.trim()) {
        localIssues.push({ rowNumber, field: 'dateOfBirth', message: 'Date of birth is required.' });
      }
    });

    if (localIssues.length > 0) {
      setRowIssues(localIssues);
      setError('Fix row validation errors before continuing.');
      setMessage(null);
      return null;
    }

    setError(null);
    return rows.map((row) => ({
      admissionNumber: row.admissionNumber.trim(),
      fullName: `${row.firstName.trim()} ${row.lastName.trim()}`.trim(),
      classLevelId,
      sectionId,
      rollNumber: row.rollNumber.trim() || undefined,
      dateOfBirth: row.dateOfBirth.trim() || undefined,
      gender: row.gender.trim() || undefined,
      guardianEmail: row.guardianEmail.trim() || undefined,
      guardianMobile: row.guardianMobile.trim() || undefined,
    }));
  }

  function issuesForRow(rowIndex: number) {
    return rowIssues.filter((issue) => issue.rowNumber === rowIndex + 1);
  }

  const canSubmit = Boolean(academicYearId && classLevelId && sectionId) && !submitting && !loadingScope;

  return (
    <section className="workflow-panel student-import-workflow" aria-labelledby="student-import-title">
      <p className="eyebrow">UX-STU-IMPORT-001</p>
      <h2 id="student-import-title">Student import</h2>
      <p className="compact-summary">
        Select the academic setup once, then add students with normal school-office fields. Internal IDs stay hidden.
      </p>

      {loadingScope ? <div className="api-skeleton" aria-label="Loading academic setup"><span /><span /><span /></div> : null}

      <form className="workflow-form" onSubmit={handleValidate}>
        <div className="import-scope-grid" aria-label="Student import class selection">
          <label>
            Academic year
            <select value={academicYearId} onChange={(event) => setAcademicYearId(event.target.value)}>
              <option value="">Select academic year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}{year.status === 'ACTIVE' ? ' - Active' : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Class
            <select
              value={classLevelId}
              onChange={(event) => setClassLevelId(event.target.value)}
              disabled={!academicYearId || classLevels.length === 0}
            >
              <option value="">Select class</option>
              {classLevels.map((classLevel) => (
                <option key={classLevel.id} value={classLevel.id}>
                  {classLevel.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Section
            <select
              value={sectionId}
              onChange={(event) => setSectionId(event.target.value)}
              disabled={!classLevelId || sections.length === 0}
            >
              <option value="">Select section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!loadingScope && academicYears.length === 0 ? (
          <div className="api-empty-state">
            <strong>No academic years yet</strong>
            <span>Create and activate an academic year before importing students.</span>
          </div>
        ) : null}
        {!loadingScope && academicYearId && classLevels.length === 0 ? (
          <div className="api-empty-state">
            <strong>No classes in {selectedAcademicYear?.name ?? 'this academic year'}</strong>
            <span>Add a class before importing students.</span>
          </div>
        ) : null}
        {!loadingScope && classLevelId && sections.length === 0 ? (
          <div className="api-empty-state">
            <strong>No sections in {selectedClass?.name ?? 'this class'}</strong>
            <span>Add a section before importing students.</span>
          </div>
        ) : null}

        <div className="import-toolbar">
          <div>
            <strong>Rows to import</strong>
            <span>
              {selectedAcademicYear?.name ?? 'Academic year'} / {selectedClass?.name ?? 'Class'} / {selectedSection?.name ?? 'Section'}
            </span>
          </div>
          <label className="csv-upload-button">
            Upload CSV
            <input
              aria-label="Upload student CSV"
              accept=".csv,text/csv"
              type="file"
              onChange={handleCsvUpload}
            />
          </label>
          <button type="button" onClick={addRow}>Add row</button>
        </div>

        <div className="student-import-row-list">
          {rows.map((row, index) => (
            <article key={row.key} className="student-import-row">
              <div className="student-import-row-header">
                <strong>Student {index + 1}</strong>
                <button type="button" onClick={() => removeRow(row.key)} disabled={rows.length === 1}>
                  Remove
                </button>
              </div>
              <div className="student-import-fields">
                <label>
                  Admission number
                  <input
                    value={row.admissionNumber}
                    onChange={(event) => updateRow(row.key, 'admissionNumber', event.target.value)}
                    placeholder="ADM-1001"
                  />
                </label>
                <label>
                  First name
                  <input
                    value={row.firstName}
                    onChange={(event) => updateRow(row.key, 'firstName', event.target.value)}
                    placeholder="Asha"
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={row.lastName}
                    onChange={(event) => updateRow(row.key, 'lastName', event.target.value)}
                    placeholder="Mehta"
                  />
                </label>
                <label>
                  Date of birth
                  <input
                    type="date"
                    value={row.dateOfBirth}
                    onChange={(event) => updateRow(row.key, 'dateOfBirth', event.target.value)}
                  />
                </label>
                <label>
                  Gender
                  <select value={row.gender} onChange={(event) => updateRow(row.key, 'gender', event.target.value)}>
                    <option value="">Select gender</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <label>
                  Roll number
                  <input
                    value={row.rollNumber}
                    onChange={(event) => updateRow(row.key, 'rollNumber', event.target.value)}
                    placeholder="1"
                  />
                </label>
                <label>
                  Parent/guardian email
                  <input
                    type="email"
                    value={row.guardianEmail}
                    onChange={(event) => updateRow(row.key, 'guardianEmail', event.target.value)}
                    placeholder="guardian@example.com"
                  />
                </label>
                <label>
                  Parent/guardian mobile
                  <input
                    value={row.guardianMobile}
                    onChange={(event) => updateRow(row.key, 'guardianMobile', event.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>
              </div>
              {issuesForRow(index).length > 0 ? (
                <ul className="row-validation-list" aria-label={`Student ${index + 1} validation errors`}>
                  {issuesForRow(index).map((issue) => (
                    <li key={`${issue.field}-${issue.message}`}>
                      {fieldLabel(issue.field)}: {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <div className="import-action-row">
          <button type="submit" disabled={!canSubmit}>Validate rows</button>
          <button type="button" onClick={handleImport} disabled={!canSubmit}>
            Import students
          </button>
          <button type="button" onClick={handleQueue} disabled={!canSubmit}>
            Queue import job
          </button>
        </div>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleInviteStudentLogin}>
        <h3>Student login invitation</h3>
        {students.length === 0 ? (
          <div className="api-empty-state">
            <strong>No imported students yet</strong>
            <span>Import students first, then invite student portal logins from this selector.</span>
          </div>
        ) : null}
        <label>
          Student
          <select
            name="student"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            disabled={students.length === 0}
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName} ({student.admissionNumber})
              </option>
            ))}
          </select>
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
        <button type="submit" disabled={submitting}>Invite student login</button>
      </form>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="toast-message" role="status">{message}</p> : null}
      {rowIssues.length > 0 ? (
        <div className="validation-summary" role="status">
          <strong>Validation summary</strong>
          <span>{rowIssues.length} issue{rowIssues.length === 1 ? '' : 's'} need attention before import.</span>
        </div>
      ) : null}
    </section>
  );
}

function parseCsvRows(csvText: string): StudentImportDraft[] {
  const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const get = (name: string) => values[headers.indexOf(name)]?.trim() ?? '';
    return {
      key: `csv-row-${index + 1}`,
      admissionNumber: get('admissionNumber'),
      firstName: get('firstName'),
      lastName: get('lastName'),
      dateOfBirth: get('dateOfBirth'),
      gender: get('gender'),
      rollNumber: get('rollNumber'),
      guardianEmail: get('guardianEmail'),
      guardianMobile: get('guardianMobile'),
    };
  });
}

function readTextFromFile(file: File): Promise<string> {
  if ('text' in file && typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error ?? new Error('CSV read failed')));
    reader.readAsText(file);
  });
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (character === ',' && !quoted) {
      values.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  values.push(current);
  return values;
}

function fieldLabel(field: string) {
  const labels: Record<string, string> = {
    admissionNumber: 'Admission number',
    firstName: 'First name',
    lastName: 'Last name',
    fullName: 'Student name',
    classLevelId: 'Class',
    sectionId: 'Section',
    rollNumber: 'Roll number',
    dateOfBirth: 'Date of birth',
    gender: 'Gender',
    guardianEmail: 'Guardian email',
    guardianMobile: 'Guardian mobile',
  };
  return labels[field] ?? field;
}

function mergeStudents(currentStudents: StudentSummary[], importedStudents: StudentSummary[]) {
  const studentsById = new Map(currentStudents.map((student) => [student.id, student]));
  importedStudents.forEach((student) => studentsById.set(student.id, student));
  return Array.from(studentsById.values());
}
