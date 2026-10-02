import React from 'react';
import { cn } from '@/utils/cn';
import type { RadioOption } from '@/types';

type RadioGroupVariant = 'default' | 'quiz';

export interface RadioGroupProps {
  options: RadioOption[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  variant?: RadioGroupVariant;
  name?: string;
  disabled?: boolean;
  className?: string;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  variant = 'default',
  name,
  disabled = false,
  className,
}) => {
  const groupName = name || React.useId();

  const handleKeyDown = (
    e: React.KeyboardEvent,
    optionValue: string | number,
    index: number
  ) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(optionValue);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      onChange(options[nextIndex].value);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      onChange(options[prevIndex].value);
    }
  };

  if (variant === 'quiz') {
    return (
      <div role="radiogroup" className={cn('space-y-3', className)}>
        {options.map((option, index) => {
          const isSelected = value === option.value;
          return (
            <div
              key={option.value}
              role="radio"
              tabIndex={disabled ? -1 : 0}
              aria-checked={isSelected}
              onClick={() => !disabled && onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value, index)}
              className={cn(
                'border-2 rounded-xl p-4 cursor-pointer min-h-[48px] flex items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                isSelected
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/10'
                  : 'border-slate-200 hover:bg-primary-50/50',
                disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
              )}
            >
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-semibold flex-shrink-0 min-w-[28px] text-center',
                  isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                {LETTERS[index] || index + 1}
              </span>
              <span className="text-sm text-dark-900 flex-1">{option.label}</span>
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" className={cn('space-y-2', className)}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              'inline-flex items-center gap-2.5 cursor-pointer select-none w-full',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              role="radio"
              tabIndex={disabled ? -1 : 0}
              aria-checked={isSelected}
              onKeyDown={(e) => handleKeyDown(e, option.value, index)}
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                isSelected
                  ? 'border-primary-600'
                  : 'border-slate-300 hover:border-primary-400'
              )}
            >
              {isSelected && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              )}
            </div>
            <span className="text-sm text-dark-800">{option.label}</span>
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
};

export default RadioGroup;
