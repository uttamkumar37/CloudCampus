import { FormEvent, useState } from 'react';

import {
  assignSubjectToClass,
  assignTeacher,
  ClassSubjectAssignmentRequest,
  ClassSubjectAssignmentResponse,
  createSubject,
  SubjectRequest,
  SubjectResponse,
  TeacherAssignmentRequest,
  TeacherAssignmentResponse,
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
  storage?: Pick<Storage, 'getItem'>;
};

export function AcademicAssignmentsPage({
  onCreateSubject = createSubject,
  onAssignSubjectToClass = assignSubjectToClass,
  onAssignTeacher = assignTeacher,
  storage = globalThis.sessionStorage,
}: AcademicAssignmentsPageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function withToken<T>(action: (accessToken: string) => Promise<T>, success: (result: T) => string) {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setMessage(null);
      return;
    }

    setError(null);
    try {
      setMessage(success(await action(accessToken)));
    } catch {
      setError('Academic assignment failed.');
      setMessage(null);
    }
  }

  async function handleSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: SubjectRequest = {
      code: String(formData.get('subjectCode') ?? ''),
      name: String(formData.get('subjectName') ?? ''),
    };
    await withToken(
      (accessToken) => onCreateSubject(payload, accessToken),
      (result) => `${result.code} subject created`,
    );
  }

  async function handleClassSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: ClassSubjectAssignmentRequest = {
      classLevelId: String(formData.get('classLevelId') ?? ''),
      subjectId: String(formData.get('subjectId') ?? ''),
    };
    await withToken(
      (accessToken) => onAssignSubjectToClass(payload, accessToken),
      (result) => `${result.subjectName} assigned to ${result.className}`,
    );
  }

  async function handleTeacherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: TeacherAssignmentRequest = {
      teacherUserId: String(formData.get('teacherUserId') ?? ''),
      classSubjectAssignmentId: String(formData.get('classSubjectAssignmentId') ?? ''),
    };
    await withToken(
      (accessToken) => onAssignTeacher(payload, accessToken),
      (result) => `${result.teacherName} assigned to ${result.subjectName}`,
    );
  }

  return (
    <section className="workflow-panel" aria-labelledby="academic-assignments-title">
      <p className="eyebrow">ACA-002</p>
      <h2 id="academic-assignments-title">Academic assignments</h2>

      <form className="workflow-form compact-form" onSubmit={handleSubjectSubmit}>
        <label>
          Subject code
          <input name="subjectCode" placeholder="MATH" required />
        </label>
        <label>
          Subject name
          <input name="subjectName" placeholder="Mathematics" required />
        </label>
        <button type="submit">Save subject</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleClassSubjectSubmit}>
        <label>
          Class ID
          <input name="classLevelId" placeholder="class-uuid" required />
        </label>
        <label>
          Subject ID
          <input name="subjectId" placeholder="subject-uuid" required />
        </label>
        <button type="submit">Assign subject</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleTeacherSubmit}>
        <label>
          Teacher user ID
          <input name="teacherUserId" placeholder="teacher-user-uuid" required />
        </label>
        <label>
          Class subject ID
          <input name="classSubjectAssignmentId" placeholder="class-subject-uuid" required />
        </label>
        <button type="submit">Assign teacher</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}
