import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { Server, Globe, Cloud } from 'lucide-react';
import NodeDot from '../crypto/NodeDot';

const PROVIDER_LABELS = {
  S3: 'Backblaze B2',
  SUPABASE: 'Supabase S3',
  STORJ: 'Storj S3',
};

// Provider accent colors
const PROVIDER_COLORS = {
  S3: 'text-orange-400',
  SUPABASE: 'text-emerald-400',
  STORJ: 'text-cyan-400',
};

const NodeStatusGrid = ({ nodes }) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
        <Cloud className="w-8 h-8 mb-3 text-text-muted" />
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">No nodes found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border font-mono text-[9px] uppercase tracking-widest text-text-muted">
        <div className="col-span-1">Status</div>
        <div className="col-span-4">Node / Region</div>
        <div className="col-span-3">Provider</div>
        <div className="col-span-2">Latency</div>
        <div className="col-span-2 text-right">Load</div>
      </div>

      {nodes.map((node, i) => {
        const providerLabel = PROVIDER_LABELS[node.provider] || node.provider;
        const statusType = node.health === 'Healthy' ? 'online' : 'offline';

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center border border-transparent hover:bg-surface-raised transition-colors group text-xs font-mono"
          >
            {/* Status */}
            <div className="col-span-1 flex justify-center">
              <NodeDot status={statusType} />
            </div>

            {/* Node Info */}
            <div className="col-span-4 min-w-0">
              <div className="text-text-primary truncate">{node.name}</div>
              <div className="text-[9px] text-text-muted truncate">{node.region}</div>
            </div>

            {/* Provider */}
            <div className="col-span-3 text-text-secondary truncate">
              {providerLabel}
            </div>

            {/* Latency */}
            <div className="col-span-2">
              <span className={statusType === 'online' ? 'text-accent' : 'text-danger'}>
                {node.latency}ms
              </span>
            </div>

            {/* Load */}
            <div className="col-span-2 text-right flex items-center justify-end space-x-2">
              <span className={node.load > 80 ? "text-danger" : node.load > 60 ? "text-warning" : "text-text-primary"}>
                {typeof node.load === 'number' ? node.load.toFixed(1) : '0'}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NodeStatusGrid;
