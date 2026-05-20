import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  UploadCloud, 
  Server, 
  ShieldCheck, 
  Activity, 
  PieChart, 
  History, 
  Settings,
  ChevronLeft,
  Menu,
  Lock,
  Share2,
  Trash2
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDashboardStore } from '../../store/useDashboardStore';

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
        width: isMobileView ? 280 : (isCollapsed ? 80 : 280),
        x: isMobileView ? (isSidebarOpenMobile ? 0 : -280) : 0
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={twMerge(
        "z-50 flex flex-col h-screen border-r border-border bg-surface-secondary transition-shadow duration-300 safari-hardware-accel",
        isMobileView ? "fixed top-0 left-0 shadow-2xl" : "relative"
      )}
    >
      {/* Logo Section */}
      <Link to="/" className="flex items-center h-20 px-6 border-b border-border/50 hover:opacity-90 transition-opacity cursor-pointer">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-accent shadow-lg shadow-primary-accent/30 group">
          <Lock className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </div>
        <AnimatePresence>
          {(!isCollapsed || isMobileView) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4"
            >
              <h2 className="font-bold text-xl tracking-tight text-text-primary">
                Zan<span className="text-primary-accent">crypt</span>
              </h2>
              <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold">Infrastructure</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isMobileView) setSidebarOpenMobile(false);
            }}
            className={({ isActive }) => twMerge(
              'flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden',
              isActive 
                ? 'text-primary-accent' 
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute inset-0 bg-primary-accent/10 border border-primary-accent/20 rounded-xl"
                  />
                )}
                
                <item.icon className={twMerge(
                  'w-5 h-5 min-w-[20px] z-10 transition-colors',
                  isActive ? 'text-primary-accent' : 'group-hover:text-text-primary'
                )} />
                
                <AnimatePresence>
                  {(!isCollapsed || isMobileView) && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="ml-4 whitespace-nowrap font-semibold z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (!isCollapsed || isMobileView) && (
                   <motion.div 
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 w-1 h-6 bg-primary-accent rounded-l-full origin-center"
                  />
                )}

                {isCollapsed && !isMobileView && (
                   <div className="absolute left-full ml-6 px-3 py-2 bg-surface-elevated border border-border text-text-primary text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform translate-x-[-10px] group-hover:translate-x-0 shadow-2xl z-[60]">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Storage Quota Block */}
      {(!isCollapsed || isMobileView) && (
        <div className="px-5 py-4 mx-4 mb-4 rounded-xl bg-surface-elevated/40 border border-border/50">
          <div className="flex items-center justify-between text-[10px] mb-1 font-bold uppercase tracking-wider text-blue-400">
            <span>Testing Tier</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-text-secondary">Storage Vault</span>
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
              })()} / 1 GB
            </span>
          </div>
          <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0.5, ((Math.max(metrics?.totalStorage || 0, (files || []).reduce((acc, f) => acc + (f.file_size || 0), 0))) / (1 * 1024 * 1024 * 1024)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-border/50">
        {isMobileView ? (
          <button
            onClick={() => setSidebarOpenMobile(false)}
            className="flex items-center justify-center w-full h-12 rounded-xl bg-surface-elevated/50 text-text-secondary hover:text-text-primary transition-all border border-border/50 hover:border-primary-accent/30 group font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="w-5 h-5 mr-3 group-hover:scale-110" />
            <span>Close Menu</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full h-12 rounded-xl bg-surface-elevated/50 text-text-secondary hover:text-text-primary transition-all border border-border/50 hover:border-primary-accent/30 group"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "backOut" }}
            >
              <ChevronLeft className="w-5 h-5 group-hover:scale-110" />
            </motion.div>
            {!isCollapsed && <span className="ml-3 text-sm font-bold uppercase tracking-widest">Minimize</span>}
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
