import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantCreatePage } from './TenantCreatePage';
import * as tenantApi from '../api/tenantApi';
import * as subscriptionApi from '../api/subscriptionApi';
import type { TenantResponse } from '../types/tenant';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('../api/tenantApi');
vi.mock('../api/subscriptionApi');

// react-router-dom navigate mock
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return renderWithProviders(<TenantCreatePage />);
}

const mockCreated: TenantResponse = {
  id: '00000000-0000-0000-0000-000000000002',
  code: 'test-school',
  name: 'Test School',
  status: 'ACTIVE',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const freePlan: subscriptionApi.SubscriptionPlan = {
  code: 'FREE',
  displayName: 'Free',
  description: 'Free starter plan',
  priceMonthlyPaise: 0,
  maxSchools: 1,
  maxStudentsPerSchool: 100,
  maxStaffPerSchool: 20,
};

async function completeIdentityStep() {
  await userEvent.type(screen.getByLabelText(/tenant code/i), 'test-school');
  await userEvent.type(screen.getByLabelText(/organisation name/i), 'Test School');
  await userEvent.click(screen.getByRole('button', { name: /next: select plan/i }));
}

async function completeReviewStep() {
  await completeIdentityStep();
  await userEvent.click(await screen.findByRole('button', { name: /next: review/i }));
}

describe('TenantCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    vi.mocked(subscriptionApi.listSubscriptionPlans).mockResolvedValue([freePlan]);
    vi.mocked(subscriptionApi.assignTenantPlan).mockResolvedValue({
      id: 'sub-1',
      tenantId: mockCreated.id,
      plan: freePlan,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      currentPeriodStart: null,
      currentPeriodEnd: null,
      assignedAt: null,
      notes: null,
    });
  });

  it('renders code and name fields', () => {
    renderPage();
    expect(screen.getByLabelText(/tenant code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organisation name/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /next: select plan/i }));
    await waitFor(() => expect(screen.getByText(/code is required/i)).toBeInTheDocument());
  });

  it('shows validation error for invalid code', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/tenant code/i), '-bad-code-');
    await userEvent.type(screen.getByLabelText(/organisation name/i), 'Valid Name');
    await userEvent.click(screen.getByRole('button', { name: /next: select plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/digits and hyphens only; cannot start or end/i)).toBeInTheDocument();
    });
  });

  it('submits valid form and navigates to tenant list', async () => {
    vi.mocked(tenantApi.createTenant).mockResolvedValue(mockCreated);
    renderPage();
    await completeReviewStep();
    await userEvent.click(screen.getByRole('button', { name: /create tenant/i }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`/super-admin/tenants/${mockCreated.id}`),
    );
  });

  it('shows API error on failure', async () => {
    vi.mocked(tenantApi.createTenant).mockRejectedValue(new Error('Duplicate code'));
    renderPage();
    await completeReviewStep();
    await userEvent.click(screen.getByRole('button', { name: /create tenant/i }));
    await waitFor(() => expect(screen.getByText('Duplicate code')).toBeInTheDocument());
  });
});
