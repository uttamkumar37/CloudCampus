import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getMyAssignments,
  getMyAttendance,
  getMyFees,
  getMyHomework,
  getMyNotices,
  getMyResults,
  getMyTimetable,
} from '../api/studentPortalApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  PortalEmptyState,
  PortalErrorState,
  PortalInsightGrid,
  PortalPanel,
  PortalQuickActions,
  PortalShell,
  PortalSkeleton,
  PortalStatCard,
  PortalTimeline,
} from '@/features/role-portals/components/PortalDashboard';
import type { DayOfWeek } from '@/features/timetable/types/timetable';
import type { PortalInsight, PortalTimelineItem } from '@/features/role-portals/types/portal';

const JS_TO_SCHOOL_DAY: Record<number, DayOfWeek | null> = {
  0: null,
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const homeworkQuery = useQuery({ queryKey: ['student-homework'], queryFn: getMyHomework });
  const assignmentsQuery = useQuery({ queryKey: ['student-assignments'], queryFn: getMyAssignments });
  const noticesQuery = useQuery({ queryKey: ['student-notices', 0], queryFn: () => getMyNotices(0) });
  const timetableQuery = useQuery({ queryKey: ['student-timetable'], queryFn: getMyTimetable });
  const attendanceQuery = useQuery({ queryKey: ['student-attendance'], queryFn: getMyAttendance });
  const feesQuery = useQuery({ queryKey: ['student-fees'], queryFn: () => getMyFees() });
  const resultsQuery = useQuery({ queryKey: ['student-results'], queryFn: getMyResults });

  const isLoading = [
    homeworkQuery,
    assignmentsQuery,
    noticesQuery,
    timetableQuery,
    attendanceQuery,
    feesQuery,
    resultsQuery,
  ].some((query) => query.isLoading);

  const isError = [
    homeworkQuery,
    assignmentsQuery,
    noticesQuery,
    timetableQuery,
    attendanceQuery,
    feesQuery,
    resultsQuery,
  ].some((query) => query.isError);

  const homework = homeworkQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const notices = noticesQuery.data?.items ?? [];
  const timetable = timetableQuery.data ?? [];
  const attendance = attendanceQuery.data;
  const fees = feesQuery.data ?? [];
  const results = resultsQuery.data ?? [];

  const todaySlots = useMemo(() => {
    const schoolDay = JS_TO_SCHOOL_DAY[new Date().getDay()];
    return schoolDay
      ? timetable.filter((slot) => slot.dayOfWeek === schoolDay).sort((a, b) => a.periodNumber - b.periodNumber)
      : [];
  }, [timetable]);

  const homeworkDue = homework.filter((item) => item.status === 'PUBLISHED' && daysUntil(item.dueDate) <= 7);
  const pendingAssignments = assignments.filter((item) => !item.submitted);
  const feeBalance = fees.reduce((sum, fee) => sum + fee.balance, 0);
  const overdueFees = fees.filter((fee) => fee.status === 'OVERDUE' || fee.balance > 0 && fee.dueDate && daysUntil(fee.dueDate) < 0);
  const latestResult = results[0];
  const attendancePct = attendance?.attendancePct ?? 0;

  const insights: PortalInsight[] = [
    {
      title: 'Study Plan',
      severity: pendingAssignments.length > 2 || homeworkDue.length > 3 ? 'MEDIUM' : 'LOW',
      summary: `${homeworkDue.length} homework item(s) and ${pendingAssignments.length} assignment(s) need attention.`,
      recommendation: homeworkDue.length || pendingAssignments.length
        ? 'Finish the nearest due work first, then review the latest class notes.'
        : 'Use today for revision and practice questions.',
      confidence: 82,
    },
    {
      title: 'Exam Readiness',
      severity: latestResult && latestResult.percentage < 60 ? 'HIGH' : latestResult ? 'LOW' : 'INFO',
      summary: latestResult ? `Latest result is ${latestResult.percentage}% in ${latestResult.examName}.` : 'No recent exam result is available yet.',
      recommendation: latestResult && latestResult.percentage < 60
        ? 'Ask the teacher for weak-topic feedback and create a daily 30-minute revision routine.'
        : 'Keep practicing with short revision cycles before the next exam.',
      confidence: latestResult ? 78 : 45,
    },
    {
      title: 'Attendance Risk',
      severity: attendancePct >= 85 ? 'LOW' : attendancePct >= 70 ? 'MEDIUM' : 'HIGH',
      summary: `Current attendance is ${attendancePct}%.`,
      recommendation: attendancePct < 85 ? 'Avoid non-urgent absences and check missed work after every absence.' : 'Attendance is steady. Keep the routine consistent.',
      confidence: attendance ? 88 : 40,
    },
  ];

  const timeline: PortalTimelineItem[] = [
    ...homework.slice(0, 3).map((item) => ({
      id: `homework-${item.id}`,
      title: item.title,
      summary: `Homework due ${formatDate(item.dueDate)}`,
      category: 'HOMEWORK',
      occurredAt: item.createdAt,
    })),
    ...assignments.slice(0, 3).map((item) => ({
      id: `assignment-${item.assignmentId}`,
      title: item.title,
      summary: item.submitted ? 'Assignment submitted' : `Assignment due ${formatDate(item.dueDate)}`,
      category: 'ASSIGNMENT',
      occurredAt: item.submittedAt ?? item.dueDate,
    })),
    ...notices.slice(0, 3).map((item) => ({
      id: `notice-${item.id}`,
      title: item.title,
      summary: item.category,
      category: 'NOTICE',
      occurredAt: item.publishedAt,
    })),
  ].sort((a, b) => new Date(b.occurredAt ?? 0).getTime() - new Date(a.occurredAt ?? 0).getTime()).slice(0, 7);

  const chartData = [
    { label: 'Attendance', value: attendancePct },
    { label: 'Homework', value: homework.length ? Math.round(((homework.length - homeworkDue.length) / homework.length) * 100) : 0 },
    { label: 'Assignments', value: assignments.length ? Math.round(((assignments.length - pendingAssignments.length) / assignments.length) * 100) : 0 },
    { label: 'Exam', value: latestResult?.percentage ?? 0 },
  ];

  if (isLoading) return <PortalSkeleton />;
  if (isError) {
    return (
      <PortalShell title="Student 360 Dashboard" subtitle="Your learning command center." eyebrow="Student Portal" tone="violet">
        <PortalErrorState message="Failed to load the student portal dashboard. Please refresh." />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Student 360 Dashboard"
      subtitle={`Welcome back. Today has ${todaySlots.length} class(es), ${homeworkDue.length} homework item(s), and ${pendingAssignments.length} assignment(s) needing attention.`}
      eyebrow={`Student ${user?.userId?.slice(0, 8) ?? 'Portal'}`}
      tone="violet"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Today's Timetable" value={todaySlots.length} helper="scheduled classes" tone="blue" />
        <PortalStatCard label="Homework Due" value={homeworkDue.length} helper="next 7 days" tone={homeworkDue.length ? 'amber' : 'emerald'} />
        <PortalStatCard label="Attendance" value={`${attendancePct}%`} helper="current rate" tone={attendancePct >= 85 ? 'emerald' : 'amber'} />
        <PortalStatCard label="Fee Balance" value={currency(feeBalance)} helper={overdueFees.length ? 'due now' : 'tracked'} tone={overdueFees.length ? 'rose' : 'slate'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <PortalPanel title="Today's Classes" subtitle="Current day timetable">
          {todaySlots.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {todaySlots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Period {slot.periodNumber}</p>
                  <p className="mt-2 font-semibold text-slate-950">{slot.subjectName ?? slot.subjectCode ?? 'Subject'}</p>
                  <p className="mt-1 text-sm text-slate-500">{slot.startTime?.slice(0, 5) ?? '-'} - {slot.endTime?.slice(0, 5) ?? '-'}</p>
                </div>
              ))}
            </div>
          ) : (
            <PortalEmptyState title="No classes today" message="Use the day for revision, assignments, or rest." />
          )}
        </PortalPanel>

        <PortalPanel title="Academic Progress" subtitle="Balanced view of effort and outcomes">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PortalPanel>
      </div>

      <PortalPanel title="AI Study Recommendations" subtitle="Deterministic recommendations from your current school data">
        <PortalInsightGrid insights={insights} />
      </PortalPanel>

      <PortalPanel title="Quick Actions" subtitle="Role-safe actions for the student workflow">
        <PortalQuickActions
          actions={[
            { label: 'Upload Homework', to: '/student/homework' },
            { label: 'Submit Assignment', to: '/student/assignments' },
            { label: 'View Timetable', to: '/student/timetable' },
            { label: 'Download Report Card', to: '/student/results' },
            { label: 'Apply Leave', disabled: true, hint: 'Leave workflow not configured' },
            { label: 'Message Teacher', disabled: true, hint: 'Messaging not configured' },
            { label: 'View Certificates', disabled: true, hint: 'Document vault readiness' },
          ]}
        />
      </PortalPanel>

      <div className="grid gap-5 xl:grid-cols-2">
        <PortalPanel title="Upcoming Work" subtitle="Homework, assignments, and announcements">
          <PortalTimeline items={timeline} />
        </PortalPanel>
        <PortalPanel title="Announcements" subtitle={`${notices.length} recent notice(s)`}>
          {notices.length ? (
            <div className="space-y-3">
              {notices.slice(0, 5).map((notice) => (
                <div key={notice.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{notice.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <PortalEmptyState title="No announcements" message="School notices will appear here." />
          )}
        </PortalPanel>
      </div>
    </PortalShell>
  );
}
