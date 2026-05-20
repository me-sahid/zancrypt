import React from 'react';

const NodeDot = ({ status = 'online', className = '' }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'success':
        return 'bg-node-active shadow-[0_0_8px_rgba(79,255,176,0.5)]';
      case 'degraded':
      case 'warning':
        return 'bg-warning shadow-[0_0_8px_rgba(255,170,51,0.5)]';
      case 'offline':
      case 'danger':
      case 'error':
      default:
        return 'bg-node-inactive shadow-[0_0_8px_rgba(255,68,85,0.5)]';
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <span className={`w-2 h-2 rounded-full ${getColors()} transition-colors duration-300`}></span>
      {(status.toLowerCase() === 'online' || status.toLowerCase() === 'healthy' || status.toLowerCase() === 'success') && (
        <span className="absolute w-2 h-2 rounded-full bg-node-active animate-ping opacity-75 duration-1000"></span>
      )}
    </div>
  );
};

export default NodeDot;
