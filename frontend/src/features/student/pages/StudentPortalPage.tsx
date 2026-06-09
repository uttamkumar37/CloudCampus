import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import type { DashboardSummary } from '../../portal/api/dashboardApi';
import {
  acceptStudentAiRecommendation,
  dismissStudentAiRecommendation,
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
  type AiEntitlement,
  type AiRecommendation,
  type StudentAttendanceRecord,
  type StudentExamResult,
  type StudentFeeDemand,
  type StudentHomework,
  type StudentNotice,
  type StudentProfile,
  type StudentTimetableEntry,
} from '../api/studentPortalApi';

type StudentPortalPageProps = {
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
const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export function StudentPortalPage({ onNavigate, section }: StudentPortalPageProps) {
  if (section === 'dashboard') return <StudentDashboardPage onNavigate={onNavigate} />;
  if (section === 'homework') return <StudentHomeworkPage />;
  if (section === 'results') return <StudentResultsPage />;
  if (section === 'fees') return <StudentFeesPage />;
  if (section === 'notices') return <StudentNoticesPage />;
  if (section === 'attendance') return <StudentAttendancePage />;
  if (section === 'timetable') return <StudentTimetablePage />;
  if (section === 'ai-suggestions') return <StudentAiStudyHelpPage />;
  return (
    <StudentPageFrame
      detail="Only Dashboard, Homework, Results, Fees, Notices, Attendance, Timetable, and AI Study Help are available for Student."
      eyebrow="Student"
      title="Unsupported module"
    >
      <StudentEmptyState detail="This module is not enabled for the Student role." title="Nothing to open here" />
    </StudentPageFrame>
  );
}

function StudentDashboardPage({ onNavigate }: { onNavigate: (navId: string) => void }) {
  const { accessToken, currentUser } = useAuthState();
  const [state, setState] = useState<AsyncState<{
    attendance: StudentAttendanceRecord[];
    fees: StudentFeeDemand[];
    homework: StudentHomework[];
    notices: StudentNotice[];
    profile: StudentProfile;
    results: StudentExamResult[];
    summary: DashboardSummary;
    timetable: StudentTimetableEntry[];
  }>>({ data: null, error: null, status: 'loading' });

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      const [summary, profile, homework, results, fees, notices, attendance, timetable] = await Promise.all([
        getStudentDashboardSummary(accessToken),
        getStudentProfile(accessToken),
        listStudentHomework(accessToken),
        listStudentResults(accessToken),
        listStudentFees(accessToken),
        listStudentNotices(accessToken),
        listStudentAttendance(accessToken),
        listStudentTimetable(accessToken),
      ]);
      setState({ data: { attendance, fees, homework, notices, profile, results, summary, timetable }, error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Student overview could not be loaded.'), status: 'error' });
    }
  }

  const data = state.data;
  const pendingHomework = data?.homework.filter((item) => !hasSubmission(item)) ?? [];
  const dueSoon = pendingHomework.filter((item) => item.dueDate <= addDays(7));
  const outstandingFees = data?.fees.filter((fee) => Number(fee.outstandingAmount) > 0) ?? [];
  const todaysClasses = data?.timetable.filter((entry) => entry.weekday === currentWeekday()) ?? [];
  const attendancePercent = attendanceRate(data?.attendance ?? []);
  const readableClass = data ? studentClassLabel(data) : 'Class not set';

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail={`${currentUser?.activeSchool?.name ?? 'Active school'} homework, results, attendance, fees, notices, timetable, and study help.`}
      eyebrow="Learning workspace"
      title="Student Overview"
    >
      {state.status === 'loading' ? <StudentSkeleton /> : null}
      {state.status === 'error' ? <StudentEmptyState action={<button onClick={() => void load()} type="button">Retry</button>} detail={state.error ?? 'Student overview unavailable.'} title="Dashboard unavailable" tone="error" /> : null}
      {state.status === 'ready' && data ? (
        <>
          <div className="teacher-metrics">
            <StudentMetric label="My profile" value={data.profile.fullName} detail={data.profile.admissionNumber} />
            <StudentMetric label="Pending homework" value={pendingHomework.length} detail="Assignments still waiting for your submission" />
            <StudentMetric label="Published results" value={data.results.length} detail="Results visible to your account" />
            <StudentMetric label="Fee due" value={money(sum(outstandingFees, 'outstandingAmount'))} detail="View-only fee status" />
            <StudentMetric label="Attendance" value={attendancePercent == null ? 'No data' : `${attendancePercent}%`} detail="Based on visible records" />
          </div>

          <div className="teacher-dashboard-grid">
            <section className="teacher-card">
              <StudentCardHeading detail="Official record details are view-only." title="My profile" />
              <DetailGrid rows={[
                ['Admission', data.profile.admissionNumber],
                ['Class', readableClass],
                ['Roll number', data.profile.rollNumber ?? 'Not set'],
                ['Status', data.profile.active ? 'Active' : 'Inactive'],
              ]} />
            </section>

            <section className="teacher-card">
              <StudentCardHeading detail="One-click paths for common student tasks." title="Quick actions" />
              <div className="teacher-action-list">
                {[
                  ['homework', 'Submit homework', 'Open pending homework and submit your answer.'],
                  ['results', 'View results', 'Review published marks and exam details.'],
                  ['timetable', 'Check timetable', 'See today and this week at a glance.'],
                  ['ai-suggestions', 'AI study help', 'Review approved learning recommendations.'],
                ].map(([id, title, detail]) => (
                  <button key={id} onClick={() => onNavigate(id)} type="button">
                    <strong>{title}</strong>
                    <span>{detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="teacher-card">
              <StudentCardHeading detail="Classes scheduled for the current weekday." title="Today's classes" />
              {todaysClasses.length > 0 ? <RecordList items={todaysClasses.slice(0, 5).map((entry) => ({
                detail: `${timeRange(entry.startTime, entry.endTime)}${entry.subjectName ? ` - ${entry.subjectName}` : ''}`,
                title: entry.title,
              }))} /> : <StudentEmptyState compact detail="No timetable entries were returned for today." title="No classes today" />}
            </section>

            <section className="teacher-card wide">
              <StudentCardHeading detail="What needs attention soon." title="Needs attention" />
              {dueSoon.length > 0 || outstandingFees.length > 0 || data.notices.length > 0 ? (
                <RecordList items={[
                  ...dueSoon.slice(0, 4).map((item) => ({ detail: `${item.subjectName} due ${formatDate(item.dueDate)}`, title: item.title })),
                  ...outstandingFees.slice(0, 2).map((fee) => ({ detail: `${money(fee.outstandingAmount)} due ${formatDate(fee.dueDate)}`, title: fee.description })),
                  ...data.notices.slice(0, 2).map((notice) => ({ detail: formatDateTime(notice.publishedAt ?? notice.createdAt), title: notice.title })),
                ]} />
              ) : (
                <StudentEmptyState compact detail="No urgent homework, fee, or notice items were returned." title="Nothing urgent" />
              )}
            </section>
          </div>
        </>
      ) : null}
    </StudentPageFrame>
  );
}

function StudentHomeworkPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<StudentHomework[]>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<StudentHomework | null>(null);
  const [submitting, setSubmitting] = useState<StudentHomework | null>(null);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listStudentHomework(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Homework could not be loaded.'), status: 'error' });
    }
  }

  function openSubmit(item: StudentHomework) {
    setSubmitting(item);
    setSelected(null);
    setContent('');
    setFormError('');
  }

  function requestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submitting || !accessToken) return;
    const nextError = validateSubmission(content);
    setFormError(nextError);
    if (nextError) return;
    setConfirm({
      confirmLabel: 'Submit homework',
      detail: `${submitting.title} will be submitted as your final answer for this homework.`,
      onConfirm: async () => {
        setBusy(true);
        try {
          const updated = await submitStudentHomework(submitting.id, { content: content.trim() }, accessToken);
          setMessage('Homework submitted.');
          setSubmitting(null);
          setContent('');
          setState((current) => ({
            data: current.data?.map((item) => item.id === updated.id ? updated : item) ?? [updated],
            error: null,
            status: 'ready',
          }));
          await load();
        } catch (error) {
          setFormError(errorMessage(error, 'Homework could not be submitted.'));
        } finally {
          setBusy(false);
          setConfirm(null);
        }
      },
      title: 'Confirm homework submission',
    });
  }

  const homework = state.data ?? [];
  const filtered = homework.filter((item) => {
    const derived = homeworkStatus(item);
    const matchesStatus = statusFilter === 'all' || derived.toLowerCase() === statusFilter;
    return matchesStatus && matchesText([item.title, item.instructions, item.subjectName, item.className, item.dueDate], debouncedQuery);
  });
  const pageItems = pageRows(filtered, page);

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="View assigned homework, read instructions, and submit your answer when it is ready."
      eyebrow="My homework"
      title="Homework"
    >
      {message ? <p className="teacher-toast" role="status">{message}</p> : null}
      <StudentToolbar query={query} searchLabel="Search homework" searchPlaceholder="Search title, subject, instructions, or due date" statusFilter={statusFilter} statusOptions={[['all', 'All statuses'], ['pending', 'Pending'], ['submitted', 'Submitted'], ['overdue', 'Overdue']]} onQueryChange={(value) => { setQuery(value); setPage(0); }} onStatusChange={(value) => { setStatusFilter(value); setPage(0); }} />
      <StudentRemoteState emptyDetail="Homework assigned to your class will appear here." emptyTitle="No homework yet" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={homework.length}>
        <StudentTable columns={['Homework', 'Subject', 'Due', 'Status', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.title}</strong><span>{truncate(item.instructions, 92)}</span></td>
              <td>{item.subjectName}</td>
              <td>{formatDate(item.dueDate)}</td>
              <td><StatusBadge value={homeworkStatus(item)} /></td>
              <td>
                <div className="teacher-actions">
                  <button className="secondary" onClick={() => { setSelected(item); setSubmitting(null); }} type="button">Details</button>
                  <button disabled={hasSubmission(item)} onClick={() => openSubmit(item)} type="button">Submit</button>
                </div>
              </td>
            </tr>
          ))}
        </StudentTable>
        <StudentPagination page={page} total={filtered.length} onPageChange={setPage} />
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="Homework detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Subject', selected.subjectName],
            ['Class', classSectionLabel(selected.className, selected.sectionName)],
            ['Due date', formatDate(selected.dueDate)],
            ['Status', homeworkStatus(selected)],
            ['Submitted at', selected.submissions[0]?.submittedAt ? formatDateTime(selected.submissions[0].submittedAt) : 'Not submitted'],
          ]} />
          <section className={isOverdue(selected) && !hasSubmission(selected) ? 'teacher-note warning' : 'teacher-note'}>
            <strong>Instructions</strong>
            <span>{selected.instructions}</span>
          </section>
          {selected.submissions[0] ? (
            <section className="teacher-note">
              <strong>Your submission</strong>
              <span>{selected.submissions[0].content}</span>
            </section>
          ) : (
            <button onClick={() => openSubmit(selected)} type="button">Submit homework</button>
          )}
        </StudentDrawer>
      ) : null}

      {submitting ? (
        <StudentDrawer eyebrow="Submit homework" title={submitting.title} onClose={() => setSubmitting(null)}>
          <form className="teacher-form" noValidate onSubmit={requestSubmit}>
            <div className="teacher-drawer-scroll">
              {formError ? <p className="form-error" role="alert">{formError}</p> : null}
              <section className="teacher-form-section">
                <h3>Homework</h3>
                <DetailGrid rows={[
                  ['Subject', submitting.subjectName],
                  ['Due date', formatDate(submitting.dueDate)],
                  ['Status', homeworkStatus(submitting)],
                ]} />
                {isOverdue(submitting) ? <StudentNote detail="This homework is past its due date. Your teacher may review late submissions separately." /> : null}
              </section>
              <section className="teacher-form-section">
                <h3>Your answer</h3>
                <StudentField label="Submission text" required>
                  <textarea aria-invalid={Boolean(formError)} rows={8} value={content} onChange={(event) => { setContent(event.target.value); setFormError(''); }} placeholder="Write your answer or paste a study link if your teacher asked for one." maxLength={2000} />
                </StudentField>
              </section>
            </div>
            <div className="teacher-drawer-footer">
              <button className="secondary" disabled={busy} onClick={() => setSubmitting(null)} type="button">Cancel</button>
              <button disabled={busy} type="submit">{busy ? 'Submitting...' : 'Submit homework'}</button>
            </div>
          </form>
        </StudentDrawer>
      ) : null}
      {confirm ? <StudentConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </StudentPageFrame>
  );
}

function StudentResultsPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<StudentExamResult[]>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<StudentExamResult | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listStudentResults(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Results could not be loaded.'), status: 'error' });
    }
  }

  const results = state.data ?? [];
  const filtered = results.filter((item) => matchesText([item.title, item.subjectName, item.className, item.status, item.examDate], debouncedQuery));
  const pageItems = pageRows(filtered, page);
  const average = resultAverage(results);

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="View published exam results for your student record."
      eyebrow="My results"
      title="Results"
    >
      <div className="teacher-metrics compact">
        <StudentMetric label="Published results" value={results.length} detail="Visible results for your account" />
        <StudentMetric label="Average marks" value={average == null ? 'No data' : `${average}%`} detail="Calculated from visible published results" />
        <StudentMetric label="Latest result" value={results[0]?.title ?? 'No result'} detail={results[0] ? formatDate(results[0].examDate) : 'Your results will appear after publication'} />
      </div>
      <StudentToolbar query={query} searchLabel="Search results" searchPlaceholder="Search exam, subject, class, or date" onQueryChange={(value) => { setQuery(value); setPage(0); }} />
      <StudentRemoteState emptyDetail="Your results will appear here after your school publishes them." emptyTitle="No published results" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={results.length}>
        <StudentTable columns={['Exam', 'Subject', 'Date', 'Marks', 'Status', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((item) => {
            const result = item.results[0];
            return (
              <tr key={item.id}>
                <td><strong>{item.title}</strong><span>{item.className}</span></td>
                <td>{item.subjectName}</td>
                <td>{formatDate(item.examDate)}</td>
                <td>{result ? `${result.marksObtained} / ${item.maxMarks}` : 'Not visible'}</td>
                <td><StatusBadge value={item.status} /></td>
                <td><button onClick={() => setSelected(item)} type="button">Review</button></td>
              </tr>
            );
          })}
        </StudentTable>
        <StudentPagination page={page} total={filtered.length} onPageChange={setPage} />
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="Published result" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Subject', selected.subjectName],
            ['Exam date', formatDate(selected.examDate)],
            ['Max marks', String(selected.maxMarks)],
            ['Status', selected.status],
            ['Published', selected.publishedAt ? formatDateTime(selected.publishedAt) : 'Publication date unavailable'],
          ]} />
          <StudentTable columns={['Student', 'Marks', 'Recorded']}>
            {(selected.results.length ? selected.results : []).map((result) => (
              <tr key={result.id}>
                <td>{result.studentName}</td>
                <td>{result.marksObtained} / {selected.maxMarks}</td>
                <td>{formatDateTime(result.recordedAt)}</td>
              </tr>
            ))}
          </StudentTable>
        </StudentDrawer>
      ) : null}
    </StudentPageFrame>
  );
}

function StudentFeesPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<StudentFeeDemand[]>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<StudentFeeDemand | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listStudentFees(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Fees could not be loaded.'), status: 'error' });
    }
  }

  const fees = state.data ?? [];
  const filtered = fees.filter((fee) => {
    const matchesStatus = statusFilter === 'all' || feeStatus(fee).toLowerCase() === statusFilter;
    return matchesStatus && matchesText([fee.description, fee.status, fee.dueDate, fee.admissionNumber], debouncedQuery);
  });
  const pageItems = pageRows(filtered, page);

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="View-only fee status and receipts returned for your own student record."
      eyebrow="Fee status"
      title="Fees"
    >
      <div className="teacher-metrics compact">
        <StudentMetric label="Total due" value={money(sum(fees, 'amountDue'))} detail="Demanded amount" />
        <StudentMetric label="Paid" value={money(sum(fees, 'amountPaid'))} detail="Recorded payments" />
        <StudentMetric label="Outstanding" value={money(sum(fees, 'outstandingAmount'))} detail="Remaining view-only balance" />
      </div>
      <StudentToolbar query={query} searchLabel="Search fees" searchPlaceholder="Search description, status, date, or receipt" statusFilter={statusFilter} statusOptions={[['all', 'All statuses'], ['due', 'Due'], ['partially paid', 'Partially paid'], ['paid', 'Paid'], ['overdue', 'Overdue']]} onQueryChange={(value) => { setQuery(value); setPage(0); }} onStatusChange={(value) => { setStatusFilter(value); setPage(0); }} />
      <StudentRemoteState emptyDetail="No fee records were returned for your account." emptyTitle="No fee records" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={fees.length}>
        <StudentTable columns={['Fee', 'Due date', 'Amount', 'Paid', 'Status', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((fee) => (
            <tr key={fee.id}>
              <td><strong>{fee.description}</strong><span>{fee.admissionNumber}</span></td>
              <td>{formatDate(fee.dueDate)}</td>
              <td>{money(fee.amountDue)}</td>
              <td>{money(fee.amountPaid)}</td>
              <td><StatusBadge value={feeStatus(fee)} /></td>
              <td><button onClick={() => setSelected(fee)} type="button">Review</button></td>
            </tr>
          ))}
        </StudentTable>
        <StudentPagination page={page} total={filtered.length} onPageChange={setPage} />
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="Fee detail" title={selected.description} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Amount due', money(selected.amountDue)],
            ['Paid', money(selected.amountPaid)],
            ['Outstanding', money(selected.outstandingAmount)],
            ['Due date', formatDate(selected.dueDate)],
            ['Status', feeStatus(selected)],
          ]} />
          {selected.payments.length > 0 ? (
            <StudentTable columns={['Receipt', 'Amount', 'Method', 'Paid at']}>
              {selected.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.receiptNumber}</td>
                  <td>{money(payment.amount)}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{formatDateTime(payment.paidAt)}</td>
                </tr>
              ))}
            </StudentTable>
          ) : <StudentEmptyState compact detail="No payments or receipts are linked to this fee demand." title="No receipts yet" />}
        </StudentDrawer>
      ) : null}
    </StudentPageFrame>
  );
}

function StudentNoticesPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<StudentNotice[]>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<StudentNotice | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [audience, setAudience] = useState('any');
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listStudentNotices(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Notices could not be loaded.'), status: 'error' });
    }
  }

  const notices = state.data ?? [];
  const filtered = notices.filter((notice) => {
    const matchesAudience = audience === 'any' || notice.audience.toLowerCase() === audience;
    return matchesAudience && matchesText([notice.title, notice.body, notice.audience, notice.className ?? '', notice.sectionName ?? ''], debouncedQuery);
  });
  const pageItems = pageRows(filtered, page);

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Read notices published to your school, class, section, or Student audience."
      eyebrow="School notices"
      title="Notices"
    >
      <StudentToolbar query={query} searchLabel="Search notices" searchPlaceholder="Search title, message, class, or audience" statusFilter={audience} statusOptions={[['any', 'All audiences'], ['students', 'Students'], ['all', 'All school']]} onQueryChange={(value) => { setQuery(value); setPage(0); }} onStatusChange={(value) => { setAudience(value); setPage(0); }} />
      <StudentRemoteState emptyDetail="Published school notices will appear here." emptyTitle="No notices" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={notices.length}>
        <StudentTable columns={['Notice', 'Scope', 'Published', 'Audience', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((notice) => (
            <tr key={notice.id}>
              <td><strong>{notice.title}</strong><span>{truncate(notice.body, 96)}</span></td>
              <td>{classSectionLabel(notice.className ?? 'School', notice.sectionName)}</td>
              <td>{formatDateTime(notice.publishedAt ?? notice.createdAt)}</td>
              <td><StatusBadge value={notice.audience} /></td>
              <td><button onClick={() => setSelected(notice)} type="button">Read</button></td>
            </tr>
          ))}
        </StudentTable>
        <StudentPagination page={page} total={filtered.length} onPageChange={setPage} />
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="Notice detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Audience', selected.audience],
            ['Scope', classSectionLabel(selected.className ?? 'School', selected.sectionName)],
            ['Published', formatDateTime(selected.publishedAt ?? selected.createdAt)],
            ['Status', selected.status],
          ]} />
          <section className="teacher-note">
            <strong>Message</strong>
            <span>{selected.body}</span>
          </section>
        </StudentDrawer>
      ) : null}
    </StudentPageFrame>
  );
}

function StudentAttendancePage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<StudentAttendanceRecord[]>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<StudentAttendanceRecord | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listStudentAttendance(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Attendance could not be loaded.'), status: 'error' });
    }
  }

  const attendance = state.data ?? [];
  const filtered = attendance.filter((record) => {
    const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter;
    return matchesStatus && matchesText([record.subjectName ?? '', record.className, record.sectionName ?? '', record.attendanceDate, record.status, record.remark ?? ''], debouncedQuery);
  });
  const pageItems = pageRows(filtered, page);
  const rate = attendanceRate(attendance);

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="View-only date-wise attendance returned for your own student record."
      eyebrow="My attendance"
      title="Attendance"
    >
      <div className="teacher-metrics compact">
        <StudentMetric label="Attendance rate" value={rate == null ? 'No data' : `${rate}%`} detail="Present plus late over visible records" />
        <StudentMetric label="Present" value={attendance.filter((record) => record.status === 'PRESENT').length} detail="Marked present" />
        <StudentMetric label="Absent" value={attendance.filter((record) => record.status === 'ABSENT').length} detail="Marked absent" />
      </div>
      {rate != null && rate < 75 ? <section className="teacher-note warning"><strong>Attendance risk</strong><span>Your visible attendance is below 75%. Please speak with your class teacher or guardian.</span></section> : null}
      <StudentToolbar query={query} searchLabel="Search attendance" searchPlaceholder="Search subject, date, status, or remark" statusFilter={statusFilter} statusOptions={[['all', 'All statuses'], ['present', 'Present'], ['absent', 'Absent'], ['late', 'Late'], ['excused', 'Excused']]} onQueryChange={(value) => { setQuery(value); setPage(0); }} onStatusChange={(value) => { setStatusFilter(value); setPage(0); }} />
      <StudentRemoteState emptyDetail="Attendance records will appear after your school marks attendance." emptyTitle="No attendance records" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={attendance.length}>
        <StudentTable columns={['Date', 'Subject', 'Class', 'Status', 'Remark', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((record) => (
            <tr key={record.id}>
              <td>{formatDate(record.attendanceDate)}</td>
              <td>{record.subjectName ?? 'Class attendance'}</td>
              <td>{classSectionLabel(record.className, record.sectionName)}</td>
              <td><StatusBadge value={record.status} /></td>
              <td>{record.remark ?? 'No remark'}</td>
              <td><button onClick={() => setSelected(record)} type="button">Review</button></td>
            </tr>
          ))}
        </StudentTable>
        <StudentPagination page={page} total={filtered.length} onPageChange={setPage} />
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="Attendance detail" title={formatDate(selected.attendanceDate)} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Subject', selected.subjectName ?? 'Class attendance'],
            ['Class', classSectionLabel(selected.className, selected.sectionName)],
            ['Status', selected.status],
            ['Remark', selected.remark ?? 'No remark'],
            ['Recorded', formatDateTime(selected.recordedAt)],
          ]} />
          <StudentNote detail="For corrections, contact your class teacher or school office." />
        </StudentDrawer>
      ) : null}
    </StudentPageFrame>
  );
}

function StudentTimetablePage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<StudentTimetableEntry[]>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<StudentTimetableEntry | null>(null);
  const [day, setDay] = useState('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      setState({ data: await listStudentTimetable(accessToken), error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'Timetable could not be loaded.'), status: 'error' });
    }
  }

  const entries = state.data ?? [];
  const filtered = entries.filter((entry) => {
    const matchesDay = day === 'all' || entry.weekday.toLowerCase() === day;
    return matchesDay && matchesText([entry.title, entry.subjectName ?? '', entry.classLevelName, entry.weekday], debouncedQuery);
  });
  const today = entries.filter((entry) => entry.weekday === currentWeekday());

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="View your class timetable for the active school."
      eyebrow="This week"
      title="Timetable"
    >
      <section className="teacher-card">
        <StudentCardHeading detail="Current weekday schedule." title="Today's classes" />
        {today.length > 0 ? <RecordList items={today.map((entry) => ({ detail: `${timeRange(entry.startTime, entry.endTime)}${entry.subjectName ? ` - ${entry.subjectName}` : ''}`, title: entry.title }))} /> : <StudentEmptyState compact detail="No classes are scheduled for today in the returned timetable." title="No classes today" />}
      </section>
      <StudentToolbar query={query} searchLabel="Search timetable" searchPlaceholder="Search subject, title, class, or weekday" statusFilter={day} statusOptions={[['all', 'All days'], ...WEEKDAYS.map((weekday) => [weekday.toLowerCase(), titleCase(weekday)] as [string, string])]} onQueryChange={setQuery} onStatusChange={setDay} />
      <StudentRemoteState emptyDetail="Your timetable will appear after the school publishes class periods." emptyTitle="No timetable entries" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={entries.length}>
        <div className="teacher-week-grid">
          {WEEKDAYS.map((weekday) => {
            const dayEntries = filtered.filter((entry) => entry.weekday === weekday);
            return (
              <section className="teacher-card" key={weekday}>
                <StudentCardHeading detail={`${dayEntries.length} period${dayEntries.length === 1 ? '' : 's'}`} title={titleCase(weekday)} />
                {dayEntries.length > 0 ? (
                  <div className="teacher-record-list">
                    {dayEntries.map((entry) => (
                      <button className="teacher-list-button" key={entry.id} onClick={() => setSelected(entry)} type="button">
                        <strong>{timeRange(entry.startTime, entry.endTime)}</strong>
                        <span>{entry.title}{entry.subjectName ? ` - ${entry.subjectName}` : ''}</span>
                      </button>
                    ))}
                  </div>
                ) : <StudentEmptyState compact detail="No periods returned for this day." title="Free day" />}
              </section>
            );
          })}
        </div>
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="Timetable detail" title={selected.title} onClose={() => setSelected(null)}>
          <DetailGrid rows={[
            ['Day', titleCase(selected.weekday)],
            ['Time', timeRange(selected.startTime, selected.endTime)],
            ['Subject', selected.subjectName ?? 'General period'],
            ['Class', classSectionLabel(selected.classLevelName, selected.sectionName)],
          ]} />
        </StudentDrawer>
      ) : null}
    </StudentPageFrame>
  );
}

function StudentAiStudyHelpPage() {
  const { accessToken } = useAuthState();
  const [state, setState] = useState<AsyncState<{ entitlement: AiEntitlement | null; recommendations: AiRecommendation[] }>>({ data: null, error: null, status: 'loading' });
  const [selected, setSelected] = useState<AiRecommendation | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    void load();
  }, [accessToken]);

  async function load() {
    if (!accessToken) {
      setState({ data: null, error: 'Student login is required.', status: 'error' });
      return;
    }
    setState((current) => ({ ...current, error: null, status: 'loading' }));
    try {
      const [recommendations, entitlement] = await Promise.all([
        listStudentAiRecommendations({ page: 0, size: 50 }, accessToken),
        getStudentAiEntitlement(accessToken).catch(() => null),
      ]);
      setState({ data: { entitlement, recommendations: recommendations.items }, error: null, status: 'ready' });
    } catch (error) {
      setState({ data: null, error: errorMessage(error, 'AI study help could not be loaded.'), status: 'error' });
    }
  }

  async function openDetail(item: AiRecommendation) {
    if (!accessToken) return;
    try {
      setSelected(await getStudentAiRecommendation(item.recommendationId, accessToken));
    } catch (error) {
      setMessage(errorMessage(error, 'AI recommendation could not be opened.'));
    }
  }

  function requestAction(item: AiRecommendation, action: 'accept' | 'dismiss' | 'execute' | 'reject') {
    const needsReason = action === 'reject';
    setConfirm({
      confirmLabel: actionLabel(action),
      detail: aiActionDetail(item, action),
      onConfirm: async (reason) => {
        if (!accessToken) return;
        setBusy(true);
        try {
          const updated = action === 'accept'
            ? await acceptStudentAiRecommendation(item.recommendationId, accessToken)
            : action === 'dismiss'
              ? await dismissStudentAiRecommendation(item.recommendationId, accessToken)
              : action === 'reject'
                ? await rejectStudentAiRecommendation(item.recommendationId, reason ?? '', accessToken)
                : await executeStudentAiRecommendation(item.recommendationId, accessToken);
          setMessage(`AI recommendation ${actionPastTense(action)}.`);
          setSelected(updated);
          await load();
        } catch (error) {
          setMessage(errorMessage(error, 'AI action could not be completed.'));
        } finally {
          setBusy(false);
          setConfirm(null);
        }
      },
      reasonLabel: needsReason ? 'Reason for rejecting' : undefined,
      requireReason: needsReason,
      title: `${actionLabel(action)} recommendation`,
      tone: action === 'reject' ? 'danger' : 'default',
    });
  }

  const recommendations = state.data?.recommendations ?? [];
  const filtered = recommendations.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    return matchesStatus && matchesText([item.title, item.summary, item.recommendationType, item.riskLevel, item.status], debouncedQuery);
  });
  const pageItems = pageRows(filtered, page);
  const entitlement = state.data?.entitlement;

  return (
    <StudentPageFrame
      action={<button className="secondary" disabled={state.status === 'loading'} onClick={() => void load()} type="button">Refresh</button>}
      detail="Review study recommendations scoped to your account."
      eyebrow="AI study help"
      title="AI Study Help"
    >
      {message ? <p className="teacher-toast" role="status">{message}</p> : null}
      {entitlement ? (
        <div className="teacher-metrics compact">
          <StudentMetric label="AI enabled" value={entitlement.enabled ? 'Yes' : 'No'} detail="Tenant entitlement state" />
          <StudentMetric label="Units left" value={entitlement.unitsRemainingThisMonth} detail="Monthly student-safe usage budget" />
          <StudentMetric label="Approval" value={entitlement.humanApprovalRequired ? 'Required' : 'Policy based'} detail="High-risk actions stay controlled" />
        </div>
      ) : null}
      <StudentToolbar query={query} searchLabel="Search study help" searchPlaceholder="Search title, risk, status, or subject context" statusFilter={statusFilter} statusOptions={[['all', 'All statuses'], ['pending_review', 'Pending'], ['approved', 'Approved'], ['executed', 'Completed'], ['cancelled', 'Dismissed'], ['rejected', 'Rejected']]} onQueryChange={(value) => { setQuery(value); setPage(0); }} onStatusChange={(value) => { setStatusFilter(value); setPage(0); }} />
      <StudentRemoteState emptyDetail="AI study recommendations will appear only when enabled and scoped to your account." emptyTitle="No study recommendations" error={state.error} loading={state.status === 'loading'} onRetry={load} ready={state.status === 'ready'} resultCount={recommendations.length}>
        <StudentTable columns={['Recommendation', 'Type', 'Risk', 'Status', 'Actions']} emptyFiltered={filtered.length === 0}>
          {pageItems.map((item) => (
            <tr key={item.recommendationId}>
              <td><strong>{item.title}</strong><span>{truncate(item.summary, 100)}</span></td>
              <td>{titleCase(item.recommendationType)}</td>
              <td><StatusBadge value={item.riskLevel} /></td>
              <td><StatusBadge value={item.status} /></td>
              <td><button onClick={() => void openDetail(item)} type="button">Review</button></td>
            </tr>
          ))}
        </StudentTable>
        <StudentPagination page={page} total={filtered.length} onPageChange={setPage} />
      </StudentRemoteState>

      {selected ? (
        <StudentDrawer eyebrow="AI study recommendation" title={selected.title} onClose={() => setSelected(null)}>
          <div className="teacher-drawer-scroll">
            <DetailGrid rows={[
              ['Type', titleCase(selected.recommendationType)],
              ['Risk', selected.riskLevel],
              ['Status', selected.status],
              ['Confidence', `${Math.round(Number(selected.confidenceScore) * 100)}%`],
              ['Approval required', selected.approvalRequired ? 'Yes' : 'No'],
              ['Created', formatDateTime(selected.createdAt)],
            ]} />
            <section className={selected.riskLevel === 'HIGH' || selected.riskLevel === 'CRITICAL' ? 'teacher-note warning' : 'teacher-note'}>
              <strong>Study guidance</strong>
              <span>{selected.rationale || selected.summary}</span>
            </section>
            {selected.approvalRequired ? <StudentNote detail="This recommendation requires human approval before it can be opened." /> : null}
          </div>
          <div className="teacher-drawer-footer inline">
            <button className="secondary" disabled={busy} onClick={() => requestAction(selected, 'reject')} type="button">Reject</button>
            <button className="secondary" disabled={busy} onClick={() => requestAction(selected, 'dismiss')} type="button">Dismiss</button>
            <button className="secondary" disabled={busy} onClick={() => requestAction(selected, 'accept')} type="button">Accept</button>
            <button disabled={busy || selected.approvalRequired} onClick={() => requestAction(selected, 'execute')} type="button">Open study help</button>
          </div>
        </StudentDrawer>
      ) : null}
      {confirm ? <StudentConfirmDialog busy={busy} config={confirm} onCancel={() => setConfirm(null)} /> : null}
    </StudentPageFrame>
  );
}

function StudentPageFrame({ action, children, detail, eyebrow, title }: { action?: ReactNode; children: ReactNode; detail: string; eyebrow: string; title: string }) {
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

function StudentToolbar({
  onQueryChange,
  onStatusChange,
  query,
  searchLabel,
  searchPlaceholder,
  statusFilter = 'all',
  statusOptions,
}: {
  onQueryChange: (value: string) => void;
  onStatusChange?: (value: string) => void;
  query: string;
  searchLabel: string;
  searchPlaceholder: string;
  statusFilter?: string;
  statusOptions?: Array<[string, string]>;
}) {
  return (
    <div className="teacher-toolbar">
      <label>
        {searchLabel}
        <input placeholder={searchPlaceholder} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </label>
      {statusOptions && onStatusChange ? (
        <label>
          Filter
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            {statusOptions.map(([value, label], index) => <option key={`${value}-${index}`} value={value}>{label}</option>)}
          </select>
        </label>
      ) : <span />}
    </div>
  );
}

function StudentRemoteState({ children, emptyDetail, emptyTitle, error, loading, onRetry, ready, resultCount }: { children: ReactNode; emptyDetail: string; emptyTitle: string; error: string | null; loading: boolean; onRetry: () => Promise<void>; ready: boolean; resultCount: number }) {
  if (loading) return <StudentSkeleton />;
  if (error) return <StudentEmptyState action={<button onClick={() => void onRetry()} type="button">Retry</button>} detail={error} title="Unable to load data" tone="error" />;
  if (ready && resultCount === 0) return <StudentEmptyState detail={emptyDetail} title={emptyTitle} />;
  return <>{children}</>;
}

function StudentTable({ children, columns, emptyFiltered }: { children: ReactNode; columns: string[]; emptyFiltered?: boolean }) {
  return (
    <div className="teacher-table-shell">
      <table className="teacher-table">
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {emptyFiltered ? (
            <tr><td colSpan={columns.length}>No rows match the current filters.</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function StudentPagination({ onPageChange, page, total }: { onPageChange: (page: number) => void; page: number; total: number }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="teacher-pagination">
      <span>Page {page + 1} of {totalPages}</span>
      <button className="secondary" disabled={page === 0} onClick={() => onPageChange(page - 1)} type="button">Previous</button>
      <button className="secondary" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} type="button">Next</button>
    </div>
  );
}

function StudentDrawer({ children, eyebrow, onClose, title }: { children: ReactNode; eyebrow: string; onClose: () => void; title: string }) {
  return (
    <div className="teacher-drawer" role="presentation">
      <button aria-label="Close detail drawer" className="teacher-drawer-backdrop" onClick={onClose} type="button" />
      <aside aria-labelledby="student-drawer-title" aria-modal="true" className="teacher-drawer-panel" role="dialog">
        <header className="teacher-drawer-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h3 id="student-drawer-title">{title}</h3>
          </div>
          <button className="secondary" onClick={onClose} type="button">Close</button>
        </header>
        <div className="teacher-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

function StudentConfirmDialog({ busy, config, onCancel }: { busy: boolean; config: ConfirmConfig; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const reasonError = config.requireReason && !reason.trim();
  return (
    <div className="teacher-confirm" role="presentation">
      <button aria-label="Close confirmation" className="teacher-confirm-backdrop" disabled={busy} onClick={onCancel} type="button" />
      <section aria-labelledby="student-confirm-title" aria-modal="true" className="teacher-confirm-panel" role="dialog">
        <p className="eyebrow">{config.tone === 'danger' ? 'Careful action' : 'Confirmation'}</p>
        <h3 id="student-confirm-title">{config.title}</h3>
        <span>{config.detail}</span>
        {config.reasonLabel ? (
          <label className="teacher-field">
            <span>{config.reasonLabel}{config.requireReason ? <em>*</em> : null}</span>
            <textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Add a short reason." />
            {reasonError ? <small role="alert">A reason is required.</small> : null}
          </label>
        ) : null}
        <div className="teacher-confirm-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy || Boolean(reasonError)} onClick={() => void config.onConfirm(reason.trim())} type="button">{busy ? 'Working...' : config.confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function StudentField({ children, label, required }: { children: ReactNode; label: string; required?: boolean }) {
  return (
    <label className="teacher-field">
      <span>{label}{required ? <em>*</em> : null}</span>
      {children}
    </label>
  );
}

function StudentMetric({ detail, label, value }: { detail: string; label: string; value: number | string }) {
  return (
    <article className="teacher-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function StudentCardHeading({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="teacher-card-heading">
      <div>
        <h3>{title}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function StudentSkeleton() {
  return (
    <div className="teacher-skeleton" aria-label="Loading Student data">
      <span />
      <span />
      <span />
    </div>
  );
}

function StudentEmptyState({ action, compact = false, detail, title, tone = 'default' }: { action?: ReactNode; compact?: boolean; detail: string; title: string; tone?: 'default' | 'error' }) {
  return (
    <div className={`teacher-empty ${compact ? 'compact' : ''} ${tone === 'error' ? 'error' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <strong>{title}</strong>
      <span>{detail}</span>
      {action}
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`teacher-status status-${value.toLowerCase().replaceAll('_', '-')}`}>{titleCase(value)}</span>;
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

function RecordList({ items }: { items: Array<{ detail: string; title: string }> }) {
  return (
    <div className="teacher-record-list">
      {items.map((item) => (
        <article key={`${item.title}-${item.detail}`}>
          <strong>{item.title}</strong>
          <span>{item.detail}</span>
        </article>
      ))}
    </div>
  );
}

function StudentNote({ detail }: { detail: string }) {
  return (
    <section className="teacher-note">
      <strong>Note</strong>
      <span>{detail}</span>
    </section>
  );
}

function useDebouncedValue(value: string, delay = 180) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);
  return debounced;
}

function pageRows<T>(rows: T[], page: number) {
  const safePage = Math.min(Math.max(page, 0), Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1));
  return rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
}

function matchesText(values: Array<string | number | null | undefined>, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) => String(value ?? '').toLowerCase().includes(needle));
}

function hasSubmission(item: StudentHomework) {
  return item.submissions.length > 0;
}

function isOverdue(item: StudentHomework) {
  return item.dueDate < TODAY;
}

function homeworkStatus(item: StudentHomework) {
  if (hasSubmission(item)) return 'SUBMITTED';
  if (isOverdue(item)) return 'OVERDUE';
  return 'PENDING';
}

function feeStatus(fee: StudentFeeDemand) {
  if (Number(fee.outstandingAmount) <= 0 || fee.status === 'PAID') return 'PAID';
  if (fee.dueDate < TODAY) return 'OVERDUE';
  if (Number(fee.amountPaid) > 0) return 'PARTIALLY PAID';
  return 'DUE';
}

function attendanceRate(records: StudentAttendanceRecord[]) {
  if (records.length === 0) return null;
  const attended = records.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length;
  return Math.round((attended / records.length) * 100);
}

function resultAverage(results: StudentExamResult[]) {
  const rows = results.flatMap((result) => result.results.map((row) => Number(row.marksObtained) / Number(result.maxMarks)));
  if (rows.length === 0) return null;
  return Math.round((rows.reduce((total, value) => total + value, 0) / rows.length) * 100);
}

function sum<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function money(value: number | string) {
  return new Intl.NumberFormat('en-IN', { currency: 'INR', maximumFractionDigits: 0, style: 'currency' }).format(Number(value));
}

function classSectionLabel(className: string, sectionName?: string | null) {
  return sectionName ? `${className} - ${sectionName}` : className;
}

function studentClassLabel(data: {
  attendance: StudentAttendanceRecord[];
  homework: StudentHomework[];
  profile: StudentProfile;
  timetable: StudentTimetableEntry[];
}) {
  const timetable = data.timetable.find((entry) => entry.classLevelName);
  if (timetable) return classSectionLabel(timetable.classLevelName, timetable.sectionName);
  const homework = data.homework.find((item) => item.className);
  if (homework) return classSectionLabel(homework.className, homework.sectionName);
  const attendance = data.attendance.find((record) => record.className);
  if (attendance) return classSectionLabel(attendance.className, attendance.sectionName);
  return data.profile.classLevelId ? 'Assigned class' : 'Class not set';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function timeRange(start: string, end: string) {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function titleCase(value: string) {
  return value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function currentWeekday() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toUpperCase();
}

function validateSubmission(content: string) {
  if (!content.trim()) return 'Submission text is required.';
  if (content.trim().length < 10) return 'Add a little more detail before submitting.';
  return '';
}

function actionLabel(action: 'accept' | 'dismiss' | 'execute' | 'reject') {
  if (action === 'accept') return 'Accept';
  if (action === 'dismiss') return 'Dismiss';
  if (action === 'reject') return 'Reject';
  return 'Open study help';
}

function actionPastTense(action: 'accept' | 'dismiss' | 'execute' | 'reject') {
  if (action === 'accept') return 'accepted';
  if (action === 'dismiss') return 'dismissed';
  if (action === 'reject') return 'rejected';
  return 'opened';
}

function aiActionDetail(item: AiRecommendation, action: 'accept' | 'dismiss' | 'execute' | 'reject') {
  if (action === 'execute') {
    return `"${item.title}" will run only if backend policy allows this Student-scoped study action.`;
  }
  return `"${item.title}" will be ${actionPastTense(action)} for your Student account.`;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
