import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonCard from './SkeletonCard';
import SkeletonAvatar from './SkeletonAvatar';
import { FeaturesGridSkeleton } from '../../pages/Landing/components/FeaturesGrid';

const LandingPageSkeleton = () => {
  return (
    <div className="w-full animate-in fade-in duration-150">
      {/* Hero Section Skeleton - Centered */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 flex flex-col items-center">
        <div className="max-w-4xl mx-auto w-full px-6 flex flex-col items-center text-center">
          {/* Title Skeleton */}
          <div className="w-full flex flex-col items-center gap-3 mb-6">
            <div className="skeleton w-3/4 max-w-xl h-14 rounded-xl" />
            <div className="skeleton w-2/3 max-w-lg h-14 rounded-xl" />
          </div>
          
          {/* Subtitle Skeleton */}
          <div className="w-full flex flex-col items-center gap-2 mb-8 max-w-xl">
            <div className="skeleton w-full h-4 rounded" />
            <div className="skeleton w-4/5 h-4 rounded" />
          </div>
          
          {/* Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
            <SkeletonButton width="180px" height="48px" className="rounded-xl" />
            <SkeletonButton width="180px" height="48px" className="rounded-xl" />
          </div>

          {/* Product Mockup Window Skeleton */}
          <div className="w-full max-w-[1060px] h-[460px] skeleton rounded-2xl" />
        </div>
      </section>

      {/* Features Grid Skeleton */}
      <FeaturesGridSkeleton />

      {/* Pricing Section Skeleton */}
      <section className="py-24 bg-void">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <SkeletonText lines={1} width="120px" className="h-6 mb-4 mx-auto" />
          <SkeletonText lines={1} width="400px" className="h-10 mb-4 mx-auto" />
          <SkeletonText lines={2} width="500px" className="mx-auto mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border p-8 flex flex-col">
                <SkeletonText lines={1} width="120px" className="h-6 mb-4" />
                <SkeletonText lines={1} width="180px" className="h-10 mb-8" />
                <SkeletonText lines={1} width="100%" className="mb-8" />
                <div className="space-y-4 mb-8 flex-grow">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex items-center">
                      <SkeletonAvatar size="16px" className="mr-3" />
                      <SkeletonText lines={1} width="80%" />
                    </div>
                  ))}
                </div>
                <SkeletonButton width="100%" height="48px" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageSkeleton;
