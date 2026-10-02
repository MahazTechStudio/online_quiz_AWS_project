import React from 'react';
import Spinner from './Spinner';
import { cn } from '@/utils/cn';

export interface LoadingOverlayProps {
  text?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = 'Loading...',
  className,
}) => {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center flex-col gap-3',
        className
      )}
      role="status"
      aria-label={text}
    >
      <Spinner size="lg" />
      <p className="text-sm text-slate-500 font-medium">{text}</p>
    </div>
  );
};

export default LoadingOverlay;
