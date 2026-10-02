import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helpText, error, required, className, id, rows = 3, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-dark-800 mb-1"
          >
            {label}
            {required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-dark-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 resize-y',
            error
              ? 'border-error-500 focus:ring-error-500/20'
              : 'border-slate-300',
            className
          )}
          {...props}
        />
        {error && (
          <div
            id={`${textareaId}-error`}
            className="mt-1 flex items-center gap-1 text-sm text-error-600"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!error && helpText && (
          <p id={`${textareaId}-help`} className="mt-1 text-sm text-slate-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
