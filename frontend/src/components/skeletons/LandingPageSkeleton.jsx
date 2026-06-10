import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonCard from './SkeletonCard';
import SkeletonAvatar from './SkeletonAvatar';

const LandingPageSkeleton = () => {
  return (
    <div className="w-full animate-in fade-in duration-150">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen pt-24 lg:pt-32 flex flex-col justify-between">
        <div className="max-w-[1200px] mx-auto w-full px-6 grid lg:grid-cols-[55%_45%] gap-12 items-center flex-1">
          {/* LEFT COLUMN: Copy & CTA */}
          <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0 w-full">
            <div className="mb-8">
              <SkeletonText lines={1} width="80%" className="h-[72px] mb-2" />
              <SkeletonText lines={1} width="90%" className="h-[72px] mb-2" />
              <SkeletonText lines={1} width="60%" className="h-[72px]" />
            </div>
            
            <div className="mb-8 lg:mb-10">
              <SkeletonText lines={3} width="100%" className="max-w-lg mx-auto lg:mx-0" />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-6 mb-8 lg:mb-6">
              <SkeletonButton width="160px" height="48px" className="w-full sm:w-auto" />
              <SkeletonButton width="160px" height="48px" className="w-full sm:w-auto" />
            </div>
            
            <SkeletonText lines={1} width="300px" className="mx-auto lg:mx-0 h-4" />
          </div>

          {/* RIGHT COLUMN: Mockup Scene */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[620px] flex items-center justify-center">
             <div className="skeleton w-full max-w-md h-[400px] rounded-xl" />
          </div>
        </div>

        {/* Marquee Ticker */}
        <div className="w-full border-t border-border py-4 mt-12 bg-void">
          <SkeletonText lines={1} width="100%" className="h-4" />
        </div>
      </section>

      {/* Features Grid Skeleton */}
      <section className="py-24 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <SkeletonText lines={1} width="120px" className="h-6 mb-4" />
            <SkeletonText lines={1} width="80%" className="h-10 mb-4" />
            <SkeletonText lines={2} width="100%" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-8 border border-border bg-void">
                <SkeletonAvatar size="48px" className="mb-6 rounded-xl" />
                <SkeletonText lines={1} width="60%" className="h-6 mb-4" />
                <SkeletonText lines={2} width="100%" />
              </div>
            ))}
          </div>
        </div>
      </section>

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
