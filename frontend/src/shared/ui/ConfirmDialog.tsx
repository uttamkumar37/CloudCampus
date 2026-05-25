import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  reasonRequired?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  reasonRequired = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter reason',
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const trimmedReason = reason.trim();
  const reasonMissing = reasonRequired && !trimmedReason;

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      {reasonRequired && (
        <label className="block pb-3 text-sm font-medium text-gray-700">
          <span>{reasonLabel}</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            maxLength={1000}
            className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          size="sm"
          onClick={() => onConfirm(trimmedReason)}
          loading={loading}
          disabled={reasonMissing}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
