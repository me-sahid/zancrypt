import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Lock
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Database, label: 'Vault', path: '/files' },
  { icon: UploadCloud, label: 'Uploads', path: '/upload' },
  { icon: Server, label: 'Nodes', path: '/nodes' },
  { icon: ShieldCheck, label: 'Security', path: '/security' },
  { icon: Activity, label: 'Monitoring', path: '/monitoring' },
  { icon: PieChart, label: 'Analytics', path: '/analytics' },
  { icon: History, label: 'Audit Logs', path: '/audit' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="relative flex flex-col h-screen border-r border-border bg-surface-secondary transition-all duration-300 z-50"
    >
      {/* Logo Section */}
      <div className="flex items-center h-20 px-6 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-accent shadow-lg shadow-primary-accent/20">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 font-bold text-lg tracking-tight text-text-primary whitespace-nowrap"
            >
              Zan<span className="text-primary-accent">crypt</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => twMerge(
              'flex items-center px-3 py-2.5 rounded-lg transition-all group relative',
              isActive 
                ? 'bg-primary-accent/10 text-primary-accent border border-primary-accent/20' 
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
            )}
          >
            <item.icon className={twMerge('w-5 h-5 min-w-[20px]', !isCollapsed && 'mr-3')} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
               <div className="absolute left-full ml-4 px-2 py-1 bg-surface-elevated border border-border text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full h-10 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors border border-border"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
