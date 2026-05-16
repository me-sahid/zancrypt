import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  Database, 
  Globe, 
  Activity,
  Server
} from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import InfrastructureOutage from './InfrastructureOutage';
import Button from '../ui/Button';

const StatusRow = ({ icon: Icon, label, status, attempts }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated/30 border border-white/5 backdrop-blur-sm">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${status === 'healthy' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-bold text-text-primary">{label}</span>
    </div>
    <div className="flex items-center space-x-4">
      {attempts !== undefined && (
        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Retrying... ({attempts})</span>
      )}
      <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${status === 'healthy' ? 'bg-status-success/20 text-status-success' : 'bg-status-danger/20 text-status-danger animate-pulse'}`}>
        {status === 'healthy' ? 'Online' : 'Offline'}
      </div>
    </div>
  </div>
);

const OfflineScreen = () => {
  const { status, retryCount, nextRetryAt, services, isInternetReachable } = useNetworkStatus();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (nextRetryAt) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((nextRetryAt - Date.now()) / 1000));
        setCountdown(remaining);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [nextRetryAt]);

  if (status === 'online') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-surface-primary flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar"
    >
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Cinematic Visual */}
        <div className="space-y-8">
           <div className="space-y-4">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-status-danger/10 border border-status-danger/30 text-status-danger text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Critical Infrastructure Failure</span>
              </motion.div>
              
              <h1 className="text-5xl font-black text-text-primary tracking-tighter leading-none">
                Connection to <br />
                <span className="text-status-danger">Distributed Infrastructure</span> Lost
              </h1>
              
              <p className="text-text-secondary text-lg leading-relaxed max-w-md">
                Unable to reach Zancrypt core services. Monitoring, cryptographic verification, and synchronization systems are temporarily suspended.
              </p>
           </div>

           <InfrastructureOutage />

           <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <RefreshCw className={`w-5 h-5 text-primary-accent ${status === 'reconnecting' ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-bold text-text-primary">Attempting secure reconnection...</span>
                 </div>
                 <span className="text-xl font-mono font-bold text-primary-accent">00:0{countdown}</span>
              </div>
              <div className="h-1 w-full bg-surface-elevated rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: '0%' }}
                   animate={{ width: `${(1 - countdown/5) * 100}%` }}
                   className="h-full bg-primary-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                 />
              </div>
           </div>
        </div>

        {/* Right Side: Status Control Panel */}
        <div className="space-y-6">
           <div className="glass-panel p-8 rounded-3xl space-y-8">
              <div>
                 <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.3em] mb-6">Service Health Matrix</h3>
                 <div className="space-y-3">
                    <StatusRow 
                      icon={Globe} 
                      label="Public Network Interface" 
                      status={isInternetReachable ? 'healthy' : 'offline'} 
                    />
                    <StatusRow 
                      icon={ShieldAlert} 
                      label="Zancrypt API Gateway" 
                      status={services.gateway === 'healthy' ? 'healthy' : 'offline'} 
                      attempts={retryCount}
                    />
                    <StatusRow 
                      icon={Database} 
                      label="Redis Stream Engine" 
                      status={services.redis === 'healthy' ? 'healthy' : 'offline'} 
                    />
                    <StatusRow 
                      icon={Activity} 
                      label="Node Telemetry Stream" 
                      status={services.telemetry === 'healthy' ? 'healthy' : 'offline'} 
                    />
                    <StatusRow 
                      icon={Server} 
                      label="Vault Sync Protocol" 
                      status={services.sync === 'healthy' ? 'healthy' : 'offline'} 
                    />
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <Button 
                   variant="primary" 
                   className="w-full py-6 text-lg font-black group"
                   isLoading={status === 'reconnecting'}
                   onClick={() => window.location.reload()}
                 >
                    Force Infrastructure Reset
                 </Button>
                 <p className="text-[10px] text-text-secondary text-center uppercase tracking-widest font-bold">
                    System will automatically resume upon successful handshake.
                 </p>
              </div>
           </div>

           {/* Security Warning */}
           <div className="p-4 rounded-2xl bg-status-warning/5 border border-status-warning/20 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
              <div>
                 <p className="text-xs font-bold text-status-warning uppercase tracking-widest mb-1">Security Enforcement Active</p>
                 <p className="text-[10px] text-text-secondary leading-normal">
                    Write operations and shard movements have been locked to prevent integrity corruption during the outage.
                 </p>
              </div>
           </div>
        </div>
      </div>
      
      {/* Background Ambience */}
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-status-danger/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default OfflineScreen;
