import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw, ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-status-danger/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center relative z-10"
      >
        <div className="w-24 h-24 rounded-3xl bg-status-danger/10 border border-status-danger/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-status-danger" />
        </div>
        
        <h1 className="text-6xl font-bold text-text-primary mb-2">404</h1>
        <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest mb-4">Shard Not Found</h2>
        
        <p className="text-text-secondary mb-10 leading-relaxed">
          The requested resource could not be located in the distributed vault. 
          The shard may have been purged or the reference hash is invalid.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/dashboard">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return to Command
            </Button>
          </Link>
          <Button variant="secondary" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => window.location.reload()}>
            Re-Sync Network
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center space-x-2 text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em] opacity-40">
           <AlertTriangle className="w-3 h-3" />
           <span>Error Ref: ERR_SHARD_NULL_0x404</span>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
