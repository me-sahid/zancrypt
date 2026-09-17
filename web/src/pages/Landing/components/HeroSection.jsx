import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useStore';
import { useWorkspace, getAuthLinks } from '../../../hooks/useWorkspace';

const HeroSection = () => {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const workspace = useWorkspace();
  const authLinks = getAuthLinks();
  const isDark = theme === 'dark';

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle ambient background radial glow */}
      <div 
        className={`absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full blur-[140px] pointer-events-none transition-colors duration-500 ${
          isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'
        }`} 
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* ── TOP HERO COPY: Centered & Clean ── */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-center mx-auto mt-2"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
            }}
          >
            <span
              className="block"
              style={{
                color: isDark ? '#e8e8f0' : '#0d0d1a',
                fontWeight: 900,
                fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
              }}
            >
              Your files are yours.
            </span>
            <span
              className="block mt-2"
              style={{
                color: isDark ? '#555566' : '#aaaabc',
                fontWeight: 900,
                fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
              }}
            >
              Even we can't open them.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-text-secondary leading-relaxed mt-7 max-w-xl"
            style={{
              fontSize: '1.125rem',
              fontWeight: 400,
              fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
            }}
          >
            A private cloud drive that encrypts every file on your device before it leaves.
            Store, sync, and share without giving up control.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto"
          >
            {isAuthenticated ? (
              <Link
                to={workspace.drive}
                className="w-full sm:w-auto h-12 px-7 rounded-xl inline-flex items-center justify-center gap-2 bg-text-primary text-primary-bg hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200"
                style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                <span style={{ fontWeight: 600 }}>Go to your vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : authLinks.isExternal ? (
              <a
                href={authLinks.register}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-7 rounded-xl inline-flex items-center justify-center gap-2 bg-text-primary text-primary-bg hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200"
                style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                <span style={{ fontWeight: 600 }}>Create a secure vault</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link
                to={authLinks.register}
                className="w-full sm:w-auto h-12 px-7 rounded-xl inline-flex items-center justify-center gap-2 bg-text-primary text-primary-bg hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200"
                style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                <span style={{ fontWeight: 600 }}>Create a secure vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/architecture"
              className="w-full sm:w-auto h-12 px-6 rounded-xl inline-flex items-center justify-center border border-border bg-surface hover:bg-surface-raised text-text-primary transition-all duration-200"
              style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
            >
              How your privacy works
            </Link>
          </motion.div>
        </div>

        {/* ── REAL DRIVE SCREENSHOT SHOWCASE ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 sm:mt-16 w-full max-w-[1080px] mx-auto select-none"
        >
          {/* Framed window container showcasing the real screenshot */}
          <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${
            isDark 
              ? 'bg-[#0d0d10] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)]' 
              : 'bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
          }`}>
            {/* Window Top Bar */}
            <div className={`h-11 px-4 sm:px-5 flex items-center justify-between border-b transition-colors ${
              isDark ? 'bg-[#121215] border-[#222227]' : 'bg-[#f8f8fa] border-[#ebebef]'
            }`}>
              {/* macOS Window Controls */}
              <div className="flex items-center gap-2 w-24">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block opacity-90" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block opacity-90" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block opacity-90" />
              </div>

              {/* Window Status Pill */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-raised/70 border border-border/50"
                style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)' }}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Vault Protected</span>
              </div>

              {/* Spacer */}
              <div className="w-24" />
            </div>

            {/* High-Resolution Real Screenshot Image */}
            <div className="relative w-full overflow-hidden">
              <img 
                src="/asset/drive-screenshot-hd.jpg" 
                alt="ZanCrypt Vault Drive Screenshot" 
                width="1344"
                height="768"
                className="w-full h-auto block select-none"
                style={{ imageRendering: 'auto' }}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
