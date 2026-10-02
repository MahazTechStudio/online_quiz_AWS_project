import React from 'react';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/format';
import { Clock } from 'lucide-react';

export interface TimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({
  secondsRemaining,
  totalSeconds,
  className,
}) => {
  const ratio = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;
  const isLow = ratio < 0.2;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        isLow
          ? 'border-error-200 bg-error-50 text-error-600 font-bold animate-pulse'
          : 'border-slate-200 bg-white text-dark-800',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${formatTime(Math.max(0, secondsRemaining))} remaining`}
    >
      <Clock
        className={cn(
          'h-4 w-4 flex-shrink-0',
          isLow ? 'text-error-500' : 'text-slate-500'
        )}
      />
      <span className="text-sm font-mono tabular-nums">
        {formatTime(Math.max(0, secondsRemaining))}
      </span>
    </div>
  );
};

export default Timer;
