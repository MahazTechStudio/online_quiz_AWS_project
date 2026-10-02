import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, helpText, error, required, className, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-800 mb-1"
          >
            {label}
            {required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-dark-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:bg-slate-50 disabled:text-slate-500',
              error
                ? 'border-error-500 focus:ring-error-500/20'
                : 'border-slate-300',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-primary-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <div
            id={`${inputId}-error`}
            className="mt-1 flex items-center gap-1 text-sm text-error-600"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!error && helpText && (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-slate-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
