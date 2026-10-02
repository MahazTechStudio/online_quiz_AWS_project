import React from 'react';
import { cn } from '@/utils/cn';

type ProgressBarSize = 'sm' | 'md';
type ProgressBarColor = 'primary' | 'success' | 'warning' | 'error';

export interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  className?: string;
}

const sizeMap: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
};

const colorMap: Record<ProgressBarColor, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color = 'primary',
  className,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs font-medium text-dark-800">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[color]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
