import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  busy = false,
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="confirm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="stack">
          <div className="confirm-dialog-header">
            <div>
              <p className="confirm-dialog-eyebrow">Konfirmasi</p>
              <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
            </div>
            <button className="btn btn-ghost confirm-dialog-close" type="button" onClick={onClose} aria-label="Tutup dialog">
              ×
            </button>
          </div>
          <p id="confirm-dialog-description" className="confirm-dialog-description">{description}</p>
          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={busy}>
              {cancelLabel}
            </button>
            <button className="btn btn-primary" type="button" onClick={() => void onConfirm()} disabled={busy}>
              {busy ? 'Memproses...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}