import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const SecurityFeed = ({ events }) => {
  return (
    <div className="relative">
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="group"
            >
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-surface-elevated/20 border border-border/30 hover:border-primary-accent/30 transition-all hover:bg-surface-elevated/40">
                <div className={twMerge(
                  "p-2.5 rounded-lg border shrink-0",
                  event.severity === 'danger' ? "bg-status-danger/10 border-status-danger/20 text-status-danger" :
                  event.severity === 'warning' ? "bg-status-warning/10 border-status-warning/20 text-status-warning" :
                  event.severity === 'success' ? "bg-status-success/10 border-status-success/20 text-status-success" :
                  "bg-surface-elevated border-border text-text-secondary"
                )}>
                  {event.severity === 'danger' ? <AlertTriangle className="w-4 h-4" /> :
                   event.severity === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   event.type === 'crypto' ? <Lock className="w-4 h-4" /> :
                   <Shield className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-text-primary truncate">{event.event}</p>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {event.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">
                    {event.user} · {event.type}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <button className="w-full mt-6 py-3 rounded-xl bg-surface-elevated/50 border border-border/50 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-primary-accent hover:border-primary-accent/30 transition-all">
        Inspect All Security Logs
      </button>
    </div>
  );
};

export default SecurityFeed;
