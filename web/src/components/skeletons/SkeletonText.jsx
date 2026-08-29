import React from 'react';

const SkeletonText = ({ lines = 1, width = '100%', className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton rounded-md h-4"
          style={{ width: lines > 1 && i === lines - 1 ? '70%' : width }}
        />
      ))}
    </div>
  );
};

export default SkeletonText;
