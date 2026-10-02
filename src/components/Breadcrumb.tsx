import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn('flex items-center flex-wrap', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = (
            <span
              className={cn(
                'text-sm',
                isLast
                  ? 'text-dark-800 font-medium'
                  : 'text-slate-500 hover:text-slate-700 cursor-pointer'
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </span>
          );

          return (
            <li
              key={index}
              className="flex items-center"
            >
              {item.to || item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded"
                  disabled={isLast}
                >
                  {content}
                </button>
              ) : (
                content
              )}
              {!isLast && (
                <ChevronRight
                  className="h-4 w-4 text-slate-300 mx-2 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
