import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getChildFees,
  getChildHomework,
  getChildResults,
  getMyChildren,
  getNotices,
} from '../api/parentApi';
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

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function statusTone(pct: number) {
  if (pct >= 85) return 'emerald';
  if (pct >= 70) return 'amber';
  return 'rose';
}

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const childrenQuery = useQuery({
    queryKey: ['parent-children'],
    queryFn: getMyChildren,
  });

  const children = childrenQuery.data ?? [];
  const activeChild = children.find((child) => child.studentId === selectedChildId) ?? children[0];

  const feeQueries = useQueries({
    queries: children.map((child) => ({
      queryKey: ['parent-child-fees', child.studentId],
      queryFn: () => getChildFees(child.studentId),
      enabled: children.length > 0,
    })),
  });

  const homeworkQueries = useQueries({
    queries: children.map((child) => ({
      queryKey: ['parent-child-homework', child.studentId],
      queryFn: () => getChildHomework(child.studentId),
      enabled: children.length > 0,
    })),
  });

  const resultQueries = useQueries({
    queries: children.map((child) => ({
      queryKey: ['parent-child-results', child.studentId],
      queryFn: () => getChildResults(child.studentId),
      enabled: children.length > 0,
    })),
  });

  const noticesQuery = useQuery({
    queryKey: ['parent-notices', 0],
    queryFn: () => getNotices(0),
  });

  const isLoading = childrenQuery.isLoading || noticesQuery.isLoading || feeQueries.some((query) => query.isLoading)
    || homeworkQueries.some((query) => query.isLoading) || resultQueries.some((query) => query.isLoading);
  const isError = childrenQuery.isError || noticesQuery.isError || feeQueries.some((query) => query.isError)
    || homeworkQueries.some((query) => query.isError) || resultQueries.some((query) => query.isError);

  const childRows = useMemo(() => children.map((child, index) => {
    const fees = feeQueries[index]?.data ?? [];
    const homework = homeworkQueries[index]?.data ?? [];
    const results = resultQueries[index]?.data ?? [];
    return {
      child,
      feeBalance: fees.reduce((sum, fee) => sum + fee.balance, 0),
      homeworkDue: homework.filter((item) => item.status === 'PUBLISHED').length,
      latestResult: results[0],
    };
  }), [children, feeQueries, homeworkQueries, resultQueries]);

  const activeRow = childRows.find((row) => row.child.studentId === activeChild?.studentId);
  const totalFeeBalance = childRows.reduce((sum, row) => sum + row.feeBalance, 0);
  const totalHomework = childRows.reduce((sum, row) => sum + row.homeworkDue, 0);
  const avgAttendance = children.length
    ? Math.round(children.reduce((sum, child) => sum + child.attendancePct, 0) / children.length)
    : 0;
  const noticeItems = noticesQuery.data?.items ?? [];

  const insights: PortalInsight[] = activeChild ? [
    {
      title: 'Child Progress Summary',
      severity: activeChild.attendancePct >= 85 ? 'LOW' : activeChild.attendancePct >= 70 ? 'MEDIUM' : 'HIGH',
      summary: `${activeChild.firstName}'s attendance is ${activeChild.attendancePct}%.`,
      recommendation: activeChild.attendancePct < 85 ? 'Check missed classwork and coordinate attendance routines.' : 'Attendance is steady. Keep reinforcing the routine.',
      confidence: 86,
    },
    {
      title: 'Homework Watch',
      severity: activeRow?.homeworkDue ? 'MEDIUM' : 'LOW',
      summary: `${activeRow?.homeworkDue ?? 0} published homework item(s) are visible for ${activeChild.firstName}.`,
      recommendation: activeRow?.homeworkDue ? 'Review homework status every evening and confirm submissions.' : 'No immediate homework pressure detected.',
      confidence: 74,
    },
    {
      title: 'Finance Reminder',
      severity: activeRow && activeRow.feeBalance > 0 ? 'MEDIUM' : 'LOW',
      summary: `Current fee balance is ${currency(activeRow?.feeBalance ?? 0)}.`,
      recommendation: activeRow && activeRow.feeBalance > 0 ? 'Review fee records and download receipts after payment.' : 'No outstanding fee follow-up needed.',
      confidence: 82,
    },
  ] : [];

  const timeline: PortalTimelineItem[] = [
    ...childRows.slice(0, 4).map((row) => ({
      id: `child-${row.child.studentId}`,
      title: `${row.child.firstName} ${row.child.lastName}`,
      summary: `Attendance ${row.child.attendancePct}% | Homework ${row.homeworkDue} | Balance ${currency(row.feeBalance)}`,
      category: 'CHILD',
    })),
    ...noticeItems.slice(0, 4).map((notice) => ({
      id: `notice-${notice.id}`,
      title: notice.title,
      summary: notice.category,
      category: 'NOTICE',
      occurredAt: notice.publishedAt,
    })),
  ];

  const chartData = childRows.map((row) => ({
    label: row.child.firstName,
    attendance: row.child.attendancePct,
    homework: row.homeworkDue,
    fee: row.feeBalance,
  }));

  if (isLoading) return <PortalSkeleton />;
  if (isError) {
    return (
      <PortalShell title="Parent 360 Dashboard" subtitle="Family engagement and child progress center." eyebrow="Parent Portal" tone="emerald">
        <PortalErrorState message="Failed to load parent dashboard. Please refresh." />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Parent 360 Dashboard"
      subtitle={children.length ? `Monitoring ${children.length} linked student${children.length !== 1 ? 's' : ''} with attendance, homework, finance, and progress signals.` : 'No linked children found.'}
      eyebrow="Parent Experience"
      tone="emerald"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Linked Children" value={children.length} helper="family access" tone="emerald" />
        <PortalStatCard label="Avg Attendance" value={`${avgAttendance}%`} helper="all children" tone={statusTone(avgAttendance)} />
        <PortalStatCard label="Homework Status" value={totalHomework} helper="published items" tone={totalHomework ? 'amber' : 'emerald'} />
        <PortalStatCard label="Fee Balance" value={currency(totalFeeBalance)} helper="family total" tone={totalFeeBalance ? 'rose' : 'slate'} />
      </div>

      {children.length === 0 ? (
        <PortalPanel title="Children" subtitle="Linked child access">
          <PortalEmptyState title="No children linked" message="Contact your school administrator to link your child." />
        </PortalPanel>
      ) : (
        <>
          <PortalPanel title="Children Switcher" subtitle="Select a child to focus the dashboard intelligence">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {childRows.map((row) => {
                const selected = row.child.studentId === activeChild?.studentId;
                return (
                  <button
                    key={row.child.studentId}
                    onClick={() => setSelectedChildId(row.child.studentId)}
                    className={`rounded-lg border p-4 text-left shadow-sm transition ${selected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{row.child.firstName} {row.child.lastName}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.child.studentNumber ?? 'Student'} | {row.child.relationship.toLowerCase()}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                        {row.child.attendancePct}%
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span>Homework: {row.homeworkDue}</span>
                      <span>Balance: {currency(row.feeBalance)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </PortalPanel>

          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <PortalPanel title="Family Analytics" subtitle="Attendance, homework, and finance overview">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#059669" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="homework" fill="#d97706" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PortalPanel>

            <PortalPanel title="Focused Child" subtitle={activeChild ? `${activeChild.firstName}'s current signals` : undefined}>
              {activeChild && activeRow ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Attendance</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">{activeChild.attendancePct}%</p>
                    <p className="mt-1 text-sm text-slate-600">{activeChild.presentCount} of {activeChild.totalSessions} sessions present</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">Homework</p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">{activeRow.homeworkDue}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">Latest Result</p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">{activeRow.latestResult?.percentage?.toFixed(1) ?? '-'}%</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/parent/children/${activeChild.studentId}`)}
                    className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    View Child Profile
                  </button>
                </div>
              ) : (
                <PortalEmptyState title="No child selected" message="Choose a linked child above." />
              )}
            </PortalPanel>
          </div>
        </>
      )}

      <PortalPanel title="AI Parent Recommendations" subtitle="Actionable child progress and family engagement prompts">
        <PortalInsightGrid insights={insights} />
      </PortalPanel>

      <PortalPanel title="Quick Actions" subtitle="Parent workflows with unavailable features safely disabled">
        <PortalQuickActions
          actions={[
            { label: 'Apply Leave', disabled: true, hint: 'Leave workflow not configured' },
            { label: 'Pay Fees', to: activeChild ? `/parent/children/${activeChild.studentId}` : undefined, disabled: !activeChild },
            { label: 'Download Receipt', to: activeChild ? `/parent/children/${activeChild.studentId}` : undefined, disabled: !activeChild },
            { label: 'View Report Card', to: activeChild ? `/parent/children/${activeChild.studentId}` : undefined, disabled: !activeChild },
            { label: 'Book Meeting', disabled: true, hint: 'Meeting scheduler not configured' },
            { label: 'Message Teacher', disabled: true, hint: 'Messaging not configured' },
            { label: 'Approve Leave', disabled: true, hint: 'Approval workflow not configured' },
          ]}
        />
      </PortalPanel>

      <div className="grid gap-5 xl:grid-cols-2">
        <PortalPanel title="Activity Timeline" subtitle="Child progress and school notices">
          <PortalTimeline items={timeline} />
        </PortalPanel>
        <PortalPanel title="Announcements" subtitle={`${noticeItems.length} recent notice(s)`}>
          {noticeItems.length ? (
            <div className="space-y-3">
              {noticeItems.slice(0, 5).map((notice) => (
                <div key={notice.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{notice.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <PortalEmptyState title="No announcements" message="School announcements will appear here." />
          )}
        </PortalPanel>
      </div>
    </PortalShell>
  );
}
