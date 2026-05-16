import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const DegradedBanner = () => {
  const { status, isWebsocketConnected } = useNetworkStatus();

  const isDegraded = status === 'degraded' || !isWebsocketConnected;

  return (
    <AnimatePresence>
      {isDegraded && status === 'online' && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-status-warning/10 backdrop-blur-md border-b border-status-warning/20 px-6 py-2"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse" />
              <AlertCircle className="w-4 h-4 text-status-warning" />
              <span className="text-[10px] font-black text-status-warning uppercase tracking-widest">
                Infrastructure Alert: Real-time Telemetry Degraded
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-tighter">
                Some observability streams are temporarily unavailable. System integrity remains optimal.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-status-warning/20 border border-status-warning/30 hover:bg-status-warning/30 transition-all group"
              >
                <RefreshCw className="w-3 h-3 text-status-warning group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[10px] font-black text-status-warning uppercase">Refresh Stream</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DegradedBanner;
