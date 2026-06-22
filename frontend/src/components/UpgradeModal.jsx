import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ isOpen, onClose, title = "Upgrade Required", message, feature = "Pro", limitType = "limit" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    // Assuming the pricing is on the home page or a specific route
    navigate('/#pricing');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-void/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-lg shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-text-primary tracking-tight">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary mb-6 leading-relaxed">
              {message || `You've reached your plan's ${limitType}. Upgrade to ${feature} to unlock more capabilities.`}
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-text-muted">
                <Check className="w-4 h-4 text-accent mr-2" />
                <span>Increase your storage up to 500GB</span>
              </div>
              <div className="flex items-center text-sm text-text-muted">
                <Check className="w-4 h-4 text-accent mr-2" />
                <span>Upload massive files up to 5GB</span>
              </div>
              <div className="flex items-center text-sm text-text-muted">
                <Check className="w-4 h-4 text-accent mr-2" />
                <span>Create unlimited secure share links</span>
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-surface-raised hover:bg-border text-text-primary text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-void text-sm font-bold rounded transition-colors shadow-[0_0_15px_rgba(var(--color-accent),0.3)]"
              >
                View Plans
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeModal;
