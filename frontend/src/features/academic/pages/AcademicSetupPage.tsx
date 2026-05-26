import { FormEvent, useState } from 'react';

import {
  AcademicYearRequest,
  AcademicYearResponse,
  ClassLevelRequest,
  ClassLevelResponse,
  createAcademicYear,
  createClassLevel,
  createSection,
  SectionRequest,
  SectionResponse,
} from '../api/academicApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type AcademicSetupPageProps = {
  onCreateAcademicYear?: (payload: AcademicYearRequest, accessToken: string) => Promise<AcademicYearResponse>;
  onCreateClassLevel?: (payload: ClassLevelRequest, accessToken: string) => Promise<ClassLevelResponse>;
  onCreateSection?: (payload: SectionRequest, accessToken: string) => Promise<SectionResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function AcademicSetupPage({
  onCreateAcademicYear = createAcademicYear,
  onCreateClassLevel = createClassLevel,
  onCreateSection = createSection,
  storage = globalThis.sessionStorage,
}: AcademicSetupPageProps) {
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
      setError('Academic setup failed.');
      setMessage(null);
    }
  }

  async function handleAcademicYearSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: AcademicYearRequest = {
      name: String(formData.get('academicYearName') ?? ''),
      startDate: String(formData.get('startDate') ?? ''),
      endDate: String(formData.get('endDate') ?? ''),
      activate: formData.get('activate') === 'on',
    };
    await withToken(
      (accessToken) => onCreateAcademicYear(payload, accessToken),
      (result) => `${result.name} is ${result.status.toLowerCase()}`,
    );
  }

  async function handleClassSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: ClassLevelRequest = {
      academicYearId: String(formData.get('academicYearId') ?? ''),
      name: String(formData.get('className') ?? ''),
      displayOrder: Number(formData.get('displayOrder') ?? 0),
    };
    await withToken(
      (accessToken) => onCreateClassLevel(payload, accessToken),
      (result) => `${result.name} class created`,
    );
  }

  async function handleSectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawCapacity = String(formData.get('capacity') ?? '');
    const payload: SectionRequest = {
      classLevelId: String(formData.get('classLevelId') ?? ''),
      name: String(formData.get('sectionName') ?? ''),
      capacity: rawCapacity ? Number(rawCapacity) : undefined,
    };
    await withToken(
      (accessToken) => onCreateSection(payload, accessToken),
      (result) => `${result.name} section created`,
    );
  }

  return (
    <section className="workflow-panel" aria-labelledby="academic-setup-title">
      <p className="eyebrow">ACA-001</p>
      <h2 id="academic-setup-title">Academic setup</h2>

      <form className="workflow-form compact-form" onSubmit={handleAcademicYearSubmit}>
        <label>
          Academic year
          <input name="academicYearName" placeholder="2026-2027" required />
        </label>
        <label>
          Start date
          <input name="startDate" required type="date" />
        </label>
        <label>
          End date
          <input name="endDate" required type="date" />
        </label>
        <label className="inline-check">
          <input name="activate" type="checkbox" />
          Activate
        </label>
        <button type="submit">Save year</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleClassSubmit}>
        <label>
          Academic year ID
          <input name="academicYearId" placeholder="academic-year-uuid" required />
        </label>
        <label>
          Class name
          <input name="className" placeholder="Class 1" required />
        </label>
        <label>
          Display order
          <input name="displayOrder" min="0" required type="number" />
        </label>
        <button type="submit">Save class</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleSectionSubmit}>
        <label>
          Class ID
          <input name="classLevelId" placeholder="class-uuid" required />
        </label>
        <label>
          Section name
          <input name="sectionName" placeholder="A" required />
        </label>
        <label>
          Capacity
          <input name="capacity" min="1" type="number" />
        </label>
        <button type="submit">Save section</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}
