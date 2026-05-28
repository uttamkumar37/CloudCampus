import { FormEvent, useEffect, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import {
  getSchoolSettings,
  updateSchoolSettings,
  type SchoolSettings,
} from '../api/schoolSettingsApi';

export function SchoolSettingsPage() {
  const { accessToken } = useAuthState();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadSettings();
  }, [accessToken]);

  async function loadSettings() {
    if (!accessToken) {
      setStatus('idle');
      setError('School Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const response = await getSchoolSettings(accessToken);
      setSettings(response);
      setName(response.name);
    } catch (caught) {
      setSettings(null);
      setError(caught instanceof Error ? caught.message : 'School settings could not be loaded.');
    } finally {
      setStatus('idle');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      setError('School Admin login is required.');
      return;
    }
    if (!name.trim()) {
      setError('School name is required.');
      return;
    }

    setStatus('saving');
    setError(null);
    try {
      const response = await updateSchoolSettings({ name: name.trim() }, accessToken);
      setSettings(response);
      setName(response.name);
      setMessage('School settings updated.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'School settings update failed.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="school-settings-title">
      <p className="eyebrow">Ready</p>
      <h2 id="school-settings-title">School settings</h2>

      {status === 'loading' ? <div className="api-skeleton"><span /><span /><span /></div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}

      {settings ? (
        <>
          <dl className="session-facts">
            <div>
              <dt>School code</dt>
              <dd>{settings.code}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{settings.active ? 'ACTIVE' : 'INACTIVE'}</dd>
            </div>
            <div>
              <dt>Primary school</dt>
              <dd>{settings.primarySchool ? 'Yes' : 'No'}</dd>
            </div>
          </dl>

          <form className="workflow-form compact-form" onSubmit={handleSubmit}>
            <label>
              School name
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={180} required />
            </label>
            <button disabled={status === 'saving'} type="submit">
              {status === 'saving' ? 'Saving...' : 'Save settings'}
            </button>
          </form>
        </>
      ) : null}
    </section>
  );
}
