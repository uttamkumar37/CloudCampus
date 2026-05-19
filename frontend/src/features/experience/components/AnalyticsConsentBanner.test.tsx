import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AnalyticsConsentBanner } from './AnalyticsConsentBanner';
import { useExperienceStore } from '../store/experienceStore';

function renderBanner(pathname = '/') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AnalyticsConsentBanner />
    </MemoryRouter>
  );
}

describe('AnalyticsConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    useExperienceStore.setState({ consentStatus: 'pending', consentGiven: false });
  });

  it('shows on public website routes until the visitor makes a consent choice', () => {
    renderBanner('/features');

    expect(screen.getByLabelText('Analytics consent')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
  });

  it('does not show on authenticated or auth routes', () => {
    renderBanner('/login');

    expect(screen.queryByLabelText('Analytics consent')).not.toBeInTheDocument();
  });

  it('keeps analytics disabled when declined', async () => {
    const user = userEvent.setup();
    renderBanner('/demo');

    await user.click(screen.getByRole('button', { name: 'Decline' }));

    expect(useExperienceStore.getState().consentStatus).toBe('declined');
    expect(useExperienceStore.getState().consentGiven).toBe(false);
    expect(screen.queryByLabelText('Analytics consent')).not.toBeInTheDocument();
  });
});
