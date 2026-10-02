import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, disabled = false, className, id }, ref) => {
    const checkboxId = id || React.useId();

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(!checked);
      }
    };

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex items-center gap-2.5 cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className="sr-only"
            aria-checked={checked}
            role="checkbox"
          />
          <span
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
              checked
                ? 'bg-primary-600 border-primary-600'
                : 'bg-white border-slate-300 hover:border-primary-400',
              disabled && 'bg-slate-100'
            )}
            aria-hidden="true"
          >
            {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </span>
        </span>
        {label && (
          <span className="text-sm text-dark-800">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
