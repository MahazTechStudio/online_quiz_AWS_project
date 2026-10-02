import React from 'react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center',
        className
      )}
      role="status"
      aria-label="Empty state"
    >
      <div className="mx-auto mb-3 text-slate-400 w-12 h-12 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-dark-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
