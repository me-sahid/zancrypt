import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Menu, 
  X, 
  ArrowRight, 
  Activity, 
  ChevronDown, 
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
import ThemeToggle from '../../../components/ui/ThemeToggle';

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
    { name: 'Features', href: '#features', isRoute: false },
    { name: 'Architecture', href: '#architecture', isRoute: false },
    { name: 'Security', href: '#security', isRoute: false },
    { name: 'API', href: '/api', isRoute: true },
  ];

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        isScrolled ? 'py-4 bg-void/90 backdrop-blur-xl border-b border-border shadow-lg' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-sm bg-accent flex items-center justify-center shadow-[0_0_10px_rgba(79,255,176,0.2)] group-hover:scale-105 transition-all">
            <Lock className="w-4.5 h-4.5 text-void" />
          </div>
          <span className="text-[22px] font-display italic text-text-primary tracking-tight">
            Zancrypt
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link 
                key={link.name} 
                to={link.href} 
                className="font-mono text-[11px] uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all group-hover:w-full" />
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="font-mono text-[11px] uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors relative group cursor-pointer"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all group-hover:w-full" />
              </a>
            )
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* System Status */}
          <div className="relative group flex items-center justify-center cursor-pointer">
            <button className="flex items-center space-x-2 p-1.5 rounded-sm hover:bg-surface-raised transition-colors border border-transparent hover:border-border">
              <Activity className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
            </button>
            <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 w-48 bg-surface border border-border shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[200]">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-bold text-text-primary">All Systems Operational</span>
              </div>
              <p className="text-[10px] text-text-muted font-mono">6/6 Global Relays Online</p>
              <Link to="/nodes" className="mt-2 block w-full text-center py-1.5 border border-border hover:border-border-active text-[10px] font-mono text-text-primary transition-colors">
                View Metrics
              </Link>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle compact />
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 py-1.5 px-2.5 border border-border hover:border-border-active transition-colors group max-w-[160px]"
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-surface-raised border border-border flex items-center justify-center font-bold text-text-primary text-xs uppercase">
                  {displayName[0]}
                </div>
                <span className="text-xs font-mono text-text-secondary group-hover:text-text-primary transition-colors truncate max-w-[70px]">
                  {displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <Link 
                to="/download" 
                className="px-4 py-2 bg-transparent border border-accent text-accent hover:bg-accent/10 font-mono text-[10px] uppercase tracking-widest transition-all shrink-0"
              >
                [ Download ]
              </Link>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.1, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border shadow-2xl p-2 z-[200]"
                  >
                    <div className="px-3 py-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">
                      Vaults & Storage
                    </div>

                    <div className="space-y-0.5">
                      {[
                        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-accent' },
                        { to: '/vault', icon: Lock, label: 'Private Vault', color: 'text-accent' },
                        { to: '/nodes', icon: Cloud, label: 'Multi-Cloud Backups', color: 'text-accent' },
                        { to: '/security', icon: Key, label: 'Security Credentials', color: 'text-accent' },
                        { to: '/audit', icon: FileText, label: 'Immutable Audit Trail', color: 'text-accent' },
                        { to: '/settings', icon: Settings, label: 'Account Settings', color: 'text-text-secondary' },
                      ].map(({ to, icon: Icon, label, color }) => (
                        <Link 
                          key={to}
                          to={to} 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                        >
                          <Icon className={`w-4 h-4 ${color} shrink-0`} />
                          <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-border my-2" />

                    <div className="space-y-0.5">
                      <a 
                        href="#support" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <HelpCircle className="w-4 h-4 text-text-secondary" />
                          <span className="font-mono text-xs uppercase tracking-wider">Support & Docs</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                      </a>

                      <button 
                        onClick={() => { setIsDropdownOpen(false); logout(); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-mono text-xs uppercase tracking-wider">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="font-mono text-[11px] text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
                Sign In
              </Link>

              {/* Animated CTA Button */}
              <Link 
                to="/register" 
                className="relative group flex items-center overflow-hidden"
              >
                {/* Pulsing ring */}
                <span className="absolute -inset-1 rounded-sm border border-accent opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" />
                <span className="relative flex items-center px-5 py-2 bg-accent text-void font-mono text-[11px] uppercase tracking-widest transition-all group-hover:brightness-110 rounded-sm">
                  {/* Shimmer overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
                  <span className="relative">Start Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2 relative group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-text-primary p-2 hover:bg-surface-raised transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-surface border-b border-border px-6 py-8 lg:hidden shadow-2xl z-[150]"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    className="font-mono text-sm uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a 
                    key={link.name} 
                    href={link.href}
                    className="font-mono text-sm uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  >
                    {link.name}
                  </a>
                )
              ))}
              
              <div className="pt-6 border-t border-border flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Theme</span>
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-surface-raised border border-border">
                      <div className="w-9 h-9 bg-accent flex items-center justify-center font-bold text-void uppercase text-sm">
                        {displayName[0]}
                      </div>
                      <span className="font-mono text-sm text-text-primary truncate">{displayName}</span>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center justify-center py-3 bg-accent text-void font-mono text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Open Your Vault
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>

                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center space-x-2 py-3 border border-danger text-danger font-mono text-xs uppercase tracking-widest hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="font-mono text-sm uppercase tracking-widest text-text-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" className="flex items-center justify-center py-3 bg-accent text-void font-mono text-xs uppercase tracking-widest hover:brightness-110 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
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
