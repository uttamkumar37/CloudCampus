import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type MetricTone = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';

const toneClasses: Record<MetricTone, string> = {
  blue: 'border-blue-100 bg-blue-50 text-blue-900',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-100 bg-amber-50 text-amber-900',
  rose: 'border-rose-100 bg-rose-50 text-rose-900',
  violet: 'border-violet-100 bg-violet-50 text-violet-900',
  slate: 'border-slate-200 bg-white text-slate-900',
};

export function MetricCard({
  label,
  value,
  helper,
  tone = 'slate',
  to,
  icon,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: MetricTone;
  to?: string;
  icon?: ReactNode;
}) {
  const card = (
    <div className={`h-full rounded-lg border p-4 shadow-sm transition ${toneClasses[tone]} ${to ? 'hover:-translate-y-0.5 hover:shadow-md' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
        {icon && <span className="shrink-0 opacity-75">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {helper && <p className="mt-2 text-sm leading-6 opacity-80">{helper}</p>}
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}
