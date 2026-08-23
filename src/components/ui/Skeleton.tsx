import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] ${className}`}
      style={{
        width,
        height,
        ...style
      }}
      {...props}
    />
  );
};
