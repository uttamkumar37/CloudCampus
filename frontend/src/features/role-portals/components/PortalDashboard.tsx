import { Link } from 'react-router-dom';
import type { PortalInsight, PortalQuickAction, PortalTimelineItem, PortalTone } from '../types/portal';

const toneClasses: Record<PortalTone, string> = {
  cyan: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  blue: 'bg-blue-50 text-blue-800 ring-blue-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  rose: 'bg-rose-50 text-rose-800 ring-rose-200',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const severityClasses: Record<PortalInsight['severity'], string> = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-800',
  HIGH: 'border-rose-200 bg-rose-50 text-rose-800',
  INFO: 'border-sky-200 bg-sky-50 text-sky-800',
};

export function PortalShell({
  title,
  subtitle,
  eyebrow,
  tone = 'cyan',
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  tone?: PortalTone;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${toneClasses[tone]}`}>
                {eyebrow}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{title}</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function PortalStatCard({
  label,
  value,
  helper,
  tone = 'cyan',
}: {
  label: string;
  value: React.ReactNode;
  helper?: string;
  tone?: PortalTone;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {helper && <p className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${toneClasses[tone]}`}>{helper}</p>}
    </div>
  );
}

export function PortalPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function PortalEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function PortalErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      {message}
    </div>
  );
}

export function PortalSkeleton() {
  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6" role="status">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-36 animate-pulse rounded-lg bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function PortalInsightGrid({ insights }: { insights: PortalInsight[] }) {
  if (!insights.length) {
    return <PortalEmptyState title="No insights yet" message="More activity data will unlock AI recommendations." />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => (
        <article key={insight.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-slate-950">{insight.title}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${severityClasses[insight.severity]}`}>
              {insight.severity}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{insight.summary}</p>
          <p className="mt-3 text-sm font-medium text-slate-800">{insight.recommendation}</p>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${Math.max(0, Math.min(100, insight.confidence))}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{insight.confidence}% confidence</p>
        </article>
      ))}
    </div>
  );
}

export function PortalQuickActions({ actions }: { actions: PortalQuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => {
        const cls = action.disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
          : 'border-slate-200 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50';
        const content = (
          <span className={`block rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm transition ${cls}`}>
            {action.label}
            {action.hint && <span className="mt-1 block text-xs font-normal text-slate-500">{action.hint}</span>}
          </span>
        );
        return action.to && !action.disabled ? <Link key={action.label} to={action.to}>{content}</Link> : <div key={action.label}>{content}</div>;
      })}
    </div>
  );
}

export function PortalTimeline({ items }: { items: PortalTimelineItem[] }) {
  if (!items.length) {
    return <PortalEmptyState title="No timeline activity" message="Recent academic and communication events will appear here." />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-cyan-600 ring-4 ring-cyan-100" />
          <div className="min-w-0 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{item.category}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
            {item.occurredAt && <p className="mt-1 text-xs text-slate-500">{new Date(item.occurredAt).toLocaleDateString()}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
