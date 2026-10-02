import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Search } from "lucide-react";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      label,
      helpText,
      error,
      required,
      className,
      id,
      placeholder = "Search...",
      ...props
    },
    ref,
  ) => {
    const inputId = id || React.useId();

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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              className={cn(
                "h-4 w-4",
                error ? "text-error-400" : "text-slate-400",
              )}
            />
          </div>
          <input
            ref={ref}
            id={inputId}
            type="search"
            placeholder={placeholder}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helpText
                  ? `${inputId}-help`
                  : undefined
            }
            className={cn(
              "w-full rounded-full border bg-white pl-10 pr-3 py-2 text-sm text-dark-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:bg-slate-50 disabled:text-slate-500",
              error
                ? "border-error-500 focus:ring-error-500/20"
                : "border-slate-300",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <div
            id={`${inputId}-error`}
            className="mt-1 flex items-center gap-1 text-sm text-error-600"
            role="alert"
          >
            {error}
          </div>
        )}
        {!error && helpText && (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-slate-500">
            {helpText}
          </p>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
