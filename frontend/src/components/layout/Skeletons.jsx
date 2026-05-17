import React from 'react';
import { useLocation } from 'react-router-dom';

// General block helper
const SkeletonBlock = ({ className = '' }) => (
  <div className={`shimmer rounded-xl bg-white/[0.02] border border-white/[0.04] ${className}`} />
);

// Stat Card skeleton helper
const StatCardSkeleton = () => (
  <div className="p-6 rounded-2xl bg-surface-secondary/50 border border-border/50 backdrop-blur-xl relative overflow-hidden space-y-4">
    <div className="flex justify-between items-start">
      <SkeletonBlock className="w-10 h-10 rounded-xl" />
      <SkeletonBlock className="w-16 h-5 rounded-full" />
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="w-24 h-3" />
      <SkeletonBlock className="w-16 h-8" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 pb-10">
    {/* Page Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <SkeletonBlock className="w-64 h-10" />
        <SkeletonBlock className="w-48 h-4" />
      </div>
      <SkeletonBlock className="w-36 h-11 rounded-xl" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    {/* Main Grid: Files & Nodes */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Files Preview */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 flex flex-col space-y-6 h-[400px]">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <SkeletonBlock className="w-32 h-6" />
            <SkeletonBlock className="w-48 h-3" />
          </div>
          <SkeletonBlock className="w-12 h-4" />
        </div>
        <div className="flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
              <div className="flex items-center space-x-4">
                <SkeletonBlock className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <SkeletonBlock className="w-32 h-4" />
                  <SkeletonBlock className="w-24 h-3" />
                </div>
              </div>
              <SkeletonBlock className="w-6 h-6 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Global Node Health */}
      <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6 h-[400px]">
        <div className="space-y-2">
          <SkeletonBlock className="w-32 h-6" />
          <SkeletonBlock className="w-40 h-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-elevated/40 border border-border flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="w-16 h-4" />
                <SkeletonBlock className="w-3 h-3 rounded-full" />
              </div>
              <SkeletonBlock className="w-20 h-3" />
              <div className="flex justify-between items-center">
                <SkeletonBlock className="w-10 h-3" />
                <SkeletonBlock className="w-8 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Activity Feed */}
    <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="w-32 h-6" />
        <SkeletonBlock className="w-64 h-3" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
            <SkeletonBlock className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <SkeletonBlock className="w-48 h-4" />
                <SkeletonBlock className="w-12 h-3" />
              </div>
              <SkeletonBlock className="w-32 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SecuritySkeleton = () => (
  <div className="space-y-8 pb-10">
    {/* Page Header */}
    <div className="space-y-2">
      <SkeletonBlock className="w-80 h-10" />
      <SkeletonBlock className="w-96 h-4" />
    </div>

    {/* Security Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Live Integrity Monitoring */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6">
        <div className="space-y-2">
          <SkeletonBlock className="w-48 h-6" />
          <SkeletonBlock className="w-64 h-3" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
              <SkeletonBlock className="w-6 h-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <SkeletonBlock className="w-56 h-4" />
                  <SkeletonBlock className="w-16 h-3" />
                </div>
                <SkeletonBlock className="w-24 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Controls */}
      <div className="space-y-8">
        <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-4">
          <SkeletonBlock className="w-32 h-6" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <SkeletonBlock className="w-20 h-4" />
              <SkeletonBlock className="w-12 h-5 rounded-md" />
            </div>
            <div className="flex justify-between">
              <SkeletonBlock className="w-20 h-4" />
              <SkeletonBlock className="w-16 h-5 rounded-md" />
            </div>
            <SkeletonBlock className="w-full h-10 rounded-lg pt-4" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6">
          <div className="space-y-2">
            <SkeletonBlock className="w-36 h-6" />
            <SkeletonBlock className="w-48 h-3" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <SkeletonBlock className="w-2.5 h-2.5 rounded-full" />
              <SkeletonBlock className="w-48 h-4" />
            </div>
            <div className="flex items-center space-x-3">
              <SkeletonBlock className="w-2.5 h-2.5 rounded-full" />
              <SkeletonBlock className="w-56 h-4" />
            </div>
            <SkeletonBlock className="w-full h-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const MonitoringSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="space-y-2">
      <SkeletonBlock className="w-72 h-10" />
      <SkeletonBlock className="w-96 h-4" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Latency & Throughput */}
      <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6 h-[400px]">
        <div className="space-y-2">
          <SkeletonBlock className="w-48 h-6" />
          <SkeletonBlock className="w-64 h-3" />
        </div>
        <SkeletonBlock className="w-full h-64 rounded-xl" />
      </div>

      <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6 h-[400px]">
        <div className="space-y-2">
          <SkeletonBlock className="w-48 h-6" />
          <SkeletonBlock className="w-64 h-3" />
        </div>
        <SkeletonBlock className="w-full h-64 rounded-xl" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6">
        <SkeletonBlock className="w-48 h-6" />
        <SkeletonBlock className="w-full h-[240px] rounded-xl" />
      </div>

      <div className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6">
        <SkeletonBlock className="w-32 h-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
              <SkeletonBlock className="w-24 h-4" />
              <SkeletonBlock className="w-10 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-8 pb-10">
    <SkeletonBlock className="w-64 h-10" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-6 rounded-3xl bg-surface-secondary/30 border border-border/50 space-y-6">
          <SkeletonBlock className="w-32 h-6" />
          <SkeletonBlock className="w-full h-64 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

export const NodesSkeleton = () => (
  <div className="space-y-8 pb-10">
    {/* Page Header */}
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <SkeletonBlock className="w-80 h-10" />
        <SkeletonBlock className="w-96 h-4" />
      </div>
      <SkeletonBlock className="w-10 h-10 rounded-xl" />
    </div>

    {/* Summary Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    {/* Nodes list */}
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-8 rounded-3xl bg-surface-secondary/40 border border-border/50 flex flex-col space-y-6">
          <div className="flex items-center space-x-6">
            <SkeletonBlock className="w-20 h-20 rounded-3xl" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-3">
                <SkeletonBlock className="w-48 h-7" />
                <SkeletonBlock className="w-16 h-5 rounded-md" />
              </div>
              <div className="flex space-x-4">
                <SkeletonBlock className="w-24 h-4" />
                <SkeletonBlock className="w-24 h-4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Generic Default Skeleton
const GenericSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="space-y-2">
      <SkeletonBlock className="w-64 h-10" />
      <SkeletonBlock className="w-96 h-4" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonBlock className="w-full h-48 rounded-2xl" />
      <SkeletonBlock className="w-full h-48 rounded-2xl" />
      <SkeletonBlock className="w-full h-48 rounded-2xl" />
    </div>
    <SkeletonBlock className="w-full h-96 rounded-3xl" />
  </div>
);

export const ContentSkeleton = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith('/dashboard')) return <DashboardSkeleton />;
  if (path.startsWith('/security')) return <SecuritySkeleton />;
  if (path.startsWith('/monitoring')) return <MonitoringSkeleton />;
  if (path.startsWith('/analytics')) return <AnalyticsSkeleton />;
  if (path.startsWith('/nodes')) return <NodesSkeleton />;
  
  return <GenericSkeleton />;
};

export default ContentSkeleton;
