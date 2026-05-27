import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AcademicSetupPage } from './AcademicSetupPage';

describe('AcademicSetupPage', () => {
  it('requires a logged-in School Admin token before saving setup', () => {
    const onCreateAcademicYear = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    render(<AcademicSetupPage onCreateAcademicYear={onCreateAcademicYear} storage={storage} />);

    fillAcademicYearForm();
    fireEvent.click(screen.getByRole('button', { name: /save year/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onCreateAcademicYear).not.toHaveBeenCalled();
  });

  it('creates academic year, class, and section with the stored access token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onCreateAcademicYear = vi.fn().mockResolvedValue({
      id: 'year-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      name: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'ACTIVE',
    });
    const onCreateClassLevel = vi.fn().mockResolvedValue({
      id: 'class-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      academicYearId: 'year-1',
      name: 'Class 1',
      displayOrder: 1,
      active: true,
    });
    const onCreateSection = vi.fn().mockResolvedValue({
      id: 'section-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      classLevelId: 'class-1',
      name: 'A',
      capacity: 40,
      active: true,
    });
    render(
      <AcademicSetupPage
        onCreateAcademicYear={onCreateAcademicYear}
        onCreateClassLevel={onCreateClassLevel}
        onCreateSection={onCreateSection}
        storage={storage}
      />,
    );

    fillAcademicYearForm();
    fireEvent.click(screen.getByRole('button', { name: /save year/i }));
    await waitFor(() => expect(onCreateAcademicYear).toHaveBeenCalledTimes(1));
    expect(onCreateAcademicYear).toHaveBeenCalledWith({
      name: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      activate: true,
    }, 'signed-school-admin-token');

    fillClassForm();
    fireEvent.click(screen.getByRole('button', { name: /save class/i }));
    await waitFor(() => expect(onCreateClassLevel).toHaveBeenCalledTimes(1));
    expect(onCreateClassLevel).toHaveBeenCalledWith({
      academicYearId: 'year-1',
      name: 'Class 1',
      displayOrder: 1,
    }, 'signed-school-admin-token');

    fillSectionForm();
    fireEvent.click(screen.getByRole('button', { name: /save section/i }));
    await waitFor(() => expect(onCreateSection).toHaveBeenCalledTimes(1));
    expect(onCreateSection).toHaveBeenCalledWith({
      classLevelId: 'class-1',
      name: 'A',
      capacity: 40,
    }, 'signed-school-admin-token');
    expect(await screen.findByText(/A section created/i)).toBeInTheDocument();
  });
});

function fillAcademicYearForm() {
  fireEvent.change(screen.getByLabelText(/^academic year$/i), {
    target: { value: '2026-2027' },
  });
  fireEvent.change(screen.getByLabelText(/start date/i), {
    target: { value: '2026-04-01' },
  });
  fireEvent.change(screen.getByLabelText(/end date/i), {
    target: { value: '2027-03-31' },
  });
  fireEvent.click(screen.getByLabelText(/activate/i));
}

function fillClassForm() {
  fireEvent.change(screen.getByLabelText(/academic year id/i), {
    target: { value: 'year-1' },
  });
  fireEvent.change(screen.getByLabelText(/class name/i), {
    target: { value: 'Class 1' },
  });
  fireEvent.change(screen.getByLabelText(/display order/i), {
    target: { value: '1' },
  });
}

function fillSectionForm() {
  fireEvent.change(screen.getByLabelText(/class id/i), {
    target: { value: 'class-1' },
  });
  fireEvent.change(screen.getByLabelText(/section name/i), {
    target: { value: 'A' },
  });
  fireEvent.change(screen.getByLabelText(/capacity/i), {
    target: { value: '40' },
  });
}
