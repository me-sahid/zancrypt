import React from 'react';
import { twMerge } from 'tailwind-merge';

const SecureInput = React.forwardRef(({ className, type, label, error, leftIcon, rightIcon, showEntropy, entropyScore = 0, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[11px] text-text-muted mb-1.5 uppercase tracking-[0.1em]">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={twMerge(
            'flex h-12 w-full rounded-md border border-border bg-void px-4 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_var(--color-accent-dim)] transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger focus:border-danger focus:shadow-[0_0_0_2px_rgba(255,68,85,0.2)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {rightIcon}
          </div>
        )}
        
        {/* Entropy indicator for passwords/keys */}
        {showEntropy && type !== 'password' && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-accent/20 w-full rounded-b-md overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                entropyScore < 40 ? 'bg-danger' : entropyScore < 70 ? 'bg-warning' : 'bg-accent'
              }`}
              style={{ width: `${Math.min(100, entropyScore)}%` }}
            />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 font-mono text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

SecureInput.displayName = 'SecureInput';

export default SecureInput;
