import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  UploadCloud, 
  Share2,
  Trash2,
  ShieldCheck, 
  Settings,
  ChevronLeft,
  Lock
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDashboardStore } from '../../store/useDashboardStore';
import CipherText from '../crypto/CipherText';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: Database, label: 'My Vault', path: '/vault' },
  { icon: UploadCloud, label: 'Add Files', path: '/uploads' },
  { icon: Share2, label: 'Shared Links', path: '/shares' },
  { icon: Trash2, label: 'Recycle Bin', path: '/bin' },
  { icon: ShieldCheck, label: 'Security', path: '/security' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSidebarOpenMobile, setSidebarOpenMobile, metrics, files } = useDashboardStore();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isMobileView ? 280 : (isCollapsed ? 80 : 260),
        x: isMobileView ? (isSidebarOpenMobile ? 0 : -280) : 0
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={twMerge(
        "z-50 flex flex-col h-screen border-r border-border bg-surface transition-all duration-300",
        isMobileView ? "fixed top-0 left-0 shadow-2xl" : "relative"
      )}
    >
      {/* Logo Section */}
      <Link to="/" className="flex items-center h-16 px-6 border-b border-border hover:bg-surface-raised transition-colors">
        <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-accent">
          <Lock className="w-3.5 h-3.5 text-void" />
        </div>
        <AnimatePresence>
          {(!isCollapsed || isMobileView) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3"
            >
              <h2 className="font-display italic text-[20px] text-text-primary tracking-tight leading-none">
                Zancrypt
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isMobileView) setSidebarOpenMobile(false);
            }}
            className={({ isActive }) => twMerge(
              'flex items-center px-6 py-3 transition-colors group relative border-l-2',
              isActive 
                ? 'bg-surface-raised border-accent text-text-primary' 
                : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-raised'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={twMerge(
                  'w-4 h-4 min-w-[16px] transition-colors',
                  isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'
                )} />
                
                <AnimatePresence>
                  {(!isCollapsed || isMobileView) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={twMerge(
                        "ml-4 whitespace-nowrap font-mono text-xs uppercase tracking-widest",
                        isActive ? "text-accent" : ""
                      )}
                    >
                      {isActive ? <CipherText text={item.label} duration={500} /> : item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Storage Quota Block */}
      {(!isCollapsed || isMobileView) && (
        <div className="px-6 py-6 border-t border-border">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2 uppercase tracking-widest text-text-muted">
            <span>Storage Usage</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs mb-3">
            <span className="text-text-primary">
              {(() => {
                const realTotalStorage = (files || []).reduce((acc, f) => acc + (f.file_size || 0), 0);
                const bytes = Math.max(metrics?.totalStorage || 0, realTotalStorage);
                const gb = bytes / (1024 * 1024 * 1024);
                if (gb < 0.1) {
                  const mb = bytes / (1024 * 1024);
                  return `${mb.toFixed(1)} MB`;
                }
                return `${gb.toFixed(2)} GB`;
              })()} / 5 GB
            </span>
          </div>
          <div className="w-full h-1 bg-surface-raised rounded-none overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0.5, ((Math.max(metrics?.totalStorage || 0, (files || []).reduce((acc, f) => acc + (f.file_size || 0), 0))) / (5 * 1024 * 1024 * 1024)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="border-t border-border">
        {isMobileView ? (
          <button
            onClick={() => setSidebarOpenMobile(false)}
            className="flex items-center justify-center w-full h-12 bg-void text-text-muted hover:text-text-primary transition-colors hover:bg-surface-raised font-mono text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Close</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full h-12 bg-void text-text-muted hover:text-text-primary transition-colors hover:bg-surface-raised"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
