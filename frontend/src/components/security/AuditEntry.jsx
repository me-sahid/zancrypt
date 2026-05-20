import React from 'react';

const AuditEntry = ({ action, timestamp, file, ip }) => {
  const getActionColor = () => {
    switch (action.toUpperCase()) {
      case 'SHARE_CREATE':
      case 'SHARE':
        return 'text-accent-dim';
      case 'DELETE':
      case 'PURGE':
        return 'text-danger shadow-[0_0_8px_rgba(255,68,85,0.2)]';
      case 'UPLOAD':
      case 'DOWNLOAD':
      case 'DECRYPT':
      default:
        return 'text-text-primary';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-3 border-b border-border hover:bg-surface-raised transition-colors font-mono text-xs items-center">
      <div className="text-text-muted">{timestamp}</div>
      <div className={`font-medium ${getActionColor()}`}>{action}</div>
      <div className="text-text-primary truncate">{file}</div>
      <div className="text-text-secondary text-right">{ip}</div>
    </div>
  );
};

export default AuditEntry;
