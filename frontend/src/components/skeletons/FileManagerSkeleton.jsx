import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonTableRow from './SkeletonTableRow';

const FileManagerSkeleton = () => {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-150 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <SkeletonText lines={1} width="220px" className="h-8 mb-2" />
          <SkeletonText lines={1} width="160px" />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonButton width="48px" height="42px" />
          <SkeletonButton width="120px" height="42px" />
          <SkeletonButton width="120px" height="42px" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-border p-4">
        <SkeletonText lines={1} width="100%" className="h-8" />
      </div>

      {/* Vault Table */}
      <div className="bg-surface border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-raised">
                <th className="py-4 px-6 w-12"><SkeletonText lines={1} width="16px" /></th>
                <th className="py-4 px-6"><SkeletonText lines={1} width="80px" /></th>
                <th className="py-4 px-6"><SkeletonText lines={1} width="60px" /></th>
                <th className="py-4 px-6 hidden sm:table-cell"><SkeletonText lines={1} width="80px" /></th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonTableRow key={i} columns={5} hasAvatar={true} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileManagerSkeleton;
