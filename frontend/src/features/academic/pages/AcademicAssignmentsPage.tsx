import { FormEvent, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import {
  AcademicYearResponse,
  ClassLevelResponse,
  listAcademicYears,
  listClassLevels,
} from '../api/academicApi';
import {
  assignSubjectToClass,
  assignTeacher,
  ClassSubjectAssignmentRequest,
  ClassSubjectAssignmentResponse,
  createSubject,
  listClassSubjectAssignments,
  listSubjects,
  listTeacherAssignments,
  listTeacherDirectory,
  SubjectRequest,
  SubjectResponse,
  TeacherAssignmentRequest,
  TeacherAssignmentResponse,
  TeacherDirectorySummary,
} from '../api/academicAssignmentsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type AcademicAssignmentsPageProps = {
  onCreateSubject?: (payload: SubjectRequest, accessToken: string) => Promise<SubjectResponse>;
  onAssignSubjectToClass?: (
    payload: ClassSubjectAssignmentRequest,
    accessToken: string,
  ) => Promise<ClassSubjectAssignmentResponse>;
  onAssignTeacher?: (
    payload: TeacherAssignmentRequest,
    accessToken: string,
  ) => Promise<TeacherAssignmentResponse>;
  onLoadAcademicYears?: (accessToken: string) => Promise<AcademicYearResponse[]>;
  onLoadClassLevels?: (academicYearId: string, accessToken: string) => Promise<ClassLevelResponse[]>;
  onLoadSubjects?: (accessToken: string) => Promise<SubjectResponse[]>;
  onLoadClassSubjectAssignments?: (
    classLevelId: string,
    accessToken: string,
  ) => Promise<ClassSubjectAssignmentResponse[]>;
  onLoadTeacherAssignments?: (classLevelId: string, accessToken: string) => Promise<TeacherAssignmentResponse[]>;
  onLoadTeachers?: (accessToken: string) => Promise<TeacherDirectorySummary[]>;
  storage?: Pick<Storage, 'getItem'>;
};

export function AcademicAssignmentsPage({
  onCreateSubject = createSubject,
  onAssignSubjectToClass = assignSubjectToClass,
  onAssignTeacher = assignTeacher,
  onLoadAcademicYears = listAcademicYears,
  onLoadClassLevels = listClassLevels,
  onLoadSubjects = listSubjects,
  onLoadClassSubjectAssignments = listClassSubjectAssignments,
  onLoadTeacherAssignments = listTeacherAssignments,
  onLoadTeachers = listTeacherDirectory,
  storage = globalThis.sessionStorage,
}: AcademicAssignmentsPageProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectAssignmentResponse[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherDirectorySummary[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [selectedClassLevelId, setSelectedClassLevelId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherUserId, setSelectedTeacherUserId] = useState('');
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedClassLevel = useMemo(
    () => classLevels.find((classLevel) => classLevel.id === selectedClassLevelId),
    [classLevels, selectedClassLevelId],
  );
  const filteredTeachers = useMemo(() => {
    const search = teacherSearch.trim().toLowerCase();
    if (!search) {
      return teachers;
    }
    return teachers.filter((teacher) => (
      teacher.fullName.toLowerCase().includes(search)
      || teacher.email.toLowerCase().includes(search)
      || teacher.employeeNumber?.toLowerCase().includes(search)
    ));
  }, [teachers, teacherSearch]);

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedAcademicYearId) {
      setClassLevels([]);
      setSelectedClassLevelId('');
      return;
    }
    void loadClasses(selectedAcademicYearId);
  }, [selectedAcademicYearId]);

  useEffect(() => {
    if (!selectedClassLevelId) {
      setClassSubjects([]);
      setTeacherAssignments([]);
      setSelectedClassSubjectId('');
      return;
    }
    void loadAssignments(selectedClassLevelId);
  }, [selectedClassLevelId]);

  async function loadInitialData(preferredSubjectId?: string) {
    const accessToken = token();
    if (!accessToken) {
      setStatus('idle');
      setError('School Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const [loadedYears, loadedSubjects, loadedTeachers] = await Promise.all([
        onLoadAcademicYears(accessToken),
        onLoadSubjects(accessToken),
        onLoadTeachers(accessToken),
      ]);
      setAcademicYears(loadedYears);
      setSubjects(loadedSubjects);
      setTeachers(loadedTeachers);
      setSelectedSubjectId(
        loadedSubjects.find((subject) => subject.id === preferredSubjectId)?.id
          ?? loadedSubjects[0]?.id
          ?? '',
      );
      setSelectedTeacherUserId(loadedTeachers[0]?.userId ?? '');
      setSelectedAcademicYearId(
        loadedYears.find((year) => year.status === 'ACTIVE')?.id
          ?? loadedYears[0]?.id
          ?? '',
      );
    } catch {
      setAcademicYears([]);
      setSubjects([]);
      setTeachers([]);
      setError('Academic assignment data could not be loaded.');
    } finally {
      setStatus('idle');
    }
  }

  async function loadClasses(academicYearId: string) {
    const accessToken = token();
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const loadedClasses = await onLoadClassLevels(academicYearId, accessToken);
      setClassLevels(loadedClasses);
      setSelectedClassLevelId(loadedClasses[0]?.id ?? '');
    } catch {
      setClassLevels([]);
      setSelectedClassLevelId('');
      setError('Classes could not be loaded for the selected academic year.');
    } finally {
      setStatus('idle');
    }
  }

  async function loadAssignments(classLevelId: string, preferredClassSubjectId?: string) {
    const accessToken = token();
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const [loadedClassSubjects, loadedTeacherAssignments] = await Promise.all([
        onLoadClassSubjectAssignments(classLevelId, accessToken),
        onLoadTeacherAssignments(classLevelId, accessToken),
      ]);
      setClassSubjects(loadedClassSubjects);
      setTeacherAssignments(loadedTeacherAssignments);
      setSelectedClassSubjectId(
        loadedClassSubjects.find((assignment) => assignment.id === preferredClassSubjectId)?.id
          ?? loadedClassSubjects[0]?.id
          ?? '',
      );
    } catch {
      setClassSubjects([]);
      setTeacherAssignments([]);
      setSelectedClassSubjectId('');
      setError('Subject and teacher assignments could not be loaded for the selected class.');
    } finally {
      setStatus('idle');
    }
  }

  async function handleSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: SubjectRequest = {
      code: String(formData.get('subjectCode') ?? '').trim(),
      name: String(formData.get('subjectName') ?? '').trim(),
    };

    if (!payload.code || !payload.name) {
      setError('Subject code and subject name are required.');
      return;
    }

    await withToken(async (accessToken) => {
      const result = await onCreateSubject(payload, accessToken);
      setMessage(`${result.name} subject created.`);
      form.reset();
      await loadInitialData(result.id);
    }, 'Subject could not be saved.');
  }

  async function handleClassSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedClassLevelId) {
      setError('Select a class before assigning a subject.');
      return;
    }
    if (!selectedSubjectId) {
      setError('Create or select a subject before assigning it to a class.');
      return;
    }

    await withToken(async (accessToken) => {
      const result = await onAssignSubjectToClass({
        classLevelId: selectedClassLevelId,
        subjectId: selectedSubjectId,
      }, accessToken);
      setMessage(`${result.subjectName} assigned to ${result.className}.`);
      await loadAssignments(selectedClassLevelId, result.id);
    }, 'Subject could not be assigned to the class.');
  }

  async function handleTeacherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTeacherUserId) {
      setError('Select a teacher before assigning class responsibility.');
      return;
    }
    if (!selectedClassSubjectId) {
      setError('Assign a subject to the selected class before choosing a teacher.');
      return;
    }

    await withToken(async (accessToken) => {
      const result = await onAssignTeacher({
        teacherUserId: selectedTeacherUserId,
        classSubjectAssignmentId: selectedClassSubjectId,
      }, accessToken);
      setMessage(`${result.teacherName} assigned to ${result.subjectName}.`);
      await loadAssignments(selectedClassLevelId, selectedClassSubjectId);
    }, 'Teacher could not be assigned.');
  }

  async function withToken(action: (accessToken: string) => Promise<void>, fallbackMessage: string) {
    const accessToken = token();
    if (!accessToken) {
      setError('School Admin login is required.');
      setMessage(null);
      return;
    }

    setStatus('saving');
    setError(null);
    try {
      await action(accessToken);
    } catch (caught) {
      setError(friendlyError(caught, fallbackMessage));
      setMessage(null);
    } finally {
      setStatus('idle');
    }
  }

  function token() {
    return storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  return (
    <section className="workflow-panel" aria-labelledby="academic-assignments-title">
      <p className="eyebrow">ACA-002</p>
      <h2 id="academic-assignments-title">Academic assignments</h2>

      {status === 'loading' ? <AssignmentSkeleton /> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-result" role="status">{message}</p> : null}

      <div className="api-record-list" aria-label="Subjects">
        {subjects.map((subject) => (
          <article key={subject.id} aria-current={subject.id === selectedSubjectId ? 'true' : undefined}>
            <strong>{subject.name}</strong>
            <span>{subject.code}</span>
            <span>{subject.active ? 'Active' : 'Inactive'}</span>
          </article>
        ))}
      </div>

      {status !== 'loading' && subjects.length === 0 ? (
        <div className="api-empty-state">
          <strong>No subjects yet</strong>
          <span>Create subjects once, then assign them to the classes that study them.</span>
        </div>
      ) : null}

      <form className="workflow-form compact-form" onSubmit={handleSubjectSubmit}>
        <label>
          Subject code
          <input name="subjectCode" placeholder="MATH" required />
        </label>
        <label>
          Subject name
          <input name="subjectName" placeholder="Mathematics" required />
        </label>
        <button disabled={status === 'saving'} type="submit">Save subject</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleClassSubjectSubmit}>
        <label>
          Academic year
          <select
            aria-label="Academic year for assignment"
            value={selectedAcademicYearId}
            onChange={(event) => setSelectedAcademicYearId(event.target.value)}
            required
          >
            <option value="" disabled>Select academic year</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>{year.name}</option>
            ))}
          </select>
        </label>
        <label>
          Class
          <select
            aria-label="Class for subject assignment"
            value={selectedClassLevelId}
            onChange={(event) => setSelectedClassLevelId(event.target.value)}
            required
          >
            <option value="" disabled>Select class</option>
            {classLevels.map((classLevel) => (
              <option key={classLevel.id} value={classLevel.id}>{classLevel.name}</option>
            ))}
          </select>
        </label>
        <label>
          Subject
          <select
            aria-label="Subject for class assignment"
            value={selectedSubjectId}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            required
          >
            <option value="" disabled>Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
            ))}
          </select>
        </label>
        <button disabled={status === 'saving' || !selectedClassLevelId || !selectedSubjectId} type="submit">
          Assign subject
        </button>
      </form>

      <div className="api-record-list" aria-label="Class subjects">
        {classSubjects.map((assignment) => (
          <article key={assignment.id} aria-current={assignment.id === selectedClassSubjectId ? 'true' : undefined}>
            <strong>{assignment.subjectName}</strong>
            <span>{assignment.className}</span>
            <span>{assignment.active ? 'Active' : 'Inactive'}</span>
          </article>
        ))}
      </div>

      {selectedClassLevelId && status !== 'loading' && classSubjects.length === 0 ? (
        <div className="api-empty-state">
          <strong>No subjects assigned</strong>
          <span>Assign a subject to {selectedClassLevel?.name ?? 'this class'} before adding teachers.</span>
        </div>
      ) : null}

      <form className="workflow-form compact-form" onSubmit={handleTeacherSubmit}>
        <label>
          Search teacher
          <input
            aria-label="Search teacher"
            placeholder="Name, email or employee number"
            value={teacherSearch}
            onChange={(event) => setTeacherSearch(event.target.value)}
          />
        </label>
        <label>
          Teacher
          <select
            aria-label="Teacher for assignment"
            value={selectedTeacherUserId}
            onChange={(event) => setSelectedTeacherUserId(event.target.value)}
            required
          >
            <option value="" disabled>Select teacher</option>
            {filteredTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.userId}>
                {teacher.fullName} - {teacher.designation ?? teacher.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          Class subject
          <select
            aria-label="Class subject for teacher assignment"
            value={selectedClassSubjectId}
            onChange={(event) => setSelectedClassSubjectId(event.target.value)}
            required
          >
            <option value="" disabled>Select class subject</option>
            {classSubjects.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.className} - {assignment.subjectName}
              </option>
            ))}
          </select>
        </label>
        <button disabled={status === 'saving' || !selectedTeacherUserId || !selectedClassSubjectId} type="submit">
          Assign teacher
        </button>
      </form>

      <div className="api-record-list" aria-label="Teacher assignments">
        {teacherAssignments.map((assignment) => (
          <article key={assignment.id}>
            <strong>{assignment.teacherName}</strong>
            <span>{assignment.className} - {assignment.subjectName}</span>
            <span>{assignment.active ? 'Active' : 'Inactive'}</span>
          </article>
        ))}
      </div>

      {selectedClassLevelId && status !== 'loading' && teacherAssignments.length === 0 ? (
        <div className="api-empty-state">
          <strong>No teachers assigned</strong>
          <span>Choose a teacher and class subject to complete the assignment.</span>
        </div>
      ) : null}

      {status !== 'loading' && academicYears.length === 0 ? (
        <div className="api-empty-state">
          <strong>Academic setup required</strong>
          <span>Create an academic year and class before assigning subjects and teachers.</span>
        </div>
      ) : null}
      {status !== 'loading' && teachers.length === 0 ? (
        <div className="api-empty-state">
          <strong>No teachers available</strong>
          <span>Provision teacher staff accounts before assigning class responsibilities.</span>
        </div>
      ) : null}
    </section>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="api-skeleton" aria-label="Loading academic assignments">
      <span />
      <span />
      <span />
    </div>
  );
}

function friendlyError(caught: unknown, fallbackMessage: string) {
  if (caught instanceof ApiError) {
    const message = caught.message.toLowerCase();
    if (caught.status === 409 || message.includes('already exists') || message.includes('duplicate')) {
      return 'This academic assignment already exists. Select the existing item or choose a different combination.';
    }
    return caught.message;
  }
  return fallbackMessage;
}
