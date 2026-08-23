import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = '', children, ...props }) => (
  <div className="w-full overflow-x-auto border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
    <table className={`w-full text-left text-xs font-mono text-[var(--text-primary)] ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => (
  <thead className={`bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-widest border-b border-[var(--border-subtle)] ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => (
  <tbody className={`divide-y divide-[var(--border-subtle)] ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', children, ...props }) => (
  <tr className={`hover:bg-[var(--bg-surface-hover)] transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => (
  <th className={`p-3 font-bold uppercase ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => (
  <td className={`p-3 align-middle ${className}`} {...props}>
    {children}
  </td>
);
