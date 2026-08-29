import React from 'react';

const SkeletonButton = ({ width = '120px', height = '40px', className = '' }) => {
  return (
    <div 
      className={`skeleton rounded-md ${className}`} 
      style={{ width, height }}
    />
  );
};

export default SkeletonButton;
