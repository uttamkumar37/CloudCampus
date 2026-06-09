import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import type { DashboardSummary } from '../../portal/api/dashboardApi';
import {
  acceptTeacherAiRecommendation,
  createTeacherAttendanceSession,
  createTeacherHomework,
  dismissTeacherAiRecommendation,
  executeTeacherAiRecommendation,
  getTeacherAiEntitlement,
  getTeacherAiRecommendation,
  getTeacherAttendanceSession,
  getTeacherDashboardSummary,
  getTeacherExam,
  getTeacherHomework,
  listTeacherAiRecommendations,
  listTeacherAssignments,
  listTeacherAttendance,
  listTeacherExamRoster,
  listTeacherExams,
  listTeacherHomework,
  listTeacherNotices,
  listTeacherTimetable,
  recordTeacherExamMarks,
  rejectTeacherAiRecommendation,
  type AiEntitlement,
  type AiRecommendation,
  type PageResponse,
  type TeacherAssignment,
  type TeacherAttendanceSession,
  type TeacherAttendanceStatus,
  type TeacherExam,
  type TeacherExamRosterStudent,
  type TeacherHomework,
  type TeacherNotice,
  type TeacherTimetableEntry,
} from '../api/teacherPortalApi';

type TeacherPortalPageProps = {
  onNavigate: (navId: string) => void;
  section: string;
};

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  status: 'loading' | 'ready' | 'error';
};

type ConfirmConfig = {
  confirmLabel: string;
  detail: string;
  onConfirm: (reason?: string) => Promise<void>;
  reasonLabel?: string;
  requireReason?: boolean;
  title: string;
  tone?: 'default' | 'danger';
};

const PAGE_SIZE = 8;
const TODAY = new Date().toISOString().slice(0, 10);
const ATTENDANCE_STATUSES: TeacherAttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export function TeacherPortalPage({ onNavigate, section }: TeacherPortalPageProps) {
  if (section === 'dashboard') return <TeacherDashboardPage onNavigate={onNavigate} />;
  if (section === 'classes') return <TeacherClassesPage onNavigate={onNavigate} />;
  if (section === 'attendance') return <TeacherAttendancePage />;
  if (section === 'homework') return <TeacherHomeworkPage />;
  if (section === 'exams') return <TeacherExamsPage />;
  if (section === 'marks') return <TeacherMarksPage />;
  if (section === 'notices') return <TeacherNoticesPage />;
  if (section === 'timetable') return <TeacherTimetablePage />;
  if (section === 'ai-suggestions') return <TeacherAiSuggestionsPage />;
  return (
    <TeacherPageFrame
      detail="Only Dashboard, My Classes, Attendance, Homework, Exams, Marks, Notices, Timetable, and AI Suggestions are available for Teacher."
      eyebrow="Teacher"
      title="Unsupported module"
    >
      <TeacherEmptyState detail="This module is not enabled for the Teacher role." title="Nothing to open here" />
    </TeacherPageFrame>
  );
}

function TeacherDashboardPage({ onNavigate }: { onNavigate: (navId: string) => void }) {
  const { accessToken, currentUser } = useAuthState();
  const [state, setState] = useState<AsyncState<{ assignments: TeacherAssignment[]; summary: DashboardSummary }>>({
    data: null,
    error: null,
    status: 'loading',
  });

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      const [summary, assignments] = await Promise.all([
        getTeacherDashboardSummary(accessToken),
        listTeacherAssignments(accessToken),
      ]);
      setState({ data: { assignments, summary }, error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Teacher overview could not be loaded.'), status: 'error' });
    }
  }

  const assignments = state.data?.assignments ?? [];
  const metrics = state.data?.summary.metrics ?? [];
  const alerts = state.data?.summary.alerts ?? [];
  const activity = state.data?.summary.activity ?? [];

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail={`${currentUser?.activeSchool?.name ?? 'Active school'} classes, attendance, homework, marks, timetable, and teaching suggestions.`}
      eyebrow="Daily teaching workspace"
      title="Teacher Overview"
    >
      {state.status === 'loading' ? <TeacherSkeleton /> : null}
      {state.status === 'error' ? <TeacherEmptyState action={<button onClick={() => void load()} type="button">Retry</button>} detail={state.error ?? 'Teacher overview unavailable.'} title="Dashboard unavailable" tone="error" /> : null}
      {state.status === 'ready' ? (
        <>
          <div className="teacher-metrics">
            {metrics.length > 0 ? metrics.map((metric) => (
              <article className="teacher-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.detail ?? 'Assigned teaching metric'}</em>
              </article>
            )) : (
              <article className="teacher-metric">
                <span>Teaching workspace</span>
                <strong>Ready</strong>
                <em>Classroom metrics will appear when the dashboard API returns activity.</em>
              </article>
            )}
          </div>

          <div className="teacher-dashboard-grid">
            <section className="teacher-card">
              <TeacherCardHeading detail="Classes and subjects assigned to your active school context." title="My classes today" />
              {assignments.length > 0 ? (
                <div className="teacher-record-list">
                  {assignments.slice(0, 5).map((assignment) => (
                    <article key={assignment.id}>
                      <strong>{assignment.className}</strong>
                      <span>{assignment.subjectName} ({assignment.subjectCode})</span>
                    </article>
                  ))}
                </div>
              ) : (
                <TeacherEmptyState compact detail="Ask the School Admin to assign classes before Teacher workflows become available." title="No assigned classes yet" />
              )}
            </section>

            <section className="teacher-card">
              <TeacherCardHeading detail="One-click paths for the most common daily teaching jobs." title="Quick actions" />
              <div className="teacher-action-list">
                {[
                  ['attendance', 'Mark attendance', 'Take attendance for an assigned class subject.'],
                  ['homework', 'Create homework', 'Publish a homework task to a class.'],
                  ['marks', 'Enter marks', 'Open roster-based marks entry.'],
                  ['ai-suggestions', 'AI suggestions', 'Review teaching recommendations.'],
                ].map(([id, title, detail]) => (
                  <button key={id} onClick={() => onNavigate(id)} type="button">
                    <strong>{title}</strong>
                    <span>{detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="teacher-card wide">
              <TeacherCardHeading detail="Alerts and recent activity returned by the teacher dashboard API." title="Needs attention" />
              {alerts.length > 0 || activity.length > 0 ? (
                <div className="teacher-record-list">
                  {[...alerts.map((item) => ({ ...item, occurredAt: '' })), ...activity].slice(0, 8).map((item) => (
                    <article key={`${item.title}-${item.occurredAt ?? ''}`}>
                      <strong>{item.title}</strong>
                      <span>{item.detail ?? 'Review this teaching item.'}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <TeacherEmptyState compact detail="No pending teaching alerts were returned for this school." title="Nothing pending" />
              )}
            </section>
          </div>
        </>
      ) : null}
    </TeacherPageFrame>
  );
}

function TeacherClassesPage({ onNavigate }: { onNavigate: (navId: string) => void }) {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<TeacherAssignment[]>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listTeacherAssignments(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Assigned classes could not be loaded.'), status: 'error' });
    }
  }

  const assignments = state.data ?? [];
  const filtered = useMemo(() => assignments.filter((assignment) => textMatches(assignment, debouncedQuery)), [assignments, debouncedQuery]);
  const pageItems = pageRows(filtered, page);

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Your class, section, and subject choices are always resolved from assignment scope returned by the backend."
      eyebrow="Classroom scope"
      title="My Classes"
    >
      <TeacherToolbar
        query={query}
        searchLabel="Search classes"
        searchPlaceholder="Search by class, subject, code, or status"
        statusFilter="all"
        statusOptions={[['all', 'All assignments']]}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onStatusChange={() => undefined}
      />
      <TeacherRemoteState emptyDetail="Ask your School Admin to assign a class and subject." emptyTitle="No assigned classes yet" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={assignments.length}>
        <div className="teacher-class-grid">
          {pageItems.map((assignment) => (
            <article className="teacher-class-card" key={assignment.id}>
              <div>
                <p className="eyebrow">{assignment.active ? 'Active assignment' : 'Inactive assignment'}</p>
                <h3>{assignment.className}</h3>
                <span>{assignment.subjectName} ({assignment.subjectCode})</span>
              </div>
              <dl>
                <div><dt>Role</dt><dd>Subject teacher</dd></div>
                <div><dt>Students</dt><dd>Roster appears in Attendance or Marks when an implemented endpoint returns it.</dd></div>
                <div><dt>Scope</dt><dd>Active school assignment</dd></div>
              </dl>
              <div className="teacher-actions">
                <button onClick={() => onNavigate('attendance')} type="button">Mark attendance</button>
                <button className="secondary" onClick={() => onNavigate('homework')} type="button">Create homework</button>
                <button className="secondary" onClick={() => onNavigate('exams')} type="button">View exams</button>
                <button className="secondary" onClick={() => onNavigate('marks')} type="button">Enter marks</button>
              </div>
            </article>
          ))}
        </div>
        <TeacherPagination page={page} total={filtered.length} onPageChange={setPage} />
      </TeacherRemoteState>
    </TeacherPageFrame>
  );
}

function TeacherAttendancePage() {
  const { accessToken } = useAuthState();
  const [assignmentsState, setAssignmentsState] = useState<AsyncState<TeacherAssignment[]>>({ data: null, error: null, status: 'loading' });
  const [sessionsState, setSessionsState] = useState<AsyncState<TeacherAttendanceSession[]>>({ data: null, error: null, status: 'loading' });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selected, setSelected] = useState<TeacherAttendanceSession | null>(null);
  const [drawer, setDrawer] = useState<'take' | null>(null);
  const [draftDate, setDraftDate] = useState(TODAY);
  const [draftRecords, setDraftRecords] = useState<Record<string, { remark: string; status: TeacherAttendanceStatus }>>({});
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadAssignments();
  }, [accessToken]);

  async function loadAssignments() {
    if (!accessToken) {
      setAssignmentsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      setSessionsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setAssignmentsState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      const assignments = await listTeacherAssignments(accessToken);
      setAssignmentsState({ data: assignments, error: null, status: 'ready' });
      setSelectedAssignmentId((current) => current || assignments[0]?.id || '');
    } catch (error) {
      setAssignmentsState({ data: null, error: errorMessage(error, 'Teacher assignments could not be loaded.'), status: 'error' });
    }
  }

  const assignments = assignmentsState.data ?? [];
  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? assignments[0] ?? null;

  useEffect(() => {
    if (!selectedAssignment || !accessToken) {
      if (assignmentsState.status === 'ready') {
        setSessionsState({ data: [], error: null, status: 'ready' });
      }
      return;
    }
    void loadSessions(selectedAssignment);
  }, [accessToken, assignmentsState.status, selectedAssignment?.id]);

  async function loadSessions(assignment = selectedAssignment) {
    if (!accessToken || !assignment) return;
    setSessionsState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setSessionsState({
        data: await listTeacherAttendance(assignment.classLevelId, assignment.subjectId, accessToken),
        error: null,
        status: 'ready',
      });
    } catch (error) {
      setSessionsState({ data: null, error: errorMessage(error, 'Attendance sessions could not be loaded.'), status: 'error' });
    }
  }

  const sessions = sessionsState.data ?? [];
  const sourceSession = sessions[0] ?? null;
  const counts = attendanceDraftCounts(draftRecords);

  async function openDetail(session: TeacherAttendanceSession) {
    setSelected(session);
    if (!accessToken) return;
    try {
      setSelected(await getTeacherAttendanceSession(session.id, accessToken));
    } catch {
      setSelected(session);
    }
  }

  function openTakeAttendance() {
    if (!sourceSession || sourceSession.records.length === 0) {
      setMessage('Attendance needs an existing session roster. A dedicated Teacher roster endpoint is a backend backlog item.');
      return;
    }
    setDraftDate(TODAY);
    setDraftRecords(Object.fromEntries(sourceSession.records.map((record) => [record.studentId, { remark: '', status: 'PRESENT' as TeacherAttendanceStatus }])));
    setDrawer('take');
  }

  function submitAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAssignment || !sourceSession) return;
    const records = sourceSession.records.map((record) => ({
      remark: draftRecords[record.studentId]?.remark ?? '',
      status: draftRecords[record.studentId]?.status ?? 'PRESENT',
      studentId: record.studentId,
    }));
    if (records.some((record) => !record.status)) {
      setMessage('Mark every student before submitting attendance.');
      return;
    }
    setConfirm({
      confirmLabel: 'Submit attendance',
      detail: 'This submits a new attendance session. Corrections are not available to Teacher in the current backend.',
      onConfirm: async () => {
        if (!accessToken) return;
        setBusy(true);
        setMessage('');
        try {
          await createTeacherAttendanceSession({
            attendanceDate: draftDate,
            classLevelId: selectedAssignment.classLevelId,
            records,
            sectionId: sourceSession.sectionId,
            subjectId: selectedAssignment.subjectId,
          }, accessToken);
          setDrawer(null);
          setConfirm(null);
          setMessage('Attendance submitted.');
          await loadSessions(selectedAssignment);
        } catch (error) {
          setMessage(errorMessage(error, 'Attendance could not be submitted.'));
        } finally {
          setBusy(false);
        }
      },
      title: 'Submit attendance?',
      tone: 'danger',
    });
  }

  return (
    <TeacherPageFrame
      action={<><button className="secondary" disabled={sessionsState.status === 'loading'} onClick={() => void loadSessions()} type="button">Refresh</button><button disabled={!selectedAssignment} onClick={openTakeAttendance} type="button">Take attendance</button></>}
      detail="Take attendance only for classes and subjects assigned to you in the active school."
      eyebrow="Attendance"
      title="Attendance"
    >
      {message ? <p className="teacher-toast" role="status">{message}</p> : null}
      <AssignmentPicker assignments={assignments} selectedId={selectedAssignment?.id ?? ''} onChange={setSelectedAssignmentId} />
      <TeacherRemoteState emptyDetail="Attendance sessions will appear after attendance is submitted for this assigned class." emptyTitle="No attendance sessions" error={assignmentsState.error ?? sessionsState.error} loading={assignmentsState.status === 'loading' || sessionsState.status === 'loading'} onRetry={loadAssignments} ready={assignmentsState.status === 'ready' && sessionsState.status === 'ready'} resultCount={assignments.length === 0 ? 0 : sessions.length}>
        <div className="teacher-metrics compact">
          <TeacherMetric label="Sessions" value={sessions.length} detail="Loaded for selected assignment" />
          <TeacherMetric label="Latest present" value={sourceSession?.presentCount ?? 0} detail={sourceSession ? formatDate(sourceSession.attendanceDate) : 'No session yet'} />
          <TeacherMetric label="Latest absent" value={sourceSession?.absentCount ?? 0} detail="Includes late/excused separately" />
        </div>
        <TeacherTable columns={['Session', 'Counts', 'Submitted by', 'Created', 'Actions']}>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td><strong>{session.classLevelName}</strong><span>{session.subjectName} - {formatDate(session.attendanceDate)}</span></td>
              <td>{session.presentCount} present / {session.absentCount} absent / {session.lateCount} late</td>
              <td>{session.submittedByRole}</td>
              <td>{formatDateTime(session.createdAt)}</td>
              <td><button onClick={() => void openDetail(session)} type="button">Review</button></td>
            </tr>
          ))}
        </TeacherTable>
      </TeacherRemoteState>

      {selected ? (
        <TeacherDrawer eyebrow="Attendance detail" title={`${selected.classLevelName} attendance`} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Date', formatDate(selected.attendanceDate)],
            ['Subject', selected.subjectName ?? 'Class attendance'],
            ['Section', selected.sectionName ?? 'All sections'],
            ['Present', String(selected.presentCount)],
            ['Absent', String(selected.absentCount)],
            ['Late', String(selected.lateCount)],
            ['Excused', String(selected.excusedCount)],
          ]} />
          <TeacherTable columns={['Student', 'Admission', 'Status', 'Remark']}>
            {selected.records.map((record) => (
              <tr key={record.id}>
                <td>{record.studentName}</td>
                <td>{record.admissionNumber}</td>
                <td><StatusBadge value={record.status} /></td>
                <td>{record.remark ?? 'No remark'}</td>
              </tr>
            ))}
          </TeacherTable>
          <BacklogNote detail="Submitted attendance correction is intentionally hidden for Teacher because no Teacher correction endpoint is implemented." />
        </TeacherDrawer>
      ) : null}

      {drawer === 'take' && sourceSession ? (
        <TeacherDrawer eyebrow="Take attendance" title={`${selectedAssignment?.className ?? 'Class'} attendance`} onClose={() => setDrawer(null)}>
          <form className="teacher-form" noValidate onSubmit={submitAttendance}>
            <div className="teacher-drawer-scroll">
              <TeacherField label="Attendance date" required>
                <input max={TODAY} type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} required />
              </TeacherField>
              <div className="teacher-metrics compact">
                <TeacherMetric label="Present" value={counts.PRESENT} detail="Marked present" />
                <TeacherMetric label="Absent" value={counts.ABSENT} detail="Marked absent" />
                <TeacherMetric label="Late" value={counts.LATE} detail="Marked late" />
                <TeacherMetric label="Excused" value={counts.EXCUSED} detail="Marked excused" />
              </div>
              <div className="teacher-attendance-list">
                {sourceSession.records.map((record) => (
                  <article key={record.studentId}>
                    <div>
                      <strong>{record.studentName}</strong>
                      <span>{record.admissionNumber}</span>
                    </div>
                    <select
                      aria-label={`Attendance status for ${record.studentName}`}
                      value={draftRecords[record.studentId]?.status ?? 'PRESENT'}
                      onChange={(event) => setDraftRecords((current) => ({
                        ...current,
                        [record.studentId]: { ...(current[record.studentId] ?? { remark: '' }), status: event.target.value as TeacherAttendanceStatus },
                      }))}
                    >
                      {ATTENDANCE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <input
                      aria-label={`Remark for ${record.studentName}`}
                      placeholder="Optional remark"
                      value={draftRecords[record.studentId]?.remark ?? ''}
                      onChange={(event) => setDraftRecords((current) => ({
                        ...current,
                        [record.studentId]: { ...(current[record.studentId] ?? { status: 'PRESENT' }), remark: event.target.value },
                      }))}
                    />
                  </article>
                ))}
              </div>
            </div>
            <div className="teacher-drawer-footer">
              <button className="secondary" disabled={busy} onClick={() => setDrawer(null)} type="button">Cancel</button>
              <button disabled={busy} type="submit">{busy ? 'Submitting...' : 'Submit attendance'}</button>
            </div>
          </form>
        </TeacherDrawer>
      ) : null}
      {confirm ? <TeacherConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </TeacherPageFrame>
  );
}

function TeacherHomeworkPage() {
  const { accessToken } = useAuthState();
  const [assignmentsState, setAssignmentsState] = useState<AsyncState<TeacherAssignment[]>>({ data: null, error: null, status: 'loading' });
  const [homeworkState, setHomeworkState] = useState<AsyncState<TeacherHomework[]>>({ data: null, error: null, status: 'loading' });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<'create' | null>(null);
  const [selected, setSelected] = useState<TeacherHomework | null>(null);
  const [form, setForm] = useState({ dueDate: TODAY, instructions: '', title: '' });
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void loadAssignments();
  }, [accessToken]);

  async function loadAssignments() {
    if (!accessToken) {
      setAssignmentsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      setHomeworkState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setAssignmentsState({ data: null, error: null, status: 'loading' });
    try {
      const assignments = await listTeacherAssignments(accessToken);
      setAssignmentsState({ data: assignments, error: null, status: 'ready' });
      setSelectedAssignmentId((current) => current || assignments[0]?.id || '');
    } catch (error) {
      setAssignmentsState({ data: null, error: errorMessage(error, 'Teacher assignments could not be loaded.'), status: 'error' });
    }
  }

  const assignments = assignmentsState.data ?? [];
  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? assignments[0] ?? null;

  useEffect(() => {
    if (!selectedAssignment || !accessToken) {
      if (assignmentsState.status === 'ready') setHomeworkState({ data: [], error: null, status: 'ready' });
      return;
    }
    void loadHomework(selectedAssignment);
  }, [accessToken, assignmentsState.status, selectedAssignment?.id]);

  async function loadHomework(assignment = selectedAssignment) {
    if (!accessToken || !assignment) return;
    setHomeworkState({ data: null, error: null, status: 'loading' });
    try {
      setHomeworkState({ data: await listTeacherHomework(assignment.classLevelId, assignment.subjectId, accessToken), error: null, status: 'ready' });
    } catch (error) {
      setHomeworkState({ data: null, error: errorMessage(error, 'Homework could not be loaded.'), status: 'error' });
    }
  }

  const homework = homeworkState.data ?? [];
  const filtered = homework.filter((item) => (
    textMatches(item, debouncedQuery)
    && (statusFilter === 'all' || item.status.toLowerCase() === statusFilter)
  ));
  const pageItems = pageRows(filtered, page);

  async function openDetail(item: TeacherHomework) {
    setSelected(item);
    if (!accessToken) return;
    try {
      setSelected(await getTeacherHomework(item.id, accessToken));
    } catch {
      setSelected(item);
    }
  }

  async function submitHomework(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAssignment || !accessToken) return;
    const nextError = validateHomework(form);
    if (nextError) {
      setFormError(nextError);
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      await createTeacherHomework({
        classLevelId: selectedAssignment.classLevelId,
        dueDate: form.dueDate,
        instructions: form.instructions.trim(),
        sectionId: null,
        subjectId: selectedAssignment.subjectId,
        title: form.title.trim(),
      }, accessToken);
      setDrawer(null);
      setForm({ dueDate: TODAY, instructions: '', title: '' });
      setMessage('Homework published.');
      await loadHomework(selectedAssignment);
    } catch (error) {
      setFormError(errorMessage(error, 'Homework could not be published.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TeacherPageFrame
      action={<><button className="secondary" disabled={homeworkState.status === 'loading'} onClick={() => void loadHomework()} type="button">Refresh</button><button disabled={!selectedAssignment} onClick={() => setDrawer('create')} type="button">Create homework</button></>}
      detail="Create and review homework only for assigned class subjects. Edit, delete, attachments, grading, and draft status are hidden until supported."
      eyebrow="Homework"
      title="Homework"
    >
      {message ? <p className="teacher-toast" role="status">{message}</p> : null}
      <AssignmentPicker assignments={assignments} selectedId={selectedAssignment?.id ?? ''} onChange={setSelectedAssignmentId} />
      <TeacherToolbar
        query={query}
        searchLabel="Search homework"
        searchPlaceholder="Search title, instructions, class, subject, or due date"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['published', 'Published']]}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
      />
      <TeacherRemoteState emptyDetail="Create homework for the selected assignment when class work is ready." emptyTitle="No homework yet" error={assignmentsState.error ?? homeworkState.error} loading={assignmentsState.status === 'loading' || homeworkState.status === 'loading'} onRetry={loadAssignments} ready={assignmentsState.status === 'ready' && homeworkState.status === 'ready'} resultCount={assignments.length === 0 ? 0 : homework.length}>
        <TeacherTable columns={['Homework', 'Class', 'Due', 'Status', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.title}</strong><span>{truncate(item.instructions, 90)}</span></td>
              <td>{item.className} - {item.subjectName}</td>
              <td>{formatDate(item.dueDate)}</td>
              <td><StatusBadge value={item.status} /></td>
              <td><button onClick={() => void openDetail(item)} type="button">Review</button></td>
            </tr>
          ))}
        </TeacherTable>
        <TeacherPagination page={page} total={filtered.length} onPageChange={setPage} />
      </TeacherRemoteState>

      {drawer === 'create' && selectedAssignment ? (
        <TeacherDrawer eyebrow="Publish homework" title="Create homework" onClose={() => setDrawer(null)}>
          <form className="teacher-form" noValidate onSubmit={submitHomework}>
            <div className="teacher-drawer-scroll">
              {formError ? <p className="form-error" role="alert">{formError}</p> : null}
              <section className="teacher-form-section">
                <h3>Class scope</h3>
                <TeacherField label="Assigned class" required>
                  <input readOnly value={`${selectedAssignment.className} - ${selectedAssignment.subjectName}`} />
                </TeacherField>
              </section>
              <section className="teacher-form-section">
                <h3>Homework details</h3>
                <TeacherField label="Title" required>
                  <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Practice worksheet on linear equations" maxLength={160} />
                </TeacherField>
                <TeacherField label="Instructions" required>
                  <textarea rows={6} value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} placeholder="Describe exactly what students should complete before the due date." maxLength={2000} />
                </TeacherField>
                <TeacherField label="Due date" required>
                  <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
                </TeacherField>
              </section>
              <BacklogNote detail="Attachments, draft save, edit/delete, and submission grading are hidden because the current Teacher homework backend does not expose those commands." />
            </div>
            <div className="teacher-drawer-footer">
              <button className="secondary" disabled={busy} onClick={() => setDrawer(null)} type="button">Cancel</button>
              <button disabled={busy} type="submit">{busy ? 'Publishing...' : 'Publish homework'}</button>
            </div>
          </form>
        </TeacherDrawer>
      ) : null}

      {selected ? (
        <TeacherDrawer eyebrow="Homework detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Class', selected.className],
            ['Subject', selected.subjectName],
            ['Due date', formatDate(selected.dueDate)],
            ['Status', selected.status],
            ['Created', formatDateTime(selected.createdAt)],
            ['Submissions', String(selected.submissions?.length ?? 0)],
          ]} />
          <section className="teacher-note">
            <strong>Instructions</strong>
            <span>{selected.instructions}</span>
          </section>
        </TeacherDrawer>
      ) : null}
    </TeacherPageFrame>
  );
}

function TeacherExamsPage() {
  const { accessToken } = useAuthState();
  const [assignmentsState, setAssignmentsState] = useState<AsyncState<TeacherAssignment[]>>({ data: null, error: null, status: 'loading' });
  const [examsState, setExamsState] = useState<AsyncState<TeacherExam[]>>({ data: null, error: null, status: 'loading' });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selected, setSelected] = useState<TeacherExam | null>(null);
  const [roster, setRoster] = useState<TeacherExamRosterStudent[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void loadAssignments();
  }, [accessToken]);

  async function loadAssignments() {
    if (!accessToken) {
      setAssignmentsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      setExamsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setAssignmentsState({ data: null, error: null, status: 'loading' });
    try {
      const assignments = await listTeacherAssignments(accessToken);
      setAssignmentsState({ data: assignments, error: null, status: 'ready' });
      setSelectedAssignmentId((current) => current || assignments[0]?.id || '');
    } catch (error) {
      setAssignmentsState({ data: null, error: errorMessage(error, 'Teacher assignments could not be loaded.'), status: 'error' });
    }
  }

  const assignments = assignmentsState.data ?? [];
  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? assignments[0] ?? null;

  useEffect(() => {
    if (!selectedAssignment || !accessToken) {
      if (assignmentsState.status === 'ready') setExamsState({ data: [], error: null, status: 'ready' });
      return;
    }
    void loadExams(selectedAssignment);
  }, [accessToken, assignmentsState.status, selectedAssignment?.id]);

  async function loadExams(assignment = selectedAssignment) {
    if (!accessToken || !assignment) return;
    setExamsState({ data: null, error: null, status: 'loading' });
    try {
      setExamsState({ data: await listTeacherExams(assignment.classLevelId, assignment.subjectId, accessToken), error: null, status: 'ready' });
    } catch (error) {
      setExamsState({ data: null, error: errorMessage(error, 'Exams could not be loaded.'), status: 'error' });
    }
  }

  const exams = examsState.data ?? [];
  const filtered = exams.filter((exam) => textMatches(exam, debouncedQuery) && (statusFilter === 'all' || exam.status.toLowerCase() === statusFilter));
  const pageItems = pageRows(filtered, page);

  async function openDetail(exam: TeacherExam) {
    setSelected(exam);
    setRoster([]);
    if (!accessToken) return;
    try {
      const [detail, students] = await Promise.all([
        getTeacherExam(exam.id, accessToken),
        listTeacherExamRoster(exam.id, accessToken),
      ]);
      setSelected(detail);
      setRoster(students);
    } catch {
      setSelected(exam);
    }
  }

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={examsState.status === 'loading'} onClick={() => void loadExams()} type="button">Refresh</button>}
      detail="Review assigned exams and roster readiness. Creation, approval, and publishing remain hidden for Teacher."
      eyebrow="Exams"
      title="Exams"
    >
      <AssignmentPicker assignments={assignments} selectedId={selectedAssignment?.id ?? ''} onChange={setSelectedAssignmentId} />
      <TeacherToolbar
        query={query}
        searchLabel="Search exams"
        searchPlaceholder="Search by exam, class, subject, date, or status"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['draft', 'Draft'], ['published', 'Published']]}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
      />
      <TeacherRemoteState emptyDetail="Assigned exams will appear after School Admin creates them for your class subject." emptyTitle="No assigned exams" error={assignmentsState.error ?? examsState.error} loading={assignmentsState.status === 'loading' || examsState.status === 'loading'} onRetry={loadAssignments} ready={assignmentsState.status === 'ready' && examsState.status === 'ready'} resultCount={assignments.length === 0 ? 0 : exams.length}>
        <TeacherTable columns={['Exam', 'Class', 'Date', 'Marks', 'Status', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((exam) => (
            <tr key={exam.id}>
              <td><strong>{exam.title}</strong><span>{exam.subjectName}</span></td>
              <td>{exam.className}{exam.sectionName ? ` - ${exam.sectionName}` : ''}</td>
              <td>{formatDate(exam.examDate)}</td>
              <td>{exam.results.length} entered / {exam.maxMarks} max</td>
              <td><StatusBadge value={marksStatus(exam)} /></td>
              <td><button onClick={() => void openDetail(exam)} type="button">Review</button></td>
            </tr>
          ))}
        </TeacherTable>
        <TeacherPagination page={page} total={filtered.length} onPageChange={setPage} />
      </TeacherRemoteState>

      {selected ? (
        <TeacherDrawer eyebrow="Exam detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Class', `${selected.className}${selected.sectionName ? ` - ${selected.sectionName}` : ''}`],
            ['Subject', selected.subjectName],
            ['Exam date', formatDate(selected.examDate)],
            ['Max marks', String(selected.maxMarks)],
            ['Status', selected.status],
            ['Marks entered', String(selected.results.length)],
          ]} />
          <TeacherTable columns={['Student', 'Admission', 'Marks', 'Recorded']}>
            {roster.map((student) => (
              <tr key={student.studentId}>
                <td>{student.fullName}</td>
                <td>{student.admissionNumber}</td>
                <td>{student.marksObtained ?? 'Pending'}</td>
                <td>{student.recordedAt ? formatDateTime(student.recordedAt) : 'Not recorded'}</td>
              </tr>
            ))}
          </TeacherTable>
          <BacklogNote detail="Exam creation, result approval, and publication are not surfaced for Teacher. Use the Marks screen for implemented roster-based marks entry." />
        </TeacherDrawer>
      ) : null}
    </TeacherPageFrame>
  );
}

function TeacherMarksPage() {
  const { accessToken } = useAuthState();
  const [assignmentsState, setAssignmentsState] = useState<AsyncState<TeacherAssignment[]>>({ data: null, error: null, status: 'loading' });
  const [examsState, setExamsState] = useState<AsyncState<TeacherExam[]>>({ data: null, error: null, status: 'loading' });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [examId, setExamId] = useState('');
  const [roster, setRoster] = useState<TeacherExamRosterStudent[]>([]);
  const [marksByStudent, setMarksByStudent] = useState<Record<string, string>>({});
  const [initialMarksByStudent, setInitialMarksByStudent] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadAssignments();
  }, [accessToken]);

  async function loadAssignments() {
    if (!accessToken) {
      setAssignmentsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      setExamsState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setAssignmentsState({ data: null, error: null, status: 'loading' });
    try {
      const assignments = await listTeacherAssignments(accessToken);
      setAssignmentsState({ data: assignments, error: null, status: 'ready' });
      setSelectedAssignmentId((current) => current || assignments[0]?.id || '');
    } catch (error) {
      setAssignmentsState({ data: null, error: errorMessage(error, 'Teacher assignments could not be loaded.'), status: 'error' });
    }
  }

  const assignments = assignmentsState.data ?? [];
  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? assignments[0] ?? null;
  const exams = examsState.data ?? [];
  const selectedExam = exams.find((exam) => exam.id === examId) ?? null;
  const changedEntries = roster
    .map((student) => ({
      initialMarks: initialMarksByStudent[student.studentId] ?? '',
      marks: marksByStudent[student.studentId] ?? '',
      student,
    }))
    .filter((entry) => entry.marks !== '' && entry.marks !== entry.initialMarks);

  useEffect(() => {
    if (!selectedAssignment || !accessToken) {
      if (assignmentsState.status === 'ready') setExamsState({ data: [], error: null, status: 'ready' });
      return;
    }
    void loadExams(selectedAssignment);
  }, [accessToken, assignmentsState.status, selectedAssignment?.id]);

  async function loadExams(assignment = selectedAssignment) {
    if (!accessToken || !assignment) return;
    setExamsState({ data: null, error: null, status: 'loading' });
    try {
      const loaded = await listTeacherExams(assignment.classLevelId, assignment.subjectId, accessToken);
      setExamsState({ data: loaded, error: null, status: 'ready' });
      setExamId((current) => loaded.some((exam) => exam.id === current) ? current : loaded[0]?.id ?? '');
    } catch (error) {
      setExamsState({ data: null, error: errorMessage(error, 'Marks queue could not be loaded.'), status: 'error' });
    }
  }

  useEffect(() => {
    if (!examId || !accessToken) {
      setRoster([]);
      setMarksByStudent({});
      setInitialMarksByStudent({});
      return;
    }
    void loadRoster(examId);
  }, [accessToken, examId]);

  async function loadRoster(nextExamId = examId) {
    if (!accessToken || !nextExamId) return;
    setBusy(true);
    try {
      const loaded = await listTeacherExamRoster(nextExamId, accessToken);
      const nextMarks = Object.fromEntries(loaded.map((student) => [student.studentId, student.marksObtained == null ? '' : String(student.marksObtained)]));
      setRoster(loaded);
      setMarksByStudent(nextMarks);
      setInitialMarksByStudent(nextMarks);
      setRowErrors({});
    } catch (error) {
      setMessage(errorMessage(error, 'Exam roster could not be loaded.'));
      setRoster([]);
    } finally {
      setBusy(false);
    }
  }

  function requestMarksSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedExam) return;
    const errors = validateMarks(selectedExam, roster, marksByStudent);
    setRowErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMessage('Fix highlighted marks before submitting.');
      return;
    }
    if (changedEntries.length === 0) {
      setMessage('Enter or change marks before submitting.');
      return;
    }
    setConfirm({
      confirmLabel: 'Submit marks',
      detail: `${changedEntries.length} changed mark ${changedEntries.length === 1 ? 'entry' : 'entries'} will be recorded for ${selectedExam.title}.`,
      onConfirm: submitMarks,
      title: 'Submit marks?',
      tone: 'danger',
    });
  }

  async function submitMarks() {
    if (!selectedExam || !accessToken) return;
    setBusy(true);
    setMessage('');
    try {
      await Promise.all(changedEntries.map((entry) => recordTeacherExamMarks(
        selectedExam.id,
        entry.student.studentId,
        Number(entry.marks),
        accessToken,
      )));
      await loadRoster(selectedExam.id);
      setConfirm(null);
      setMessage(`${changedEntries.length} mark ${changedEntries.length === 1 ? 'entry' : 'entries'} saved.`);
    } catch (error) {
      setMessage(errorMessage(error, 'Marks could not be saved.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={busy} onClick={() => void loadRoster()} type="button">Refresh roster</button>}
      detail="Enter marks only for assigned exams. Approval and publication remain with school leadership workflows."
      eyebrow="Marks"
      title="Marks"
    >
      {message ? <p className="teacher-toast" role="status">{message}</p> : null}
      <AssignmentPicker assignments={assignments} selectedId={selectedAssignment?.id ?? ''} onChange={(value) => {
        setSelectedAssignmentId(value);
        setExamId('');
      }} />
      <TeacherRemoteState emptyDetail="Assigned exams will appear after they are created for this class subject." emptyTitle="No marks queue" error={assignmentsState.error ?? examsState.error} loading={assignmentsState.status === 'loading' || examsState.status === 'loading'} onRetry={loadAssignments} ready={assignmentsState.status === 'ready' && examsState.status === 'ready'} resultCount={assignments.length === 0 ? 0 : exams.length}>
        <div className="teacher-selector-grid">
          <label>
            Exam
            <select value={examId} onChange={(event) => setExamId(event.target.value)}>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.title} - {formatDate(exam.examDate)}</option>
              ))}
            </select>
          </label>
          {selectedExam ? (
            <div className="teacher-context-pill">
              <strong>{selectedExam.className}</strong>
              <span>{selectedExam.subjectName} - Max marks {selectedExam.maxMarks}</span>
            </div>
          ) : null}
        </div>
        {selectedExam && roster.length > 0 ? (
          <form className="teacher-form" noValidate onSubmit={requestMarksSubmit}>
            <TeacherTable columns={['Student', 'Admission', 'Roll', 'Marks', 'Status']}>
              {roster.map((student) => (
                <tr key={student.studentId}>
                  <td><strong>{student.fullName}</strong><span>{student.className}{student.sectionName ? ` - ${student.sectionName}` : ''}</span></td>
                  <td>{student.admissionNumber}</td>
                  <td>{student.rollNumber ?? 'Not set'}</td>
                  <td>
                    <label className="teacher-marks-input">
                      <span className="sr-only">Marks for {student.fullName}</span>
                      <input
                        aria-invalid={Boolean(rowErrors[student.studentId])}
                        aria-label={`Marks for ${student.fullName}`}
                        inputMode="decimal"
                        max={selectedExam.maxMarks}
                        min="0"
                        step="0.01"
                        type="number"
                        value={marksByStudent[student.studentId] ?? ''}
                        onChange={(event) => {
                          setMarksByStudent((current) => ({ ...current, [student.studentId]: event.target.value }));
                          setRowErrors((current) => ({ ...current, [student.studentId]: '' }));
                        }}
                      />
                      {rowErrors[student.studentId] ? <small role="alert">{rowErrors[student.studentId]}</small> : null}
                    </label>
                  </td>
                  <td><StatusBadge value={student.marksObtained == null ? 'PENDING' : 'RECORDED'} /></td>
                </tr>
              ))}
            </TeacherTable>
            <BacklogNote detail="Endpoint-level MFA freshness for high-risk marks submission is a backend guardrail backlog item." />
            <div className="teacher-drawer-footer inline">
              <button className="secondary" disabled={busy} onClick={() => void loadRoster()} type="button">Reset</button>
              <button disabled={busy || changedEntries.length === 0} type="submit">{busy ? 'Saving...' : 'Submit changed marks'}</button>
            </div>
          </form>
        ) : (
          <TeacherEmptyState compact detail="Select an assigned exam with an active roster to enter marks." title="No roster loaded" />
        )}
      </TeacherRemoteState>
      {confirm ? <TeacherConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </TeacherPageFrame>
  );
}

function TeacherNoticesPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<TeacherNotice[]>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<TeacherNotice | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setState({ data: null, error: null, status: 'loading' });
    try {
      setState({ data: await listTeacherNotices(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Notices could not be loaded.'), status: 'error' });
    }
  }

  const notices = state.data ?? [];
  const filtered = notices.filter((notice) => (
    textMatches(notice, debouncedQuery)
    && (statusFilter === 'all' || notice.audience.toLowerCase() === statusFilter)
  ));
  const pageItems = pageRows(filtered, page);

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="School and teacher notices are read-only here. Create/publish controls are hidden because no Teacher notice command endpoint is implemented."
      eyebrow="Notices"
      title="Notices"
    >
      <TeacherToolbar
        query={query}
        searchLabel="Search notices"
        searchPlaceholder="Search title, body, audience, class, or date"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All audiences'], ['teachers', 'Teachers']]}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
      />
      <TeacherRemoteState emptyDetail="Teacher-visible school notices will appear here after publication." emptyTitle="No notices" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={notices.length}>
        <TeacherTable columns={['Notice', 'Audience', 'Scope', 'Published', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((notice) => (
            <tr key={notice.id}>
              <td><strong>{notice.title}</strong><span>{truncate(notice.body, 100)}</span></td>
              <td><StatusBadge value={notice.audience} /></td>
              <td>{notice.className ?? 'School-wide'}</td>
              <td>{notice.publishedAt ? formatDateTime(notice.publishedAt) : formatDateTime(notice.createdAt)}</td>
              <td><button onClick={() => setSelected(notice)} type="button">Read</button></td>
            </tr>
          ))}
        </TeacherTable>
        <TeacherPagination page={page} total={filtered.length} onPageChange={setPage} />
      </TeacherRemoteState>
      {selected ? (
        <TeacherDrawer eyebrow="Notice detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Audience', selected.audience],
            ['Scope', selected.className ?? 'School-wide'],
            ['Status', selected.status],
            ['Published', selected.publishedAt ? formatDateTime(selected.publishedAt) : 'Not published'],
          ]} />
          <section className="teacher-note">
            <strong>Message</strong>
            <span>{selected.body}</span>
          </section>
        </TeacherDrawer>
      ) : null}
    </TeacherPageFrame>
  );
}

function TeacherTimetablePage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<TeacherTimetableEntry[]>>({ data: null, error: null, status: 'loading' });
  const [query, setQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [selected, setSelected] = useState<TeacherTimetableEntry | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setState({ data: null, error: null, status: 'loading' });
    try {
      setState({ data: await listTeacherTimetable(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Timetable could not be loaded.'), status: 'error' });
    }
  }

  const entries = state.data ?? [];
  const filtered = entries.filter((entry) => (
    textMatches(entry, debouncedQuery)
    && (dayFilter === 'all' || entry.weekday.toLowerCase() === dayFilter)
  ));
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toUpperCase();
  const todayEntries = filtered.filter((entry) => entry.weekday === todayName);

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Weekly timetable entries are read-only and scoped to assigned class subjects."
      eyebrow="Timetable"
      title="Timetable"
    >
      <TeacherToolbar
        query={query}
        searchLabel="Search timetable"
        searchPlaceholder="Search class, subject, room title, day, or time"
        statusFilter={dayFilter}
        statusOptions={[['all', 'All days'], ...weekdayOptions()]}
        onQueryChange={setQuery}
        onStatusChange={setDayFilter}
      />
      <TeacherRemoteState emptyDetail="Timetable entries will appear after School Admin schedules assigned classes." emptyTitle="No timetable entries" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={entries.length}>
        <section className="teacher-card">
          <TeacherCardHeading detail="Current-day periods from your assigned timetable." title="Today" />
          {todayEntries.length > 0 ? (
            <div className="teacher-timetable-list">
              {todayEntries.map((entry) => <TimetableCard entry={entry} key={entry.id} onSelect={setSelected} />)}
            </div>
          ) : (
            <TeacherEmptyState compact detail="No assigned periods are scheduled today." title="No classes today" />
          )}
        </section>
        <div className="teacher-week-grid">
          {weekdayOptions().map(([value, label]) => {
            const dayEntries = filtered.filter((entry) => entry.weekday.toLowerCase() === value);
            return (
              <section className="teacher-card" key={value}>
                <TeacherCardHeading detail={`${dayEntries.length} assigned ${dayEntries.length === 1 ? 'period' : 'periods'}`} title={label} />
                <div className="teacher-timetable-list">
                  {dayEntries.map((entry) => <TimetableCard entry={entry} key={entry.id} onSelect={setSelected} />)}
                </div>
              </section>
            );
          })}
        </div>
      </TeacherRemoteState>
      {selected ? (
        <TeacherDrawer eyebrow="Timetable detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Day', titleCase(selected.weekday)],
            ['Time', `${formatTime(selected.startTime)} - ${formatTime(selected.endTime)}`],
            ['Class', selected.classLevelName],
            ['Section', selected.sectionName ?? 'All sections'],
            ['Subject', selected.subjectName ?? 'Class period'],
          ]} />
        </TeacherDrawer>
      ) : null}
    </TeacherPageFrame>
  );
}

function TeacherAiSuggestionsPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<PageResponse<AiRecommendation>>>({ data: null, error: null, status: 'loading' });
  const [entitlement, setEntitlement] = useState<AiEntitlement | null>(null);
  const [selected, setSelected] = useState<AiRecommendation | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Teacher login is required.', status: 'error' });
      return;
    }
    setState({ data: null, error: null, status: 'loading' });
    try {
      const [recommendations, entitlementResponse] = await Promise.all([
        listTeacherAiRecommendations({ page: 0, size: 50 }, accessToken),
        getTeacherAiEntitlement(accessToken).catch(() => null),
      ]);
      setState({ data: recommendations, error: null, status: 'ready' });
      setEntitlement(entitlementResponse);
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'AI suggestions could not be loaded.'), status: 'error' });
    }
  }

  const rows = state.data?.items ?? [];
  const filtered = rows.filter((item) => textMatches(item, debouncedQuery) && (statusFilter === 'all' || item.status.toLowerCase() === statusFilter));
  const pageItems = pageRows(filtered, page);

  async function openDetail(item: AiRecommendation) {
    setSelected(item);
    if (!accessToken) return;
    try {
      setSelected(await getTeacherAiRecommendation(item.recommendationId, accessToken));
    } catch {
      setSelected(item);
    }
  }

  function requestAction(item: AiRecommendation, action: 'accept' | 'dismiss' | 'execute' | 'reject') {
    const copy = {
      accept: ['Accept suggestion?', 'Accept', 'This keeps the recommendation inside your teacher-scoped AI workflow.'],
      dismiss: ['Dismiss suggestion?', 'Dismiss', 'This removes the suggestion from your active review queue.'],
      execute: ['Execute AI suggestion?', 'Execute', 'Only policy-allowed actions can execute. High-risk actions should require human approval.'],
      reject: ['Reject suggestion?', 'Reject', 'Provide a short reason so the AI governance trail remains useful.'],
    }[action];
    setConfirm({
      confirmLabel: copy[1],
      detail: copy[2],
      onConfirm: async (reason) => {
        if (!accessToken) return;
        setBusy(true);
        try {
          const updated = action === 'accept'
            ? await acceptTeacherAiRecommendation(item.recommendationId, accessToken)
            : action === 'dismiss'
              ? await dismissTeacherAiRecommendation(item.recommendationId, accessToken)
              : action === 'reject'
                ? await rejectTeacherAiRecommendation(item.recommendationId, reason ?? '', accessToken)
                : await executeTeacherAiRecommendation(item.recommendationId, accessToken);
          setSelected(updated);
          setConfirm(null);
          setMessage(`AI suggestion ${pastTense(action)}.`);
          await load();
        } catch (error) {
          setMessage(errorMessage(error, 'AI suggestion action failed.'));
        } finally {
          setBusy(false);
        }
      },
      reasonLabel: action === 'reject' ? 'Rejection reason' : undefined,
      requireReason: action === 'reject',
      title: copy[0],
      tone: action === 'execute' || action === 'reject' ? 'danger' : 'default',
    });
  }

  return (
    <TeacherPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Review teaching recommendations that remain inside tenant, school, and assigned-class policy scope."
      eyebrow="Teaching intelligence"
      title="AI Suggestions"
    >
      {message ? <p className="teacher-toast" role="status">{message}</p> : null}
      <div className="teacher-metrics compact">
        <TeacherMetric label="AI enabled" value={entitlement?.enabled ? 'Yes' : 'No'} detail="Tenant entitlement" />
        <TeacherMetric label="Units left" value={entitlement?.unitsRemainingThisMonth ?? 0} detail="Monthly budget" />
        <TeacherMetric label="Human approval" value={entitlement?.humanApprovalRequired ? 'Required' : 'Policy'} detail="High-risk guardrail" />
      </div>
      <TeacherToolbar
        query={query}
        searchLabel="Search suggestions"
        searchPlaceholder="Search title, summary, risk, type, status, or target"
        statusFilter={statusFilter}
        statusOptions={[['all', 'All statuses'], ['pending', 'Pending'], ['accepted', 'Accepted'], ['dismissed', 'Dismissed'], ['rejected', 'Rejected'], ['approved', 'Approved'], ['executed', 'Executed']]}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
      />
      <TeacherRemoteState emptyDetail="Teaching suggestions will appear when AI recommendations are created for your role and scope." emptyTitle="No AI suggestions" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={rows.length}>
        <TeacherTable columns={['Suggestion', 'Risk', 'Status', 'Confidence', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((item) => (
            <tr key={item.recommendationId}>
              <td><strong>{item.title}</strong><span>{item.summary}</span></td>
              <td><RiskBadge value={item.riskLevel} /></td>
              <td><StatusBadge value={item.status} /></td>
              <td>{Math.round(item.confidenceScore * 100)}%</td>
              <td>
                <div className="teacher-actions">
                  <button onClick={() => void openDetail(item)} type="button">Review</button>
                  <button className="secondary" onClick={() => requestAction(item, 'accept')} type="button">Accept</button>
                  <button className="secondary" onClick={() => requestAction(item, 'dismiss')} type="button">Dismiss</button>
                </div>
              </td>
            </tr>
          ))}
        </TeacherTable>
        <TeacherPagination page={page} total={filtered.length} onPageChange={setPage} />
      </TeacherRemoteState>
      <BacklogNote detail="Central AI policy configuration and automation rule editing are hidden for Teacher. MFA freshness for high-risk AI execution is a backend guardrail backlog item unless policy enforces it." />
      {selected ? (
        <TeacherDrawer eyebrow="AI suggestion detail" title={selected.title} onClose={() => setSelected(null)}>
          <div className="teacher-drawer-scroll">
            <DetailGrid rows={[
              ['Type', selected.recommendationType],
              ['Risk', selected.riskLevel],
              ['Status', selected.status],
              ['Confidence', `${Math.round(selected.confidenceScore * 100)}%`],
              ['Approval required', selected.approvalRequired ? 'Yes' : 'No'],
              ['Created', formatDateTime(selected.createdAt)],
            ]} />
            <section className="teacher-note warning">
              <strong>Teaching AI guardrail</strong>
              <span>{selected.rationale || selected.summary}</span>
            </section>
          </div>
          <div className="teacher-drawer-footer inline">
            <button className="secondary" disabled={busy} onClick={() => requestAction(selected, 'reject')} type="button">Reject</button>
            <button className="secondary" disabled={busy} onClick={() => requestAction(selected, 'dismiss')} type="button">Dismiss</button>
            <button disabled={busy || selected.approvalRequired} onClick={() => requestAction(selected, 'execute')} type="button">Execute</button>
          </div>
        </TeacherDrawer>
      ) : null}
      {confirm ? <TeacherConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </TeacherPageFrame>
  );
}

function AssignmentPicker({
  assignments,
  onChange,
  selectedId,
}: {
  assignments: TeacherAssignment[];
  onChange: (value: string) => void;
  selectedId: string;
}) {
  if (assignments.length === 0) {
    return null;
  }
  return (
    <div className="teacher-selector-grid">
      <label>
        Assigned class and subject
        <select value={selectedId} onChange={(event) => onChange(event.target.value)}>
          {assignments.map((assignment) => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.className} - {assignment.subjectName} ({assignment.subjectCode})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function TeacherPageFrame({
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
    <section className="teacher-panel" aria-labelledby={`${slug(title)}-title`}>
      <div className="teacher-title">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${slug(title)}-title`}>{title}</h2>
          <span>{detail}</span>
        </div>
        {action ? <div className="teacher-title-actions">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function TeacherToolbar({
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
    <div className="teacher-toolbar">
      <label>
        {searchLabel}
        <input placeholder={searchPlaceholder} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </label>
      <label>
        Filter
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
          {statusOptions.map(([value, label], index) => <option key={`${value}-${index}`} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}

function TeacherRemoteState({
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
  if (loading) return <TeacherSkeleton />;
  if (error) return <TeacherEmptyState action={<button onClick={() => void onRetry()} type="button">Retry</button>} detail={error} title="Unable to load data" tone="error" />;
  if (ready && resultCount === 0) return <TeacherEmptyState detail={emptyDetail} title={emptyTitle} />;
  return <>{children}</>;
}

function TeacherTable({
  children,
  columns,
  emptyFiltered = false,
}: {
  children: ReactNode;
  columns: string[];
  emptyFiltered?: boolean;
}) {
  if (emptyFiltered) {
    return <TeacherEmptyState detail="Adjust search or filters to see more records." title="No matching records" />;
  }
  return (
    <div className="teacher-table-shell">
      <table className="teacher-table">
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TeacherPagination({ onPageChange, page, total }: { onPageChange: (page: number) => void; page: number; total: number }) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  return (
    <div className="teacher-pagination">
      <span>Page {currentPage + 1} of {pageCount} - {total} records</span>
      <div>
        <button className="secondary" disabled={currentPage === 0} onClick={() => onPageChange(Math.max(0, currentPage - 1))} type="button">Previous</button>
        <button className="secondary" disabled={currentPage >= pageCount - 1} onClick={() => onPageChange(Math.min(pageCount - 1, currentPage + 1))} type="button">Next</button>
      </div>
    </div>
  );
}

function TeacherCardHeading({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="teacher-card-heading">
      <div>
        <h3>{title}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function TeacherMetric({ detail, label, value }: { detail: string; label: string; value: number | string }) {
  return (
    <article className="teacher-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function TeacherSkeleton() {
  return (
    <div className="teacher-skeleton" aria-label="Loading Teacher data">
      <span />
      <span />
      <span />
    </div>
  );
}

function TeacherEmptyState({
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
    <div className={`teacher-empty ${compact ? 'compact' : ''} ${tone === 'error' ? 'error' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <strong>{title}</strong>
      <span>{detail}</span>
      {action}
    </div>
  );
}

function TeacherDrawer({ children, eyebrow, onClose, title }: { children: ReactNode; eyebrow: string; onClose: () => void; title: string }) {
  return (
    <div className="teacher-drawer" role="presentation">
      <button aria-label="Close detail drawer" className="teacher-drawer-backdrop" onClick={onClose} type="button" />
      <aside aria-labelledby="teacher-drawer-title" aria-modal="true" className="teacher-drawer-panel" role="dialog">
        <header className="teacher-drawer-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h3 id="teacher-drawer-title">{title}</h3>
          </div>
          <button className="secondary" onClick={onClose} type="button">Close</button>
        </header>
        <div className="teacher-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

function TeacherConfirmDialog({ busy, config, onCancel }: { busy: boolean; config: ConfirmConfig; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const reasonError = config.requireReason && !reason.trim();
  return (
    <div className="school-admin-confirm teacher-confirm" role="presentation">
      <button aria-label="Close confirmation" className="school-admin-confirm-scrim" disabled={busy} onClick={onCancel} type="button" />
      <section aria-labelledby="teacher-confirm-title" aria-modal="true" className={`school-admin-confirm-panel ${config.tone === 'danger' ? 'danger' : ''}`} role="dialog">
        <div>
          <p className="eyebrow">Confirm Teacher action</p>
          <h3 id="teacher-confirm-title">{config.title}</h3>
          <span>{config.detail}</span>
        </div>
        {config.reasonLabel ? (
          <TeacherField error={reasonError ? 'Reason is required.' : undefined} label={config.reasonLabel} required={config.requireReason}>
            <textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} />
          </TeacherField>
        ) : null}
        <div className="school-admin-confirm-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy || Boolean(reasonError)} onClick={() => void config.onConfirm(reason)} type="button">{busy ? 'Working...' : config.confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function TeacherField({ children, error, label, required = false }: { children: ReactNode; error?: string; label: string; required?: boolean }) {
  return (
    <label className="teacher-field">
      <span>{label}{required ? <em aria-hidden="true">*</em> : null}</span>
      {children}
      {error ? <small role="alert">{error}</small> : null}
    </label>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="teacher-detail-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function BacklogNote({ detail }: { detail: string }) {
  return (
    <section className="teacher-note">
      <strong>Guardrail note</strong>
      <span>{detail}</span>
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`teacher-status status-${value.toLowerCase().replaceAll('_', '-')}`}>{titleCase(value)}</span>;
}

function RiskBadge({ value }: { value: string }) {
  return <span className={`teacher-risk risk-${value.toLowerCase()}`}>{titleCase(value)}</span>;
}

function TimetableCard({ entry, onSelect }: { entry: TeacherTimetableEntry; onSelect: (entry: TeacherTimetableEntry) => void }) {
  return (
    <button className="teacher-timetable-card" onClick={() => onSelect(entry)} type="button">
      <strong>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</strong>
      <span>{entry.classLevelName}{entry.sectionName ? ` - ${entry.sectionName}` : ''}</span>
      <em>{entry.subjectName ?? entry.title}</em>
    </button>
  );
}

function useDebouncedValue(value: string, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);
  return debounced.trim().toLowerCase();
}

function textMatches(item: unknown, query: string) {
  if (!query) return true;
  return JSON.stringify(item).toLowerCase().includes(query);
}

function pageRows<T>(items: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  const start = safePage * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function pastTense(action: 'accept' | 'dismiss' | 'execute' | 'reject') {
  return {
    accept: 'accepted',
    dismiss: 'dismissed',
    execute: 'executed',
    reject: 'rejected',
  }[action];
}

function attendanceDraftCounts(records: Record<string, { status: TeacherAttendanceStatus }>) {
  return ATTENDANCE_STATUSES.reduce<Record<TeacherAttendanceStatus, number>>((counts, status) => {
    counts[status] = Object.values(records).filter((record) => record.status === status).length;
    return counts;
  }, { ABSENT: 0, EXCUSED: 0, LATE: 0, PRESENT: 0 });
}

function validateHomework(form: { dueDate: string; instructions: string; title: string }) {
  if (!form.title.trim()) return 'Title is required.';
  if (form.title.trim().length > 160) return 'Title must be 160 characters or fewer.';
  if (!form.instructions.trim()) return 'Instructions are required.';
  if (form.instructions.trim().length > 2000) return 'Instructions must be 2000 characters or fewer.';
  if (!form.dueDate) return 'Due date is required.';
  return null;
}

function validateMarks(exam: TeacherExam, roster: TeacherExamRosterStudent[], marksByStudent: Record<string, string>) {
  const errors: Record<string, string> = {};
  roster.forEach((student) => {
    const rawMarks = marksByStudent[student.studentId] ?? '';
    if (rawMarks === '') return;
    const marks = Number(rawMarks);
    if (!Number.isFinite(marks)) {
      errors[student.studentId] = 'Use a valid number.';
    } else if (marks < 0) {
      errors[student.studentId] = 'Cannot be negative.';
    } else if (marks > exam.maxMarks) {
      errors[student.studentId] = `Cannot exceed ${exam.maxMarks}.`;
    }
  });
  return errors;
}

function marksStatus(exam: TeacherExam) {
  if (exam.status === 'PUBLISHED') return 'PUBLISHED';
  if (exam.results.length > 0) return 'MARKS_RECORDED';
  return 'MARKS_PENDING';
}

function weekdayOptions(): Array<[string, string]> {
  return [
    ['monday', 'Monday'],
    ['tuesday', 'Tuesday'],
    ['wednesday', 'Wednesday'],
    ['thursday', 'Thursday'],
    ['friday', 'Friday'],
    ['saturday', 'Saturday'],
    ['sunday', 'Sunday'],
  ];
}

function formatDate(value?: string | null) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}...`;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
