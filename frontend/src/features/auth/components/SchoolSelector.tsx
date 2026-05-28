import { FormEvent, useEffect, useState } from 'react';

import { useAuthState } from '../hooks/authState';

export function SchoolSelector() {
  const {
    activateSchool,
    allowedSchools,
    currentUser,
    schoolActivationError,
    status,
  } = useAuthState();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [autoActivationAttempted, setAutoActivationAttempted] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }
    const activeSchoolId = currentUser?.activeSchool?.schoolId;
    if (activeSchoolId) {
      setSelectedSchoolId(activeSchoolId);
      return;
    }
    const onlySchool = allowedSchools[0];
    if (allowedSchools.length === 1 && onlySchool && autoActivationAttempted !== onlySchool.schoolId) {
      setSelectedSchoolId(onlySchool.schoolId);
      setAutoActivationAttempted(onlySchool.schoolId);
      void activateSchool(onlySchool.schoolId);
    }
  }, [activateSchool, allowedSchools, autoActivationAttempted, currentUser, status]);

  if (status !== 'authenticated' || !currentUser || allowedSchools.length === 0) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedSchoolId) {
      await activateSchool(selectedSchoolId);
    }
  }

  return (
    <section className="workflow-panel auth-panel" aria-labelledby="school-selector-title">
      <p className="eyebrow">School context</p>
      <h2 id="school-selector-title">Current school</h2>
      <p className="summary compact-summary">
        {currentUser.activeSchool?.name ?? 'No active school selected'}
      </p>
      <p className="form-result">
        {allowedSchools.length === 1
          ? '1 assigned school'
          : `${allowedSchools.length} assigned schools`}
      </p>

      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          School
          <select
            name="schoolId"
            value={selectedSchoolId}
            onChange={(event) => setSelectedSchoolId(event.target.value)}
          >
            <option value="">Select school</option>
            {allowedSchools.map((school) => (
              <option key={school.schoolId} value={school.schoolId}>
                {school.name} ({school.code})
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={!selectedSchoolId}>Activate school</button>
      </form>

      {allowedSchools.length === 1 && !currentUser.activeSchool ? (
        <p className="form-result">Activating your assigned school.</p>
      ) : null}
      {schoolActivationError ? <p className="form-error">{schoolActivationError}</p> : null}
    </section>
  );
}
