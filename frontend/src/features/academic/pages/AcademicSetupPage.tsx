import { FormEvent, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import {
  AcademicYearRequest,
  AcademicYearResponse,
  ClassLevelRequest,
  ClassLevelResponse,
  createAcademicYear,
  createClassLevel,
  createSection,
  listAcademicYears,
  listClassLevels,
  listSections,
  SectionRequest,
  SectionResponse,
} from '../api/academicApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type AcademicSetupPageProps = {
  onCreateAcademicYear?: (payload: AcademicYearRequest, accessToken: string) => Promise<AcademicYearResponse>;
  onCreateClassLevel?: (payload: ClassLevelRequest, accessToken: string) => Promise<ClassLevelResponse>;
  onCreateSection?: (payload: SectionRequest, accessToken: string) => Promise<SectionResponse>;
  onLoadAcademicYears?: (accessToken: string) => Promise<AcademicYearResponse[]>;
  onLoadClassLevels?: (academicYearId: string, accessToken: string) => Promise<ClassLevelResponse[]>;
  onLoadSections?: (classLevelId: string, accessToken: string) => Promise<SectionResponse[]>;
  storage?: Pick<Storage, 'getItem'>;
};

export function AcademicSetupPage({
  onCreateAcademicYear = createAcademicYear,
  onCreateClassLevel = createClassLevel,
  onCreateSection = createSection,
  onLoadAcademicYears = listAcademicYears,
  onLoadClassLevels = listClassLevels,
  onLoadSections = listSections,
  storage = globalThis.sessionStorage,
}: AcademicSetupPageProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [selectedClassLevelId, setSelectedClassLevelId] = useState('');
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAcademicYear = useMemo(
    () => academicYears.find((year) => year.id === selectedAcademicYearId),
    [academicYears, selectedAcademicYearId],
  );
  const selectedClassLevel = useMemo(
    () => classLevels.find((classLevel) => classLevel.id === selectedClassLevelId),
    [classLevels, selectedClassLevelId],
  );

  useEffect(() => {
    void loadAcademicYears();
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
      setSections([]);
      return;
    }
    void loadClassSections(selectedClassLevelId);
  }, [selectedClassLevelId]);

  async function loadAcademicYears(preferredAcademicYearId?: string) {
    const accessToken = token();
    if (!accessToken) {
      setStatus('idle');
      setError('School Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const loadedYears = await onLoadAcademicYears(accessToken);
      setAcademicYears(loadedYears);
      const activeYear = loadedYears.find((year) => year.id === preferredAcademicYearId)
        ?? loadedYears.find((year) => year.status === 'ACTIVE')
        ?? loadedYears[0];
      setSelectedAcademicYearId(activeYear?.id ?? '');
    } catch {
      setAcademicYears([]);
      setError('Academic years could not be loaded.');
    } finally {
      setStatus('idle');
    }
  }

  async function loadClasses(academicYearId: string, preferredClassLevelId?: string) {
    const accessToken = token();
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const loadedClasses = await onLoadClassLevels(academicYearId, accessToken);
      setClassLevels(loadedClasses);
      const selectedClass = loadedClasses.find((classLevel) => classLevel.id === preferredClassLevelId)
        ?? loadedClasses[0];
      setSelectedClassLevelId(selectedClass?.id ?? '');
    } catch {
      setClassLevels([]);
      setSelectedClassLevelId('');
      setError('Classes could not be loaded for the selected academic year.');
    } finally {
      setStatus('idle');
    }
  }

  async function loadClassSections(classLevelId: string) {
    const accessToken = token();
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      setSections(await onLoadSections(classLevelId, accessToken));
    } catch {
      setSections([]);
      setError('Sections could not be loaded for the selected class.');
    } finally {
      setStatus('idle');
    }
  }

  async function handleAcademicYearSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: AcademicYearRequest = {
      name: String(formData.get('academicYearName') ?? '').trim(),
      startDate: String(formData.get('startDate') ?? ''),
      endDate: String(formData.get('endDate') ?? ''),
      activate: formData.get('activate') === 'on',
    };

    if (!payload.name || !payload.startDate || !payload.endDate) {
      setError('Academic year name, start date and end date are required.');
      return;
    }

    await withToken(async (accessToken) => {
      const result = await onCreateAcademicYear(payload, accessToken);
      setMessage(`${result.name} is ${result.status.toLowerCase()}.`);
      form.reset();
      await loadAcademicYears(result.id);
    }, 'Academic year could not be saved.');
  }

  async function handleClassSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const className = String(formData.get('className') ?? '').trim();
    const displayOrder = Number(formData.get('displayOrder') ?? 0);

    if (!selectedAcademicYearId) {
      setError('Select an academic year before creating a class.');
      return;
    }
    if (!className) {
      setError('Class name is required.');
      return;
    }

    await withToken(async (accessToken) => {
      const result = await onCreateClassLevel({
        academicYearId: selectedAcademicYearId,
        name: className,
        displayOrder,
      }, accessToken);
      setMessage(`${result.name} class created for ${selectedAcademicYear?.name ?? 'the selected year'}.`);
      form.reset();
      await loadClasses(selectedAcademicYearId, result.id);
    }, 'Class could not be saved.');
  }

  async function handleSectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const sectionName = String(formData.get('sectionName') ?? '').trim();
    const rawCapacity = String(formData.get('capacity') ?? '');

    if (!selectedClassLevelId) {
      setError('Select a class before creating a section.');
      return;
    }
    if (!sectionName) {
      setError('Section name is required.');
      return;
    }

    await withToken(async (accessToken) => {
      const result = await onCreateSection({
        classLevelId: selectedClassLevelId,
        name: sectionName,
        capacity: rawCapacity ? Number(rawCapacity) : undefined,
      }, accessToken);
      setMessage(`${result.name} section created for ${selectedClassLevel?.name ?? 'the selected class'}.`);
      form.reset();
      await loadClassSections(selectedClassLevelId);
    }, 'Section could not be saved.');
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
    <section className="workflow-panel" aria-labelledby="academic-setup-title">
      <p className="eyebrow">ACA-001</p>
      <h2 id="academic-setup-title">Academic setup</h2>

      {status === 'loading' ? <SetupSkeleton /> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-result" role="status">{message}</p> : null}

      <div className="api-record-list" aria-label="Academic years">
        {academicYears.map((year) => (
          <article key={year.id} aria-current={year.id === selectedAcademicYearId ? 'true' : undefined}>
            <strong>{year.name}</strong>
            <span>{formatDate(year.startDate)} - {formatDate(year.endDate)}</span>
            <span>{year.status === 'ACTIVE' ? 'Current academic year' : year.status.toLowerCase()}</span>
          </article>
        ))}
      </div>

      {status !== 'loading' && academicYears.length === 0 ? (
        <div className="api-empty-state">
          <strong>No academic years yet</strong>
          <span>Create the first academic year to unlock class and section setup.</span>
        </div>
      ) : null}

      <form className="workflow-form compact-form" onSubmit={handleAcademicYearSubmit}>
        <label>
          Academic year name
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
          Set as current year
        </label>
        <button disabled={status === 'saving'} type="submit">Save year</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleClassSubmit}>
        <label>
          Academic year
          <select
            aria-label="Academic year for class"
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
          Class name
          <input name="className" placeholder="Class 1" required />
        </label>
        <label>
          Display order
          <input name="displayOrder" min="0" required type="number" />
        </label>
        <button disabled={status === 'saving' || !selectedAcademicYearId} type="submit">Save class</button>
      </form>

      <div className="api-record-list" aria-label="Classes">
        {classLevels.map((classLevel) => (
          <article key={classLevel.id} aria-current={classLevel.id === selectedClassLevelId ? 'true' : undefined}>
            <strong>{classLevel.name}</strong>
            <span>{selectedAcademicYear?.name ?? 'Selected academic year'}</span>
            <span>{classLevel.active ? 'Active' : 'Inactive'}</span>
          </article>
        ))}
      </div>

      {selectedAcademicYearId && status !== 'loading' && classLevels.length === 0 ? (
        <div className="api-empty-state">
          <strong>No classes yet</strong>
          <span>Create the first class for {selectedAcademicYear?.name ?? 'this academic year'}.</span>
        </div>
      ) : null}

      <form className="workflow-form compact-form" onSubmit={handleSectionSubmit}>
        <label>
          Class
          <select
            aria-label="Class for section"
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
          Section name
          <input name="sectionName" placeholder="A" required />
        </label>
        <label>
          Capacity
          <input name="capacity" min="1" type="number" />
        </label>
        <button disabled={status === 'saving' || !selectedClassLevelId} type="submit">Save section</button>
      </form>

      <div className="api-record-list" aria-label="Sections">
        {sections.map((section) => (
          <article key={section.id}>
            <strong>{section.name}</strong>
            <span>{selectedClassLevel?.name ?? 'Selected class'}</span>
            <span>{section.capacity ? `${section.capacity} seats` : 'No capacity set'}</span>
          </article>
        ))}
      </div>

      {selectedClassLevelId && status !== 'loading' && sections.length === 0 ? (
        <div className="api-empty-state">
          <strong>No sections yet</strong>
          <span>Create the first section for {selectedClassLevel?.name ?? 'this class'}.</span>
        </div>
      ) : null}
    </section>
  );
}

function SetupSkeleton() {
  return (
    <div className="api-skeleton" aria-label="Loading academic setup">
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
      return 'This academic setup item already exists. Choose a different name or select the existing item.';
    }
    return caught.message;
  }
  return fallbackMessage;
}

function formatDate(value: string) {
  if (!value) {
    return 'Not set';
  }
  return value;
}
