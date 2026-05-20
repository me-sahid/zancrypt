import React from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import CipherText from '../crypto/CipherText';

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (typeof value !== 'number') return;
    
    const controls = animate(displayValue, value, {
      duration: 1.5,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  const formattedValue = typeof value === 'number' && value % 1 !== 0 
    ? displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.floor(displayValue).toLocaleString();

  return <>{formattedValue}{suffix}</>;
};

const MetricCard = ({ label, value, suffix, icon: Icon, trend, isPositive, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        "relative p-6 bg-surface border border-border group overflow-hidden",
        className
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <Icon className="w-4 h-4 text-accent" />
        
        {trend && (
          <div className={twMerge(
            "flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-widest border",
            isPositive 
              ? "text-accent bg-transparent border-accent/20" 
              : "text-warning bg-transparent border-warning/20"
          )}>
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono text-text-muted uppercase tracking-[0.1em]">{label}</p>
        <div className="flex items-baseline space-x-1">
          <h3 className="text-3xl font-mono text-text-primary tracking-tight">
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} suffix={suffix} />
            ) : (
              <><CipherText text={value} duration={1000} />{suffix}</>
            )}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
