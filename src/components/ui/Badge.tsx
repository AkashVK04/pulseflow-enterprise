import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 transition-colors border',
  {
    variants: {
      variant: {
        critical: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]',
        high: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
        medium: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30',
        low: 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]',
        info: 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info-border)]',
        neutral: 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border-[var(--border-default)]'
      },
      size: {
        sm: 'text-[9px] px-1.5 py-0.2',
        md: 'text-[10px] px-2 py-0.5',
        lg: 'text-xs px-2.5 py-1'
      }
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant,
  size,
  dot = false,
  children,
  ...props
}) => {
  return (
    <span className={badgeVariants({ variant, size, className })} {...props}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0 animate-pulse" />
      )}
      {children}
    </span>
  );
};
