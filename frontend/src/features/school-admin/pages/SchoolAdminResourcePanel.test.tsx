import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listSchoolAdminResource,
  publishSchoolAdminResource,
} from '../api/schoolAdminResourcesApi';
import { SchoolAdminResourcePanel } from './SchoolAdminResourcePanel';

const authMock = vi.hoisted(() => ({ accessToken: 'school-admin-token' as string | null }));

vi.mock('../../auth/hooks/authState', () => ({
  useAuthState: () => ({ accessToken: authMock.accessToken }),
}));

vi.mock('../api/schoolAdminResourcesApi', async () => {
  const actual = await vi.importActual<typeof import('../api/schoolAdminResourcesApi')>('../api/schoolAdminResourcesApi');
  return {
    ...actual,
    createSchoolAdminResource: vi.fn(),
    listSchoolAdminResource: vi.fn(),
    publishSchoolAdminResource: vi.fn(),
  };
});

describe('SchoolAdminResourcePanel', () => {
  beforeEach(() => {
    authMock.accessToken = 'school-admin-token';
    vi.mocked(listSchoolAdminResource).mockReset();
    vi.mocked(publishSchoolAdminResource).mockReset();
  });

  it('renders a searchable, school-scoped table without fake records', async () => {
    vi.mocked(listSchoolAdminResource).mockResolvedValue([
      {
        id: 'teacher-1',
        fullName: 'Ravi Sharma',
        email: 'ravi@example.com',
        role: 'TEACHER',
        active: true,
        updatedAt: '2026-06-01T00:00:00Z',
      },
      {
        id: 'teacher-2',
        fullName: 'Neha Singh',
        email: 'neha@example.com',
        role: 'TEACHER',
        active: false,
        updatedAt: '2026-06-02T00:00:00Z',
      },
    ]);

    render(<SchoolAdminResourcePanel resource="teachers" />);

    expect(await screen.findByRole('heading', { name: /^teachers$/i })).toBeInTheDocument();
    expect(listSchoolAdminResource).toHaveBeenCalledWith('teachers', 'school-admin-token');
    expect(screen.getByLabelText(/search records/i)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    expect(screen.getByText(/2 of 2 records shown/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/search records/i), { target: { value: 'neha' } });

    expect(screen.queryByText(/ravi sharma/i)).not.toBeInTheDocument();
    expect(screen.getByText(/neha singh/i)).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 records shown/i)).toBeInTheDocument();
  });

  it('confirms publish actions before calling the publish API', async () => {
    vi.mocked(listSchoolAdminResource).mockResolvedValue([
      {
        id: 'notice-1',
        title: 'Annual day',
        audience: 'SCHOOL',
        status: 'DRAFT',
        createdAt: '2026-06-01T00:00:00Z',
      },
    ]);
    vi.mocked(publishSchoolAdminResource).mockResolvedValue({});

    render(<SchoolAdminResourcePanel resource="notices" />);

    expect(await screen.findByText(/annual day/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^publish$/i }));

    const dialog = screen.getByRole('dialog', { name: /publish notices record/i });
    expect(within(dialog).getByText(/may become visible/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /publish record/i }));

    await waitFor(() => expect(publishSchoolAdminResource).toHaveBeenCalledWith('notices', 'notice-1', 'school-admin-token'));
    expect(await screen.findByText(/notices record published/i)).toBeInTheDocument();
  });
});
