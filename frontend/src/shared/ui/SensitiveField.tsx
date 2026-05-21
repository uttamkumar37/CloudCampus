import type { ReactNode } from 'react';

export function SensitiveField({
  label,
  value,
  visible,
  reason = 'Restricted by role policy',
}: {
  label: string;
  value: ReactNode;
  visible: boolean;
  reason?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      {visible ? (
        <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
      ) : (
        <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          Hidden · {reason}
        </div>
      )}
    </div>
  );
}
