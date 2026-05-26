import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AcademicAssignmentsPage } from './AcademicAssignmentsPage';

describe('AcademicAssignmentsPage', () => {
  it('requires a logged-in School Admin token before saving assignments', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onCreateSubject = vi.fn();
    render(<AcademicAssignmentsPage onCreateSubject={onCreateSubject} storage={storage} />);

    fillSubjectForm();
    fireEvent.click(screen.getByRole('button', { name: /save subject/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onCreateSubject).not.toHaveBeenCalled();
  });

  it('creates subject, class-subject assignment, and teacher assignment with the stored token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onCreateSubject = vi.fn().mockResolvedValue({
      id: 'subject-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      code: 'MATH',
      name: 'Mathematics',
      active: true,
    });
    const onAssignSubjectToClass = vi.fn().mockResolvedValue({
      id: 'class-subject-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      classLevelId: 'class-1',
      className: 'Class 1',
      subjectId: 'subject-1',
      subjectCode: 'MATH',
      subjectName: 'Mathematics',
      active: true,
    });
    const onAssignTeacher = vi.fn().mockResolvedValue({
      id: 'teacher-assignment-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      teacherUserId: 'teacher-1',
      teacherName: 'Teacher One',
      classSubjectAssignmentId: 'class-subject-1',
      classLevelId: 'class-1',
      className: 'Class 1',
      subjectId: 'subject-1',
      subjectCode: 'MATH',
      subjectName: 'Mathematics',
      active: true,
    });
    render(
      <AcademicAssignmentsPage
        onCreateSubject={onCreateSubject}
        onAssignSubjectToClass={onAssignSubjectToClass}
        onAssignTeacher={onAssignTeacher}
        storage={storage}
      />,
    );

    fillSubjectForm();
    fireEvent.click(screen.getByRole('button', { name: /save subject/i }));
    await waitFor(() => expect(onCreateSubject).toHaveBeenCalledTimes(1));
    expect(onCreateSubject).toHaveBeenCalledWith({
      code: 'MATH',
      name: 'Mathematics',
    }, 'signed-school-admin-token');

    fillClassSubjectForm();
    fireEvent.click(screen.getByRole('button', { name: /assign subject/i }));
    await waitFor(() => expect(onAssignSubjectToClass).toHaveBeenCalledTimes(1));
    expect(onAssignSubjectToClass).toHaveBeenCalledWith({
      classLevelId: 'class-1',
      subjectId: 'subject-1',
    }, 'signed-school-admin-token');

    fillTeacherForm();
    fireEvent.click(screen.getByRole('button', { name: /assign teacher/i }));
    await waitFor(() => expect(onAssignTeacher).toHaveBeenCalledTimes(1));
    expect(onAssignTeacher).toHaveBeenCalledWith({
      teacherUserId: 'teacher-1',
      classSubjectAssignmentId: 'class-subject-1',
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Teacher One assigned to Mathematics/i)).toBeInTheDocument();
  });
});

function fillSubjectForm() {
  fireEvent.change(screen.getByLabelText(/subject code/i), {
    target: { value: 'MATH' },
  });
  fireEvent.change(screen.getByLabelText(/subject name/i), {
    target: { value: 'Mathematics' },
  });
}

function fillClassSubjectForm() {
  fireEvent.change(screen.getByLabelText(/^class id$/i), {
    target: { value: 'class-1' },
  });
  fireEvent.change(screen.getByLabelText(/^subject id$/i), {
    target: { value: 'subject-1' },
  });
}

function fillTeacherForm() {
  fireEvent.change(screen.getByLabelText(/teacher user id/i), {
    target: { value: 'teacher-1' },
  });
  fireEvent.change(screen.getByLabelText(/class subject id/i), {
    target: { value: 'class-subject-1' },
  });
}
