import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import type { DashboardSummary } from '../../portal/api/dashboardApi';
import type { ReportExportFormat, ReportExportResponse, ReportType } from '../../reports/api/reportExportsApi';
import {
  approvePrincipalAiRecommendation,
  dismissPrincipalAiRecommendation,
  downloadPrincipalReportExport,
  executePrincipalAiRecommendation,
  getPrincipalAiEntitlement,
  getPrincipalAiRecommendation,
  getPrincipalAttendanceSession,
  getPrincipalExam,
  getPrincipalReportExport,
  getPrincipalDashboardSummary,
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
  type AiAutomationRule,
  type AiAutomationRun,
  type AiEntitlement,
  type AiRecommendation,
  type PageResponse,
  type PrincipalAttendanceSession,
  type PrincipalExam,
  type PrincipalStudent,
  type PrincipalTeacher,
} from '../api/principalApi';

type PrincipalPortalPageProps = {
  onNavigate: (navId: string) => void;
  section: string;
};

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

type ConfirmConfig = {
  confirmLabel: string;
  detail: string;
  reasonLabel?: string;
  requireReason?: boolean;
  title: string;
  tone?: 'default' | 'danger';
  onConfirm: (reason?: string) => Promise<void>;
};

const PAGE_SIZE = 10;

export function PrincipalPortalPage({ onNavigate, section }: PrincipalPortalPageProps) {
  if (section === 'dashboard') return <PrincipalDashboardPage onNavigate={onNavigate} />;
  if (section === 'teachers') return <PrincipalTeachersPage />;
  if (section === 'students') return <PrincipalStudentsPage />;
  if (section === 'attendance') return <PrincipalAttendancePage />;
  if (section === 'exams') return <PrincipalExamsPage mode="exams" />;
  if (section === 'results') return <PrincipalExamsPage mode="results" />;
  if (section === 'ai-suggestions') return <PrincipalAiApprovalsPage />;
  if (section === 'reports') return <PrincipalReportsPage />;
  return (
    <PrincipalPageFrame
      detail="This Principal module is not enabled for the current role inventory."
      eyebrow="Principal"
      title="Unsupported module"
    >
      <PanelState
        detail="Only Dashboard, Teachers, Students, Attendance Review, Exams, Results Approval, AI Approvals, and Reports are surfaced for Principal."
        title="Module not available"
      />
    </PrincipalPageFrame>
  );
}

function PrincipalDashboardPage({ onNavigate }: { onNavigate: (navId: string) => void }) {
  const { accessToken, currentUser } = useAuthState();
  const [state, setState] = useState<AsyncState<DashboardSummary>>({ data: null, error: null, status: 'loading' });

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await getPrincipalDashboardSummary(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Principal overview could not be loaded.'), status: 'error' });
    }
  }

  const metrics = state.data?.metrics ?? [];
  const alerts = state.data?.alerts ?? [];
  const activity = state.data?.activity ?? [];

  return (
    <PrincipalPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail={`${currentUser?.activeSchool?.name ?? 'Active school'} academic review, attendance, exams, AI recommendations, and exports.`}
      eyebrow="Academic leadership"
      title="Principal Overview"
    >
      {state.status === 'loading' ? <PrincipalSkeleton /> : null}
      {state.status === 'error' ? <PanelState action={<button onClick={() => void load()} type="button">Retry</button>} detail={state.error ?? 'Overview unavailable.'} title="Dashboard unavailable" tone="error" /> : null}
      {state.status === 'ready' ? (
        <>
          <div className="principal-metrics">
            {metrics.length > 0 ? metrics.map((metric) => (
              <article className="principal-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.detail ?? 'School-scoped academic metric'}</em>
              </article>
            )) : (
              <article className="principal-metric">
                <span>Academic command center</span>
                <strong>Ready</strong>
                <em>Summary metrics will appear when the dashboard API returns activity.</em>
              </article>
            )}
          </div>

          <div className="principal-dashboard-grid">
            <section className="principal-card" aria-labelledby="principal-needs-attention">
              <PrincipalCardHeading
                detail="Student performance, attendance, exams, and AI review items returned by the dashboard API."
                title="Needs attention"
              />
              {alerts.length > 0 ? (
                <div className="principal-record-list">
                  {alerts.map((alert) => (
                    <article key={alert.title}>
                      <strong>{alert.title}</strong>
                      <span>{alert.detail ?? 'Review this academic alert.'}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <PanelState compact detail="No academic alerts were returned for this school." title="No active alerts" />
              )}
            </section>

            <section className="principal-card" aria-labelledby="principal-quick-actions">
              <PrincipalCardHeading detail="Fast paths into implemented Principal screens." title="Quick actions" />
              <div className="principal-action-list">
                {[
                  ['results', 'Review results', 'Open the result approval queue and publish guardrails.'],
                  ['ai-suggestions', 'AI approvals', 'Review school-scoped recommendations that require human judgment.'],
                  ['reports', 'View reports', 'Queue and download supported academic report exports.'],
                ].map(([id, title, detail]) => (
                  <button key={id} onClick={() => onNavigate(id)} type="button">
                    <strong>{title}</strong>
                    <span>{detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="principal-card wide" aria-labelledby="principal-recent-activity">
              <PrincipalCardHeading detail="Read-only activity from the school-scoped dashboard summary." title="Recent academic activity" />
              {activity.length > 0 ? (
                <div className="principal-record-list">
                  {activity.map((item) => (
                    <article key={`${item.title}-${item.occurredAt ?? ''}`}>
                      <strong>{item.title}</strong>
                      <span>{item.detail ?? 'School activity'}</span>
                      {item.occurredAt ? <em>{formatDateTime(item.occurredAt)}</em> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <PanelState compact detail="Recent academic activity will appear here when returned by the API." title="No recent activity" />
              )}
            </section>
          </div>
        </>
      ) : null}
    </PrincipalPageFrame>
  );
}

function PrincipalTeachersPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<PageResponse<PrincipalTeacher>>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PrincipalTeacher | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listPrincipalTeachers({ page: 0, size: 50 }, accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Teachers could not be loaded.'), status: 'error' });
    }
  }

  const teachers = state.data?.items ?? [];
  const filtered = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesQuery = textMatches(teacher, debouncedQuery);
      const status = teacher.active ? 'active' : 'inactive';
      return matchesQuery && (statusFilter === 'all' || statusFilter === status);
    });
  }, [debouncedQuery, statusFilter, teachers]);
  const pageItems = paginate(filtered, page);

  return (
    <PrincipalPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Review teacher directory, status, staff identifiers, departments, and assignments returned by the school-scoped API."
      eyebrow="Faculty review"
      title="Teachers"
    >
      <PrincipalToolbar
        query={query}
        searchLabel="Search teachers"
        searchPlaceholder="Search by teacher name, department, designation, or email"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['active', 'Active'], ['inactive', 'Inactive']]}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
      />
      <PrincipalRemoteState
        emptyDetail="Teacher records will appear after staff accounts are provisioned for this school."
        emptyTitle="No teachers found"
        error={state.error}
        loading={state.status === 'loading'}
        onRetry={load}
        ready={state.status === 'ready'}
        resultCount={teachers.length}
      >
        <PrincipalTable
          columns={['Teacher', 'Staff ID', 'Department', 'Status', 'Actions']}
          emptyFiltered={filtered.length === 0}
          emptyFilteredDetail="Adjust search or status filters to review more teachers."
        >
          {pageItems.map((teacher) => (
            <tr key={teacher.id}>
              <td><strong>{teacher.fullName}</strong><span>{maskEmail(teacher.email)}</span></td>
              <td>{teacher.employeeNumber ?? 'Not provided'}</td>
              <td>{teacher.department ?? teacher.designation ?? 'Not assigned'}</td>
              <td><StatusBadge value={teacher.active ? 'ACTIVE' : 'INACTIVE'} /></td>
              <td><button onClick={() => setSelected(teacher)} type="button">Review</button></td>
            </tr>
          ))}
        </PrincipalTable>
        <PrincipalPagination page={page} total={filtered.length} onPageChange={setPage} />
      </PrincipalRemoteState>
      {selected ? (
        <PrincipalDrawer onClose={() => setSelected(null)} title={selected.fullName} eyebrow="Teacher detail">
          <DetailGrid rows={[
            ['Email', maskEmail(selected.email)],
            ['Employee number', selected.employeeNumber ?? 'Not provided'],
            ['Department', selected.department ?? 'Not assigned'],
            ['Designation', selected.designation ?? 'Not assigned'],
            ['Portal login', selected.portalLoginRequired ? 'Required' : 'Not required'],
            ['Status', selected.active ? 'Active' : selected.userStatus],
          ]} />
          <BacklogNote detail="Teacher workload and assignment summaries are shown only when the directory API returns them. Provisioning, edit, deactivate, and role-management controls are intentionally hidden for Principal." />
        </PrincipalDrawer>
      ) : null}
    </PrincipalPageFrame>
  );
}

function PrincipalStudentsPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<PageResponse<PrincipalStudent>>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PrincipalStudent | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken, debouncedQuery, page, statusFilter]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({
        data: await listPrincipalStudents({
          page,
          search: debouncedQuery.trim() || undefined,
          size: PAGE_SIZE,
          status: statusFilter === 'all' ? undefined : statusFilter,
        }, accessToken),
        error: null,
        status: 'ready',
      });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Students could not be loaded.'), status: 'error' });
    }
  }

  const students = state.data?.items ?? [];
  const totalStudents = Number(state.data?.totalItems ?? 0);
  const currentPage = state.data?.page ?? page;

  return (
    <PrincipalPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Review student roster and safe academic identifiers. Import, edit, delete, fee, and disciplinary operations remain hidden for Principal."
      eyebrow="Student review"
      title="Students"
    >
      <PrincipalToolbar
        query={query}
        searchLabel="Search students"
        searchPlaceholder="Search by student name, admission number, roll number, or guardian"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['active', 'Active'], ['inactive', 'Inactive']]}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
      />
      <PrincipalRemoteState
        emptyDetail="Student records will appear after school-scoped imports or admissions create them."
        emptyTitle="No students found"
        error={state.error}
        loading={state.status === 'loading'}
        onRetry={load}
        ready={state.status === 'ready'}
        resultCount={totalStudents}
      >
        <PrincipalTable
          columns={['Student', 'Admission', 'Class', 'Status', 'Actions']}
          emptyFiltered={students.length === 0}
          emptyFilteredDetail="Adjust search or status filters to review more students."
        >
          {students.map((student) => (
            <tr key={student.id}>
              <td><strong>{student.fullName}</strong><span>Roll {student.rollNumber ?? 'not set'}</span></td>
              <td>{student.admissionNumber}</td>
              <td>{student.classLevelId ?? 'Class not set'}{student.sectionId ? ` / ${student.sectionId}` : ''}</td>
              <td><StatusBadge value={student.active ? 'ACTIVE' : 'INACTIVE'} /></td>
              <td><button onClick={() => setSelected(student)} type="button">Review</button></td>
            </tr>
          ))}
        </PrincipalTable>
        <PrincipalPagination page={currentPage} total={totalStudents} onPageChange={setPage} />
      </PrincipalRemoteState>
      {selected ? (
        <PrincipalDrawer onClose={() => setSelected(null)} title={selected.fullName} eyebrow="Student detail">
          <DetailGrid rows={[
            ['Admission number', selected.admissionNumber],
            ['Roll number', selected.rollNumber ?? 'Not set'],
            ['Class', selected.classLevelId ?? 'Not set'],
            ['Section', selected.sectionId ?? 'Not set'],
            ['Gender', selected.gender ?? 'Not provided'],
            ['Guardian', selected.guardianName ?? 'Not provided'],
            ['Guardian email', selected.guardianEmail ? maskEmail(selected.guardianEmail) : 'Not provided'],
            ['Status', selected.active ? 'Active' : 'Inactive'],
          ]} />
          <BacklogNote detail="Login invitations, imports, edits, fees, and disciplinary actions are not surfaced for Principal because this screen is review-focused." />
        </PrincipalDrawer>
      ) : null}
    </PrincipalPageFrame>
  );
}

function PrincipalAttendancePage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<PrincipalAttendanceSession[]>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PrincipalAttendanceSession | null>(null);
  const [detailStatus, setDetailStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listPrincipalAttendanceSessions(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Attendance sessions could not be loaded.'), status: 'error' });
    }
  }

  async function openDetail(session: PrincipalAttendanceSession) {
    if (!accessToken) return;
    setSelected(session);
    setDetailStatus('loading');
    try {
      setSelected(await getPrincipalAttendanceSession(session.id, accessToken));
      setDetailStatus('idle');
    } catch {
      setDetailStatus('error');
    }
  }

  const sessions = state.data ?? [];
  const filtered = useMemo(() => sessions.filter((session) => {
    const reviewStatus = attendanceReviewStatus(session).toLowerCase();
    return textMatches(session, debouncedQuery) && (statusFilter === 'all' || reviewStatus === statusFilter);
  }), [debouncedQuery, sessions, statusFilter]);
  const pageItems = paginate(filtered, page);
  const totals = sessions.reduce((sum, session) => ({
    absent: sum.absent + session.absentCount,
    late: sum.late + session.lateCount,
    present: sum.present + session.presentCount,
    sessions: sum.sessions + 1,
  }), { absent: 0, late: 0, present: 0, sessions: 0 });

  return (
    <PrincipalPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Scan class attendance sessions for absences, late marks, and incomplete review signals. Submission and correction controls are intentionally hidden."
      eyebrow="Attendance review"
      title="Attendance Review"
    >
      <div className="principal-metrics compact">
        <MetricCard detail="Submitted school-scoped sessions" label="Sessions" value={totals.sessions} />
        <MetricCard detail="Total present records" label="Present" value={totals.present} />
        <MetricCard detail="Absence records needing review" label="Absent" value={totals.absent} />
        <MetricCard detail="Late records needing follow-up" label="Late" value={totals.late} />
      </div>
      <PrincipalToolbar
        query={query}
        searchLabel="Search attendance"
        searchPlaceholder="Search by class, section, subject, date, or submitter"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All review states'], ['healthy', 'Healthy'], ['needs-review', 'Needs review']]}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
      />
      <PrincipalRemoteState
        emptyDetail="Attendance sessions will appear after attendance is submitted for this school."
        emptyTitle="No attendance sessions"
        error={state.error}
        loading={state.status === 'loading'}
        onRetry={load}
        ready={state.status === 'ready'}
        resultCount={sessions.length}
      >
        <PrincipalTable columns={['Session', 'Counts', 'Review state', 'Submitted', 'Actions']} emptyFiltered={filtered.length === 0} emptyFilteredDetail="Adjust search or review filters to inspect more sessions.">
          {pageItems.map((session) => (
            <tr key={session.id}>
              <td><strong>{session.classLevelName}{session.sectionName ? ` / ${session.sectionName}` : ''}</strong><span>{session.subjectName ?? 'No subject'} - {formatDate(session.attendanceDate)}</span></td>
              <td>{session.presentCount} present / {session.absentCount} absent / {session.lateCount} late</td>
              <td><StatusBadge value={attendanceReviewStatus(session)} /></td>
              <td>{session.submittedByRole}</td>
              <td><button onClick={() => void openDetail(session)} type="button">Open detail</button></td>
            </tr>
          ))}
        </PrincipalTable>
        <PrincipalPagination page={page} total={filtered.length} onPageChange={setPage} />
      </PrincipalRemoteState>
      {selected ? (
        <PrincipalDrawer onClose={() => setSelected(null)} title={`${selected.classLevelName} attendance`} eyebrow="Attendance detail">
          {detailStatus === 'loading' ? <PrincipalSkeleton compact /> : null}
          {detailStatus === 'error' ? <PanelState compact detail="Session detail could not be loaded." title="Detail unavailable" tone="error" /> : null}
          <DetailGrid rows={[
            ['Date', formatDate(selected.attendanceDate)],
            ['Subject', selected.subjectName ?? 'Not set'],
            ['Submitted by', selected.submittedByRole],
            ['Present', String(selected.presentCount)],
            ['Absent', String(selected.absentCount)],
            ['Late', String(selected.lateCount)],
            ['Excused', String(selected.excusedCount)],
          ]} />
          <PrincipalTable columns={['Student', 'Admission', 'Status', 'Remark']}>
            {selected.records.map((record) => (
              <tr key={record.id}>
                <td><strong>{record.studentName}</strong></td>
                <td>{record.admissionNumber}</td>
                <td><StatusBadge value={record.status} /></td>
                <td>{record.remark ?? 'No remark'}</td>
              </tr>
            ))}
          </PrincipalTable>
          <BacklogNote detail="Attendance correction and final submission actions require explicit Principal manage permission and MFA freshness. They are not surfaced in this review-first screen." />
        </PrincipalDrawer>
      ) : null}
    </PrincipalPageFrame>
  );
}

function PrincipalExamsPage({ mode }: { mode: 'exams' | 'results' }) {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<PrincipalExam[]>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PrincipalExam | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listPrincipalExams(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Exams could not be loaded.'), status: 'error' });
    }
  }

  async function openDetail(exam: PrincipalExam) {
    if (!accessToken) return;
    setSelected(exam);
    try {
      setSelected(await getPrincipalExam(exam.id, accessToken));
    } catch {
      setSelected(exam);
    }
  }

  function requestPublish(exam: PrincipalExam) {
    setConfirm({
      confirmLabel: mode === 'results' ? 'Publish final results' : 'Publish exam',
      detail: mode === 'results'
        ? 'Publishing results may make them visible to students/parents. Review carefully before continuing.'
        : 'Publishing may make exam information visible to relevant users. Review carefully before continuing.',
      title: mode === 'results' ? 'Publish final results?' : 'Publish exam?',
      tone: 'danger',
      onConfirm: async () => {
        if (!accessToken) return;
        setBusy(true);
        try {
          const updated = await publishPrincipalExam(exam.id, accessToken);
          setMessage(mode === 'results' ? 'Final results published.' : 'Exam published.');
          setSelected(updated);
          await load();
        } finally {
          setBusy(false);
          setConfirm(null);
        }
      },
    });
  }

  const exams = state.data ?? [];
  const filtered = useMemo(() => exams.filter((exam) => {
    return textMatches(exam, debouncedQuery) && (statusFilter === 'all' || exam.status.toLowerCase() === statusFilter);
  }), [debouncedQuery, exams, statusFilter]);
  const pageItems = paginate(filtered, page);
  const title = mode === 'results' ? 'Results Approval' : 'Exams';

  return (
    <PrincipalPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail={mode === 'results' ? 'Review result readiness and publish completed exams with explicit confirmation.' : 'Review exam schedules, publication state, and assessment readiness.'}
      eyebrow={mode === 'results' ? 'Approval queue' : 'Assessment review'}
      title={title}
    >
      {message ? <p className="form-result" role="status">{message}</p> : null}
      <PrincipalToolbar
        query={query}
        searchLabel={`Search ${mode === 'results' ? 'results' : 'exams'}`}
        searchPlaceholder="Search by exam, class, section, subject, status, or date"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['draft', 'Draft'], ['published', 'Published']]}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
      />
      <PrincipalRemoteState
        emptyDetail={mode === 'results' ? 'Result review items will appear after exams and marks are recorded.' : 'Exam records will appear after schedules are created.'}
        emptyTitle={mode === 'results' ? 'No results to review' : 'No exams found'}
        error={state.error}
        loading={state.status === 'loading'}
        onRetry={load}
        ready={state.status === 'ready'}
        resultCount={exams.length}
      >
        <PrincipalTable columns={mode === 'results' ? ['Exam', 'Results', 'Status', 'Publish', 'Actions'] : ['Exam', 'Class', 'Date', 'Status', 'Actions']} emptyFiltered={filtered.length === 0} emptyFilteredDetail="Adjust search or status filters to review more exam records.">
          {pageItems.map((exam) => (
            <tr key={exam.id}>
              <td><strong>{exam.title}</strong><span>{exam.subjectName}</span></td>
              {mode === 'results' ? (
                <>
                  <td>{exam.results.length} recorded / max {exam.maxMarks}</td>
                  <td><StatusBadge value={resultReviewStatus(exam)} /></td>
                  <td>{exam.status === 'PUBLISHED' ? 'Published' : 'Ready when reviewed'}</td>
                </>
              ) : (
                <>
                  <td>{exam.className}{exam.sectionName ? ` / ${exam.sectionName}` : ''}</td>
                  <td>{formatDate(exam.examDate)}</td>
                  <td><StatusBadge value={exam.status} /></td>
                </>
              )}
              <td>
                <div className="principal-actions">
                  <button onClick={() => void openDetail(exam)} type="button">Review</button>
                  {exam.status !== 'PUBLISHED' ? <button className="secondary" disabled={busy} onClick={() => requestPublish(exam)} type="button">Publish</button> : null}
                </div>
              </td>
            </tr>
          ))}
        </PrincipalTable>
        <PrincipalPagination page={page} total={filtered.length} onPageChange={setPage} />
      </PrincipalRemoteState>
      {selected ? (
        <PrincipalDrawer onClose={() => setSelected(null)} title={selected.title} eyebrow={mode === 'results' ? 'Result review detail' : 'Exam detail'}>
          <DetailGrid rows={[
            ['Class', selected.className],
            ['Section', selected.sectionName ?? 'Not set'],
            ['Subject', selected.subjectName],
            ['Exam date', formatDate(selected.examDate)],
            ['Max marks', String(selected.maxMarks)],
            ['Status', selected.status],
            ['Published at', selected.publishedAt ? formatDateTime(selected.publishedAt) : 'Not published'],
          ]} />
          <PrincipalTable columns={['Student', 'Marks', 'Recorded at']}>
            {selected.results.length > 0 ? selected.results.map((result) => (
              <tr key={result.id}>
                <td><strong>{result.studentName}</strong></td>
                <td>{result.marksObtained} / {selected.maxMarks}</td>
                <td>{formatDateTime(result.recordedAt)}</td>
              </tr>
            )) : (
              <tr><td colSpan={3}>No marks have been recorded for this exam yet.</td></tr>
            )}
          </PrincipalTable>
          <BacklogNote detail="Approve/reject request-changes workflow is not exposed because the current backend supports mark recording and publish, but no distinct Principal approval/rejection endpoint. MFA freshness for result publishing is a backlog guardrail." />
        </PrincipalDrawer>
      ) : null}
      {confirm ? <PrincipalConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </PrincipalPageFrame>
  );
}

function PrincipalAiApprovalsPage() {
  const { accessToken } = useAuthState();
  const [recommendations, setRecommendations] = useState<AsyncState<PageResponse<AiRecommendation>>>({ data: null, error: null, status: 'loading' });
  const [rules, setRules] = useState<AiAutomationRule[]>([]);
  const [runs, setRuns] = useState<AiAutomationRun[]>([]);
  const [entitlement, setEntitlement] = useState<AiEntitlement | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<AiRecommendation | null>(null);
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setRecommendations({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setRecommendations((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      const [items, rulesResponse, runsResponse, entitlementResponse] = await Promise.all([
        listPrincipalAiRecommendations({ page: 0, size: 50 }, accessToken),
        listPrincipalAutomationRules({ page: 0, size: 10 }, accessToken).catch(() => null),
        listPrincipalAutomationRuns({ page: 0, size: 10 }, accessToken).catch(() => null),
        getPrincipalAiEntitlement(accessToken).catch(() => null),
      ]);
      setRecommendations({ data: items, error: null, status: 'ready' });
      setRules(rulesResponse?.items ?? []);
      setRuns(runsResponse?.items ?? []);
      setEntitlement(entitlementResponse);
    } catch (error) {
      setRecommendations({ data: null, error: errorMessage(error, 'AI recommendations could not be loaded.'), status: 'error' });
    }
  }

  async function openDetail(item: AiRecommendation) {
    if (!accessToken) return;
    setSelected(item);
    try {
      setSelected(await getPrincipalAiRecommendation(item.recommendationId, accessToken));
    } catch {
      setSelected(item);
    }
  }

  function action(item: AiRecommendation, kind: 'approve' | 'reject' | 'dismiss' | 'execute') {
    const labels = {
      approve: ['Approve recommendation?', 'Approve', 'This will approve the recommendation within Principal school scope.'],
      reject: ['Reject recommendation?', 'Reject', 'This will reject the recommendation and store the provided reason.'],
      dismiss: ['Dismiss recommendation?', 'Dismiss', 'This will remove the recommendation from the active review queue.'],
      execute: ['Execute approved recommendation?', 'Execute', 'Execution is policy-controlled and may request an approved automation action. Never execute sensitive data changes without human approval.'],
    } as const;
    const [title, confirmLabel, detail] = labels[kind];
    setConfirm({
      confirmLabel,
      detail,
      reasonLabel: kind === 'reject' ? 'Reason for rejection' : undefined,
      requireReason: kind === 'reject',
      title,
      tone: kind === 'execute' ? 'danger' : 'default',
      onConfirm: async (reason) => {
        if (!accessToken) return;
        setBusy(true);
        try {
          const updated = kind === 'approve'
            ? await approvePrincipalAiRecommendation(item.recommendationId, accessToken)
            : kind === 'reject'
              ? await rejectPrincipalAiRecommendation(item.recommendationId, reason ?? '', accessToken)
              : kind === 'dismiss'
                ? await dismissPrincipalAiRecommendation(item.recommendationId, accessToken)
                : await executePrincipalAiRecommendation(item.recommendationId, accessToken);
          const messageByAction = {
            approve: 'AI recommendation approved.',
            reject: 'AI recommendation rejected.',
            dismiss: 'AI recommendation dismissed.',
            execute: 'AI recommendation execution requested.',
          };
          setSelected(updated);
          setMessage(messageByAction[kind]);
          await load();
        } finally {
          setBusy(false);
          setConfirm(null);
        }
      },
    });
  }

  const rows = recommendations.data?.items ?? [];
  const filtered = useMemo(() => rows.filter((item) => {
    return textMatches(item, debouncedQuery) && (statusFilter === 'all' || item.status.toLowerCase() === statusFilter);
  }), [debouncedQuery, rows, statusFilter]);
  const pageItems = paginate(filtered, page);

  return (
    <PrincipalPageFrame
      action={<button className="secondary" disabled={recommendations.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Review school-scoped AI recommendations with human approval, rejection, dismissal, and policy-controlled execution guardrails."
      eyebrow="AI approvals"
      title="AI Approvals"
    >
      {message ? <p className="form-result" role="status">{message}</p> : null}
      <div className="principal-metrics compact">
        <MetricCard detail="Tenant AI entitlement" label="AI enabled" value={entitlement?.enabled ? 'Yes' : 'No'} />
        <MetricCard detail="Recommendations returned" label="Queue" value={rows.length} />
        <MetricCard detail="Visible automation rules" label="Rules" value={rules.length} />
        <MetricCard detail="Recent automation runs" label="Runs" value={runs.length} />
      </div>
      <PrincipalToolbar
        query={query}
        searchLabel="Search recommendations"
        searchPlaceholder="Search by title, type, risk, status, or target"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['pending_review', 'Pending review'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['executed', 'Executed'], ['failed', 'Failed']]}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
      />
      <PrincipalRemoteState
        emptyDetail="AI recommendations will appear when policy-controlled suggestions are created for this school."
        emptyTitle="No AI recommendations"
        error={recommendations.error}
        loading={recommendations.status === 'loading'}
        onRetry={load}
        ready={recommendations.status === 'ready'}
        resultCount={rows.length}
      >
        <PrincipalTable columns={['Recommendation', 'Risk', 'Status', 'Confidence', 'Actions']} emptyFiltered={filtered.length === 0} emptyFilteredDetail="Adjust search or status filters to review more recommendations.">
          {pageItems.map((item) => (
            <tr key={item.recommendationId}>
              <td><strong>{item.title}</strong><span>{item.recommendationType} / {item.targetType}</span></td>
              <td><StatusBadge value={item.riskLevel} /></td>
              <td><StatusBadge value={item.status} /></td>
              <td>{Math.round(Number(item.confidenceScore) * 100)}%</td>
              <td>
                <div className="principal-actions">
                  <button onClick={() => void openDetail(item)} type="button">Review</button>
                  <button className="secondary" disabled={busy} onClick={() => action(item, 'approve')} type="button">Approve</button>
                  <button className="secondary" disabled={busy} onClick={() => action(item, 'reject')} type="button">Reject</button>
                  {item.status === 'APPROVED' ? <button disabled={busy} onClick={() => action(item, 'execute')} type="button">Execute</button> : null}
                </div>
              </td>
            </tr>
          ))}
        </PrincipalTable>
        <PrincipalPagination page={page} total={filtered.length} onPageChange={setPage} />
      </PrincipalRemoteState>
      <BacklogNote detail="Central AI policy configuration remains hidden for Principal. Risk policy and MFA freshness for high-risk AI execution are backend guardrail backlog items unless enforced by policy." />
      {selected ? (
        <PrincipalDrawer onClose={() => setSelected(null)} title={selected.title} eyebrow="AI recommendation detail">
          <DetailGrid rows={[
            ['Type', selected.recommendationType],
            ['Target', `${selected.targetType}${selected.targetId ? ` / ${selected.targetId}` : ''}`],
            ['Risk', selected.riskLevel],
            ['Status', selected.status],
            ['Approval required', selected.approvalRequired ? 'Yes' : 'No'],
            ['Created', formatDateTime(selected.createdAt)],
          ]} />
          <section className="principal-note">
            <strong>Rationale</strong>
            <span>{selected.rationale || selected.summary}</span>
          </section>
          <div className="principal-actions">
            <button disabled={busy} onClick={() => action(selected, 'approve')} type="button">Approve</button>
            <button className="secondary" disabled={busy} onClick={() => action(selected, 'reject')} type="button">Reject</button>
            <button className="secondary" disabled={busy} onClick={() => action(selected, 'dismiss')} type="button">Dismiss</button>
            {selected.status === 'APPROVED' ? <button disabled={busy} onClick={() => action(selected, 'execute')} type="button">Execute</button> : null}
          </div>
        </PrincipalDrawer>
      ) : null}
      {confirm ? <PrincipalConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </PrincipalPageFrame>
  );
}

function PrincipalReportsPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<ReportExportResponse[]>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<'request' | null>(null);
  const [selected, setSelected] = useState<ReportExportResponse | null>(null);
  const [reportType, setReportType] = useState<ReportType>('STUDENT_DIRECTORY');
  const [format] = useState<ReportExportFormat>('CSV');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Principal login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listPrincipalReportExports(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Report exports could not be loaded.'), status: 'error' });
    }
  }

  async function openDetail(item: ReportExportResponse) {
    if (!accessToken) return;
    setSelected(item);
    try {
      setSelected(await getPrincipalReportExport(item.id, accessToken));
    } catch {
      setSelected(item);
    }
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirm({
      confirmLabel: 'Queue export',
      detail: 'This export may contain sensitive student or academic data for the active school. Queue it only for a legitimate academic review purpose.',
      title: 'Queue sensitive report export?',
      tone: 'danger',
      onConfirm: async () => {
        if (!accessToken) return;
        setBusy(true);
        try {
          const response = await requestPrincipalReportExport({ reportType, format }, accessToken);
          setMessage(`${labelForReport(response.reportType)} export queued.`);
          setDrawer(null);
          await load();
        } finally {
          setBusy(false);
          setConfirm(null);
        }
      },
    });
  }

  async function download(item: ReportExportResponse) {
    if (!accessToken || item.status !== 'COMPLETED') return;
    setBusy(true);
    try {
      const content = await downloadPrincipalReportExport(item.id, accessToken);
      setMessage(`Downloaded ${content.length} characters from ${item.fileName ?? 'export'}.`);
    } finally {
      setBusy(false);
    }
  }

  const exports = state.data ?? [];
  const filtered = useMemo(() => exports.filter((item) => {
    return textMatches(item, debouncedQuery) && (statusFilter === 'all' || item.status.toLowerCase() === statusFilter);
  }), [debouncedQuery, exports, statusFilter]);
  const pageItems = paginate(filtered, page);

  return (
    <PrincipalPageFrame
      action={<><button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button><button onClick={() => setDrawer('request')} type="button">Request export</button></>}
      detail="Queue and monitor supported school-scoped report export jobs. Downloads are only enabled for completed exports."
      eyebrow="Reports"
      title="Reports"
    >
      {message ? <p className="form-result" role="status">{message}</p> : null}
      <PrincipalToolbar
        query={query}
        searchLabel="Search exports"
        searchPlaceholder="Search by file, report type, status, or job id"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['queued', 'Queued'], ['processing', 'Processing'], ['completed', 'Completed'], ['failed', 'Failed'], ['cancelled', 'Cancelled']]}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
      />
      <PrincipalRemoteState emptyDetail="Report export jobs will appear after a Principal requests a supported export." emptyTitle="No report exports" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={exports.length}>
        <PrincipalTable columns={['Report', 'Status', 'Requested', 'File', 'Actions']} emptyFiltered={filtered.length === 0} emptyFilteredDetail="Adjust search or status filters to review more export jobs.">
          {pageItems.map((item) => (
            <tr key={item.id}>
              <td><strong>{labelForReport(item.reportType)}</strong><span>{item.id}</span></td>
              <td><StatusBadge value={item.status} /></td>
              <td>{formatDateTime(item.requestedAt)}</td>
              <td>{item.fileName ?? 'Pending file'}</td>
              <td>
                <div className="principal-actions">
                  <button onClick={() => void openDetail(item)} type="button">Detail</button>
                  <button className="secondary" disabled={busy || item.status !== 'COMPLETED'} onClick={() => void download(item)} type="button">Download</button>
                </div>
              </td>
            </tr>
          ))}
        </PrincipalTable>
        <PrincipalPagination page={page} total={filtered.length} onPageChange={setPage} />
      </PrincipalRemoteState>
      <BacklogNote detail="Endpoint-level MFA freshness for sensitive exports is a backlog guardrail unless enforced by the backend session policy." />
      {drawer === 'request' ? (
        <PrincipalDrawer onClose={() => setDrawer(null)} title="Request report export" eyebrow="Sensitive export">
          <form className="principal-form" onSubmit={submitRequest}>
            <PrincipalField label="Report type" required>
              <select value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)}>
                <option value="STUDENT_DIRECTORY">Student directory</option>
                <option value="FEE_DEMANDS">Fee demands</option>
              </select>
            </PrincipalField>
            <PrincipalField label="Format" required>
              <input readOnly value={format} />
            </PrincipalField>
            <section className="principal-note warning">
              <strong>Sensitive data warning</strong>
              <span>Exports may include student or academic data. Confirm the active school and intended purpose before queueing.</span>
            </section>
            <div className="principal-drawer-footer">
              <button className="secondary" disabled={busy} onClick={() => setDrawer(null)} type="button">Cancel</button>
              <button disabled={busy} type="submit">{busy ? 'Queueing...' : 'Continue'}</button>
            </div>
          </form>
        </PrincipalDrawer>
      ) : null}
      {selected ? (
        <PrincipalDrawer onClose={() => setSelected(null)} title={labelForReport(selected.reportType)} eyebrow="Export job detail">
          <DetailGrid rows={[
            ['Export id', selected.id],
            ['Bulk job id', selected.bulkJobId],
            ['Status', selected.status],
            ['Format', selected.format],
            ['File', selected.fileName ?? 'Pending'],
            ['Content type', selected.contentType ?? 'Pending'],
            ['Requested', formatDateTime(selected.requestedAt)],
            ['Completed', selected.completedAt ? formatDateTime(selected.completedAt) : 'Not completed'],
          ]} />
        </PrincipalDrawer>
      ) : null}
      {confirm ? <PrincipalConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </PrincipalPageFrame>
  );
}

function PrincipalPageFrame({
  action,
  children,
  detail,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  detail: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="principal-panel" aria-labelledby={`${slug(title)}-title`}>
      <div className="principal-title">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${slug(title)}-title`}>{title}</h2>
          <span>{detail}</span>
        </div>
        {action ? <div className="principal-title-actions">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function PrincipalToolbar({
  onQueryChange,
  onStatusChange,
  query,
  searchLabel,
  searchPlaceholder,
  statusFilter,
  statusOptions,
}: {
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  query: string;
  searchLabel: string;
  searchPlaceholder: string;
  statusFilter: string;
  statusOptions: Array<[string, string]>;
}) {
  return (
    <div className="principal-toolbar">
      <label>
        {searchLabel}
        <input placeholder={searchPlaceholder} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </label>
      <label>
        Filter
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
          {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}

function PrincipalRemoteState({
  children,
  emptyDetail,
  emptyTitle,
  error,
  loading,
  onRetry,
  ready,
  resultCount,
}: {
  children: ReactNode;
  emptyDetail: string;
  emptyTitle: string;
  error: string | null;
  loading: boolean;
  onRetry: () => Promise<void>;
  ready: boolean;
  resultCount: number;
}) {
  if (loading) return <PrincipalSkeleton />;
  if (error) return <PanelState action={<button onClick={() => void onRetry()} type="button">Retry</button>} detail={error} title="Unable to load data" tone="error" />;
  if (ready && resultCount === 0) return <PanelState detail={emptyDetail} title={emptyTitle} />;
  return <>{children}</>;
}

function PrincipalTable({
  children,
  columns,
  emptyFiltered = false,
  emptyFilteredDetail = 'No records match the current filters.',
}: {
  children: ReactNode;
  columns: string[];
  emptyFiltered?: boolean;
  emptyFilteredDetail?: string;
}) {
  if (emptyFiltered) {
    return <PanelState detail={emptyFilteredDetail} title="No matching records" />;
  }
  return (
    <div className="principal-table-shell">
      <table className="principal-table">
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function PrincipalPagination({ onPageChange, page, total }: { onPageChange: (page: number) => void; page: number; total: number }) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  return (
    <div className="principal-pagination">
      <span>Page {currentPage + 1} of {pageCount} - {total} records</span>
      <div>
        <button className="secondary" disabled={currentPage === 0} onClick={() => onPageChange(Math.max(0, currentPage - 1))} type="button">Previous</button>
        <button className="secondary" disabled={currentPage >= pageCount - 1} onClick={() => onPageChange(Math.min(pageCount - 1, currentPage + 1))} type="button">Next</button>
      </div>
    </div>
  );
}

function PrincipalCardHeading({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="principal-card-heading">
      <div>
        <h3>{title}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function PrincipalSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`principal-skeleton ${compact ? 'compact' : ''}`} aria-label="Loading Principal data">
      <span />
      <span />
      <span />
    </div>
  );
}

function PanelState({
  action,
  compact = false,
  detail,
  title,
  tone = 'default',
}: {
  action?: ReactNode;
  compact?: boolean;
  detail: string;
  title: string;
  tone?: 'default' | 'error';
}) {
  return (
    <div className={`principal-empty ${compact ? 'compact' : ''} ${tone === 'error' ? 'error' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <strong>{title}</strong>
      <span>{detail}</span>
      {action}
    </div>
  );
}

function PrincipalDrawer({ children, eyebrow, onClose, title }: { children: ReactNode; eyebrow: string; onClose: () => void; title: string }) {
  return (
    <div className="principal-drawer" role="presentation">
      <button aria-label="Close detail drawer" className="principal-drawer-backdrop" onClick={onClose} type="button" />
      <aside aria-labelledby="principal-drawer-title" aria-modal="true" className="principal-drawer-panel" role="dialog">
        <header className="principal-drawer-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h3 id="principal-drawer-title">{title}</h3>
          </div>
          <button className="secondary" onClick={onClose} type="button">Close</button>
        </header>
        <div className="principal-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

function PrincipalConfirmDialog({ busy, config, onCancel }: { busy: boolean; config: ConfirmConfig; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const reasonError = config.requireReason && !reason.trim();
  return (
    <div className="school-admin-confirm principal-confirm" role="presentation">
      <button aria-label="Close confirmation" className="school-admin-confirm-scrim" disabled={busy} onClick={onCancel} type="button" />
      <section aria-labelledby="principal-confirm-title" aria-modal="true" className={`school-admin-confirm-panel ${config.tone === 'danger' ? 'danger' : ''}`} role="dialog">
        <div>
          <p className="eyebrow">Confirm Principal action</p>
          <h3 id="principal-confirm-title">{config.title}</h3>
          <span>{config.detail}</span>
        </div>
        {config.reasonLabel ? (
          <PrincipalField error={reasonError ? 'Reason is required.' : undefined} label={config.reasonLabel} required={config.requireReason}>
            <textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} />
          </PrincipalField>
        ) : null}
        <div className="school-admin-confirm-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy || Boolean(reasonError)} onClick={() => void config.onConfirm(reason)} type="button">{busy ? 'Working...' : config.confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function PrincipalField({ children, error, label, required = false }: { children: ReactNode; error?: string; label: string; required?: boolean }) {
  return (
    <label className="principal-field">
      <span>{label}{required ? <em aria-hidden="true">*</em> : null}</span>
      {children}
      {error ? <small role="alert">{error}</small> : null}
    </label>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="principal-detail-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MetricCard({ detail, label, value }: { detail: string; label: string; value: ReactNode }) {
  return (
    <article className="principal-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`principal-status status-${statusClass(value)}`}>{humanize(value)}</span>;
}

function BacklogNote({ detail }: { detail: string }) {
  return (
    <section className="principal-note">
      <strong>Guardrail note</strong>
      <span>{detail}</span>
    </section>
  );
}

function paginate<T>(items: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  return items.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
}

function useDebouncedValue(value: string, delay = 180) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDebounced(value), delay);
    return () => globalThis.clearTimeout(timer);
  }, [delay, value]);
  return debounced;
}

function textMatches(value: unknown, query: string) {
  if (!query.trim()) return true;
  return JSON.stringify(value).toLowerCase().includes(query.trim().toLowerCase());
}

function attendanceReviewStatus(session: PrincipalAttendanceSession) {
  return session.absentCount > 0 || session.lateCount > 0 ? 'NEEDS_REVIEW' : 'HEALTHY';
}

function resultReviewStatus(exam: PrincipalExam) {
  if (exam.status === 'PUBLISHED') return 'PUBLISHED';
  if (exam.results.length > 0) return 'NEEDS_REVIEW';
  return 'DRAFT';
}

function labelForReport(reportType: ReportType) {
  if (reportType === 'STUDENT_DIRECTORY') return 'Student directory';
  if (reportType === 'FEE_DEMANDS') return 'Fee demands';
  return reportType;
}

function maskEmail(value: string) {
  const [name, domain] = value.split('@');
  if (!name || !domain) return value;
  return `${name.slice(0, 2)}***@${domain}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
