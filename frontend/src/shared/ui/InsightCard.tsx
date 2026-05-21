import type { AiInsightCardContract, AiInsightSeverity } from '@/shared/types/aiInsight';

const severityClasses: Record<AiInsightSeverity, string> = {
  INFO: 'border-sky-200 bg-sky-50 text-sky-800',
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-800',
  HIGH: 'border-rose-200 bg-rose-50 text-rose-800',
};

export function InsightCard({ insight }: { insight: AiInsightCardContract }) {
  const confidence = Math.max(0, Math.min(100, insight.confidence));

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{insight.audience.replace('_', ' ')}</p>
          <h3 className="mt-1 font-semibold text-slate-950">{insight.title}</h3>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${severityClasses[insight.severity]}`}>
          {insight.severity}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{insight.summary}</p>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-800">{insight.recommendation}</p>
      {insight.signals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {insight.signals.map((signal) => (
            <span key={signal} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {signal}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${confidence}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{confidence}% confidence</p>
    </article>
  );
}
