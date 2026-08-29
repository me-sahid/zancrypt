import React from 'react';
import { useLocation } from 'react-router-dom';

/* ─────────────────────────────────────────────
   Base Primitives
───────────────────────────────────────────── */
const S = ({ className = '', style = {} }) => (
  <div
    className={`shimmer rounded-lg bg-white/[0.03] border border-white/[0.04] ${className}`}
    style={style}
  />
);

const SCircle = ({ size = 'w-10 h-10' }) => (
  <div className={`shimmer rounded-full bg-white/[0.03] border border-white/[0.04] ${size}`} />
);

/* ─────────────────────────────────────────────
   Shared Building Blocks
───────────────────────────────────────────── */
const PageHeader = ({ titleW = 'w-56', subtitleW = 'w-80', hasButton = false }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-4 md:pb-6">
    <div className="space-y-2">
      <S className={`${titleW} h-8`} />
      <S className={`${subtitleW} h-4`} />
    </div>
    {hasButton && <S className="w-32 h-10 rounded-xl" />}
  </div>
);

const StatCard = () => (
  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
    <div className="flex justify-between items-start">
      <SCircle size="w-10 h-10" />
      <S className="w-14 h-5 rounded-full" />
    </div>
    <div className="space-y-2">
      <S className="w-20 h-3" />
      <S className="w-16 h-7" />
    </div>
  </div>
);

const TableRowSkeleton = ({ cols = 4, hasThumb = false }) => (
  <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.03]">
    <S className="w-4 h-4 rounded-sm shrink-0" />
    {hasThumb && <S className="w-11 h-11 rounded-xl shrink-0" />}
    <div className="flex-1 space-y-2">
      <S className="h-4 w-2/5" />
      <S className="h-3 w-1/4" />
    </div>
    {cols > 2 && <S className="w-16 h-4 hidden sm:block" />}
    {cols > 3 && <S className="w-24 h-4 hidden sm:block" />}
    <S className="w-16 h-7 rounded-lg shrink-0" />
  </div>
);

const CardPanel = ({ children, className = '' }) => (
  <div className={`rounded-3xl bg-white/[0.02] border border-white/[0.04] p-6 ${className}`}>
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   Dashboard  /dashboard
───────────────────────────────────────────── */
export const DashboardSkeleton = () => (
  <div className="space-y-8 pb-10">
    <PageHeader titleW="w-72" subtitleW="w-48" hasButton />

    {/* Stat cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} />)}
    </div>

    {/* Main 2-col grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent files */}
      <CardPanel className="lg:col-span-2 space-y-5 h-[360px]">
        <div className="flex justify-between items-center">
          <div className="space-y-2"><S className="w-32 h-5" /><S className="w-48 h-3" /></div>
          <S className="w-12 h-4" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <S className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2"><S className="w-36 h-4" /><S className="w-24 h-3" /></div>
              <S className="w-6 h-6 rounded-md" />
            </div>
          ))}
        </div>
      </CardPanel>

      {/* Node health */}
      <CardPanel className="space-y-5 h-[360px]">
        <div className="space-y-2"><S className="w-28 h-5" /><S className="w-40 h-3" /></div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <div className="flex justify-between items-center">
                <S className="w-14 h-3" />
                <SCircle size="w-2.5 h-2.5" />
              </div>
              <S className="w-20 h-3" />
              <S className="w-16 h-3" />
            </div>
          ))}
        </div>
      </CardPanel>
    </div>

    {/* Activity feed */}
    <CardPanel className="space-y-5">
      <div className="space-y-2"><S className="w-32 h-5" /><S className="w-64 h-3" /></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <S className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between"><S className="w-48 h-4" /><S className="w-12 h-3" /></div>
              <S className="w-32 h-3" />
            </div>
          </div>
        ))}
      </div>
    </CardPanel>
  </div>
);

/* ─────────────────────────────────────────────
   Vault / Files  /vault
───────────────────────────────────────────── */
export const FilesSkeleton = () => (
  <div className="space-y-6 pb-20">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-4 md:pb-6">
      <div className="space-y-2">
        <S className="w-32 h-7" />
        <S className="w-48 h-4" />
      </div>
      <div className="flex items-center gap-3">
        <S className="w-10 h-10 rounded-lg" />
        <S className="w-28 h-10 rounded-lg" />
        <S className="w-24 h-10 rounded-lg" />
      </div>
    </div>

    {/* Filter bar */}
    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-lg">
      <S className="w-full h-12 rounded-lg" />
    </div>

    {/* Table */}
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
      {/* thead */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <S className="w-4 h-4 rounded-sm" />
        <S className="w-24 h-3" />
        <div className="flex-1" />
        <S className="w-12 h-3 hidden sm:block" />
        <S className="w-20 h-3 hidden sm:block" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRowSkeleton key={i} hasThumb cols={4} />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Upload  /uploads
───────────────────────────────────────────── */
export const UploadSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-8">
    <div className="text-center space-y-2 mb-12">
      <S className="w-56 h-8 mx-auto" />
      <S className="w-80 h-4 mx-auto" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Dropzone */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border-2 border-dashed border-white/[0.06] rounded-2xl p-12 flex flex-col items-center space-y-4">
          <S className="w-16 h-16 rounded-2xl" />
          <S className="w-48 h-6" />
          <S className="w-72 h-4" />
          <S className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Upload Progress sidebar */}
      <CardPanel className="space-y-8">
        <div className="space-y-2"><S className="w-36 h-5" /><S className="w-48 h-3" /></div>
        <div className="space-y-10 relative">
          <div className="absolute top-5 left-5 w-0.5 h-[calc(100%-20px)] bg-white/[0.04]" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 relative z-10">
              <S className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <S className="w-40 h-4" />
                <S className="w-32 h-3" />
              </div>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.04]">
          <S className="w-full aspect-square rounded-2xl" />
        </div>
      </CardPanel>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Shares  /shares
───────────────────────────────────────────── */
export const SharesSkeleton = () => (
  <div className="space-y-6 pb-20">
    <PageHeader titleW="w-48" subtitleW="w-72" />

    {/* Stats strip */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} />)}
    </div>

    {/* Shares table */}
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <S className="w-4 h-4 rounded-sm" />
        <S className="w-24 h-3" />
        <div className="flex-1" />
        <S className="w-16 h-3 hidden sm:block" />
        <S className="w-20 h-3 hidden sm:block" />
        <S className="w-12 h-3" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRowSkeleton key={i} hasThumb cols={4} />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Recycle Bin  /bin
───────────────────────────────────────────── */
export const RecycleBinSkeleton = () => (
  <div className="space-y-6 max-w-6xl mx-auto pb-20">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <S className="w-40 h-7" />
        <S className="w-80 h-4" />
      </div>
      <S className="w-28 h-10 rounded-xl" />
    </div>

    {/* Search */}
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4">
      <S className="w-full h-10 rounded-xl" />
    </div>

    {/* Table */}
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <S className="w-4 h-4 rounded-sm" />
        <S className="w-24 h-3" />
        <div className="flex-1" />
        <S className="w-20 h-3 hidden sm:block" />
        <S className="w-24 h-3 hidden sm:block" />
        <S className="w-16 h-3" />
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <TableRowSkeleton key={i} hasThumb cols={5} />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Security  /security
───────────────────────────────────────────── */
export const SecuritySkeleton = () => (
  <div className="space-y-8 pb-10">
    <PageHeader titleW="w-80" subtitleW="w-96" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} />)}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <CardPanel className="lg:col-span-2 space-y-5">
        <div className="space-y-2"><S className="w-48 h-5" /><S className="w-64 h-3" /></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <SCircle size="w-6 h-6" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between"><S className="w-56 h-4" /><S className="w-16 h-3" /></div>
                <S className="w-24 h-3" />
              </div>
            </div>
          ))}
        </div>
      </CardPanel>

      <div className="space-y-6">
        <CardPanel className="space-y-4">
          <S className="w-32 h-5" />
          <div className="space-y-3">
            <div className="flex justify-between"><S className="w-20 h-4" /><S className="w-12 h-5 rounded-md" /></div>
            <div className="flex justify-between"><S className="w-20 h-4" /><S className="w-16 h-5 rounded-md" /></div>
            <S className="w-full h-10 rounded-lg" />
          </div>
        </CardPanel>
        <CardPanel className="space-y-5">
          <div className="space-y-2"><S className="w-36 h-5" /><S className="w-48 h-3" /></div>
          <div className="space-y-3">
            {[48, 56].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <SCircle size="w-2.5 h-2.5" />
                <S className={`w-${w} h-4`} />
              </div>
            ))}
            <S className="w-full h-32 rounded-xl" />
          </div>
        </CardPanel>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Monitoring  /monitoring
───────────────────────────────────────────── */
export const MonitoringSkeleton = () => (
  <div className="space-y-8 pb-10">
    <PageHeader titleW="w-72" subtitleW="w-96" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <CardPanel key={i} className="space-y-5 h-[360px]">
          <div className="space-y-2"><S className="w-48 h-5" /><S className="w-64 h-3" /></div>
          <S className="w-full h-56 rounded-xl" />
        </CardPanel>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <CardPanel className="lg:col-span-2 space-y-5">
        <S className="w-48 h-5" />
        <S className="w-full h-56 rounded-xl" />
      </CardPanel>
      <CardPanel className="space-y-5">
        <S className="w-32 h-5" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <S className="w-24 h-4" />
              <S className="w-10 h-4" />
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Analytics  /analytics
───────────────────────────────────────────── */
export const AnalyticsSkeleton = () => (
  <div className="space-y-8 pb-10">
    <PageHeader titleW="w-64" subtitleW="w-80" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardPanel key={i} className="space-y-5">
          <S className="w-32 h-5" />
          <S className="w-full h-64 rounded-xl" />
        </CardPanel>
      ))}
    </div>
    <CardPanel className="space-y-5">
      <S className="w-40 h-5" />
      <S className="w-full h-72 rounded-xl" />
    </CardPanel>
  </div>
);

/* ─────────────────────────────────────────────
   Nodes  /nodes
───────────────────────────────────────────── */
export const NodesSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <S className="w-80 h-10" />
        <S className="w-96 h-4" />
      </div>
      <S className="w-10 h-10 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} />)}
    </div>

    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardPanel key={i} className="flex flex-col space-y-5">
          <div className="flex items-center gap-6">
            <S className="w-20 h-20 rounded-3xl shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <S className="w-48 h-7" />
                <S className="w-16 h-5 rounded-md" />
              </div>
              <div className="flex gap-4">
                <S className="w-24 h-4" />
                <S className="w-24 h-4" />
              </div>
            </div>
            <S className="w-24 h-9 rounded-xl shrink-0" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.04]">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <S className="w-16 h-3" />
                <S className="w-20 h-5" />
              </div>
            ))}
          </div>
        </CardPanel>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Audit  /audit
───────────────────────────────────────────── */
export const AuditSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="flex justify-between items-center">
      <S className="w-64 h-10" />
      <div className="flex gap-3">
        <S className="w-9 h-9 rounded-lg" />
        <S className="w-9 h-9 rounded-lg" />
      </div>
    </div>
    <CardPanel className="space-y-0 p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02]">
        <S className="w-48 h-5" />
      </div>
      <div className="divide-y divide-white/[0.03]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <S className="w-8 h-8 rounded-lg" />
              <div className="space-y-2">
                <S className="w-56 h-4" />
                <S className="w-40 h-3" />
              </div>
            </div>
            <S className="w-16 h-5 rounded-full" />
          </div>
        ))}
      </div>
    </CardPanel>
  </div>
);

/* ─────────────────────────────────────────────
   Settings  /settings
───────────────────────────────────────────── */
export const SettingsSkeleton = () => (
  <div className="space-y-6 max-w-5xl pb-20">
    <PageHeader titleW="w-64" subtitleW="w-48" />

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar tabs */}
      <div className="flex flex-row md:flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <S key={i} className="h-11 rounded-lg flex-1 md:flex-none md:w-full" />
        ))}
      </div>

      {/* Content area */}
      <div className="md:col-span-3 space-y-6">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04] bg-white/[0.02]">
            <S className="w-32 h-4" />
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <S className="w-28 h-3" />
                  <S className="w-full h-10 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/[0.04] flex justify-end">
              <S className="w-28 h-10 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04] bg-white/[0.02]">
            <S className="w-40 h-4" />
          </div>
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-5">
                <div className="space-y-2">
                  <S className="w-48 h-4" />
                  <S className="w-64 h-3" />
                </div>
                <S className="w-8 h-4 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Profile  /profile
───────────────────────────────────────────── */
export const ProfileSkeleton = () => (
  <div className="space-y-6 max-w-3xl pb-20">
    <PageHeader titleW="w-48" subtitleW="w-64" />
    <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
      <SCircle size="w-20 h-20" />
      <div className="space-y-3 flex-1">
        <S className="w-40 h-6" />
        <S className="w-56 h-4" />
        <S className="w-24 h-7 rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <S className="w-24 h-3" />
          <S className="w-full h-11 rounded-xl" />
        </div>
      ))}
    </div>
    <div className="flex justify-end">
      <S className="w-32 h-11 rounded-xl" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   API Keys  /dashboard/api-keys
───────────────────────────────────────────── */
export const ApiKeysSkeleton = () => (
  <div className="space-y-8 pb-10">
    <PageHeader titleW="w-48" subtitleW="w-72" hasButton />

    <CardPanel className="space-y-0 p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02]">
        <S className="w-40 h-5" />
      </div>
      <div className="divide-y divide-white/[0.03]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5">
            <SCircle size="w-8 h-8" />
            <div className="flex-1 space-y-2">
              <S className="w-40 h-4" />
              <S className="w-56 h-3" />
            </div>
            <S className="w-16 h-6 rounded-full hidden sm:block" />
            <S className="w-20 h-4 hidden sm:block" />
            <S className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </CardPanel>
  </div>
);

/* ─────────────────────────────────────────────
   Generic Fallback
───────────────────────────────────────────── */
const GenericSkeleton = () => (
  <div className="space-y-8 pb-10">
    <PageHeader titleW="w-64" subtitleW="w-96" hasButton />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <S key={i} className="w-full h-48 rounded-2xl" />
      ))}
    </div>
    <S className="w-full h-96 rounded-3xl" />
  </div>
);

/* ─────────────────────────────────────────────
   Route-aware Skeleton Router
   Used by DashboardLayout <Suspense fallback>
   AND by ProtectedRoute while initializing
───────────────────────────────────────────── */
export const ContentSkeleton = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/dashboard/api-keys') return <ApiKeysSkeleton />;
  if (path.startsWith('/dashboard')) return <DashboardSkeleton />;
  if (path.startsWith('/vault'))     return <FilesSkeleton />;
  if (path.startsWith('/uploads'))   return <UploadSkeleton />;
  if (path.startsWith('/shares'))    return <SharesSkeleton />;
  if (path.startsWith('/bin'))       return <RecycleBinSkeleton />;
  if (path.startsWith('/security'))  return <SecuritySkeleton />;
  if (path.startsWith('/monitoring'))return <MonitoringSkeleton />;
  if (path.startsWith('/analytics')) return <AnalyticsSkeleton />;
  if (path.startsWith('/nodes'))     return <NodesSkeleton />;
  if (path.startsWith('/audit'))     return <AuditSkeleton />;
  if (path.startsWith('/settings'))  return <SettingsSkeleton />;
  if (path.startsWith('/profile'))   return <ProfileSkeleton />;

  return <GenericSkeleton />;
};

export default ContentSkeleton;
