import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthState } from '../../auth/hooks/authState';
import {
  createTeacherHomework,
  executeTeacherAiRecommendation,
  getTeacherAiEntitlement,
  getTeacherAiRecommendation,
  getTeacherDashboardSummary,
  listTeacherAiRecommendations,
  listTeacherAssignments,
  listTeacherExamRoster,
  listTeacherExams,
  listTeacherHomework,
  recordTeacherExamMarks,
  rejectTeacherAiRecommendation,
  type AiRecommendation,
  type TeacherAssignment,
  type TeacherExam,
  type TeacherExamRosterStudent,
} from '../api/teacherPortalApi';
import { TeacherPortalPage } from './TeacherPortalPage';

vi.mock('../../auth/hooks/authState', () => ({
  useAuthState: vi.fn(),
}));

vi.mock('../api/teacherPortalApi', () => ({
  acceptTeacherAiRecommendation: vi.fn(),
  createTeacherAttendanceSession: vi.fn(),
  createTeacherHomework: vi.fn(),
  dismissTeacherAiRecommendation: vi.fn(),
  executeTeacherAiRecommendation: vi.fn(),
  getTeacherAiEntitlement: vi.fn(),
  getTeacherAiRecommendation: vi.fn(),
  getTeacherAttendanceSession: vi.fn(),
  getTeacherDashboardSummary: vi.fn(),
  getTeacherExam: vi.fn(),
  getTeacherHomework: vi.fn(),
  listTeacherAiRecommendations: vi.fn(),
  listTeacherAssignments: vi.fn(),
  listTeacherAttendance: vi.fn(),
  listTeacherExamRoster: vi.fn(),
  listTeacherExams: vi.fn(),
  listTeacherHomework: vi.fn(),
  listTeacherNotices: vi.fn(),
  listTeacherTimetable: vi.fn(),
  recordTeacherExamMarks: vi.fn(),
  rejectTeacherAiRecommendation: vi.fn(),
}));

const assignment: TeacherAssignment = {
  id: 'assignment-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  teacherUserId: 'teacher-1',
  teacherName: 'Anita Rao',
  classSubjectAssignmentId: 'class-subject-1',
  classLevelId: 'class-8',
  className: 'Grade 8',
  subjectId: 'math',
  subjectCode: 'MATH',
  subjectName: 'Mathematics',
  active: true,
};

const exam: TeacherExam = {
  id: 'exam-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  classLevelId: 'class-8',
  className: 'Grade 8',
  sectionId: 'section-a',
  sectionName: 'A',
  subjectId: 'math',
  subjectCode: 'MATH',
  subjectName: 'Mathematics',
  title: 'Term 1 Mathematics',
  examDate: '2026-06-12',
  maxMarks: 100,
  status: 'DRAFT',
  createdByUserId: 'school-admin-1',
  publishedByUserId: null,
  createdAt: '2026-06-01T09:00:00Z',
  publishedAt: null,
  results: [],
};

const rosterStudent: TeacherExamRosterStudent = {
  studentId: 'student-1',
  admissionNumber: 'ADM-001',
  fullName: 'Asha Mehta',
  classLevelId: 'class-8',
  className: 'Grade 8',
  sectionId: 'section-a',
  sectionName: 'A',
  rollNumber: '7',
  resultId: null,
  marksObtained: null,
  recordedAt: null,
};

const recommendation: AiRecommendation = {
  recommendationId: 'rec-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  targetType: 'HOMEWORK',
  targetId: 'homework-1',
  recommendationType: 'REMEDIATION',
  title: 'Review algebra practice',
  summary: 'Several students need additional algebra practice.',
  rationale: 'The class average dropped below the configured threshold.',
  confidenceScore: 0.91,
  riskLevel: 'HIGH',
  status: 'PENDING_REVIEW',
  approvalRequired: true,
  metadataJson: '{}',
  createdAt: '2026-06-08T12:00:00Z',
};

describe('TeacherPortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const activeSchool = { schoolId: 'school-a', code: 'A', name: 'School A', role: 'TEACHER' as const, primaryAccess: true };
    vi.mocked(useAuthState).mockReturnValue({
      accessToken: 'teacher-token',
      allowedSchools: [activeSchool],
      activateSchool: vi.fn(),
      clearError: vi.fn(),
      currentUser: {
        userId: 'teacher-1',
        email: 'teacher@example.com',
        displayName: 'Teacher User',
        role: 'TEACHER',
        tenantId: 'tenant-1',
        activeSchool,
        allowedSchools: [activeSchool],
      },
      error: null,
      logout: vi.fn(),
      refreshCurrentUser: vi.fn(),
      registerSession: vi.fn(),
      schoolActivationError: null,
      status: 'authenticated',
    });
    vi.mocked(getTeacherDashboardSummary).mockResolvedValue({ metrics: [], alerts: [], activity: [] });
    vi.mocked(listTeacherAssignments).mockResolvedValue([assignment]);
    vi.mocked(listTeacherHomework).mockResolvedValue([]);
    vi.mocked(createTeacherHomework).mockResolvedValue({
      id: 'homework-1',
      tenantId: 'tenant-1',
      schoolId: 'school-a',
      classLevelId: assignment.classLevelId,
      className: assignment.className,
      sectionId: null,
      sectionName: null,
      subjectId: assignment.subjectId,
      subjectCode: assignment.subjectCode,
      subjectName: assignment.subjectName,
      title: 'Linear equations',
      instructions: 'Complete questions 1 through 10.',
      dueDate: '2026-06-09',
      status: 'PUBLISHED',
      createdByUserId: 'teacher-1',
      createdByRole: 'TEACHER',
      createdAt: '2026-06-08T10:00:00Z',
      publishedAt: '2026-06-08T10:00:00Z',
      submissions: [],
    });
    vi.mocked(listTeacherExams).mockResolvedValue([exam]);
    vi.mocked(listTeacherExamRoster).mockResolvedValue([rosterStudent]);
    vi.mocked(recordTeacherExamMarks).mockResolvedValue({ ...exam, results: [] });
    vi.mocked(listTeacherAiRecommendations).mockResolvedValue({ items: [recommendation], page: 0, size: 50, totalItems: 1, totalPages: 1 });
    vi.mocked(getTeacherAiRecommendation).mockResolvedValue(recommendation);
    vi.mocked(rejectTeacherAiRecommendation).mockResolvedValue({ ...recommendation, status: 'REJECTED' });
    vi.mocked(executeTeacherAiRecommendation).mockResolvedValue({ ...recommendation, status: 'EXECUTED' });
    vi.mocked(getTeacherAiEntitlement).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      monthlyUnitBudget: 1000,
      unitsUsedThisMonth: 120,
      unitsRemainingThisMonth: 880,
      enabledFeatures: ['recommendations'],
      humanApprovalRequired: true,
      retentionDays: 30,
      updatedByUserId: null,
      updatedAt: null,
    });
  });

  it('renders only active-school Teacher assignments in My Classes', async () => {
    render(<TeacherPortalPage section="classes" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Grade 8')).toBeInTheDocument();
    expect(screen.getByText(/mathematics/i)).toBeInTheDocument();
    expect(screen.getByText(/MATH/)).toBeInTheDocument();
    expect(listTeacherAssignments).toHaveBeenCalledWith('teacher-token');
    expect(screen.queryByRole('button', { name: /create school|approve tenant|billing/i })).not.toBeInTheDocument();
  });

  it('validates and publishes homework through the Teacher homework API', async () => {
    render(<TeacherPortalPage section="homework" onNavigate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /^homework$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /create homework/i }));

    const drawer = await screen.findByRole('dialog', { name: /create homework/i });
    fireEvent.click(within(drawer).getByRole('button', { name: /publish homework/i }));
    expect(await within(drawer).findByText(/title is required/i)).toBeInTheDocument();

    fireEvent.change(within(drawer).getByLabelText(/^title/i), { target: { value: 'Linear equations' } });
    fireEvent.change(within(drawer).getByLabelText(/instructions/i), { target: { value: 'Complete questions 1 through 10.' } });
    fireEvent.click(within(drawer).getByRole('button', { name: /publish homework/i }));

    await waitFor(() => expect(createTeacherHomework).toHaveBeenCalledWith({
      classLevelId: 'class-8',
      dueDate: expect.any(String),
      instructions: 'Complete questions 1 through 10.',
      sectionId: null,
      subjectId: 'math',
      title: 'Linear equations',
    }, 'teacher-token'));
    expect(await screen.findByText(/homework published/i)).toBeInTheDocument();
  });

  it('validates marks and requires confirmation before recording exam marks', async () => {
    render(<TeacherPortalPage section="marks" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Asha Mehta')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/marks for asha mehta/i), { target: { value: '105' } });
    fireEvent.click(screen.getByRole('button', { name: /submit changed marks/i }));

    expect(await screen.findByText(/cannot exceed 100/i)).toBeInTheDocument();
    expect(recordTeacherExamMarks).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/marks for asha mehta/i), { target: { value: '95' } });
    fireEvent.click(screen.getByRole('button', { name: /submit changed marks/i }));

    const dialog = await screen.findByRole('dialog', { name: /submit marks/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /^submit marks$/i }));

    await waitFor(() => expect(recordTeacherExamMarks).toHaveBeenCalledWith('exam-1', 'student-1', 95, 'teacher-token'));
    expect(await screen.findByText(/1 mark entry saved/i)).toBeInTheDocument();
  });

  it('keeps high-risk AI execution disabled and requires a rejection reason', async () => {
    render(<TeacherPortalPage section="ai-suggestions" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Review algebra practice')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^review$/i }));

    const drawer = await screen.findByRole('dialog', { name: /review algebra practice/i });
    expect(within(drawer).getByRole('button', { name: /^execute$/i })).toBeDisabled();

    fireEvent.click(within(drawer).getByRole('button', { name: /^reject$/i }));
    const dialog = await screen.findByRole('dialog', { name: /reject suggestion/i });
    const rejectButton = within(dialog).getByRole('button', { name: /^reject$/i });
    expect(rejectButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/rejection reason/i), { target: { value: 'Needs class teacher review first.' } });
    fireEvent.click(rejectButton);

    await waitFor(() => expect(rejectTeacherAiRecommendation).toHaveBeenCalledWith('rec-1', 'Needs class teacher review first.', 'teacher-token'));
    expect(executeTeacherAiRecommendation).not.toHaveBeenCalled();
  });
});
