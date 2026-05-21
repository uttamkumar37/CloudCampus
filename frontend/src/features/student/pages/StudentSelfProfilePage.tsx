import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getMyStudentProfile360, type ProfileSectionResponse, type TimelineItemResponse } from '../api/studentProfile360Api';
import {
  PortalEmptyState,
  PortalErrorState,
  PortalInsightGrid,
  PortalPanel,
  PortalShell,
  PortalSkeleton,
  PortalStatCard,
} from '@/features/role-portals/components/PortalDashboard';
import type { PortalInsight } from '@/features/role-portals/types/portal';

type BadgeTone = 'green' | 'amber' | 'blue' | 'violet' | 'slate' | 'rose';
type MetricTone = 'violet' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
type TabKey = 'overview' | 'personal' | 'academic' | 'attendance' | 'skills' | 'achievements' | 'documents' | 'health' | 'career' | 'timeline' | 'ai';

interface StudentBadge {
  label: string;
  tone: BadgeTone;
}

interface IdentityMetric {
  label: string;
  value: string;
  helper: string;
  tone: MetricTone;
}

interface TabDefinition {
  key: TabKey;
  label: string;
}

const tabs: TabDefinition[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal' },
  { key: 'academic', label: 'Academic' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'skills', label: 'Skills' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'documents', label: 'Documents' },
  { key: 'health', label: 'Health' },
  { key: 'career', label: 'Career' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'ai', label: 'AI Insights' },
];

const badgeToneClasses: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-700',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-700',
  blue: 'bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:ring-blue-700',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-700',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  rose: 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-700',
};

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.length ? value.map(valueText).join(', ') : '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function optionalText(value: unknown): string | undefined {
  const text = valueText(value);
  return text === '-' ? undefined : text;
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function listValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function splitTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(valueText).filter((item) => item !== '-');
  if (typeof value !== 'string') return [];
  return value.split(/[,|]/).map((item) => item.trim()).filter(Boolean);
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';
}

function findSection(sections: ProfileSectionResponse[], key: string) {
  return sections.find((section) => section.key === key);
}

function badgeList(value: unknown): StudentBadge[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const tone = String(record.tone ?? 'slate') as BadgeTone;
      return {
        label: valueText(record.label),
        tone: ['green', 'amber', 'blue', 'violet', 'slate', 'rose'].includes(tone) ? tone : 'slate',
      };
    })
    .filter((item): item is StudentBadge => Boolean(item && item.label !== '-'));
}

function toInsight(raw: Record<string, unknown>, index: number): PortalInsight {
  const severity = String(raw.severity ?? raw.level ?? 'INFO').toUpperCase();
  return {
    title: valueText(raw.title ?? `Insight ${index + 1}`),
    summary: valueText(raw.summary ?? raw.description ?? 'Profile insight is available.'),
    recommendation: valueText(raw.recommendation ?? raw.action ?? 'Review this with your class teacher if needed.'),
    severity: severity === 'HIGH' || severity === 'MEDIUM' || severity === 'LOW' ? severity : 'INFO',
    confidence: numberValue(raw.confidence ?? raw.confidencePercent, 70),
  };
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const bounded = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="grid h-28 w-28 place-items-center rounded-full"
      style={{ background: `conic-gradient(rgb(124 58 237) ${bounded * 3.6}deg, rgb(226 232 240) 0deg)` }}
      role="img"
      aria-label={`${label}: ${bounded}%`}
    >
      <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner dark:bg-slate-950">
        <span className="text-2xl font-black text-slate-950 dark:text-white">{bounded}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      </div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-white/45 bg-white/70 px-3 py-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-950 dark:text-white">{valueText(value)}</p>
    </div>
  );
}

function IdentityHero({
  displayName,
  header,
  personal,
  academics,
  profileCompletion,
  metrics,
  onRequestEdit,
  requestSent,
}: {
  displayName: string;
  header: Record<string, unknown>;
  personal?: ProfileSectionResponse;
  academics?: ProfileSectionResponse;
  profileCompletion: number;
  metrics: IdentityMetric[];
  onRequestEdit: () => void;
  requestSent: boolean;
}) {
  const badges = badgeList(header.badges);
  const photoUrl = optionalText(header.photoUrl ?? personal?.data.photoUrl);
  const className = [header.className ?? academics?.data.className, header.sectionName ?? academics?.data.sectionName]
    .map(optionalText)
    .filter(Boolean)
    .join(' - ');

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_32%),linear-gradient(135deg,_#f8fafc,_#eef2ff_48%,_#ecfeff)] p-5 dark:bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.35),_transparent_32%),linear-gradient(135deg,_#020617,_#111827_48%,_#082f49)] md:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-violet-100 shadow-xl dark:border-slate-900 dark:bg-violet-950">
              {photoUrl ? (
                <img src={photoUrl} alt={`${displayName} profile`} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-3xl font-black text-violet-700 dark:text-violet-100">
                  {initials(displayName)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-violet-800 ring-1 ring-violet-200 dark:bg-slate-900/80 dark:text-violet-100 dark:ring-violet-700">
                  360 Student Digital Identity
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800">
                  {valueText(header.status ?? personal?.data.status)}
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white md:text-4xl">{displayName}</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600 dark:text-slate-300">
                {valueText(header.preferredName ?? personal?.data.firstName)}'s academic identity, growth signals, achievements, wellbeing, and AI guidance in one student-friendly profile.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatusPill label="Student ID" value={header.studentId ?? personal?.data.studentNumber} />
                <StatusPill label="Admission No." value={header.admissionNumber ?? personal?.data.studentNumber} />
                <StatusPill label="Class & Section" value={className || header.classSection} />
                <StatusPill label="Academic Year" value={header.academicYear ?? academics?.data.academicYear} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(badges.length ? badges : [{ label: 'AI Recommended', tone: 'violet' as BadgeTone }]).map((badge) => (
                  <span key={badge.label} className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeToneClasses[badge.tone]}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 rounded-lg border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 sm:flex-row sm:items-center xl:flex-col">
            <ProgressRing value={profileCompletion} label="complete" />
            <div className="space-y-2">
              <div className="rounded-lg bg-slate-950 px-4 py-3 text-white shadow-sm dark:bg-white dark:text-slate-950">
                <p className="text-xs font-bold uppercase tracking-wide opacity-70">AI Score</p>
                <p className="mt-1 text-2xl font-black">{valueText(header.aiRiskScore)}/100</p>
              </div>
              <button
                type="button"
                onClick={onRequestEdit}
                className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              >
                Request Edit
              </button>
            </div>
          </div>
        </div>

        {requestSent && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100" role="status">
            Profile edit request noted for this session. School office approval is required before student records are changed.
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <PortalStatCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} tone={metric.tone} />
        ))}
      </div>
    </section>
  );
}

function ProfileTabs({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="sticky top-0 z-10 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95" aria-label="Student profile sections">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              active === tab.key
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-violet-50 hover:text-violet-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function FieldGrid({ items }: { items: Array<[string, unknown]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 break-words text-sm font-semibold text-slate-950 dark:text-white">{valueText(value)}</p>
        </div>
      ))}
    </div>
  );
}

function ProgressList({ items }: { items: Array<{ label: string; value: number; tone?: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const bounded = Math.max(0, Math.min(100, Math.round(item.value)));
        return (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{bounded}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-2 rounded-full ${item.tone ?? 'bg-violet-600'}`} style={{ width: `${bounded}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TagCloud({ tags, emptyTitle }: { tags: string[]; emptyTitle: string }) {
  if (!tags.length) return <PortalEmptyState title={emptyTitle} message="These details will appear after your school updates the profile." />;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-800 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-800">
          {tag}
        </span>
      ))}
    </div>
  );
}

function TrendBars({ rows, valueKey = 'percentage' }: { rows: unknown[]; valueKey?: string }) {
  if (!rows.length) return <PortalEmptyState title="No trend data" message="Performance trends will appear after exam results are published." />;
  return (
    <div className="space-y-3">
      {rows.slice(0, 8).map((row, index) => {
        const record = row && typeof row === 'object' ? row as Record<string, unknown> : {};
        const value = numberValue(record[valueKey], 0);
        return (
          <div key={`${valueKey}-${index}`} className="grid gap-2 sm:grid-cols-[8rem_1fr_3rem] sm:items-center">
            <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{valueText(record.label ?? record.grade ?? `Exam ${index + 1}`)}</p>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
            </div>
            <p className="text-right text-xs font-black text-slate-800 dark:text-slate-100">{value}%</p>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({ present, absent, late }: { present: number; absent: number; late: number }) {
  const total = Math.max(1, present + absent + late);
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, index) => {
        const weight = index / 35;
        const cls = weight < present / total
          ? 'bg-emerald-500'
          : weight < (present + late) / total
            ? 'bg-amber-400'
            : 'bg-rose-400';
        return <div key={index} className={`aspect-square rounded-md ${cls}`} aria-hidden="true" />;
      })}
    </div>
  );
}

function RecordCards({ rows, emptyTitle }: { rows: unknown[]; emptyTitle: string }) {
  if (!rows.length) return <PortalEmptyState title={emptyTitle} message="Records will appear here when your school publishes them." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.slice(0, 6).map((row, index) => {
        const record = row && typeof row === 'object' ? row as Record<string, unknown> : {};
        return (
          <article key={index} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white">{valueText(record.title ?? record.name ?? record.category ?? record.subject ?? `Record ${index + 1}`)}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{valueText(record.summary ?? record.description ?? record.notes ?? record.type)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(record).slice(0, 3).map(([key, value]) => (
                <span key={key} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {key}: {valueText(value)}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function TimelineFeed({ items, filter, onFilter }: { items: TimelineItemResponse[]; filter: string; onFilter: (value: string) => void }) {
  const filters = ['ALL', ...Array.from(new Set(items.map((item) => item.type).filter(Boolean)))];
  const visible = filter === 'ALL' ? items : items.filter((item) => item.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilter(item)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-black transition ${
              filter === item ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      {!visible.length ? (
        <PortalEmptyState title="No timeline activity" message="Academic and communication events will appear as your school records activity." />
      ) : (
        <div className="space-y-4">
          {visible.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-violet-600 ring-4 ring-violet-100 dark:ring-violet-950" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-950 dark:text-white">{item.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.type}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{new Date(item.occurredAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AiRiskGrid({ risks }: { risks: unknown[] }) {
  if (!risks.length) return <PortalEmptyState title="No risk signals" message="Risk analysis will appear as data quality improves." />;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {risks.map((risk, index) => {
        const record = risk && typeof risk === 'object' ? risk as Record<string, unknown> : {};
        const severity = valueText(record.severity);
        const cls = severity === 'HIGH' ? 'border-rose-200 bg-rose-50 text-rose-800' : severity === 'MEDIUM' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800';
        return (
          <article key={index} className={`rounded-lg border p-4 ${cls}`}>
            <p className="text-xs font-black uppercase tracking-wide">{severity}</p>
            <h3 className="mt-2 font-black">{valueText(record.label)}</h3>
            <p className="mt-2 text-sm">{valueText(record.explanation)}</p>
            <p className="mt-3 text-sm font-bold">{valueText(record.recommendedIntervention)}</p>
          </article>
        );
      })}
    </div>
  );
}

function renderActiveTab({
  activeTab,
  profile,
  sections,
  header,
  personal,
  identity,
  contact,
  attendance,
  interests,
  skills,
  achievements,
  documents,
  health,
  communication,
  ai,
  timelineFilter,
  setTimelineFilter,
  insightCards,
}: {
  activeTab: TabKey;
  profile: Awaited<ReturnType<typeof getMyStudentProfile360>>;
  sections: ProfileSectionResponse[];
  header: Record<string, unknown>;
  personal?: ProfileSectionResponse;
  identity?: ProfileSectionResponse;
  contact?: ProfileSectionResponse;
  attendance?: ProfileSectionResponse;
  interests?: ProfileSectionResponse;
  skills?: ProfileSectionResponse;
  achievements?: ProfileSectionResponse;
  documents?: ProfileSectionResponse;
  health?: ProfileSectionResponse;
  communication?: ProfileSectionResponse;
  ai?: ProfileSectionResponse;
  timelineFilter: string;
  setTimelineFilter: (value: string) => void;
  insightCards: PortalInsight[];
}) {
  const academicAnalytics = profile.academicAnalytics ?? {};
  const documentVault = profile.documentVault ?? {};
  const healthWellbeing = profile.healthWellbeing ?? {};
  const aiInsightRows = profile.aiInsights ?? [];
  const careerTags = [
    ...splitTags(skills?.data.careerGoals),
    ...splitTags(skills?.data.skills),
    ...aiInsightRows.filter((item) => String(item.category ?? '').toUpperCase() === 'CAREER').map((item) => valueText(item.summary)),
  ];
  const skillTags = [
    ...splitTags(skills?.data.skills),
    ...splitTags(interests?.data.interests),
    ...splitTags(interests?.data.hobbies),
    ...splitTags(interests?.data.likes),
  ];

  if (activeTab === 'overview') {
    const avg = numberValue(academicAnalytics.averagePercentage);
    const assignmentCompletion = numberValue(academicAnalytics.assignmentCompletionPercent);
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PortalStatCard label="Attendance" value={`${numberValue(attendance?.data.attendancePercent)}%`} helper="current attendance" tone="emerald" />
          <PortalStatCard label="Performance" value={`${avg}%`} helper={valueText(academicAnalytics.latestGrade ?? 'GPA trend')} tone="blue" />
          <PortalStatCard label="Homework" value={valueText(academicAnalytics.homeworkSubmissionCount)} helper="submitted items" tone="violet" />
          <PortalStatCard label="AI Focus" value={`${Math.max(0, 100 - numberValue(header.aiRiskScore))}%`} helper={valueText(ai?.data.aiRiskLevel ?? 'NORMAL')} tone="amber" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
          <PortalPanel title="Learning Consistency" subtitle="Profile, attendance, assignments, and readiness signals">
            <ProgressList items={[
              { label: 'Profile completion', value: profile.profileCompletionPercent, tone: 'bg-violet-600' },
              { label: 'Attendance consistency', value: numberValue(attendance?.data.attendancePercent), tone: 'bg-emerald-600' },
              { label: 'Assignment completion', value: assignmentCompletion, tone: 'bg-blue-600' },
              { label: 'Exam readiness', value: numberValue(academicAnalytics.examReadinessScore), tone: 'bg-amber-500' },
            ]} />
          </PortalPanel>
          <PortalPanel title="Priority Actions" subtitle="Suggested next steps from profile completeness">
            <div className="space-y-3">
              {listValue(profile.completion?.suggestedActions).slice(0, 5).map((item, index) => (
                <div key={index} className="rounded-lg border border-violet-100 bg-violet-50 p-4 text-sm font-bold text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
                  {valueText(item)}
                </div>
              ))}
              {!listValue(profile.completion?.suggestedActions).length && <PortalEmptyState title="No priority actions" message="Your profile has no urgent completion action right now." />}
            </div>
          </PortalPanel>
        </div>
      </div>
    );
  }

  if (activeTab === 'personal') {
    return (
      <div className="space-y-5">
        <PortalPanel title="Personal Details" subtitle="Identity, contact, interests, and student preferences">
          <FieldGrid items={[
            ['Preferred Name', header.preferredName ?? personal?.data.firstName],
            ['Date of Birth', personal?.data.dateOfBirth],
            ['Gender', personal?.data.gender],
            ['Nationality', identity?.data.nationality],
            ['Mother Tongue', identity?.data.motherTongue],
            ['Phone', contact?.data.phone],
            ['Address', contact?.data.address],
            ['Emergency Contact', contact?.data.emergencyContactName ?? healthWellbeing.emergencyContacts],
            ['Favorite Subjects', interests?.data.likes],
            ['Learning Style', skills?.data.learningStyle],
            ['Strengths', skills?.data.skills],
            ['Career Aspiration', skills?.data.careerGoals],
          ]} />
        </PortalPanel>
        <PortalPanel title="Interests And Hobbies" subtitle="Student-friendly identity tags">
          <TagCloud tags={[...splitTags(interests?.data.interests), ...splitTags(interests?.data.hobbies), ...splitTags(interests?.data.likes)]} emptyTitle="No interests recorded" />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'academic') {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PortalStatCard label="Average" value={`${valueText(academicAnalytics.averagePercentage)}%`} helper="exam performance" tone="blue" />
          <PortalStatCard label="Latest Grade" value={valueText(academicAnalytics.latestGrade)} helper="published result" tone="violet" />
          <PortalStatCard label="Latest Rank" value={valueText(academicAnalytics.latestRank)} helper="rank trend" tone="amber" />
          <PortalStatCard label="Assignments" value={`${valueText(academicAnalytics.assignmentCompletionPercent)}%`} helper="completion" tone="emerald" />
        </div>
        <PortalPanel title="Academic Growth Chart" subtitle="Recent exam and performance movement">
          <TrendBars rows={listValue(academicAnalytics.performanceTrend)} />
        </PortalPanel>
        <PortalPanel title="Teacher Remarks" subtitle="Published academic remarks">
          <RecordCards rows={listValue(academicAnalytics.teacherRemarks).map((remark) => ({ title: 'Teacher Remark', summary: remark }))} emptyTitle="No teacher remarks" />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'attendance') {
    const present = numberValue(attendance?.data.present);
    const absent = numberValue(attendance?.data.absent);
    const late = numberValue(attendance?.data.late);
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PortalStatCard label="Attendance" value={`${numberValue(attendance?.data.attendancePercent)}%`} helper={valueText(header.attendanceStreak)} tone="emerald" />
          <PortalStatCard label="Present" value={present} helper="marked present" tone="blue" />
          <PortalStatCard label="Absent" value={absent} helper="absence count" tone={absent > 5 ? 'rose' : 'slate'} />
          <PortalStatCard label="Late" value={late} helper="late arrivals" tone={late > 3 ? 'amber' : 'slate'} />
        </div>
        <PortalPanel title="Attendance Heatmap" subtitle="Color-coded attendance distribution">
          <Heatmap present={present} absent={absent} late={late} />
        </PortalPanel>
        <PortalPanel title="AI Attendance Risk" subtitle="Student-safe interpretation">
          <AiRiskGrid risks={listValue(profile.riskProfile).filter((item) => valueText((item as Record<string, unknown>).label).includes('Attendance'))} />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'skills') {
    return (
      <div className="space-y-5">
        <PortalPanel title="Skills And Interests" subtitle="Modern student portfolio tags">
          <TagCloud tags={skillTags} emptyTitle="No skills recorded" />
        </PortalPanel>
        <PortalPanel title="Skill Indicators" subtitle="Estimated progress indicators from available profile data">
          <ProgressList items={[
            { label: 'Communication', value: skillTags.some((tag) => tag.toLowerCase().includes('communication')) ? 78 : 45, tone: 'bg-blue-600' },
            { label: 'Leadership', value: skillTags.some((tag) => tag.toLowerCase().includes('leader')) ? 82 : 42, tone: 'bg-violet-600' },
            { label: 'Creativity', value: skillTags.some((tag) => /music|art|dance|creative/i.test(tag)) ? 84 : 48, tone: 'bg-amber-500' },
            { label: 'Teamwork', value: skillTags.some((tag) => /sport|club|team/i.test(tag)) ? 80 : 50, tone: 'bg-emerald-600' },
          ]} />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'achievements') {
    return (
      <div className="space-y-5">
        <PortalPanel title="Achievements And Portfolio" subtitle="Certificates, competitions, projects, and leadership highlights">
          <RecordCards rows={listValue(achievements?.data.recentRecords)} emptyTitle="No achievements yet" />
        </PortalPanel>
        <PortalPanel title="Portfolio Signals" subtitle="Badges and growth highlights">
          <TagCloud tags={badgeList(header.badges).map((badge) => badge.label)} emptyTitle="No portfolio badges" />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'documents') {
    const requiredTypes = listValue(documentVault.requiredTypes).map(valueText);
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PortalStatCard label="Documents" value={valueText(documents?.data.documentCount ?? documentVault.documentCount)} helper="secure vault" tone="blue" />
          <PortalStatCard label="Preview" value={valueText(documentVault.previewSupported)} helper="permission aware" tone="violet" />
          <PortalStatCard label="Download" value={valueText(documentVault.downloadSupported)} helper="secured access" tone="emerald" />
          <PortalStatCard label="History" value={valueText(documentVault.uploadHistoryAvailable)} helper="audit-ready" tone="amber" />
        </div>
        <PortalPanel title="Document Vault" subtitle="Read-only overview of required school documents">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requiredTypes.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="font-black text-slate-950 dark:text-white">{item.replaceAll('_', ' ')}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Preview and download follow school document permissions.</p>
              </div>
            ))}
          </div>
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'health') {
    return (
      <div className="space-y-5">
        <PortalPanel title="Health And Wellness" subtitle="Medical, emergency, and wellbeing details">
          <FieldGrid items={[
            ['Blood Group', healthWellbeing.bloodGroup ?? header.bloodGroup],
            ['Allergies', healthWellbeing.allergies],
            ['Medical Conditions', healthWellbeing.medicalConditions],
            ['Vaccinations', healthWellbeing.vaccinationRecords],
            ['Emergency Contacts', healthWellbeing.emergencyContacts],
            ['Doctor Details', healthWellbeing.doctorDetails],
            ['Fitness Notes', healthWellbeing.physicalFitnessIndicators],
            ['Wellness Notes', healthWellbeing.mentalWellnessNotes],
          ]} />
        </PortalPanel>
        <PortalPanel title="Recent Medical Records" subtitle="School health records visible to the student">
          <RecordCards rows={listValue(health?.data.recentRecords)} emptyTitle="No medical records" />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'career') {
    return (
      <div className="space-y-5">
        <PortalPanel title="Career And Future" subtitle="Goals, aspirations, skill gaps, and AI learning roadmap">
          <FieldGrid items={[
            ['Career Goals', skills?.data.careerGoals],
            ['Learning Style', skills?.data.learningStyle],
            ['Current Skills', skills?.data.skills],
            ['Counseling Summary', findSection(sections, 'behavior')?.data.counselingSummary],
            ['AI Career Signal', aiInsightRows.find((item) => String(item.category ?? '').toUpperCase() === 'CAREER')?.summary],
            ['Recommended Action', aiInsightRows.find((item) => String(item.category ?? '').toUpperCase() === 'CAREER')?.recommendation],
          ]} />
        </PortalPanel>
        <PortalPanel title="Learning Roadmap" subtitle="Recommended future-ready growth areas">
          <TagCloud tags={careerTags.length ? careerTags : ['Build portfolio', 'Capture certifications', 'Review teacher recommendations', 'Set entrance targets']} emptyTitle="No career roadmap" />
        </PortalPanel>
      </div>
    );
  }

  if (activeTab === 'timeline') {
    return (
      <PortalPanel title="Timeline And Activity Feed" subtitle="Homework, exams, achievements, milestones, certificates, and teacher remarks">
        <TimelineFeed items={profile.timeline} filter={timelineFilter} onFilter={setTimelineFilter} />
      </PortalPanel>
    );
  }

  return (
    <div className="space-y-5">
      <PortalPanel title="AI Insight Cards" subtitle="Weak subjects, focus, readiness, career guidance, confidence, and recommendations">
        <PortalInsightGrid insights={insightCards} />
      </PortalPanel>
      <PortalPanel title="Risk Management" subtitle="Academic, attendance, behavior, finance, and wellness risk signals">
        <AiRiskGrid risks={profile.riskProfile ?? []} />
      </PortalPanel>
      <PortalPanel title="Communication Summary" subtitle="Recent teacher and parent communication intelligence">
        <FieldGrid items={[
          ['Teacher Notes', profile.communicationCenter?.teacherNotes],
          ['Parent Logs', profile.communicationCenter?.parentLogs],
          ['Notifications', profile.communicationCenter?.notifications],
          ['Meeting Summaries', profile.communicationCenter?.meetingSummaries],
          ['AI Summary', profile.communicationCenter?.aiSummary],
          ['Recent Communication', communication?.data.recentRecords],
        ]} />
      </PortalPanel>
    </div>
  );
}

export default function StudentSelfProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [requestSent, setRequestSent] = useState(false);
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['student-self-profile-360'],
    queryFn: getMyStudentProfile360,
  });

  if (isLoading) return <PortalSkeleton />;
  if (isError || !profile) {
    return (
      <PortalShell title="My 360 Profile" subtitle="Your student intelligence profile." eyebrow="Student Portal" tone="violet">
        <PortalErrorState message="Failed to load your profile. Please refresh or contact the school office." />
      </PortalShell>
    );
  }

  const sections = profile.sections ?? [];
  const header = profile.header ?? {};
  const personal = findSection(sections, 'personal');
  const identity = findSection(sections, 'identity');
  const contact = findSection(sections, 'contact');
  const academics = findSection(sections, 'academics');
  const attendance = findSection(sections, 'attendance');
  const interests = findSection(sections, 'interests');
  const skills = findSection(sections, 'skills');
  const achievements = findSection(sections, 'achievements');
  const documents = findSection(sections, 'documents');
  const health = findSection(sections, 'health');
  const communication = findSection(sections, 'communication');
  const ai = findSection(sections, 'ai');
  const insightCards = (profile.aiInsights ?? []).map(toInsight);
  const displayName = valueText(header.fullName ?? `${valueText(personal?.data.firstName)} ${valueText(personal?.data.lastName)}`.trim());
  const attendancePercent = numberValue(profile.quickStats.attendancePercent ?? attendance?.data.attendancePercent);
  const profileCompletion = Math.max(0, Math.min(100, profile.profileCompletionPercent));
  const aiRiskScore = numberValue(header.aiRiskScore, 0);
  const metrics: IdentityMetric[] = [
    {
      label: 'Attendance',
      value: `${attendancePercent}%`,
      helper: valueText(header.attendanceStreak),
      tone: attendancePercent >= 90 ? 'emerald' : attendancePercent >= 75 ? 'amber' : 'rose',
    },
    {
      label: 'Documents',
      value: valueText(profile.quickStats.documents ?? documents?.data.documentCount),
      helper: 'vault records',
      tone: 'blue',
    },
    {
      label: 'Achievements',
      value: valueText(profile.quickStats.achievements ?? achievements?.data.recordCount),
      helper: 'portfolio signals',
      tone: 'violet',
    },
    {
      label: 'AI Readiness',
      value: `${Math.max(0, 100 - aiRiskScore)}%`,
      helper: valueText(ai?.data.aiRiskLevel ?? 'NORMAL'),
      tone: aiRiskScore >= 70 ? 'rose' : aiRiskScore >= 40 ? 'amber' : 'emerald',
    },
  ];

  return (
    <PortalShell
      title="My 360 Profile"
      subtitle={`${displayName === '-' ? 'Your profile' : displayName} with academic, attendance, health, interest, skill, and AI readiness signals.`}
      eyebrow="Student Intelligence"
      tone="violet"
    >
      <IdentityHero
        displayName={displayName}
        header={header}
        personal={personal}
        academics={academics}
        profileCompletion={profileCompletion}
        metrics={metrics}
        requestSent={requestSent}
        onRequestEdit={() => setRequestSent(true)}
      />

      <ProfileTabs active={activeTab} onChange={setActiveTab} />

      {renderActiveTab({
        activeTab,
        profile,
        sections,
        header,
        personal,
        identity,
        contact,
        attendance,
        interests,
        skills,
        achievements,
        documents,
        health,
        communication,
        ai,
        timelineFilter,
        setTimelineFilter,
        insightCards,
      })}
    </PortalShell>
  );
}
