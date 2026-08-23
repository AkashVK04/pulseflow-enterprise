import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all duration-200 shadow-sm',
  {
    variants: {
      variant: {
        default: 'hover:border-[var(--border-default)]',
        elevated: 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-default)]',
        interactive: 'hover:border-[var(--brand-primary)] hover:shadow-md cursor-pointer',
        glass: 'bg-[var(--glass-bg)] backdrop-blur-md border-[var(--glass-border)]'
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md'
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`pb-3 mb-3 border-b border-[var(--border-subtle)] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h3 className={`text-base font-black uppercase tracking-tight text-[var(--text-primary)] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
  <p className={`text-xs font-mono text-[var(--text-secondary)] uppercase ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
