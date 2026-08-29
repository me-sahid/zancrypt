import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, label, error, leftIcon, options = [], ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary-accent transition-colors pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          className={twMerge(
            'flex h-10 w-full appearance-none rounded-md border border-border bg-surface-secondary/50 px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-accent focus-visible:border-primary-accent transition-all',
            leftIcon && 'pl-10',
            'pr-10',
            error && 'border-status-danger focus-visible:ring-status-danger',
            className
          )}
          ref={ref}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-primary text-text-primary">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
