import React from 'react';

const StatusBadge = ({ severity = 'info' }) => {
  const getStyles = () => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-danger text-white border-danger shadow-[0_0_8px_rgba(255,68,85,0.5)]';
      case 'high':
        return 'bg-transparent text-danger border-danger';
      case 'medium':
        return 'bg-transparent text-warning border-warning';
      case 'low':
        return 'bg-transparent text-text-secondary border-border';
      case 'info':
      default:
        return 'bg-transparent text-accent border-accent/50';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border font-mono text-xs uppercase tracking-wider ${getStyles()}`}>
      {severity}
    </span>
  );
};

export default StatusBadge;
