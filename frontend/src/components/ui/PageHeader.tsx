import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  badge?: { label: string; tone?: 'green' | 'amber' | 'blue' | 'slate' }
}

export function PageHeader({ title, subtitle, action, badge }: PageHeaderProps) {
  const badgeClass: Record<string, string> = {
    green: 'cc-badge cc-badge-green',
    amber: 'cc-badge cc-badge-amber',
    blue:  'cc-badge cc-badge-blue',
    slate: 'cc-badge cc-badge-slate',
  }

  return (
    <div className="cc-fade-up flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge && (
            <span className={badgeClass[badge.tone ?? 'slate']}>
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
