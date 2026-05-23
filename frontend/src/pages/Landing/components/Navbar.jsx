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
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Accordion states for mobile menu
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const userDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

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

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        window.location.href = '/' + href;
        return;
      }
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Hover grace delay handlers for high-fidelity UX
  const handleMouseEnter = (menuName) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms buffer time prevents accidental flickering
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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled
        ? 'py-3 bg-surface/90 backdrop-blur-xl border-b border-border shadow-lg'
        : 'py-4 bg-surface/40 backdrop-blur-md border-b border-border/20'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

        {/* ── Logo Section ── */}
        <Link to="/" className="flex items-center gap-2 group shrink-0" onClick={() => handleNavClick('#')}>
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(79,255,176,0.3)] group-hover:scale-105 transition-all duration-300">
            <svg className="w-5 h-5 text-void" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16.5C13.5 16.5 16 15 16.5 13C17 11 16 8.5 13.5 8C11 7.5 9 9.5 8.5 11.5C8 13.5 9.5 16.5 12 16.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16.5C10.5 16.5 8 15 7.5 13C7 11 8 8.5 10.5 8C13 7.5 15 9.5 15.5 11.5C16 13.5 14.5 16.5 12 16.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
              <path d="M4 12C4 8.5 6.5 6.5 9 6.5C11.5 6.5 12 8 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 12C20 8.5 17.5 6.5 15 6.5C12.5 6.5 12 8 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-lg font-sans font-extrabold tracking-[0.08em] text-text-primary uppercase leading-none group-hover:text-accent transition-colors">
            Zancrypt
          </span>
        </Link>

        {/* ── Desktop Centre Links (Simplified) ── */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <Link
            to="/pricing"
            className="font-sans text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {t('nav', 'pricing')}
          </Link>

          <a
            href="#architecture"
            onClick={(e) => { e.preventDefault(); handleNavClick('#architecture'); }}
            className="font-sans text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {t('nav', 'documentation')}
          </a>

          <a
            href="#security"
            onClick={(e) => { e.preventDefault(); handleNavClick('#security'); }}
            className="font-sans text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {t('nav', 'security')}
          </a>
        </div>

        {/* ── Right Side Action Button ── */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-void font-sans text-sm font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
            >
              {t('nav', 'dashboard')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-void font-sans text-sm font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
            >
              {t('nav', 'startNow')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <button
          className="lg:hidden h-9 w-9 flex items-center justify-center text-text-primary hover:bg-surface-raised transition-colors rounded-lg border border-border"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Menu (Full accordion layout) ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden absolute top-full left-0 w-full bg-surface border-b border-border px-6 py-6 shadow-2xl z-50 backdrop-blur-xl max-h-96 overflow-y-auto"
          >
            <div className="flex flex-col gap-5">
              {/* Navigation Links */}
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-sm font-medium text-text-primary py-2"
              >
                {t('nav', 'pricing')}
              </Link>

              <a
                href="#architecture"
                onClick={(e) => { e.preventDefault(); handleNavClick('#architecture'); setIsMobileMenuOpen(false); }}
                className="font-sans text-sm font-medium text-text-primary py-2"
              >
                {t('nav', 'documentation')}
              </a>

              <a
                href="#security"
                onClick={(e) => { e.preventDefault(); handleNavClick('#security'); setIsMobileMenuOpen(false); }}
                className="font-sans text-sm font-medium text-text-primary py-2"
              >
                {t('nav', 'security')}
              </a>

              <div className="border-t border-border/30 pt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 p-3 bg-surface-raised rounded-lg">
                      <div className="w-8 h-8 bg-accent/20 border border-accent/40 rounded-lg flex items-center justify-center font-bold text-accent text-xs uppercase">
                        {displayName[0]}
                      </div>
                      <span className="font-sans text-sm font-medium text-text-primary">{displayName}</span>
                    </div>
                    <Link
                      to="/dashboard"
                      className="w-full py-2.5 bg-accent text-void font-sans text-sm font-semibold rounded-lg text-center hover:bg-accent/90 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav', 'dashboard')}
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full py-2.5 border border-danger/40 text-danger font-sans text-sm font-semibold rounded-lg hover:bg-danger/5 transition-colors"
                    >
                      {t('nav', 'signOut')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      className="w-full py-2.5 border border-border text-text-primary font-sans text-sm font-semibold rounded-lg text-center hover:bg-surface-raised transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav', 'signIn')}
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-2.5 bg-accent text-void font-sans text-sm font-semibold rounded-lg text-center hover:bg-accent/90 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav', 'startNow')}
                    </Link>
                  </div>
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
                </button>
                <AnimatePresence>
                  {mobileProductsOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3 mt-2 space-y-3"
                    >
                      <Link to="/vault" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-1 group">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div className="space-y-0.5">
                          <p className="font-sans text-[13.5px] font-medium text-text-secondary group-hover:text-text-primary">{t('nav', 'vaultProduct')}</p>
                          <p className="font-sans text-[11px] text-text-muted">{t('nav', 'vaultProductDesc')}</p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SOLUTIONS ACCORDION */}
              <div className="border-b border-border/30 pb-3">
                <button 
                  onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
                  className="flex items-center justify-between w-full font-sans text-[15px] font-semibold text-text-primary py-1"
                >
                  <span>{t('nav', 'solutions')}</span>
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${mobileSolutionsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileSolutionsOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3 mt-2 space-y-3"
                    >
                      <a href="#architecture" onClick={() => handleNavClick('#architecture')} className="flex items-center gap-3 py-1 group">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div className="space-y-0.5">
                          <p className="font-sans text-[13.5px] font-medium text-text-secondary group-hover:text-text-primary">{t('nav', 'multiCloudBackup')}</p>
                          <p className="font-sans text-[11px] text-text-muted">{t('nav', 'multiCloudBackupDesc')}</p>
                        </div>
                      </a>
                      <a href="#security" onClick={() => handleNavClick('#security')} className="flex items-center gap-3 py-1 group">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <div className="space-y-0.5">
                          <p className="font-sans text-[13.5px] font-medium text-text-secondary group-hover:text-text-primary">{t('nav', 'developerApi')}</p>
                          <p className="font-sans text-[11px] text-text-muted">{t('nav', 'developerApiDesc')}</p>
                        </div>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PRICING LINK */}
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-[15px] font-semibold text-text-primary border-b border-border/30 pb-3 block py-1"
              >
                {t('nav', 'pricing')}
              </Link>

              {/* RESOURCES ACCORDION */}
              <div className="border-b border-border/30 pb-3">
                <button 
                  onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                  className="flex items-center justify-between w-full font-sans text-[15px] font-semibold text-text-primary py-1"
                >
                  <span>{t('nav', 'resources')}</span>
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${mobileResourcesOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileResourcesOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3 mt-2 space-y-3"
                    >
                      <a href="#architecture" onClick={() => handleNavClick('#architecture')} className="flex items-center gap-3 py-1 group">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <div className="space-y-0.5">
                          <p className="font-sans text-[13.5px] font-medium text-text-secondary group-hover:text-text-primary">{t('nav', 'documentation')}</p>
                          <p className="font-sans text-[11px] text-text-muted">{t('nav', 'documentationDesc')}</p>
                        </div>
                      </a>
                      <a href="#architecture" onClick={() => handleNavClick('#architecture')} className="flex items-center gap-3 py-1 group">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="space-y-0.5">
                          <p className="font-sans text-[13.5px] font-medium text-text-secondary group-hover:text-text-primary">{t('nav', 'architecture')}</p>
                          <p className="font-sans text-[11px] text-text-muted">{t('nav', 'architectureDesc')}</p>
                        </div>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language & Theme switches in row */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-text-secondary" />
                  <span className="font-sans text-[13.5px] font-medium text-text-secondary uppercase">{currentLanguage}</span>
                </div>
                <div className="flex gap-2">
                  {languages.filter(l => l.code !== currentLanguage).slice(0, 3).map(l => (
                    <button 
                      key={l.code} 
                      onClick={() => setLanguage(l.code)}
                      className="px-2 py-0.5 text-xs font-semibold rounded bg-surface-raised border border-border text-text-secondary"
                    >
                      {l.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-sans text-[13.5px] font-medium text-text-secondary">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-accent bg-surface-raised/50"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <div className="border-t border-border/30 pt-3" />

              {/* Auth section */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded-xl">
                    <div className="w-9 h-9 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center font-bold text-accent uppercase text-sm">
                      {displayName[0]}
                    </div>
                    <span className="font-sans text-[14.5px] font-semibold text-text-primary truncate">{displayName}</span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center py-3 bg-accent text-void font-sans text-[13.5px] font-bold transition-all rounded-xl shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav', 'dashboard')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 py-3 border border-danger/40 text-danger font-sans text-[13.5px] font-bold hover:bg-danger/5 transition-colors rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav', 'signOut')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="font-sans text-[14.5px] font-semibold text-text-primary text-center py-3 border border-border rounded-xl hover:border-border-active transition-colors bg-surface-raised/40"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav', 'signIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center py-3 bg-[#0f2347] dark:bg-accent text-white dark:text-void font-sans text-[14px] font-bold tracking-wide rounded-xl shadow-md"
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
