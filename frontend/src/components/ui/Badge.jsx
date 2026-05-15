import React from 'react';
import { twMerge } from 'tailwind-merge';

const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-surface-elevated text-text-secondary border-border',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    security: 'bg-security/10 text-security border-security/20',
    outline: 'bg-transparent border-border text-text-secondary',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
