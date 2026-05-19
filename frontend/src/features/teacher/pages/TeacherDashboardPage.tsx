import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getTeacherDashboard } from '../api/teacherDashboardApi';
import { listMyAssignments } from '../api/teacherAssignmentApi';
import { listMyHomework } from '../api/teacherHomeworkApi';
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
import type { PortalInsight, PortalTimelineItem } from '@/features/role-portals/types/portal';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

function formatTime(value: string | null) {
  if (!value) return '-';
  const [hours = '0', minutes = '00'] = value.split(':');
  const hour = Number.parseInt(hours, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minutes} ${suffix}`;
}

function slotLabel(slot: TimetableSlot) {
  return slot.subjectName ?? slot.subjectCode ?? `Subject ${slot.subjectId.slice(0, 8)}`;
}

export default function TeacherDashboardPage() {
  const dashboardQuery = useQuery({ queryKey: ['teacher-dashboard'], queryFn: getTeacherDashboard });
  const homeworkQuery = useQuery({ queryKey: ['teacher-homework-dashboard', 0], queryFn: () => listMyHomework(0, 8) });
  const assignmentQuery = useQuery({ queryKey: ['teacher-assignments-dashboard', 0], queryFn: () => listMyAssignments(0, 8) });

  const isLoading = dashboardQuery.isLoading || homeworkQuery.isLoading || assignmentQuery.isLoading;
  const isError = dashboardQuery.isError || homeworkQuery.isError || assignmentQuery.isError;

  const dashboard = dashboardQuery.data;
  const homework = homeworkQuery.data?.items ?? [];
  const assignments = assignmentQuery.data?.items ?? [];

  const todaySlots = (dashboard?.todaySlots ?? []).slice().sort((a, b) => a.periodNumber - b.periodNumber);
  const reviewQueue = dashboard ? dashboard.pendingHomeworkReview + dashboard.pendingAssignmentGrading : 0;
  const publishedWork = dashboard ? dashboard.totalHomeworkPosted + dashboard.totalAssignmentsPosted : 0;
  const completionAverage = assignments.length
    ? Math.round(assignments.reduce((sum, item) => sum + (item.submissionCount ? (item.gradedCount / item.submissionCount) * 100 : 0), 0) / assignments.length)
    : 0;
  const workloadScore = Math.min(100, todaySlots.length * 12 + reviewQueue * 6 + publishedWork * 2);

  const chartData = [
    { label: 'Classes', value: todaySlots.length },
    { label: 'Review', value: dashboard?.pendingHomeworkReview ?? 0 },
    { label: 'Grading', value: dashboard?.pendingAssignmentGrading ?? 0 },
    { label: 'Posted', value: publishedWork },
  ];

  const insights: PortalInsight[] = [
    {
      title: 'Teaching Load',
      severity: workloadScore > 80 ? 'HIGH' : workloadScore > 55 ? 'MEDIUM' : 'LOW',
      summary: `Today's workload score is ${workloadScore} based on classes, pending review, and posted work.`,
      recommendation: workloadScore > 80 ? 'Prioritize grading windows and defer non-urgent uploads.' : 'Current workload is manageable.',
      confidence: 78,
    },
    {
      title: 'Evaluation Queue',
      severity: reviewQueue > 10 ? 'HIGH' : reviewQueue > 0 ? 'MEDIUM' : 'LOW',
      summary: `${reviewQueue} item(s) are waiting for review or grading.`,
      recommendation: reviewQueue ? 'Clear the oldest submissions first to reduce student feedback delay.' : 'No pending evaluation queue right now.',
      confidence: 86,
    },
    {
      title: 'Class Engagement',
      severity: publishedWork > 0 ? 'LOW' : 'INFO',
      summary: `${publishedWork} homework/assignment item(s) are linked to your teacher account.`,
      recommendation: publishedWork ? 'Review submission patterns to identify students needing help.' : 'Create homework or assignments to unlock engagement analytics.',
      confidence: publishedWork ? 72 : 45,
    },
  ];

  const timeline: PortalTimelineItem[] = [
    ...todaySlots.slice(0, 4).map((slot) => ({
      id: `slot-${slot.id}`,
      title: slotLabel(slot),
      summary: `Period ${slot.periodNumber} | ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
      category: 'CLASS',
    })),
    ...homework.slice(0, 3).map((item) => ({
      id: `homework-${item.homeworkId}`,
      title: item.title,
      summary: `${item.submissionCount} submission(s) | Due ${new Date(item.dueDate).toLocaleDateString()}`,
      category: 'HOMEWORK',
      occurredAt: item.dueDate,
    })),
    ...assignments.slice(0, 3).map((item) => ({
      id: `assignment-${item.assignmentId}`,
      title: item.title,
      summary: `${item.gradedCount}/${item.submissionCount} graded | Due ${new Date(item.dueDate).toLocaleDateString()}`,
      category: 'ASSIGNMENT',
      occurredAt: item.dueDate,
    })),
  ].slice(0, 9);

  if (isLoading) return <PortalSkeleton />;
  if (isError || !dashboard) {
    return (
      <PortalShell title="Teacher 360 Dashboard" subtitle="Faculty intelligence and classroom operations." eyebrow="Teacher Portal" tone="blue">
        <PortalErrorState message="Failed to load teacher dashboard. Please refresh." />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Teacher 360 Dashboard"
      subtitle={`You have ${todaySlots.length} class(es) today and ${reviewQueue} review item(s) waiting.`}
      eyebrow="Faculty Experience"
      tone="blue"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Today's Classes" value={todaySlots.length} helper="scheduled" tone="blue" />
        <PortalStatCard label="Attendance Tasks" value={todaySlots.length} helper="class-ready" tone="cyan" />
        <PortalStatCard label="Pending Review" value={reviewQueue} helper="homework + assignments" tone={reviewQueue ? 'amber' : 'emerald'} />
        <PortalStatCard label="Completion" value={`${completionAverage}%`} helper="grading efficiency" tone="violet" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <PortalPanel title="Today's Classes" subtitle="Classroom plan for the day">
          {todaySlots.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {todaySlots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Period {slot.periodNumber}</p>
                  <p className="mt-2 font-semibold text-slate-950">{slotLabel(slot)}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                </div>
              ))}
            </div>
          ) : (
            <PortalEmptyState title="No classes scheduled" message="Use this time for planning, feedback, or parent communication." />
          )}
        </PortalPanel>

        <PortalPanel title="Faculty Analytics" subtitle="Workload and classroom operations">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PortalPanel>
      </div>

      <PortalPanel title="AI Teaching Insights" subtitle="Teaching operations, workload, and feedback intelligence">
        <PortalInsightGrid insights={insights} />
      </PortalPanel>

      <PortalPanel title="Quick Actions" subtitle="Role-safe teacher workflows">
        <PortalQuickActions
          actions={[
            { label: 'Mark Attendance', to: '/teacher/attendance' },
            { label: 'Create Homework', to: '/teacher/homework' },
            { label: 'Enter Marks', to: '/school-admin/exams', disabled: true, hint: 'Use school-admin marks workflow' },
            { label: 'Upload Material', to: '/teacher/videos' },
            { label: 'Lesson Plans', to: '/teacher/lesson-plans' },
            { label: 'Review Leave', disabled: true, hint: 'Approval workflow is admin-owned' },
            { label: 'Add Student Remark', disabled: true, hint: 'Behavior notes not configured' },
            { label: 'Message Parents', disabled: true, hint: 'Messaging not configured' },
          ]}
        />
      </PortalPanel>

      <div className="grid gap-5 xl:grid-cols-2">
        <PortalPanel title="Activity Timeline" subtitle="Classes, homework, and assignment operations">
          <PortalTimeline items={timeline} />
        </PortalPanel>
        <PortalPanel title="Review Queues" subtitle="Submission work that may need attention">
          <div className="space-y-3">
            {homework.slice(0, 4).map((item) => (
              <div key={item.homeworkId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.submissionCount} homework submission(s)</p>
              </div>
            ))}
            {assignments.slice(0, 4).map((item) => (
              <div key={item.assignmentId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.gradedCount}/{item.submissionCount} assignment submission(s) graded</p>
              </div>
            ))}
            {!homework.length && !assignments.length && (
              <PortalEmptyState title="No review items" message="Homework and assignment activity will appear here." />
            )}
          </div>
        </PortalPanel>
      </div>
    </PortalShell>
  );
}
