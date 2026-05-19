import React from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

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
        "relative p-6 rounded-2xl bg-surface-secondary/50 border border-border/50 backdrop-blur-xl overflow-hidden group",
        className
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
          <Icon className="w-5 h-5 text-text-secondary" />
        </div>
        
        {trend && (
          <div className={twMerge(
            "flex items-center px-2 py-1 rounded-full text-[10px] font-bold border",
            isPositive 
              ? "text-status-success bg-status-success/10 border-status-success/20" 
              : "text-status-danger bg-status-danger/10 border-status-danger/20"
          )}>
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em]">{label}</p>
        <div className="flex items-baseline space-x-1">
          <h3 className="text-3xl font-bold text-text-primary tracking-tight">
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} suffix={suffix} />
            ) : (
              <>{value}{suffix}</>
            )}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
