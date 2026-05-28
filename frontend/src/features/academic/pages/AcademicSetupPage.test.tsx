import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AcademicSetupPage } from './AcademicSetupPage';

const academicYear = {
  id: 'year-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  name: '2026-2027',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  status: 'ACTIVE' as const,
};

const classLevel = {
  id: 'class-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  academicYearId: 'year-1',
  name: 'Class 1',
  displayOrder: 1,
  active: true,
};

const section = {
  id: 'section-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  classLevelId: 'class-1',
  name: 'A',
  capacity: 40,
  active: true,
};

describe('AcademicSetupPage', () => {
  it('requires a logged-in School Admin token before saving setup', async () => {
    const onCreateAcademicYear = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    render(<AcademicSetupPage onCreateAcademicYear={onCreateAcademicYear} storage={storage} />);

    await screen.findByText(/School Admin login is required/i);
    fillAcademicYearForm();
    fireEvent.click(screen.getByRole('button', { name: /save year/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onCreateAcademicYear).not.toHaveBeenCalled();
  });

  it('loads academic year and class selectors instead of exposing raw IDs', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    render(
      <AcademicSetupPage
        onLoadAcademicYears={vi.fn().mockResolvedValue([academicYear])}
        onLoadClassLevels={vi.fn().mockResolvedValue([classLevel])}
        onLoadSections={vi.fn().mockResolvedValue([section])}
        storage={storage}
      />,
    );

    expect(await screen.findByRole('option', { name: academicYear.name })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: classLevel.name })).toBeInTheDocument();
    expect(screen.queryByLabelText(/academic year id/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^class id$/i)).not.toBeInTheDocument();
  });

  it('creates academic year, class, and section with selected values and the stored access token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onCreateAcademicYear = vi.fn().mockResolvedValue(academicYear);
    const onCreateClassLevel = vi.fn().mockResolvedValue(classLevel);
    const onCreateSection = vi.fn().mockResolvedValue(section);
    const onLoadClassLevels = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([classLevel]);
    const onLoadSections = vi.fn().mockResolvedValue([]);

    render(
      <AcademicSetupPage
        onCreateAcademicYear={onCreateAcademicYear}
        onCreateClassLevel={onCreateClassLevel}
        onCreateSection={onCreateSection}
        onLoadAcademicYears={vi.fn().mockResolvedValue([academicYear])}
        onLoadClassLevels={onLoadClassLevels}
        onLoadSections={onLoadSections}
        storage={storage}
      />,
    );

    await screen.findByRole('option', { name: academicYear.name });

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

    expect(await screen.findByRole('option', { name: classLevel.name })).toBeInTheDocument();
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

  it('shows loading, empty, and friendly duplicate states', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onCreateAcademicYear = vi.fn().mockRejectedValue(new Error('duplicate'));
    render(
      <AcademicSetupPage
        onCreateAcademicYear={onCreateAcademicYear}
        onLoadAcademicYears={vi.fn().mockResolvedValue([])}
        onLoadClassLevels={vi.fn().mockResolvedValue([])}
        onLoadSections={vi.fn().mockResolvedValue([])}
        storage={storage}
      />,
    );

    expect(screen.getByLabelText(/loading academic setup/i)).toBeInTheDocument();
    expect(await screen.findByText(/No academic years yet/i)).toBeInTheDocument();

    fillAcademicYearForm();
    fireEvent.click(screen.getByRole('button', { name: /save year/i }));
    expect(await screen.findByText(/Academic year could not be saved/i)).toBeInTheDocument();
  });
});

function fillAcademicYearForm() {
  fireEvent.change(screen.getByLabelText(/academic year name/i), {
    target: { value: '2026-2027' },
  });
  fireEvent.change(screen.getByLabelText(/start date/i), {
    target: { value: '2026-04-01' },
  });
  fireEvent.change(screen.getByLabelText(/end date/i), {
    target: { value: '2027-03-31' },
  });
  fireEvent.click(screen.getByLabelText(/set as current year/i));
}

function fillClassForm() {
  fireEvent.change(screen.getByLabelText(/class name/i), {
    target: { value: 'Class 1' },
  });
  fireEvent.change(screen.getByLabelText(/display order/i), {
    target: { value: '1' },
  });
}

function fillSectionForm() {
  fireEvent.change(screen.getByLabelText(/section name/i), {
    target: { value: 'A' },
  });
  fireEvent.change(screen.getByLabelText(/capacity/i), {
    target: { value: '40' },
  });
}
