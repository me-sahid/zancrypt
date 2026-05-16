import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { Activity, Server, Globe, Cpu } from 'lucide-react';

const NodeStatusGrid = ({ nodes }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative p-4 rounded-xl bg-surface-elevated/30 border border-border/50 hover:border-primary-accent/40 transition-all cursor-pointer overflow-hidden"
        >
          {/* Active Status */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
             <span className={twMerge(
                "w-2 h-2 rounded-full",
                node.status === 'success' ? "bg-status-success" : "bg-status-warning"
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
                <span className="flex items-center"><Cpu className="w-3 h-3 mr-1" /> {node.load.toFixed(0)}% Load</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="px-2 py-1.5 rounded-lg bg-surface-primary/50 border border-border/50">
              <p className="text-[8px] text-text-secondary uppercase font-bold mb-0.5">Shards</p>
              <p className="text-xs font-bold text-text-primary">{node.shards.toLocaleString()}</p>
            </div>
             <div className="px-2 py-1.5 rounded-lg bg-surface-primary/50 border border-border/50">
              <p className="text-[8px] text-text-secondary uppercase font-bold mb-0.5">Uptime</p>
              <p className="text-xs font-bold text-text-primary">99.98%</p>
            </div>
             <div className="px-2 py-1.5 rounded-lg bg-surface-primary/50 border border-border/50">
              <p className="text-[8px] text-text-secondary uppercase font-bold mb-0.5">Provider</p>
              <p className="text-xs font-bold text-text-primary">{node.provider}</p>
            </div>
          </div>

          {/* Progress Bar (Load) */}
          <div className="mt-3 w-full h-1 bg-border/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${node.load}%` }}
              className={twMerge(
                "h-full rounded-full transition-all duration-500",
                node.load > 80 ? "bg-status-danger" : node.load > 60 ? "bg-status-warning" : "bg-status-success"
              )}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NodeStatusGrid;
