import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HardDrive, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '../store/useUploadStore';
import Button from './ui/Button';

const StorageLimitModal = () => {
  const navigate = useNavigate();
  const { showStorageLimitModal, setShowStorageLimitModal } = useUploadStore();

  if (!showStorageLimitModal) return null;

  const handleSeePlans = () => {
    setShowStorageLimitModal(false);
    navigate('/pricing'); 
  };

  return (
    <AnimatePresence>
      {showStorageLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStorageLimitModal(false)}
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-danger/10 rounded-lg text-danger">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Insufficient Storage</h3>
              </div>
              <button
                onClick={() => setShowStorageLimitModal(false)}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-surface-raised rounded-full flex items-center justify-center border border-border">
                <HardDrive className="w-10 h-10 text-text-muted" />
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-2">Storage Limit Reached</h4>
              <p className="text-text-muted mb-6 leading-relaxed">
                You have hit your 1 GB storage limit on the free tier. Please upgrade your plan to upload more files and get additional storage space.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowStorageLimitModal(false)}
                  className="w-full sm:w-1/2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSeePlans}
                  className="w-full sm:w-1/2 group"
                >
                  See Plans
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StorageLimitModal;
