import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  leftIcon, 
  rightIcon, 
  children, 
  ...props 
}, ref) => {
  
  const variants = {
    primary: 'bg-primary-accent text-white hover:bg-blue-600 shadow-lg shadow-primary-accent/20',
    secondary: 'bg-surface-elevated text-text-primary border border-border hover:bg-surface-secondary',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
    danger: 'bg-status-danger text-white hover:bg-red-600 shadow-lg shadow-status-danger/20',
    outline: 'bg-transparent border border-primary-accent text-primary-accent hover:bg-primary-accent/10',
    security: 'bg-security text-white hover:bg-cyan-600 shadow-lg shadow-security/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={twMerge(
        'relative inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-accent disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="mr-2 h-4 w-4 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
