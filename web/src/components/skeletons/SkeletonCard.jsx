import React from 'react';
import SkeletonImage from './SkeletonImage';
import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';

const SkeletonCard = ({ hasImage = true, hasButton = true, className = '' }) => {
  return (
    <div className={`bg-surface border border-border rounded-xl p-6 flex flex-col ${className}`}>
      {hasImage && (
        <div className="mb-6">
          <SkeletonImage height="160px" />
        </div>
      )}
      
      <div className="mb-4">
        <SkeletonText lines={1} width="60%" className="mb-2 h-6" />
      </div>
      
      <div className="flex-grow mb-6">
        <SkeletonText lines={3} />
      </div>
      
      {hasButton && (
        <div className="mt-auto pt-4 border-t border-border">
          <SkeletonButton width="100%" />
        </div>
      )}
    </div>
  );
};

export default SkeletonCard;
