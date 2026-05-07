import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn('cc-input', className)}
      {...props}
    />
  )
}
