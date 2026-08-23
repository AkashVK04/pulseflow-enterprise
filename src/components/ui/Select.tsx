import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  'w-full font-mono text-xs text-[var(--text-primary)] bg-[var(--bg-canvas)] border border-[var(--border-default)] transition-all focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase font-bold',
  {
    variants: {
      selectSize: {
        sm: 'px-2 py-1 text-[11px]',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2.5 text-sm'
      }
    },
    defaultVariants: {
      selectSize: 'md'
    }
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  errorText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', selectSize, label, errorText, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={selectVariants({ selectSize, className })}
          {...props}
        >
          {children}
        </select>
        {errorText && (
          <p className="text-[10px] font-mono text-[var(--status-danger)] uppercase font-bold">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
