import React from 'react';

const SkeletonAvatar = ({ size = '3rem', className = '' }) => {
  return (
    <div 
      className={`skeleton rounded-full shrink-0 ${className}`} 
      style={{ width: size, height: size }}
    />
  );
};

export default SkeletonAvatar;
