import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext, type Toast, type ToastVariant } from './ToastContext';

// ── Styles ────────────────────────────────────────────────────────────────────

const variantStyles: Record<ToastVariant, { bar: string; icon: string; label: string }> = {
  success: { bar: 'bg-green-500', icon: '✓', label: 'text-green-700' },
  error: { bar: 'bg-red-500', icon: '✕', label: 'text-red-700' },
  warning: { bar: 'bg-amber-400', icon: '⚠', label: 'text-amber-700' },
  info: { bar: 'bg-blue-500', icon: 'ℹ', label: 'text-blue-700' },
};

// ── Single Toast Item ─────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { bar, icon, label } = variantStyles[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const remove = useCallback(() => onRemove(toast.id), [onRemove, toast.id]);

  useEffect(() => {
    timerRef.current = setTimeout(remove, toast.duration ?? 4000);
    return () => clearTimeout(timerRef.current);
  }, [remove, toast.duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-80 max-w-full items-start gap-3 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5"
    >
      <div className={`w-1 self-stretch shrink-0 rounded-l-xl ${bar}`} aria-hidden="true" />
      <div className="flex flex-1 gap-2 py-3 pr-3 min-w-0">
        <span className={`shrink-0 text-sm font-bold ${label}`} aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          )}
          <p className="text-sm text-gray-600">{toast.message}</p>
        </div>
        <button
          onClick={remove}
          aria-label="Dismiss notification"
          className="shrink-0 self-start text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const success = useCallback((message: string, title?: string) => toast({ variant: 'success', message, title }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ variant: 'error', message, title }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ variant: 'warning', message, title }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ variant: 'info', message, title }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {createPortal(
        <div
          aria-label="Notifications"
          className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2"
        >
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={remove} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
