import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Poll for notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/');
      if (res.data) setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark read when opened
  const handleOpen = async () => {
    const wasClosed = !isOpen;
    setIsOpen(!isOpen);
    
    if (wasClosed && notifications.length > 0) {
      try {
        await api.post('/api/notifications/mark-read');
        // Optimistically clear the dot, but keep the list visible for the user to read
        setTimeout(() => setNotifications([]), 5000); // Clear after 5 seconds to give them time to read
      } catch (error) {
        console.error('Failed to mark read:', error);
      }
    }
  };

  const unreadCount = notifications.length;

  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'ttl_expiry':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'download_limit':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-rose-400" />;
    }
  };

  const getTriggerText = (trigger) => {
    switch (trigger) {
      case 'ttl_expiry':
        return 'Link expired';
      case 'download_limit':
        return 'Download limit reached';
      case 'manual':
        return 'Manually revoked';
      default:
        return 'Auto-deleted';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-surface-elevated rounded-lg"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-surface-secondary shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-[#0d121f]/95 border border-[#1e293b]/70 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 backdrop-blur-xl"
          >
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#1e293b]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">You're all caught up!</p>
                  <p className="text-[10px] text-slate-500 mt-1">No new ephemeral deletion alerts.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1e293b]/50">
                  {notifications.map(notif => (
                    <div key={notif.notification_id} className="p-4 hover:bg-[#1e293b]/30 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg shrink-0 border border-rose-500/20">
                          {getTriggerIcon(notif.trigger)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-200">File Auto-Deleted</p>
                          <p className="text-xs text-slate-400 mt-1 truncate" title={notif.file_name}>
                            <FileText className="w-3 h-3 inline-block mr-1 opacity-50" />
                            {notif.file_name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              {getTriggerText(notif.trigger)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
