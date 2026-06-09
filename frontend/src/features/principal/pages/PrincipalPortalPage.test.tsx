import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthState } from '../../auth/hooks/authState';
import {
  approvePrincipalAiRecommendation,
  dismissPrincipalAiRecommendation,
  downloadPrincipalReportExport,
  executePrincipalAiRecommendation,
  getPrincipalAiEntitlement,
  getPrincipalAiRecommendation,
  getPrincipalAttendanceSession,
  getPrincipalDashboardSummary,
  getPrincipalExam,
  getPrincipalReportExport,
  listPrincipalAiRecommendations,
  listPrincipalAttendanceSessions,
  listPrincipalAutomationRules,
  listPrincipalAutomationRuns,
  listPrincipalExams,
  listPrincipalReportExports,
  listPrincipalStudents,
  listPrincipalTeachers,
  publishPrincipalExam,
  rejectPrincipalAiRecommendation,
  requestPrincipalReportExport,
  type AiRecommendation,
  type PrincipalExam,
  type PrincipalTeacher,
} from '../api/principalApi';
import { PrincipalPortalPage } from './PrincipalPortalPage';

vi.mock('../../auth/hooks/authState', () => ({
  useAuthState: vi.fn(),
}));

vi.mock('../api/principalApi', () => ({
  approvePrincipalAiRecommendation: vi.fn(),
  dismissPrincipalAiRecommendation: vi.fn(),
  downloadPrincipalReportExport: vi.fn(),
  executePrincipalAiRecommendation: vi.fn(),
  getPrincipalAiEntitlement: vi.fn(),
  getPrincipalAiRecommendation: vi.fn(),
  getPrincipalAttendanceSession: vi.fn(),
  getPrincipalDashboardSummary: vi.fn(),
  getPrincipalExam: vi.fn(),
  getPrincipalReportExport: vi.fn(),
  listPrincipalAiRecommendations: vi.fn(),
  listPrincipalAttendanceSessions: vi.fn(),
  listPrincipalAutomationRules: vi.fn(),
  listPrincipalAutomationRuns: vi.fn(),
  listPrincipalExams: vi.fn(),
  listPrincipalReportExports: vi.fn(),
  listPrincipalStudents: vi.fn(),
  listPrincipalTeachers: vi.fn(),
  publishPrincipalExam: vi.fn(),
  rejectPrincipalAiRecommendation: vi.fn(),
  requestPrincipalReportExport: vi.fn(),
}));

const teacher: PrincipalTeacher = {
  id: 'teacher-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  userId: 'user-teacher-1',
  email: 'anita@school.edu',
  fullName: 'Anita Rao',
  role: 'TEACHER',
  userStatus: 'ACTIVE',
  employeeNumber: 'EMP-102',
  department: 'Mathematics',
  designation: 'Senior Teacher',
  portalLoginRequired: true,
  active: true,
  createdAt: '2026-06-01T09:00:00Z',
};

const exam: PrincipalExam = {
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
  createdByUserId: 'teacher-1',
  publishedByUserId: null,
  createdAt: '2026-06-01T09:00:00Z',
  publishedAt: null,
  results: [{
    id: 'result-1',
    studentId: 'student-1',
    studentName: 'Asha Mehta',
    recordedByUserId: 'teacher-1',
    marksObtained: 92,
    recordedAt: '2026-06-08T10:30:00Z',
  }],
};

const recommendation: AiRecommendation = {
  recommendationId: 'rec-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  targetType: 'ATTENDANCE',
  targetId: 'student-1',
  recommendationType: 'FOLLOW_UP',
  title: 'Review attendance anomaly',
  summary: 'A student has repeated late attendance.',
  rationale: 'The pattern crossed the configured risk threshold.',
  confidenceScore: 0.87,
  riskLevel: 'HIGH',
  status: 'PENDING_REVIEW',
  approvalRequired: true,
  metadataJson: '{}',
  createdAt: '2026-06-08T12:00:00Z',
};

describe('PrincipalPortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const activeSchool = { schoolId: 'school-a', code: 'A', name: 'School A', role: 'PRINCIPAL' as const, primaryAccess: true };
    vi.mocked(useAuthState).mockReturnValue({
      accessToken: 'principal-token',
      allowedSchools: [activeSchool],
      activateSchool: vi.fn(),
      clearError: vi.fn(),
      currentUser: {
        userId: 'principal-1',
        email: 'principal@example.com',
        displayName: 'Principal User',
        role: 'PRINCIPAL',
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
    vi.mocked(getPrincipalDashboardSummary).mockResolvedValue({ metrics: [], alerts: [], activity: [] });
    vi.mocked(listPrincipalTeachers).mockResolvedValue({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 });
    vi.mocked(listPrincipalStudents).mockResolvedValue({ items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 });
    vi.mocked(listPrincipalAttendanceSessions).mockResolvedValue([]);
    vi.mocked(getPrincipalAttendanceSession).mockResolvedValue({} as Awaited<ReturnType<typeof getPrincipalAttendanceSession>>);
    vi.mocked(listPrincipalExams).mockResolvedValue([]);
    vi.mocked(getPrincipalExam).mockResolvedValue(exam);
    vi.mocked(publishPrincipalExam).mockResolvedValue({ ...exam, status: 'PUBLISHED', publishedAt: '2026-06-09T08:00:00Z' });
    vi.mocked(listPrincipalAiRecommendations).mockResolvedValue({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 });
    vi.mocked(getPrincipalAiRecommendation).mockResolvedValue(recommendation);
    vi.mocked(approvePrincipalAiRecommendation).mockResolvedValue({ ...recommendation, status: 'APPROVED' });
    vi.mocked(rejectPrincipalAiRecommendation).mockResolvedValue({ ...recommendation, status: 'REJECTED' });
    vi.mocked(dismissPrincipalAiRecommendation).mockResolvedValue({ ...recommendation, status: 'DISMISSED' });
    vi.mocked(executePrincipalAiRecommendation).mockResolvedValue({ ...recommendation, status: 'EXECUTED' });
    vi.mocked(listPrincipalAutomationRules).mockResolvedValue({ items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 });
    vi.mocked(listPrincipalAutomationRuns).mockResolvedValue({ items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 });
    vi.mocked(getPrincipalAiEntitlement).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      monthlyUnitBudget: 1000,
      unitsUsedThisMonth: 100,
      unitsRemainingThisMonth: 900,
      enabledFeatures: ['recommendations'],
      humanApprovalRequired: true,
      retentionDays: 30,
      updatedByUserId: null,
      updatedAt: null,
    });
    vi.mocked(listPrincipalReportExports).mockResolvedValue([]);
    vi.mocked(getPrincipalReportExport).mockResolvedValue({} as Awaited<ReturnType<typeof getPrincipalReportExport>>);
    vi.mocked(requestPrincipalReportExport).mockResolvedValue({} as Awaited<ReturnType<typeof requestPrincipalReportExport>>);
    vi.mocked(downloadPrincipalReportExport).mockResolvedValue('csv');
  });

  it('loads the teacher directory as masked, review-only Principal data', async () => {
    vi.mocked(listPrincipalTeachers).mockResolvedValue({ items: [teacher], page: 0, size: 50, totalItems: 1, totalPages: 1 });

    render(<PrincipalPortalPage section="teachers" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Anita Rao')).toBeInTheDocument();
    expect(screen.getByText('an***@school.edu')).toBeInTheDocument();
    expect(listPrincipalTeachers).toHaveBeenCalledWith({ page: 0, size: 50 }, 'principal-token');
    expect(screen.queryByRole('button', { name: /provision|invite|edit|delete|deactivate/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^review$/i }));

    const drawer = await screen.findByRole('dialog', { name: /anita rao/i });
    expect(within(drawer).getByText('EMP-102')).toBeInTheDocument();
    expect(within(drawer).getByText(/provisioning, edit, deactivate, and role-management controls are intentionally hidden/i)).toBeInTheDocument();
  });

  it('requires explicit confirmation before publishing final results', async () => {
    vi.mocked(listPrincipalExams).mockResolvedValue([exam]);

    render(<PrincipalPortalPage section="results" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Term 1 Mathematics')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^publish$/i }));

    const dialog = await screen.findByRole('dialog', { name: /publish final results/i });
    expect(publishPrincipalExam).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: /publish final results/i }));

    await waitFor(() => expect(publishPrincipalExam).toHaveBeenCalledWith('exam-1', 'principal-token'));
    expect(await screen.findByText(/final results published/i)).toBeInTheDocument();
  });

  it('requires a rejection reason before calling the AI review API', async () => {
    vi.mocked(listPrincipalAiRecommendations).mockResolvedValue({ items: [recommendation], page: 0, size: 50, totalItems: 1, totalPages: 1 });

    render(<PrincipalPortalPage section="ai-suggestions" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Review attendance anomaly')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^reject$/i }));

    const dialog = await screen.findByRole('dialog', { name: /reject recommendation/i });
    const confirmButton = within(dialog).getByRole('button', { name: /^reject$/i });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/reason for rejection/i), { target: { value: 'Needs counselor review first.' } });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(rejectPrincipalAiRecommendation).toHaveBeenCalledWith('rec-1', 'Needs counselor review first.', 'principal-token'));
    expect(await screen.findByText(/ai recommendation rejected/i)).toBeInTheDocument();
  });
});
