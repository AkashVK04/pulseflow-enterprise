import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const iconMap = {
    success: <CheckCircle2 className="h-4 w-4 text-[var(--status-success)] shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-[var(--status-danger)] shrink-0" />,
    info: <Info className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
  };

  const borderMap = {
    success: 'border-[var(--status-success)]',
    error: 'border-[var(--status-danger)]',
    info: 'border-[var(--brand-primary)]'
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 bg-[var(--bg-surface)] border-2 ${borderMap[type]} text-[var(--text-primary)] text-xs font-mono font-bold uppercase tracking-wider px-4 py-3 flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-200`}>
      {iconMap[type]}
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
