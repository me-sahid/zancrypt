import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonAvatar from './SkeletonAvatar';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <SkeletonText lines={1} width="200px" className="h-8 mb-2" />
          <SkeletonText lines={1} width="150px" />
        </div>
        <SkeletonButton width="120px" height="42px" className="w-full md:w-auto" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border p-6 rounded-none flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start mb-2">
              <SkeletonText lines={1} width="100px" />
              <SkeletonAvatar size="24px" className="rounded-md" />
            </div>
            <SkeletonText lines={1} width="140px" className="h-8" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Files Preview */}
        <div className="lg:col-span-2 flex flex-col bg-surface border border-border h-[400px]">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <SkeletonText lines={1} width="120px" />
            <SkeletonText lines={1} width="80px" />
          </div>
          <div className="p-2 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center p-3">
                <SkeletonAvatar size="24px" className="rounded-none mr-3" />
                <div className="flex-1">
                  <SkeletonText lines={1} width="60%" className="mb-1" />
                  <SkeletonText lines={1} width="30%" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Health Grid */}
        <div className="bg-surface border border-border h-[400px] flex flex-col">
          <div className="p-4 border-b border-border">
            <SkeletonText lines={1} width="100px" />
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border p-3 flex flex-col items-center">
                <SkeletonAvatar size="40px" className="mb-3" />
                <SkeletonText lines={1} width="80%" className="mb-2" />
                <SkeletonText lines={1} width="50%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
