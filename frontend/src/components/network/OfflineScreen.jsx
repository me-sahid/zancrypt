import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const OfflineScreen = () => {
  const { status } = useNetworkStatus();

  if (status === 'online') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-surface-primary flex flex-col items-center justify-center p-6"
    >
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Cinematic Premium Dual-Ring Orbiting Loader */}
        <div className="relative w-20 h-20">
          {/* Animated Background Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-accent/15"
            style={{ borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          {/* Active Orbiting Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-accent"
            style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
          {/* Inner Pulsing Radar Glow */}
          <div className="absolute inset-4 rounded-full bg-primary-accent/5 border border-primary-accent/20 flex items-center justify-center">
            <WifiOff className="w-6 h-6 text-primary-accent animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Network connection lost
          </h2>
          <p className="text-sm text-text-secondary">
            Reconnecting to secure Zancrypt vault...
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-surface-secondary border border-border hover:bg-surface-elevated text-xs font-bold text-text-secondary hover:text-text-primary active:scale-95 transition-all shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Force Reconnect</span>
        </button>
      </div>

      {/* Decorative Premium Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-accent/5 rounded-full blur-[100px] pointer-events-none" />
    </motion.div>
  );
};

export default OfflineScreen;
