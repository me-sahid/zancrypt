import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Menu, 
  X, 
  ArrowRight, 
  Globe, 
  ChevronDown, 
  Snowflake, 
  Cloud, 
  Key, 
  FileText, 
  Settings, 
  HelpCircle, 
  ExternalLink, 
  LogOut,
  LayoutDashboard 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/useStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to extract clean name instead of showing raw email
  const getUserDisplayName = () => {
    if (!user) return 'sahidzack';
    const name = user.name || user.username || user.email || 'sahidzack';
    if (name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  const displayName = getUserDisplayName();

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Security', href: '#security' },
    { name: 'API', href: '#api' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        isScrolled ? 'py-4 bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/5 shadow-lg' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary-accent flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-all">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Zan<span className="text-primary-accent">crypt</span>
          </span>
        </Link>

        {/* Desktop Links (Optimized spacing for tablet widths) */}
        <div className="hidden md:flex items-center space-x-5 lg:space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-xs lg:text-sm font-semibold text-text-secondary hover:text-white transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-accent transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Auth Buttons / Dropdown Section (Responsive adjustments) */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
          <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-text-secondary hover:text-white transition-colors cursor-pointer" />
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 lg:space-x-4 relative" ref={dropdownRef}>
              {/* User Selector Block */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 py-1.5 px-2.5 rounded-full hover:bg-white/5 transition-colors group max-w-[160px] lg:max-w-[200px]"
              >
                <div className="w-7 h-7 lg:w-8 lg:h-8 shrink-0 rounded-full bg-[#202024] border border-white/10 flex items-center justify-center font-bold text-white text-xs lg:text-sm uppercase">
                  {displayName[0]}
                </div>
                <span className="text-xs lg:text-sm font-semibold text-text-secondary group-hover:text-white transition-colors truncate max-w-[70px] lg:max-w-[100px]">
                  {displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-text-secondary group-hover:text-white transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Download Action Button linking to /download */}
              <Link 
                to="/download" 
                className="px-4 py-2 bg-primary-accent hover:bg-primary-accent/90 text-white text-[10px] lg:text-xs font-black uppercase tracking-wider rounded-lg transition-all transform hover:scale-102 shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0"
              >
                Download
              </Link>

              {/* Floating Dropdown Card (Epic Games style) */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[#18181c] border border-white/5 rounded-xl shadow-2xl p-2 z-[200] backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 text-[10px] font-black text-[#5F6368] uppercase tracking-[0.2em] mb-1">
                      Vaults & Storage
                    </div>

                    <div className="space-y-0.5">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-accent shrink-0" />
                        <span className="font-bold">Dashboard</span>
                      </Link>

                      <Link 
                        to="/vault" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-bold">Private Vault</span>
                      </Link>

                      <Link 
                        to="/nodes" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <Cloud className="w-4 h-4 text-green-400" />
                        <span className="font-bold">Multi-Cloud Backups</span>
                      </Link>

                      <Link 
                        to="/security" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <Key className="w-4 h-4 text-status-warning" />
                        <span className="font-bold">Security Credentials</span>
                      </Link>

                      <Link 
                        to="/audit" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="font-bold">Immutable Audit Trail</span>
                      </Link>

                      <Link 
                        to="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-text-secondary" />
                        <span className="font-bold">Account Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-white/5 my-2" />

                    <div className="space-y-0.5">
                      <a 
                        href="#support" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <HelpCircle className="w-4 h-4 text-text-secondary" />
                          <span className="font-bold">Support & Docs</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                      </a>

                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-status-danger hover:bg-status-danger/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-bold">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-xs lg:text-sm font-semibold text-text-secondary hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="flex items-center px-4 py-2 bg-white text-black text-xs lg:text-sm font-bold rounded-full hover:bg-primary-accent hover:text-white transition-all transform hover:scale-105"
              >
                Start Now
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-[#0a0a0c] border-b border-white/5 px-6 py-8 md:hidden shadow-2xl z-[150]"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg font-bold text-text-secondary hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              
              <div className="pt-6 border-t border-white/5 flex flex-col space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#18181c] border border-white/5">
                      <div className="w-9 h-9 rounded-full bg-primary-accent flex items-center justify-center font-bold text-white uppercase text-sm">
                        {displayName[0]}
                      </div>
                      <span className="font-bold text-white truncate">{displayName}</span>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center justify-center py-3.5 bg-primary-accent text-white font-bold rounded-xl shadow-lg hover:bg-primary-accent/90"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Open Your Vault
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>

                    <Link 
                      to="/download" 
                      className="flex items-center justify-center py-3.5 bg-[#202024] border border-white/5 text-white font-bold rounded-xl"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Download App
                    </Link>

                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 py-3.5 bg-[#2a1b1b] hover:bg-[#3d1f1f] text-status-danger font-bold rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-bold text-white block text-center" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" className="flex items-center justify-center py-3.5 bg-primary-accent text-white font-bold rounded-xl shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
