import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const SecurityFeed = ({ events }) => {
  return (
    <div className="relative">
      <div className="space-y-0">
        <AnimatePresence initial={false}>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="group border-b border-border last:border-0"
            >
              <div className="flex items-start space-x-4 p-4 bg-void hover:bg-surface transition-colors cursor-pointer">
                <div className={twMerge(
                  "p-2 border shrink-0",
                  event.severity === 'danger' ? "border-danger text-danger bg-danger/5" :
                  event.severity === 'warning' ? "border-warning text-warning bg-warning/5" :
                  event.severity === 'success' ? "border-accent text-accent bg-accent/5" :
                  "border-border text-text-muted bg-surface"
                )}>
                  {event.severity === 'danger' ? <AlertTriangle className="w-4 h-4" /> :
                   event.severity === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   event.type === 'crypto' ? <Lock className="w-4 h-4" /> :
                   <Shield className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-mono text-text-primary truncate">{event.event}</p>
                    <span className="text-xs font-mono text-text-muted whitespace-nowrap ml-2 flex items-center uppercase tracking-widest">
                      <Clock className="w-3 h-3 mr-1" /> {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-mono uppercase tracking-widest">
                    <span className="text-accent">{event.user}</span> · {event.type}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="w-full mt-4 py-3 bg-surface border border-border text-xs font-mono uppercase tracking-widest text-text-muted hover:text-accent hover:border-accent transition-colors">
        [ Inspect All Logs ]
      </button>
    </div>
  );
};

export default SecurityFeed;
