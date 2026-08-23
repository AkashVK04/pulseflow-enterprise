import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="h-8 w-8 text-[var(--text-muted)]" />,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
          {title}
        </h4>
        {description && (
          <p className="text-xs font-mono text-[var(--text-secondary)] uppercase mt-1 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
