import React from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'slate' | 'cyan' | 'amber';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: BadgeSize;
}

const variantMap: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  error: 'bg-error-50 text-error-700 border-error-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'slate',
  children,
  className,
  size = 'sm',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
