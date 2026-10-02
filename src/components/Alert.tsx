import React from 'react';
import { cn } from '@/utils/cn';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  X,
} from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-primary-50 border-primary-200 text-primary-800',
  success: 'bg-success-50 border-success-200 text-success-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  error: 'bg-error-50 border-error-200 text-error-800',
};

const iconMap: Record<AlertVariant, React.FC<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
  onClose,
}) => {
  const Icon = iconMap[variant];
  const role = variant === 'error' ? 'alert' : variant === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={cn(
        'rounded-lg border p-4 flex gap-3',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className="flex-shrink-0 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current rounded p-0.5 transition"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
