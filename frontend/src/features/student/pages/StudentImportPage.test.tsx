import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StudentImportPage } from './StudentImportPage';

describe('StudentImportPage', () => {
  it('requires a logged-in School Admin token before validation', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onValidate = vi.fn();
    render(<StudentImportPage onValidate={onValidate} storage={storage} />);

    fireEvent.click(screen.getByRole('button', { name: /validate rows/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onValidate).not.toHaveBeenCalled();
  });

  it('validates imports and queues rows with the stored access token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
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
        onValidate={onValidate}
        onImport={onImport}
        onQueue={onQueue}
        onInviteStudentLogin={onInviteStudentLogin}
        storage={storage}
      />,
    );

    fireEvent.change(screen.getByLabelText(/import rows/i), {
      target: {
        value: JSON.stringify([
          {
            admissionNumber: 'ADM-1001',
            fullName: 'Student Name',
            classLevelId: 'class-1',
            sectionId: 'section-1',
          },
        ]),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /validate rows/i }));
    await waitFor(() => expect(onValidate).toHaveBeenCalledTimes(1));
    expect(onValidate).toHaveBeenCalledWith([
      {
        admissionNumber: 'ADM-1001',
        fullName: 'Student Name',
        classLevelId: 'class-1',
        sectionId: 'section-1',
      },
    ], 'signed-school-admin-token');
    expect(screen.getByText(/1 rows valid/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /import students/i }));
    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1));
    expect(onImport).toHaveBeenCalledWith([
      {
        admissionNumber: 'ADM-1001',
        fullName: 'Student Name',
        classLevelId: 'class-1',
        sectionId: 'section-1',
      },
    ], 'signed-school-admin-token');
    expect(screen.getByText(/1 students imported/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /queue import job/i }));
    await waitFor(() => expect(onQueue).toHaveBeenCalledTimes(1));
    expect(onQueue).toHaveBeenCalledWith([
      {
        admissionNumber: 'ADM-1001',
        fullName: 'Student Name',
        classLevelId: 'class-1',
        sectionId: 'section-1',
      },
    ], 'signed-school-admin-token');
    expect(screen.getByText(/1 row import job queued/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/student id/i), {
      target: { value: 'student-1' },
    });
    fireEvent.change(screen.getByLabelText(/student login email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /invite student login/i }));
    await waitFor(() => expect(onInviteStudentLogin).toHaveBeenCalledTimes(1));
    expect(onInviteStudentLogin).toHaveBeenCalledWith(
      'student-1',
      'student@example.com',
      'signed-school-admin-token',
    );
    expect(screen.getByText(/Student login invitation created/i)).toBeInTheDocument();
  });
});
