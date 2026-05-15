import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ className, children, glass = true, elevated = false, ...props }) => {
  return (
    <div
      className={twMerge(
        'rounded-xl border border-border overflow-hidden transition-all duration-300',
        glass && 'bg-surface-secondary/40 backdrop-blur-sm',
        !glass && 'bg-surface-secondary',
        elevated && 'shadow-2xl shadow-black/40 bg-surface-elevated/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => (
  <div className={twMerge('px-6 py-4 border-b border-border', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={twMerge('text-lg font-semibold text-text-primary leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className, children, ...props }) => (
  <p className={twMerge('text-sm text-text-secondary mt-1', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={twMerge('p-6', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className, children, ...props }) => (
  <div className={twMerge('px-6 py-4 bg-black/10 border-t border-border flex items-center', className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
