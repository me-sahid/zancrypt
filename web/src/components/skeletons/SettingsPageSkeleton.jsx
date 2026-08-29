import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonAvatar from './SkeletonAvatar';
import SkeletonButton from './SkeletonButton';

const SettingsPageSkeleton = () => {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <SkeletonText lines={1} width="200px" className="h-8 mb-2" />
        <SkeletonText lines={1} width="300px" />
      </div>

      <div className="bg-surface border border-border p-6 sm:p-8">
        <SkeletonText lines={1} width="150px" className="h-6 mb-6" />
        
        {/* Avatar Area */}
        <div className="flex items-center gap-6 mb-8">
          <SkeletonAvatar size="80px" />
          <div className="flex flex-col gap-3">
            <SkeletonButton width="140px" height="36px" />
            <SkeletonText lines={1} width="200px" />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SkeletonText lines={1} width="100px" className="mb-2" />
              <div className="skeleton w-full h-12 rounded-none" />
            </div>
            <div>
              <SkeletonText lines={1} width="100px" className="mb-2" />
              <div className="skeleton w-full h-12 rounded-none" />
            </div>
          </div>
          
          <div>
            <SkeletonText lines={1} width="100px" className="mb-2" />
            <div className="skeleton w-full h-12 rounded-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t border-border flex justify-end gap-4">
          <SkeletonButton width="100px" height="42px" />
          <SkeletonButton width="120px" height="42px" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPageSkeleton;
