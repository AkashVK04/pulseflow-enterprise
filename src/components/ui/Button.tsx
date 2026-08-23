import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)] shadow-sm border border-transparent',
        secondary: 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]',
        outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]',
        ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]',
        danger: 'bg-[var(--status-danger)] text-white hover:opacity-90 shadow-sm border border-transparent',
        success: 'bg-[var(--status-success)] text-white hover:opacity-90 shadow-sm border border-transparent'
      },
      size: {
        sm: 'text-[10px] px-2.5 py-1 gap-1.5 h-7',
        md: 'text-xs px-3.5 py-2 gap-2 h-9',
        lg: 'text-sm px-5 py-2.5 gap-2.5 h-11'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant,
  size,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
