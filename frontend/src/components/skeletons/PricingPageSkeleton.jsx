import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonCard from './SkeletonCard';

const PricingPageSkeleton = () => {
  return (
    <div className="pt-24 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full animate-in fade-in duration-150">
      <div className="text-center mb-16 mt-12">
        <SkeletonText lines={1} width="300px" className="mx-auto h-12 mb-6" />
        <SkeletonText lines={2} width="50%" className="mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border p-8 rounded-2xl flex flex-col">
            <SkeletonText lines={1} width="120px" className="mb-4 h-6" />
            <SkeletonText lines={1} width="180px" className="mb-8 h-10" />
            <SkeletonText lines={1} width="100%" className="mb-8" />
            
            <div className="space-y-4 mb-8 flex-grow">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center">
                  <div className="skeleton w-4 h-4 rounded-full mr-3 shrink-0" />
                  <SkeletonText lines={1} width="80%" />
                </div>
              ))}
            </div>
            
            <div className="skeleton w-full h-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPageSkeleton;
