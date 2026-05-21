import { Link } from 'react-router-dom';
import type { EntitlementPlanCode } from '@/shared/hooks/useEntitlement';
import { displayPlan } from '@/shared/hooks/useEntitlement';

type LockedFeatureProps = {
  title: string;
  description: string;
  requiredPlan: EntitlementPlanCode;
  compact?: boolean;
};

export function LockedFeature({ title, description, requiredPlan, compact = false }: LockedFeatureProps) {
  return (
    <div className={[
      'rounded-2xl border border-amber-200 bg-amber-50 text-amber-950',
      compact ? 'p-3' : 'p-5',
    ].join(' ')}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{displayPlan(requiredPlan)}</p>
          <h3 className={compact ? 'mt-1 text-sm font-black' : 'mt-1 text-lg font-black'}>{title}</h3>
          <p className={compact ? 'mt-1 text-xs leading-5 text-amber-800' : 'mt-2 text-sm leading-6 text-amber-800'}>
            {description}
          </p>
        </div>
        <Link
          to="/plan-upgrade"
          className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800"
        >
          View plans
        </Link>
      </div>
    </div>
  );
}
