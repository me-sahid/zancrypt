import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { Activity, Server, Globe, Cpu, Cloud } from 'lucide-react';

// Human-readable provider labels
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
        <Cloud className="w-8 h-8 mb-3 text-text-secondary" />
        <p className="text-xs font-bold text-text-secondary">No cloud nodes connected</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {nodes.map((node, i) => {
        const providerLabel = PROVIDER_LABELS[node.provider] || node.provider;
        const providerColor = PROVIDER_COLORS[node.provider] || 'text-primary-accent';

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative p-4 rounded-xl bg-surface-elevated/30 border border-border/50 hover:border-primary-accent/40 transition-all cursor-pointer overflow-hidden"
          >
            {/* Live Status indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <span className={twMerge(
                "w-2 h-2 rounded-full",
                node.status === 'success' ? "bg-status-success animate-pulse" : "bg-status-danger"
              )} />
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                {node.health}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-surface-secondary border border-border group-hover:bg-primary-accent/5 transition-colors">
                <Server className="w-5 h-5 text-text-secondary group-hover:text-primary-accent transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-text-primary truncate">{node.name}</h4>
                  <span className="text-[10px] font-mono text-primary-accent">{node.latency}ms</span>
                </div>
                
                <div className="flex items-center space-x-3 text-[10px] text-text-secondary uppercase font-bold tracking-tight">
                  <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> {node.region}</span>
                  <span className={twMerge("flex items-center font-bold", providerColor)}>
                    <Cloud className="w-3 h-3 mr-1" /> {providerLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="px-2 py-1.5 rounded-lg bg-surface-primary/50 border border-border/50">
                <p className="text-[8px] text-text-secondary uppercase font-bold mb-0.5">Shards</p>
                <p className="text-xs font-bold text-text-primary">{(node.shards || 0).toLocaleString()}</p>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-surface-primary/50 border border-border/50">
                <p className="text-[8px] text-text-secondary uppercase font-bold mb-0.5">Uptime</p>
                <p className="text-xs font-bold text-text-primary">99.98%</p>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-surface-primary/50 border border-border/50">
                <p className="text-[8px] text-text-secondary uppercase font-bold mb-0.5">Load</p>
                <p className={twMerge(
                  "text-xs font-bold",
                  node.load > 80 ? "text-status-danger" : node.load > 60 ? "text-status-warning" : "text-status-success"
                )}>
                  {typeof node.load === 'number' ? node.load.toFixed(1) : '0'}%
                </p>
              </div>
            </div>

            {/* Load bar */}
            <div className="mt-3 w-full h-1 bg-border/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${node.load}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={twMerge(
                  "h-full rounded-full",
                  node.load > 80 ? "bg-status-danger" : node.load > 60 ? "bg-status-warning" : "bg-status-success"
                )}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NodeStatusGrid;
