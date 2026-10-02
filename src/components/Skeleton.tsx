import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn('rounded bg-slate-200 animate-pulse', className)}
    aria-hidden="true"
  />
);

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-xl border border-slate-200 bg-white p-6 shadow-sm',
      className
    )}
    aria-hidden="true"
  >
    <Skeleton className="h-6 w-1/2 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-[90%] mb-2" />
    <Skeleton className="h-4 w-[80%] mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  </div>
);

const SkeletonRow: React.FC<{ columns?: number; className?: string }> = ({
  columns = 4,
  className,
}) => (
  <div
    className={cn(
      'flex items-center px-4 py-3 gap-4 border-b border-slate-100',
      className
    )}
    aria-hidden="true"
  >
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4 flex-1', i === 0 && '!w-1/2 !flex-none')}
      />
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonRow };
export default Skeleton;
