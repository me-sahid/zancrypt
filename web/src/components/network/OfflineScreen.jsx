import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const OfflineScreen = () => {
  const { status } = useNetworkStatus();

  if (status === 'online') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 right-6 z-[9999] bg-surface-elevated border border-border p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto"
    >
      <div className="p-2.5 bg-primary-accent/10 text-primary-accent rounded-xl border border-primary-accent/20">
        <WifiOff className="w-5 h-5 animate-pulse" />
      </div>

      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-text-primary tracking-tight">
          Network connection lost
        </h2>
        <p className="text-xs text-text-secondary">
          Reconnecting to secure Zancrypt vault...
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="ml-2 flex items-center p-2 rounded-xl bg-surface-secondary border border-border hover:bg-surface hover:text-text-primary text-text-secondary transition-all"
        title="Force Reconnect"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default OfflineScreen;
