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
  Moon,
  Layers,
  Users,
  BarChart,
  Plug,
  Code,
  Shield,
  Briefcase,
  Share2,
  Newspaper
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/useStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';
import ThemeToggle from '../../../components/ui/ThemeToggle';

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
        ? 'py-3.5 bg-surface/90 backdrop-blur-xl border-b border-border shadow-lg'
        : 'py-5 bg-surface/40 backdrop-blur-md border-b border-border/20'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">

        {/* ── Left Unit: Logo + Menus ── */}
        <div className="flex items-center gap-12">
          {/* ── Logo Section ── */}
          <Link to="/" className="flex items-center gap-2 group shrink-0" onClick={() => handleNavClick('#')}>
            <span className="text-3xl font-bold text-text-primary tracking-tight">
              Zancrypt
            </span>
          </Link>

          {/* ── Desktop Centre Links (Premium Storj-style dropdown system) ── */}
          <div className="hidden lg:flex items-center gap-7">

          {/* PRODUCT DROPDOWN */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('products')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 font-sans text-base font-medium text-text-secondary hover:text-text-primary transition-colors py-2 cursor-pointer">
              Product
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'products' ? 'rotate-180 text-text-primary' : 'text-text-muted'}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'products' && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[600px] bg-surface border border-border shadow-2xl rounded-xl z-50 overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-3 grid grid-cols-2 gap-2">
                    <Link to="/vault" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Lock className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">
                          Secure Vault
                        </p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">
                          Zero-knowledge encrypted personal storage
                        </p>
                      </div>
                    </Link>
                    <Link to="/shares" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Share2 className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">
                          File Sharing
                        </p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">
                          Share files securely with expiring links
                        </p>
                      </div>
                    </Link>
                    <Link to="/nodes" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Cloud className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">
                          Multi-Cloud Nodes
                        </p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">
                          Distributed architecture across providers
                        </p>
                      </div>
                    </Link>
                    <Link to="/audit" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <FileText className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">
                          Audit & Logs
                        </p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">
                          Comprehensive tracking of all access
                        </p>
                      </div>
                    </Link>
                    <Link to="/security" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Key className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">
                          Security & Encryption
                        </p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">
                          AES-256-GCM client-side encryption
                        </p>
                      </div>
                    </Link>
                    <Link to="/api" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Code className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">
                          Developer API
                        </p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">
                          Integrate with our secure network
                        </p>
                      </div>
                    </Link>
                  </div>
                  <div className="bg-surface-raised/40 p-4 border-t border-border">
                    <p className="text-base text-text-secondary font-sans ml-2">
                      Interested? <a href="#" className="text-text-primary font-semibold hover:underline">Schedule a demo</a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COMPANY DROPDOWN */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('company')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 font-sans text-base font-medium text-text-secondary hover:text-text-primary transition-colors py-2 cursor-pointer">
              Company
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'company' ? 'rotate-180 text-text-primary' : 'text-text-muted'}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'company' && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[600px] bg-surface border border-border shadow-2xl rounded-xl z-50 overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-3 grid grid-cols-2 gap-2">
                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Users className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">About Us</p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">Our mission and open-source team</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Briefcase className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">Careers</p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">Join our fully remote global team</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <HelpCircle className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">Contact Support</p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">Get 24/7 help with your secure vault</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <BarChart className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">System Status</p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">Real-time network and node uptime</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Newspaper className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">Blog & News</p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">Latest product updates and security news</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised transition-all group">
                      <div className="shrink-0 p-3 rounded-lg bg-surface-raised border border-border/80 group-hover:border-border-active transition-colors">
                        <Shield className="w-6 h-6 text-text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-base text-text-primary transition-colors">Trust Center</p>
                        <p className="font-sans text-sm text-text-secondary leading-relaxed">Security policies and compliance docs</p>
                      </div>
                    </a>
                  </div>
                  <div className="bg-surface-raised/40 p-4 border-t border-border">
                    <p className="text-base text-text-secondary font-sans ml-2">
                      Partner with us? <a href="#" className="text-text-primary font-semibold hover:underline">Get in touch</a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PRICING LINK */}
          <Link
            to="/pricing"
            className="font-sans text-base font-medium text-text-secondary hover:text-text-primary transition-colors py-2 cursor-pointer"
          >
            Pricing
          </Link>

          </div>
        </div>

        {/* ── Desktop Right Controls ── */}
        <div className="hidden lg:flex items-center gap-3.5 shrink-0">

          {/* Language Picker */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border hover:border-border-active bg-surface-raised/40 hover:bg-surface-raised transition-all text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <Globe className="w-4 h-4 shrink-0 text-text-secondary/80" />
              <span className="font-sans text-sm font-semibold tracking-wider">{currentLanguage}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-surface border border-border shadow-2xl py-1.5 z-50 rounded-xl overflow-hidden backdrop-blur-xl"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-sans transition-colors cursor-pointer ${
                        currentLanguage === lang.code
                          ? 'text-accent bg-accent/5 font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                      }`}
                    >
                      {lang.label}
                      <span className="ml-1 text-text-muted text-xs font-mono">({lang.code})</span>
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
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:border-border-active bg-surface-raised/40 hover:bg-surface-raised text-text-secondary hover:text-accent transition-all cursor-pointer"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-border/60 mx-0.5" />

          {/* Authentication State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 h-9 px-2.5 rounded-lg border border-border hover:border-border-active bg-surface-raised/40 hover:bg-surface-raised transition-all group cursor-pointer"
                >
                  <div className="w-5 h-5 shrink-0 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs uppercase">
                    {user?.full_name?.[0] || user?.username?.[0] || '?'}
                  </div>
                  <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {user?.full_name || user?.username || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 shrink-0 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border shadow-2xl py-1.5 z-50 rounded-xl overflow-hidden backdrop-blur-xl"
                    >
                      <div className="px-4 py-1.5 mb-1 border-b border-border/40">
                        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">{t('nav', 'vaults')}</p>
                      </div>

                      <div className="space-y-px px-1.5">
                        {userMenuItems.map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                          >
                            <Icon className="w-4 h-4 text-accent shrink-0" />
                            <span className="font-sans text-xs font-medium">{label}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-border/40 mt-1 mx-3" />

                      <div className="px-1.5 mt-1 space-y-px">
                        <a
                          href="#support"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <HelpCircle className="w-4 h-4 shrink-0 text-text-muted" />
                            <span className="font-sans text-xs font-medium">{t('nav', 'support')}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-40 text-text-muted" />
                        </a>

                        <button
                          onClick={() => { setIsUserDropdownOpen(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-danger hover:bg-danger/8 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span className="font-sans text-xs font-medium">{t('nav', 'signOut')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/download"
                className="h-9 px-4 flex items-center border border-accent/50 text-accent hover:bg-accent hover:text-void font-sans text-xs font-semibold transition-all rounded-lg"
              >
                {t('nav', 'download')}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="h-10 px-5 flex items-center border border-border hover:border-border-active bg-surface-raised/40 hover:bg-surface-raised text-text-primary font-sans text-sm font-semibold rounded-lg transition-all"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="h-10 px-5 flex items-center bg-text-primary hover:bg-text-primary/90 text-surface font-sans text-sm font-semibold rounded-lg transition-all shadow-lg shadow-text-primary/20"
              >
                Get Started
              </Link>
            </div>
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

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden absolute top-full left-0 w-full bg-surface border-b border-border px-6 py-6 shadow-2xl z-50 backdrop-blur-xl max-h-96 overflow-y-auto"
          >
            <div className="flex flex-col gap-4">

              {/* PRODUCT ACCORDION */}
              <div className="border-b border-border/30 pb-3">
                <button 
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="flex items-center justify-between w-full font-sans text-sm font-semibold text-text-primary py-1"
                >
                  <span>Product</span>
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileProductsOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3 mt-2 space-y-2"
                    >
                      <Link to="/vault" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Lock className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Secure Vault</span>
                      </Link>
                      <Link to="/shares" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Share2 className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">File Sharing</span>
                      </Link>
                      <Link to="/nodes" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Cloud className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Multi-Cloud Nodes</span>
                      </Link>
                      <Link to="/audit" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <FileText className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Audit & Logs</span>
                      </Link>
                      <Link to="/security" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Key className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Security & Encryption</span>
                      </Link>
                      <Link to="/api" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Code className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Developer API</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* COMPANY ACCORDION */}
              <div className="border-b border-border/30 pb-3">
                <button 
                  onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
                  className="flex items-center justify-between w-full font-sans text-sm font-semibold text-text-primary py-1"
                >
                  <span>Company</span>
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${mobileSolutionsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileSolutionsOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3 mt-2 space-y-2"
                    >
                      <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Users className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">About Us</span>
                      </a>
                      <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Briefcase className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Careers</span>
                      </a>
                      <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <HelpCircle className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Contact Support</span>
                      </a>
                      <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <BarChart className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">System Status</span>
                      </a>
                      <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Newspaper className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Blog & News</span>
                      </a>
                      <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 group">
                        <Shield className="w-4 h-4 text-text-secondary" />
                        <span className="font-sans text-xs font-medium text-text-secondary group-hover:text-text-primary">Trust Center</span>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PRICING LINK */}
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-sm font-semibold text-text-primary border-b border-border/30 pb-3 block py-1"
              >
                Pricing
              </Link>

              <div className="border-t border-border/30 pt-4" />

              {/* Auth section */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 p-3 bg-surface-raised rounded-lg">
                    <div className="w-8 h-8 bg-accent/20 border border-accent/40 rounded-lg flex items-center justify-center font-bold text-accent text-xs uppercase">
                      {user?.full_name?.[0] || user?.username?.[0] || '?'}
                    </div>
                    <span className="font-sans text-xs font-medium text-text-primary">{user?.full_name || user?.username || 'User'}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="w-full py-2.5 bg-accent text-void font-sans text-xs font-semibold rounded-lg text-center hover:bg-accent/90 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav', 'dashboard')}
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full py-2.5 border border-danger/40 text-danger font-sans text-xs font-semibold rounded-lg hover:bg-danger/5 transition-colors"
                  >
                    {t('nav', 'signOut')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="w-full py-2.5 border border-border text-text-primary font-sans text-xs font-semibold rounded-lg text-center hover:bg-surface-raised transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 bg-text-primary text-surface font-sans text-xs font-semibold rounded-lg text-center hover:bg-text-primary/90 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
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
