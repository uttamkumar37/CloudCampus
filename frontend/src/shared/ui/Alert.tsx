type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertVariant, { container: string; icon: string }> = {
  info: { container: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'ℹ' },
  success: { container: 'bg-green-50 border-green-200 text-green-800', icon: '✓' },
  warning: { container: 'bg-amber-50 border-amber-200 text-amber-800', icon: '⚠' },
  error: { container: 'bg-red-50 border-red-200 text-red-800', icon: '✕' },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', title, children, onDismiss, className = '' }: AlertProps) {
  const { container, icon } = styles[variant];

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${container} ${className}`}
    >
      <span className="shrink-0 font-bold" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 self-start text-current opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
