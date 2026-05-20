import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Globe, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronDown,
  Menu
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../ui/ThemeToggle';

const TopNav = () => {
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery, isSidebarOpenMobile, setSidebarOpenMobile } = useDashboardStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      useDashboardStore.getState().reset();
      logout();
      toast.success('Securely logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="h-20 border-b border-border bg-surface-secondary/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
      {/* Mobile Drawer Hamburger Menu Button */}
      <button 
        onClick={() => setSidebarOpenMobile(!isSidebarOpenMobile)}
        className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-surface-elevated rounded-xl mr-3 shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary-accent transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, files, or nodes..."
            className="w-full h-10 pl-10 pr-4 bg-surface-elevated/50 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-status-success/5 border border-status-success/20">
          <Globe className="w-4 h-4 text-status-success mr-2" />
          <span className="text-xs font-medium text-status-success">System Healthy</span>
          <div className="ml-2 w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
        </div>

        <NotificationBell />

        <ThemeToggle />

        <div className="h-8 w-[1px] bg-border" />

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-surface-elevated transition-all border border-transparent hover:border-border group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-accent to-security flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary-accent/10">
              {getInitials(user?.full_name || user?.username)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-text-primary leading-tight flex items-center">
                {user?.full_name || user?.username || 'Anonymous'}
                <ChevronDown className={`ml-2 w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-56 bg-surface-elevated/95 border border-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50 backdrop-blur-xl safari-hardware-accel safari-backdrop-blur"
              >
                <div className="px-4 py-3 border-b border-border/50 mb-1">
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Active Identity</p>
                  <p className="text-xs font-bold text-text-primary truncate">{user?.email}</p>
                </div>

                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2.5 text-sm text-text-secondary hover:text-primary-accent hover:bg-primary-accent/5 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </Link>

                <Link 
                  to="/security" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2.5 text-sm text-text-secondary hover:text-primary-accent hover:bg-primary-accent/5 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Security Status</span>
                </Link>

                <Link 
                  to="/settings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2.5 text-sm text-text-secondary hover:text-primary-accent hover:bg-primary-accent/5 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Vault Settings</span>
                </Link>

                <div className="h-px bg-border/50 my-1 mx-2" />

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-status-danger hover:bg-status-danger/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold">Logout Session</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
