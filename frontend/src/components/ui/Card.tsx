import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/cn'

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'bordered'
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  const base = 'rounded-2xl bg-white'
  const variants: Record<string, string> = {
    default:  'border border-slate-200 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.12)]',
    flat:     'border border-slate-100',
    bordered: 'border-2 border-slate-200',
  }

  return (
    <div
      className={cn(base, variants[variant], 'p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
