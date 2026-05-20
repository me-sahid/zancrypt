import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Menu, 
  X, 
  ArrowRight, 
  ChevronDown, 
  Globe,
  Cloud, 
  Key, 
  FileText, 
  Settings, 
  HelpCircle, 
  ExternalLink, 
  LogOut,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/useStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const userDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const name = user.name || user.username || user.email || 'User';
    return name.includes('@') ? name.split('@')[0] : name;
  };
  const displayName = getUserDisplayName();

  const navLinks = [
    { name: t('nav', 'features'),      href: '#features',      isRoute: false },
    { name: t('nav', 'architecture'),  href: '#architecture',  isRoute: false },
    { name: t('nav', 'security'),      href: '#security',      isRoute: false },
  ];

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        window.location.href = '/' + href;
        return;
      }
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const languages = [
    { label: 'English',  code: 'EN' },
    { label: 'Español',  code: 'ES' },
    { label: 'Français', code: 'FR' },
    { label: 'Deutsch',  code: 'DE' },
    { label: 'Italiano', code: 'IT' },
    { label: '中国',     code: 'ZH' },
    { label: 'Русский',  code: 'RU' },
    { label: 'Taiwan',   code: 'TW' },
  ];

  const userMenuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav', 'dashboard') },
    { to: '/vault',     icon: Lock,            label: t('nav', 'privateVault') },
    { to: '/nodes',     icon: Cloud,           label: t('nav', 'multiCloud') },
    { to: '/security',  icon: Key,             label: t('nav', 'secCreds') },
    { to: '/audit',     icon: FileText,        label: t('nav', 'audit') },
    { to: '/settings',  icon: Settings,        label: t('nav', 'settings') },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
      isScrolled
        ? 'py-3 bg-void/95 backdrop-blur-xl border-b border-border shadow-lg'
        : 'py-5 bg-void/80 backdrop-blur-md border-b border-border/30'
    }`}>
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shadow-[0_0_12px_rgba(79,255,176,0.25)] group-hover:scale-105 transition-transform">
            <Lock className="w-[18px] h-[18px] text-void" />
          </div>
          <span className="text-2xl font-display italic text-text-primary tracking-tight leading-none">
            Zancrypt
          </span>
        </Link>

        {/* ── Desktop Centre Links ── */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.name}
                to={link.href}
                className="relative group font-mono text-sm uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all duration-200 group-hover:w-full" />
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="relative group font-mono text-sm uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all duration-200 group-hover:w-full" />
              </a>
            )
          )}
        </div>

        {/* ── Desktop Right Controls ── */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">

          {/* Language Picker */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-border/50 hover:border-border bg-surface/30 hover:bg-surface-raised/60 transition-all text-text-muted hover:text-text-primary"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-[13px] uppercase tracking-widest">{currentLanguage}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-surface border border-border shadow-2xl py-1.5 z-[200] rounded-lg overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[12px] font-sans transition-colors ${
                        currentLanguage === lang.code
                          ? 'text-accent bg-accent/5 font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                      }`}
                    >
                      {lang.label}
                      <span className="ml-1 text-text-muted">({lang.code})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="h-9 w-9 flex items-center justify-center rounded-md border border-border/50 hover:border-border bg-surface/30 hover:bg-surface-raised/60 text-text-muted hover:text-accent transition-all"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Authenticated state */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User button + dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 h-9 px-2.5 rounded-md border border-border/50 hover:border-border bg-surface/30 hover:bg-surface-raised/60 transition-all group"
                >
                  <div className="w-5 h-5 shrink-0 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-[10px] uppercase">
                    {displayName[0]}
                  </div>
                  <span className="font-mono text-[13px] text-text-secondary group-hover:text-text-primary transition-colors truncate max-w-[90px]">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-150 shrink-0 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border shadow-2xl py-1.5 z-[200] rounded-lg overflow-hidden"
                    >
                      <div className="px-4 py-2 mb-1 border-b border-border/40">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">{t('nav', 'vaults')}</p>
                      </div>

                      <div className="space-y-px px-1.5">
                        {userMenuItems.map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-border/40 mt-1 mx-3" />

                      <div className="px-1.5 mt-1 space-y-px">
                        <a
                          href="#support"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-mono text-[10px] uppercase tracking-wider">{t('nav', 'support')}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-40" />
                        </a>

                        <button
                          onClick={() => { setIsUserDropdownOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-danger hover:bg-danger/8 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono text-[10px] uppercase tracking-wider">{t('nav', 'signOut')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Download CTA */}
              <Link
                to="/download"
                className="h-9 px-4 flex items-center border border-accent text-accent hover:bg-accent hover:text-void font-mono text-[13px] uppercase tracking-widest transition-all rounded-md"
              >
                [ {t('nav', 'download')} ]
              </Link>
            </div>
          ) : (
            /* Unauthenticated state */
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="font-mono text-[13px] text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
              >
                {t('nav', 'signIn')}
              </Link>

              <Link
                to="/register"
                className="relative group h-9 flex items-center overflow-hidden"
              >
                <span className="absolute -inset-0.5 rounded-md border border-accent opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" />
                <span className="relative flex items-center gap-2 px-4 py-2 bg-accent text-void font-mono text-[13px] uppercase tracking-widest rounded-md group-hover:brightness-110 transition-all">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out rounded-md" />
                  <span className="relative">{t('nav', 'startNow')}</span>
                  <ArrowRight className="w-3.5 h-3.5 relative group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <button
          className="lg:hidden h-9 w-9 flex items-center justify-center text-text-primary hover:bg-surface-raised transition-colors rounded-md border border-border/40"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden absolute top-full left-0 w-full bg-surface/98 border-b border-border px-6 py-8 shadow-2xl z-[150] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-6">
              {/* Nav Links */}
              <div className="flex flex-col gap-4">
                {navLinks.map((link) =>
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
                )}
              </div>

              <div className="border-t border-border/40" />

              {/* Theme row */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="h-8 w-8 flex items-center justify-center rounded-md border border-border/50 hover:border-border text-text-muted hover:text-accent transition-all"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              {/* Auth section */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded-lg">
                    <div className="w-9 h-9 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center font-bold text-accent uppercase text-sm">
                      {displayName[0]}
                    </div>
                    <span className="font-mono text-sm text-text-primary truncate">{displayName}</span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center py-3 bg-accent text-void font-mono text-xs uppercase tracking-widest hover:brightness-110 transition-all rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav', 'dashboard')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 py-3 border border-danger text-danger font-mono text-xs uppercase tracking-widest hover:bg-danger/10 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav', 'signOut')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="font-mono text-sm uppercase tracking-widest text-text-primary text-center py-2.5 border border-border rounded-lg hover:border-border-active transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav', 'signIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center py-3 bg-accent text-void font-mono text-xs uppercase tracking-widest hover:brightness-110 transition-all rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav', 'startNow')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
