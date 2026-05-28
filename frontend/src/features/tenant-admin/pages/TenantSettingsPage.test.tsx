import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TenantSettingsPage } from './TenantSettingsPage';
import type { TenantSettings, TenantUsage } from '../api/tenantSettingsApi';

function storageWithToken(token: string | null) {
  return {
    getItem: vi.fn(() => token),
  };
}

const settings: TenantSettings = {
  tenantId: 'tenant-1',
  tenantCode: 'TRUST',
  tenantName: 'Trust Schools',
  displayName: 'Trust Schools Group',
  billingEmail: 'billing@example.com',
  supportEmail: 'support@example.com',
  timezone: 'Asia/Kolkata',
  locale: 'en-IN',
  updatedAt: '2026-05-26T17:00:00Z',
};

const usage: TenantUsage = {
  tenantId: 'tenant-1',
  tenantCode: 'TRUST',
  tenantName: 'Trust Schools',
  tenantStatus: 'ACTIVE',
  planCode: 'SCAFFOLD',
  maxSchools: 3,
  schoolsUsed: 2,
  activeSchools: 2,
  remainingSchools: 1,
  schoolAdmins: 2,
  teachers: 5,
  staff: 7,
  students: 120,
  schoolLimitReached: false,
};

describe('TenantSettingsPage', () => {
  it('requires a Tenant Admin token before loading settings', () => {
    const onLoadSettings = vi.fn();

    render(
      <TenantSettingsPage
        onLoadSettings={onLoadSettings}
        storage={storageWithToken(null)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /load organization settings/i }));

    expect(screen.getByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onLoadSettings).not.toHaveBeenCalled();
  });

  it('loads settings and usage with the stored Bearer token', async () => {
    const onLoadSettings = vi.fn().mockResolvedValue(settings);
    const onLoadUsage = vi.fn().mockResolvedValue(usage);

    render(
      <TenantSettingsPage
        onLoadSettings={onLoadSettings}
        onLoadUsage={onLoadUsage}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /load organization settings/i }));

    await waitFor(() => expect(onLoadSettings).toHaveBeenCalledWith('tenant-admin-token'));
    expect(onLoadUsage).toHaveBeenCalledWith('tenant-admin-token');
    expect(await screen.findByText(/trust schools group settings loaded/i)).toBeInTheDocument();
    expect(screen.getByText(/schools: 2\/3/i)).toBeInTheDocument();
    expect(screen.getByText(/students: 120/i)).toBeInTheDocument();
  });

  it('updates organization settings with the stored Bearer token', async () => {
    const onUpdateSettings = vi.fn().mockResolvedValue({
      ...settings,
      displayName: 'Updated Trust',
      billingEmail: 'accounts@example.com',
    });

    render(
      <TenantSettingsPage
        onUpdateSettings={onUpdateSettings}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Updated Trust' } });
    fireEvent.change(screen.getByLabelText(/billing email/i), { target: { value: 'accounts@example.com' } });
    fireEvent.change(screen.getByLabelText(/support email/i), { target: { value: 'help@example.com' } });
    fireEvent.change(screen.getByLabelText(/timezone/i), { target: { value: 'Asia/Kolkata' } });
    fireEvent.change(screen.getByLabelText(/locale/i), { target: { value: 'en-IN' } });
    fireEvent.click(screen.getByRole('button', { name: /update organization settings/i }));

    await waitFor(() => expect(onUpdateSettings).toHaveBeenCalledWith({
      displayName: 'Updated Trust',
      billingEmail: 'accounts@example.com',
      supportEmail: 'help@example.com',
      timezone: 'Asia/Kolkata',
      locale: 'en-IN',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/updated trust settings updated/i)).toBeInTheDocument();
  });
});
