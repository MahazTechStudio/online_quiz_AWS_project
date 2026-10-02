import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type StatAccent = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'slate';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  delta?: string;
  accent: StatAccent;
  icon: React.ReactNode;
  className?: string;
}

const accentBgMap: Record<StatAccent, string> = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-slate-100 text-slate-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  slate: 'bg-slate-100 text-slate-600',
};

const deltaColorMap: Record<string, string> = {
  up: 'text-success-600',
  down: 'text-error-600',
  neutral: 'text-slate-500',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  delta,
  accent,
  icon,
  className,
}) => {
  const isUp = delta?.startsWith('+') || delta?.includes('up');
  const isDown = delta?.startsWith('-') || delta?.includes('down');
  const deltaColor = isUp
    ? deltaColorMap.up
    : isDown
    ? deltaColorMap.down
    : deltaColorMap.neutral;

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <div className="mt-2">
            <span className="text-2xl font-bold text-dark-900">{value}</span>
          </div>
          {delta && (
            <div className={cn('mt-2 flex items-center gap-1 text-sm font-medium', deltaColor)}>
              {isUp && <ArrowUpRight className="h-4 w-4" />}
              {isDown && <ArrowDownRight className="h-4 w-4" />}
              <span>{delta}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'ml-4 flex-shrink-0 rounded-lg p-2.5',
            accentBgMap[accent]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
