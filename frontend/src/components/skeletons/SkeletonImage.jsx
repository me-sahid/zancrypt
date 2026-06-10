import React from 'react';

const SkeletonImage = ({ width = '100%', height = '100%', aspectRatio, className = '' }) => {
  return (
    <div 
      className={`skeleton rounded-md overflow-hidden ${className}`} 
      style={{ 
        width, 
        height: aspectRatio ? 'auto' : height,
        aspectRatio 
      }}
    />
  );
};

export default SkeletonImage;
