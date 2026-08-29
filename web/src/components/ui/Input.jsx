import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ className, type, label, error, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary-accent transition-colors">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={twMerge(
            'flex h-10 w-full rounded-md border border-border bg-surface-secondary/50 px-3 py-2 text-sm text-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-accent focus-visible:border-primary-accent transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-status-danger focus-visible:ring-status-danger',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
