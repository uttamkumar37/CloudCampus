import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StudentImportPage } from './StudentImportPage';

const years = [{
  id: 'year-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  name: '2026-2027',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  status: 'ACTIVE' as const,
}];

const classes = [{
  id: 'class-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  academicYearId: 'year-1',
  name: 'Grade 1',
  displayOrder: 1,
  active: true,
}];

const sections = [{
  id: 'section-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  classLevelId: 'class-1',
  name: 'A',
  capacity: 40,
  active: true,
}];

const students = [{
  id: 'student-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  admissionNumber: 'ADM-0001',
  fullName: 'Existing Student',
  classLevelId: 'class-1',
  sectionId: 'section-1',
  rollNumber: '1',
  dateOfBirth: '2016-04-15',
  gender: 'FEMALE',
  guardianName: null,
  guardianEmail: 'guardian@example.com',
  guardianMobile: '+919876543210',
  active: true,
}];

function setup(overrides: Partial<Parameters<typeof StudentImportPage>[0]> = {}) {
  const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
  const onLoadAcademicYears = vi.fn().mockResolvedValue(years);
  const onLoadClassLevels = vi.fn().mockResolvedValue(classes);
  const onLoadSections = vi.fn().mockResolvedValue(sections);
  const onLoadStudents = vi.fn().mockResolvedValue(students);
  const onValidate = vi.fn().mockResolvedValue({ valid: true, rowCount: 1, errors: [] });
  const onImport = vi.fn().mockResolvedValue({
    imported: true,
    importedCount: 1,
      students: [],
    errors: [],
  });
  const onQueue = vi.fn().mockResolvedValue({
    id: 'student-import-job-1',
    bulkJobId: 'bulk-job-1',
    tenantId: 'tenant-1',
    schoolId: 'school-1',
    status: 'QUEUED',
    totalRecords: 1,
    processedRecords: 0,
    successRecords: 0,
    failedRecords: 0,
    validationErrors: [],
    createdAt: '2026-05-26T00:00:00Z',
  });
  const onInviteStudentLogin = vi.fn().mockResolvedValue({
    studentId: 'student-1',
    tenantId: 'tenant-1',
    schoolId: 'school-1',
    userId: 'student-user-1',
    email: 'student@example.com',
    userStatus: 'INVITED',
    schoolAccessGranted: true,
    invitationCreated: true,
    invitationId: 'invitation-1',
    invitationToken: 'one-time-token',
    invitationAcceptUrl: '/invitations/accept?token=one-time-token',
  });

  render(
    <StudentImportPage
      onLoadAcademicYears={onLoadAcademicYears}
      onLoadClassLevels={onLoadClassLevels}
      onLoadSections={onLoadSections}
      onLoadStudents={onLoadStudents}
      onValidate={onValidate}
      onImport={onImport}
      onQueue={onQueue}
      onInviteStudentLogin={onInviteStudentLogin}
      storage={storage}
      {...overrides}
    />,
  );

  return {
    storage,
    onLoadAcademicYears,
    onLoadClassLevels,
    onLoadSections,
    onLoadStudents,
    onValidate,
    onImport,
    onQueue,
    onInviteStudentLogin,
  };
}

describe('StudentImportPage', () => {
  it('requires a logged-in School Admin token before loading setup or validation', async () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onValidate = vi.fn();
    render(<StudentImportPage onValidate={onValidate} storage={storage} />);

    expect(await screen.findByText(/School Admin login is required/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /validate rows/i }));

    expect(onValidate).not.toHaveBeenCalled();
  });

  it('loads academic setup as dropdowns and hides technical UUID fields', async () => {
    const api = setup();

    expect(await screen.findByRole('option', { name: /2026-2027 - active/i })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: /grade 1/i })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: /^a$/i })).toBeInTheDocument();
    expect(api.onLoadClassLevels).toHaveBeenCalledWith('year-1', 'signed-school-admin-token');
    expect(api.onLoadSections).toHaveBeenCalledWith('class-1', 'signed-school-admin-token');
    expect(api.onLoadStudents).toHaveBeenCalledWith('signed-school-admin-token');

    expect(screen.queryByLabelText(/import rows/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/student id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/class-level-id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/section-id/i)).not.toBeInTheDocument();
  });

  it('validates, imports and queues students with selected class and section ids hidden from users', async () => {
    const api = setup();
    await screen.findByRole('option', { name: /grade 1/i });

    fireEvent.change(screen.getByLabelText(/admission number/i), { target: { value: 'ADM-1001' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Asha' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Mehta' } });
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '2016-04-15' } });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: 'FEMALE' } });
    fireEvent.change(screen.getByLabelText(/roll number/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/parent\/guardian email/i), { target: { value: 'guardian@example.com' } });
    fireEvent.change(screen.getByLabelText(/parent\/guardian mobile/i), { target: { value: '+919876543210' } });

    fireEvent.click(screen.getByRole('button', { name: /validate rows/i }));
    await waitFor(() => expect(api.onValidate).toHaveBeenCalledTimes(1));
    expect(api.onValidate).toHaveBeenLastCalledWith([
      {
        admissionNumber: 'ADM-1001',
        fullName: 'Asha Mehta',
        classLevelId: 'class-1',
        sectionId: 'section-1',
        rollNumber: '1',
        dateOfBirth: '2016-04-15',
        gender: 'FEMALE',
        guardianEmail: 'guardian@example.com',
        guardianMobile: '+919876543210',
      },
    ], 'signed-school-admin-token');
    expect(screen.getByText(/1 rows valid/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /import students/i }));
    await waitFor(() => expect(api.onImport).toHaveBeenCalledTimes(1));
    expect(api.onValidate).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/1 students imported/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /queue import job/i }));
    await waitFor(() => expect(api.onQueue).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/1 row import job queued/i)).toBeInTheDocument();
  });

  it('shows per-row validation errors and supports multiple rows', async () => {
    const api = setup();
    await screen.findByRole('option', { name: /grade 1/i });

    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    expect(screen.getByText(/student 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /validate rows/i }));

    expect(await screen.findByText(/Fix row validation errors/i)).toBeInTheDocument();
    expect(api.onValidate).not.toHaveBeenCalled();
    const firstRowErrors = screen.getByLabelText(/student 1 validation errors/i);
    expect(within(firstRowErrors).getByText(/admission number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/8 issues need attention/i)).toBeInTheDocument();
  });

  it('loads simple CSV rows into editable student fields', async () => {
    setup();
    await screen.findByRole('option', { name: /grade 1/i });

    const file = new File([
      'admissionNumber,firstName,lastName,dateOfBirth,gender,rollNumber,guardianEmail,guardianMobile\n',
      'ADM-1002,Rohan,Gupta,2016-05-20,MALE,2,parent@example.com,+919999999999',
    ], 'students.csv', { type: 'text/csv' });

    fireEvent.change(screen.getByLabelText(/upload student csv/i), { target: { files: [file] } });

    expect(await screen.findByDisplayValue('ADM-1002')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rohan')).toBeInTheDocument();
    expect(screen.getByText(/1 rows loaded from CSV/i)).toBeInTheDocument();
  });

  it('keeps the student login invitation action working', async () => {
    const api = setup();
    await screen.findByRole('option', { name: /grade 1/i });

    fireEvent.change(screen.getByLabelText(/^student$/i), {
      target: { value: 'student-1' },
    });
    fireEvent.change(screen.getByLabelText(/student login email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /invite student login/i }));

    await waitFor(() => expect(api.onInviteStudentLogin).toHaveBeenCalledTimes(1));
    expect(api.onInviteStudentLogin).toHaveBeenCalledWith(
      'student-1',
      'student@example.com',
      'signed-school-admin-token',
    );
    expect(screen.getByText(/Student login invitation created/i)).toBeInTheDocument();
  });
});
