import React from 'react';
import { cn } from '@/utils/cn';

export interface TableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface TableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children?: React.ReactNode;
  label?: string;
}

interface TableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'max-w-full w-full rounded-xl border border-slate-200 overflow-hidden bg-white',
      className
    )}
    role="region"
    aria-label="Table"
    {...props}
  >
    <table className="w-full min-w-full border-collapse">{children}</table>
  </div>
);

const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={cn('bg-slate-50 border-b border-slate-200 sm:table-header-group hidden', className)} {...props}>
    {children}
  </thead>
);

const Th: React.FC<TableThProps> = ({ className, children, label: _label, ...props }) => (
  <th
    scope="col"
    className={cn(
      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn('divide-y divide-slate-100', className)} {...props}>
    {children}
  </tbody>
);

const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={cn(
      'hover:bg-slate-50/60 transition sm:table-row block sm:table-row mb-3 sm:mb-0 border sm:border-0 border-slate-200 sm:rounded-none rounded-lg sm:p-0 p-3',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

const Td: React.FC<TableTdProps> = ({ className, label, children, ...props }) => (
  <td
    className={cn(
      'px-4 py-3 text-sm text-dark-800 align-middle sm:table-cell flex sm:flex-none justify-between items-center sm:justify-start',
      className
    )}
    data-label={label}
    {...props}
  >
    {label && (
      <span className="sm:hidden text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2 flex-shrink-0">
        {label}
      </span>
    )}
    <span className="flex-1 sm:flex-none text-right sm:text-left break-words">
      {children}
    </span>
  </td>
);

const Table = Object.assign(TableWrapper, {
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
});

export { Table };
export default Table;
