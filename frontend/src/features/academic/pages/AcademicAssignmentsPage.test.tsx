import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AcademicAssignmentsPage } from './AcademicAssignmentsPage';

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

const subject = {
  id: 'subject-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  code: 'MATH',
  name: 'Mathematics',
  active: true,
};

const classSubject = {
  id: 'class-subject-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  classLevelId: 'class-1',
  className: 'Class 1',
  subjectId: 'subject-1',
  subjectCode: 'MATH',
  subjectName: 'Mathematics',
  active: true,
};

const teacher = {
  id: 'staff-1',
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  userId: 'teacher-user-1',
  email: 'teacher@example.com',
  fullName: 'Teacher One',
  role: 'TEACHER' as const,
  userStatus: 'ACTIVE' as const,
  employeeNumber: 'T-001',
  department: 'Science',
  designation: 'Senior Teacher',
  portalLoginRequired: true,
  active: true,
  createdAt: '2026-05-01T00:00:00Z',
};

describe('AcademicAssignmentsPage', () => {
  it('requires a logged-in School Admin token before saving assignments', async () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onCreateSubject = vi.fn();
    render(<AcademicAssignmentsPage onCreateSubject={onCreateSubject} storage={storage} />);

    await screen.findByText(/School Admin login is required/i);
    fillSubjectForm();
    fireEvent.click(screen.getByRole('button', { name: /save subject/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onCreateSubject).not.toHaveBeenCalled();
  });

  it('loads selector-driven assignment data without exposing raw ID inputs', async () => {
    renderAssignmentPage();

    expect(await screen.findByRole('option', { name: academicYear.name })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: classLevel.name })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Mathematics \(MATH\)/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Teacher One - Senior Teacher/i })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: /Class 1 - Mathematics/i })).toBeInTheDocument();

    expect(screen.queryByLabelText(/^class id$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^subject id$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/teacher user id/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/class subject id/i)).not.toBeInTheDocument();
  });

  it('creates subject, class-subject assignment, and teacher assignment with selected values', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onCreateSubject = vi.fn().mockResolvedValue(subject);
    const onAssignSubjectToClass = vi.fn().mockResolvedValue(classSubject);
    const onAssignTeacher = vi.fn().mockResolvedValue({
      id: 'teacher-assignment-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      teacherUserId: 'teacher-user-1',
      teacherName: 'Teacher One',
      classSubjectAssignmentId: 'class-subject-1',
      classLevelId: 'class-1',
      className: 'Class 1',
      subjectId: 'subject-1',
      subjectCode: 'MATH',
      subjectName: 'Mathematics',
      active: true,
    });
    const onLoadClassSubjectAssignments = vi.fn()
      .mockResolvedValueOnce([classSubject])
      .mockResolvedValue([classSubject]);

    render(
      <AcademicAssignmentsPage
        onCreateSubject={onCreateSubject}
        onAssignSubjectToClass={onAssignSubjectToClass}
        onAssignTeacher={onAssignTeacher}
        onLoadAcademicYears={vi.fn().mockResolvedValue([academicYear])}
        onLoadClassLevels={vi.fn().mockResolvedValue([classLevel])}
        onLoadSubjects={vi.fn().mockResolvedValue([subject])}
        onLoadClassSubjectAssignments={onLoadClassSubjectAssignments}
        onLoadTeacherAssignments={vi.fn().mockResolvedValue([])}
        onLoadTeachers={vi.fn().mockResolvedValue([teacher])}
        storage={storage}
      />,
    );

    await screen.findByRole('option', { name: academicYear.name });

    fillSubjectForm();
    fireEvent.click(screen.getByRole('button', { name: /save subject/i }));
    await waitFor(() => expect(onCreateSubject).toHaveBeenCalledTimes(1));
    expect(onCreateSubject).toHaveBeenCalledWith({
      code: 'MATH',
      name: 'Mathematics',
    }, 'signed-school-admin-token');

    fireEvent.click(screen.getByRole('button', { name: /assign subject/i }));
    await waitFor(() => expect(onAssignSubjectToClass).toHaveBeenCalledTimes(1));
    expect(onAssignSubjectToClass).toHaveBeenCalledWith({
      classLevelId: 'class-1',
      subjectId: 'subject-1',
    }, 'signed-school-admin-token');

    await screen.findByRole('option', { name: /Class 1 - Mathematics/i });
    fireEvent.change(screen.getByLabelText(/search teacher/i), {
      target: { value: 'Teacher One' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assign teacher/i }));
    await waitFor(() => expect(onAssignTeacher).toHaveBeenCalledTimes(1));
    expect(onAssignTeacher).toHaveBeenCalledWith({
      teacherUserId: 'teacher-user-1',
      classSubjectAssignmentId: 'class-subject-1',
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Teacher One assigned to Mathematics/i)).toBeInTheDocument();
  });

  it('shows loading, empty, and error states', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    render(
      <AcademicAssignmentsPage
        onLoadAcademicYears={vi.fn().mockRejectedValue(new Error('failed'))}
        onLoadClassLevels={vi.fn().mockResolvedValue([])}
        onLoadSubjects={vi.fn().mockResolvedValue([])}
        onLoadClassSubjectAssignments={vi.fn().mockResolvedValue([])}
        onLoadTeacherAssignments={vi.fn().mockResolvedValue([])}
        onLoadTeachers={vi.fn().mockResolvedValue([])}
        storage={storage}
      />,
    );

    expect(screen.getByLabelText(/loading academic assignments/i)).toBeInTheDocument();
    expect(await screen.findByText(/Academic assignment data could not be loaded/i)).toBeInTheDocument();
    expect(screen.getByText(/No subjects yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic setup required/i)).toBeInTheDocument();
  });
});

function renderAssignmentPage() {
  const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
  return render(
    <AcademicAssignmentsPage
      onLoadAcademicYears={vi.fn().mockResolvedValue([academicYear])}
      onLoadClassLevels={vi.fn().mockResolvedValue([classLevel])}
      onLoadSubjects={vi.fn().mockResolvedValue([subject])}
      onLoadClassSubjectAssignments={vi.fn().mockResolvedValue([classSubject])}
      onLoadTeacherAssignments={vi.fn().mockResolvedValue([])}
      onLoadTeachers={vi.fn().mockResolvedValue([teacher])}
      storage={storage}
    />,
  );
}

function fillSubjectForm() {
  fireEvent.change(screen.getByLabelText(/subject code/i), {
    target: { value: 'MATH' },
  });
  fireEvent.change(screen.getByLabelText(/subject name/i), {
    target: { value: 'Mathematics' },
  });
}
