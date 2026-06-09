import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthState } from '../../auth/hooks/authState';
import {
  executeStudentAiRecommendation,
  getStudentAiEntitlement,
  getStudentAiRecommendation,
  getStudentDashboardSummary,
  getStudentProfile,
  listStudentAiRecommendations,
  listStudentAttendance,
  listStudentFees,
  listStudentHomework,
  listStudentNotices,
  listStudentResults,
  listStudentTimetable,
  rejectStudentAiRecommendation,
  submitStudentHomework,
  type AiRecommendation,
  type StudentAttendanceRecord,
  type StudentExamResult,
  type StudentFeeDemand,
  type StudentHomework,
  type StudentNotice,
  type StudentProfile,
  type StudentTimetableEntry,
} from '../api/studentPortalApi';
import { StudentPortalPage } from './StudentPortalPage';

vi.mock('../../auth/hooks/authState', () => ({
  useAuthState: vi.fn(),
}));

vi.mock('../api/studentPortalApi', () => ({
  acceptStudentAiRecommendation: vi.fn(),
  dismissStudentAiRecommendation: vi.fn(),
  executeStudentAiRecommendation: vi.fn(),
  getStudentAiEntitlement: vi.fn(),
  getStudentAiRecommendation: vi.fn(),
  getStudentDashboardSummary: vi.fn(),
  getStudentProfile: vi.fn(),
  listStudentAiRecommendations: vi.fn(),
  listStudentAttendance: vi.fn(),
  listStudentFees: vi.fn(),
  listStudentHomework: vi.fn(),
  listStudentNotices: vi.fn(),
  listStudentResults: vi.fn(),
  listStudentTimetable: vi.fn(),
  rejectStudentAiRecommendation: vi.fn(),
  submitStudentHomework: vi.fn(),
}));

const profile: StudentProfile = {
  id: 'student-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  admissionNumber: 'ADM-001',
  fullName: 'Aarav Sharma',
  classLevelId: 'class-6',
  sectionId: 'section-a',
  rollNumber: '12',
  dateOfBirth: '2014-04-10',
  gender: 'MALE',
  active: true,
};

const homework: StudentHomework = {
  id: 'homework-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  classLevelId: 'class-6',
  className: 'Grade 6',
  sectionId: 'section-a',
  sectionName: 'A',
  subjectId: 'math',
  subjectCode: 'MATH',
  subjectName: 'Mathematics',
  title: 'Linear equations',
  instructions: 'Complete questions 1 through 10.',
  dueDate: '2026-06-20',
  status: 'PUBLISHED',
  createdByUserId: 'teacher-1',
  createdByRole: 'TEACHER',
  createdAt: '2026-06-08T10:00:00Z',
  publishedAt: '2026-06-08T10:00:00Z',
  submissions: [],
};

const result: StudentExamResult = {
  id: 'exam-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  classLevelId: 'class-6',
  className: 'Grade 6',
  sectionId: 'section-a',
  sectionName: 'A',
  subjectId: 'math',
  subjectCode: 'MATH',
  subjectName: 'Mathematics',
  title: 'Term 1 Mathematics',
  examDate: '2026-06-12',
  maxMarks: 100,
  status: 'PUBLISHED',
  createdByUserId: 'teacher-1',
  publishedByUserId: 'principal-1',
  createdAt: '2026-06-01T09:00:00Z',
  publishedAt: '2026-06-13T09:00:00Z',
  results: [{
    id: 'result-1',
    studentId: 'student-1',
    studentName: 'Aarav Sharma',
    recordedByUserId: 'teacher-1',
    marksObtained: 88,
    recordedAt: '2026-06-12T12:00:00Z',
  }],
};

const fee: StudentFeeDemand = {
  id: 'fee-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  studentId: 'student-1',
  studentName: 'Aarav Sharma',
  admissionNumber: 'ADM-001',
  description: 'Term fee',
  amountDue: 5000,
  amountPaid: 2500,
  outstandingAmount: 2500,
  dueDate: '2026-06-30',
  status: 'PARTIALLY_PAID',
  createdAt: '2026-06-01T09:00:00Z',
  payments: [{
    id: 'payment-1',
    tenantId: 'tenant-1',
    schoolId: 'school-a',
    demandId: 'fee-1',
    studentId: 'student-1',
    amount: 2500,
    paymentMethod: 'CASH',
    paymentReference: null,
    receiptNumber: 'RCP-001',
    paidAt: '2026-06-05T09:00:00Z',
  }],
};

const notice: StudentNotice = {
  id: 'notice-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  classLevelId: 'class-6',
  className: 'Grade 6',
  sectionId: 'section-a',
  sectionName: 'A',
  title: 'Science fair',
  body: 'Bring your project outline on Friday.',
  audience: 'STUDENTS',
  status: 'PUBLISHED',
  createdByUserId: 'school-admin-1',
  publishedByUserId: 'school-admin-1',
  createdAt: '2026-06-07T09:00:00Z',
  publishedAt: '2026-06-07T10:00:00Z',
};

const attendance: StudentAttendanceRecord = {
  id: 'attendance-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  sessionId: 'session-1',
  studentId: 'student-1',
  studentName: 'Aarav Sharma',
  admissionNumber: 'ADM-001',
  classLevelId: 'class-6',
  className: 'Grade 6',
  sectionId: 'section-a',
  sectionName: 'A',
  subjectId: 'math',
  subjectCode: 'MATH',
  subjectName: 'Mathematics',
  attendanceDate: '2026-06-08',
  status: 'PRESENT',
  remark: null,
  recordedAt: '2026-06-08T09:00:00Z',
};

const timetable: StudentTimetableEntry = {
  id: 'timetable-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  classLevelId: 'class-6',
  classLevelName: 'Grade 6',
  sectionId: 'section-a',
  sectionName: 'A',
  subjectId: 'math',
  subjectName: 'Mathematics',
  weekday: 'MONDAY',
  startTime: '09:00:00',
  endTime: '09:45:00',
  title: 'Math practice',
  createdAt: '2026-06-01T09:00:00Z',
};

const recommendation: AiRecommendation = {
  recommendationId: 'rec-1',
  tenantId: 'tenant-1',
  schoolId: 'school-a',
  targetType: 'STUDENT',
  targetId: 'student-1',
  recommendationType: 'REMEDIATION',
  title: 'Revise fractions',
  summary: 'Review fraction operations before the weekly quiz.',
  rationale: 'Recent homework indicates extra practice would help.',
  confidenceScore: 0.91,
  riskLevel: 'HIGH',
  status: 'PENDING_REVIEW',
  approvalRequired: true,
  metadataJson: '{}',
  createdAt: '2026-06-08T12:00:00Z',
};

describe('StudentPortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const activeSchool = { schoolId: 'school-a', code: 'A', name: 'School A', role: 'STUDENT' as const, primaryAccess: true };
    vi.mocked(useAuthState).mockReturnValue({
      accessToken: 'student-token',
      allowedSchools: [activeSchool],
      activateSchool: vi.fn(),
      clearError: vi.fn(),
      currentUser: {
        userId: 'student-user-1',
        email: 'student@example.com',
        displayName: 'Aarav Sharma',
        role: 'STUDENT',
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
    vi.mocked(getStudentDashboardSummary).mockResolvedValue({ metrics: [], alerts: [], activity: [] });
    vi.mocked(getStudentProfile).mockResolvedValue(profile);
    vi.mocked(listStudentHomework).mockResolvedValue([homework]);
    vi.mocked(listStudentResults).mockResolvedValue([result]);
    vi.mocked(listStudentFees).mockResolvedValue([fee]);
    vi.mocked(listStudentNotices).mockResolvedValue([notice]);
    vi.mocked(listStudentAttendance).mockResolvedValue([attendance]);
    vi.mocked(listStudentTimetable).mockResolvedValue([timetable]);
    vi.mocked(listStudentAiRecommendations).mockResolvedValue({ items: [recommendation], page: 0, size: 50, totalItems: 1, totalPages: 1 });
    vi.mocked(getStudentAiRecommendation).mockResolvedValue(recommendation);
    vi.mocked(rejectStudentAiRecommendation).mockResolvedValue({ ...recommendation, status: 'REJECTED' });
    vi.mocked(executeStudentAiRecommendation).mockResolvedValue({ ...recommendation, status: 'EXECUTED' });
    vi.mocked(getStudentAiEntitlement).mockResolvedValue({
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
    vi.mocked(submitStudentHomework).mockResolvedValue({
      ...homework,
      submissions: [{
        id: 'submission-1',
        studentId: 'student-1',
        studentName: 'Aarav Sharma',
        submittedByUserId: 'student-user-1',
        content: 'Here is my completed answer.',
        submittedAt: '2026-06-09T09:00:00Z',
      }],
    });
  });

  it('loads the own-record Student dashboard without admin controls', async () => {
    render(<StudentPortalPage section="dashboard" onNavigate={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: /student overview/i })).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Grade 6 - A')).toBeInTheDocument();
    expect(getStudentProfile).toHaveBeenCalledWith('student-token');
    expect(listStudentHomework).toHaveBeenCalledWith('student-token');
    expect(screen.queryByRole('button', { name: /create school|record payment|publish marks/i })).not.toBeInTheDocument();
  });

  it('validates and confirms homework submission before calling the Student API', async () => {
    render(<StudentPortalPage section="homework" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Linear equations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    const drawer = await screen.findByRole('dialog', { name: /linear equations/i });
    fireEvent.click(within(drawer).getByRole('button', { name: /submit homework/i }));
    expect(await within(drawer).findByText(/submission text is required/i)).toBeInTheDocument();

    fireEvent.change(within(drawer).getByLabelText(/submission text/i), { target: { value: 'Here is my completed answer.' } });
    fireEvent.click(within(drawer).getByRole('button', { name: /submit homework/i }));

    const dialog = await screen.findByRole('dialog', { name: /confirm homework submission/i });
    expect(submitStudentHomework).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: /submit homework/i }));

    await waitFor(() => expect(submitStudentHomework).toHaveBeenCalledWith(
      'homework-1',
      { content: 'Here is my completed answer.' },
      'student-token',
    ));
    expect(await screen.findByText(/homework submitted/i)).toBeInTheDocument();
  });

  it('keeps Results and Fees view-only for Student accounts', async () => {
    const { unmount } = render(<StudentPortalPage section="results" onNavigate={vi.fn()} />);

    expect((await screen.findAllByText('Term 1 Mathematics')).length).toBeGreaterThan(0);
    expect(screen.getByText('88 / 100')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /record marks|publish result|approve/i })).not.toBeInTheDocument();

    unmount();
    render(<StudentPortalPage section="fees" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Term fee')).toBeInTheDocument();
    expect(screen.getAllByText(/2,500/).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /record payment|create demand|discount|refund/i })).not.toBeInTheDocument();
  });

  it('keeps high-risk AI execution disabled and requires a rejection reason', async () => {
    render(<StudentPortalPage section="ai-suggestions" onNavigate={vi.fn()} />);

    expect(await screen.findByText('Revise fractions')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^review$/i }));

    const drawer = await screen.findByRole('dialog', { name: /revise fractions/i });
    expect(within(drawer).getByRole('button', { name: /open study help/i })).toBeDisabled();

    fireEvent.click(within(drawer).getByRole('button', { name: /^reject$/i }));
    const dialog = await screen.findByRole('dialog', { name: /reject recommendation/i });
    const rejectButton = within(dialog).getByRole('button', { name: /^reject$/i });
    expect(rejectButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/reason for rejecting/i), { target: { value: 'I want my teacher to review it first.' } });
    await waitFor(() => expect(rejectButton).not.toBeDisabled());
    fireEvent.click(rejectButton);

    await waitFor(() => expect(rejectStudentAiRecommendation).toHaveBeenCalledWith('rec-1', 'I want my teacher to review it first.', 'student-token'));
    expect(executeStudentAiRecommendation).not.toHaveBeenCalled();
  });
});
