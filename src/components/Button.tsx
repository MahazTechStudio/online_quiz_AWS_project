import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'outline-primary'
  | 'success';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:bg-primary-400',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-dark-800 border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400',
  danger: 'bg-error-600 hover:bg-error-500 text-white disabled:bg-error-400',
  success: 'bg-success-600 hover:bg-success-500 text-white disabled:bg-success-400',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-300',
  'outline-primary':
    'border border-primary-600 text-primary-700 hover:bg-primary-50 disabled:border-primary-300 disabled:text-primary-300',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 rounded-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled && !loading) {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        onKeyDown={handleKeyDown}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 disabled:cursor-not-allowed',
          variantMap[variant],
          sizeMap[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {!loading && <span>{children}</span>}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
