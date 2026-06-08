import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TenantSettings, TenantUsage } from '../api/tenantSettingsApi';
import { TenantSettingsPage, TenantUsagePage } from './TenantSettingsPage';

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
  it('requires a Tenant Admin token before loading settings', async () => {
    const onLoadSettings = vi.fn();

    render(
      <TenantSettingsPage
        onLoadSettings={onLoadSettings}
        storage={storageWithToken(null)}
      />,
    );

    expect(await screen.findByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onLoadSettings).not.toHaveBeenCalled();
  });

  it('loads organization settings with the stored token', async () => {
    const onLoadSettings = vi.fn().mockResolvedValue(settings);

    render(
      <TenantSettingsPage
        onLoadSettings={onLoadSettings}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    await waitFor(() => expect(onLoadSettings).toHaveBeenCalledWith('tenant-admin-token'));
    expect(await screen.findByDisplayValue(/trust schools group/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/billing@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/TRUST/i)).toBeInTheDocument();
  });

  it('updates organization settings with the stored token', async () => {
    const onLoadSettings = vi.fn().mockResolvedValue(settings);
    const onUpdateSettings = vi.fn().mockResolvedValue({
      ...settings,
      displayName: 'Updated Trust',
      billingEmail: 'accounts@example.com',
    });

    render(
      <TenantSettingsPage
        onLoadSettings={onLoadSettings}
        onUpdateSettings={onUpdateSettings}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    expect(await screen.findByDisplayValue(/trust schools group/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Updated Trust' } });
    fireEvent.change(screen.getByLabelText(/billing email/i), { target: { value: 'accounts@example.com' } });
    fireEvent.change(screen.getByLabelText(/support email/i), { target: { value: 'help@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => expect(onUpdateSettings).toHaveBeenCalledWith({
      displayName: 'Updated Trust',
      billingEmail: 'accounts@example.com',
      supportEmail: 'help@example.com',
      timezone: 'Asia/Kolkata',
      locale: 'en-IN',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/updated trust settings updated\./i)).toBeInTheDocument();
  });
});

describe('TenantUsagePage', () => {
  it('loads subscription usage as read-only Tenant Admin data', async () => {
    const onLoadUsage = vi.fn().mockResolvedValue(usage);

    render(
      <TenantUsagePage
        onLoadUsage={onLoadUsage}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    await waitFor(() => expect(onLoadUsage).toHaveBeenCalledWith('tenant-admin-token'));
    expect(await screen.findByText(/subscription usage/i)).toBeInTheDocument();
    expect(screen.getAllByText('2/3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('120').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Schools 67% used')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });
});
