import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full font-mono text-xs text-[var(--text-primary)] bg-[var(--bg-canvas)] border border-[var(--border-default)] transition-all focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--text-muted)]',
  {
    variants: {
      inputSize: {
        sm: 'px-2.5 py-1 text-[11px]',
        md: 'px-3 py-2 text-xs',
        lg: 'px-4 py-2.5 text-sm'
      },
      error: {
        true: 'border-[var(--status-danger)] focus:border-[var(--status-danger)] focus:ring-[var(--status-danger)]/20'
      }
    },
    defaultVariants: {
      inputSize: 'md'
    }
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', inputSize, error, label, errorText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`${inputVariants({ inputSize, error: !!errorText || error, className })} ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--text-muted)] pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {errorText && (
          <p className="text-[10px] font-mono text-[var(--status-danger)] uppercase font-bold">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
