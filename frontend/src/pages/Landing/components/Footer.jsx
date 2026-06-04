import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Lock, Globe, MessageSquare, Share2,
  X, Send, Mail, User, FileText,
  Link2, Check, Copy
} from 'lucide-react';

// Social icons not available in older lucide-react builds
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

/* ─────────────────────────────────────────────
   CONTACT POPUP
───────────────────────────────────────────── */
const ContactPopup = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    toast.success('Message sent. We will get back to you shortly.');
    setTimeout(onClose, 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-2xl bg-void border border-border shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary leading-tight">Contact Us</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:border-text-muted/50 text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Check className="w-10 h-10 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">Message Received</p>
                  <p className="text-lg text-white/80 mt-2 font-sans">Our enterprise team will respond within 24 hours.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-sans font-semibold uppercase tracking-widest text-white/90">
                      <User className="w-4 h-4 text-accent/60" /> Full Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-surface border border-border focus:border-accent/50 rounded-xl px-5 py-4 text-base text-text-primary font-mono placeholder:text-text-muted/40 outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-sans font-semibold uppercase tracking-widest text-white/90">
                      <Mail className="w-4 h-4 text-accent/60" /> Work Email
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="Enter your email address"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-surface border border-border focus:border-accent/50 rounded-xl px-5 py-4 text-base text-text-primary font-mono placeholder:text-text-muted/40 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-sans font-semibold uppercase tracking-widest text-white/90">
                    <FileText className="w-4 h-4 text-accent/60" /> Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your enterprise use case or inquiry..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full resize-none bg-surface border border-border focus:border-accent/50 rounded-xl px-5 py-4 text-base text-text-primary font-mono placeholder:text-text-muted/40 outline-none transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-accent text-void text-lg font-bold hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-60 mt-4"
                >
                  {sending ? (
                    <>
                      <span className="w-5 h-5 border-2 border-void/40 border-t-void rounded-full animate-spin" />
                      Processing Request…
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Inquiry
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-white/70 font-sans pt-2">
                  Enterprise Support Line · security@zancrypt.in
                </p>
              </motion.form>

            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

/* ─────────────────────────────────────────────
   SHARE POPUP
───────────────────────────────────────────── */
const SITE_URL = 'https://zancrypt.in';
const SITE_TITLE = 'Zancrypt — Zero-Knowledge Distributed Storage';

const socialLinks = [
  {
    id: 'twitter',
    label: 'Twitter / X',
    color: 'hover:border-[#1d9bf0]/40 hover:text-[#1d9bf0]',
    icon: TwitterIcon,
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out ' + SITE_TITLE)}&url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: 'hover:border-[#0a66c2]/40 hover:text-[#0a66c2]',
    icon: LinkedinIcon,
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'hover:border-[#1877f2]/40 hover:text-[#1877f2]',
    icon: FacebookIcon,
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
  },
  {
    id: 'github',
    label: 'GitHub',
    color: 'hover:border-white/30 hover:text-white',
    icon: GithubIcon,
    href: 'https://github.com/zancrypt',
  },
];

const SharePopup = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-xl bg-void border border-border shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-accent to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-base font-sans font-semibold uppercase tracking-widest text-white/90">Evangelize</p>
              <h2 className="text-2xl font-bold text-text-primary leading-tight">Share Zancrypt</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:border-text-muted/50 text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-8">

          {/* Direct link copy */}
          <div className="space-y-3">
            <p className="text-base font-sans font-semibold uppercase tracking-widest text-white/90 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-accent/60" /> Direct Link
            </p>
            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-4">
              <span className="flex-1 text-base font-mono text-text-primary truncate">{SITE_URL}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent text-sm font-mono font-bold uppercase tracking-widest transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-sm font-sans font-semibold uppercase tracking-widest text-white/70">Or share via</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Social grid */}
          <div className="grid grid-cols-2 gap-4">
            {socialLinks.map(({ id, label, color, icon: Icon, href }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center sm:justify-start gap-4 px-6 py-5 rounded-2xl border border-border bg-surface text-white text-lg font-bold transition-all duration-300 ${color} group hover:-translate-y-1 hover:shadow-lg`}
              >
                <Icon className="w-6 h-6 shrink-0 transition-colors" />
                <span className="font-sans hidden sm:block">{label}</span>
              </a>
            ))}
          </div>

          <p className="text-center text-base text-white/70 font-sans pt-4">
            Help us expand the zero-knowledge ecosystem
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <footer className="bg-void border-t border-border/40 pt-20 pb-10 px-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">

            {/* Column 1: Brand */}
            <div className="col-span-2 md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6 group">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(79,255,176,0.3)] group-hover:scale-105 transition-all duration-300">
                  <Lock className="w-5 h-5 text-void" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold text-text-primary tracking-tight">
                  Zan<span className="text-accent">crypt</span>
                </span>
              </Link>
              <p className="text-sm text-text-secondary mb-8 pr-4 leading-relaxed">
                Enterprise-grade distributed zero-knowledge storage infrastructure. Built for scale, engineered for absolute privacy.
              </p>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h4 className="text-text-primary font-bold mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-sm text-text-secondary hover:text-accent transition-colors">Platform Features</Link></li>
                <li><Link to="/security-architecture" className="text-sm text-text-secondary hover:text-accent transition-colors">Security Architecture</Link></li>
                <li><Link to="/global-network" className="text-sm text-text-secondary hover:text-accent transition-colors">Global Network</Link></li>
                <li><Link to="/system-architecture" className="text-sm text-text-secondary hover:text-accent transition-colors">System Architecture</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="text-text-primary font-bold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/api" className="text-sm text-text-secondary hover:text-accent transition-colors">REST API Reference</Link></li>
                <li><Link to="/client-sdks" className="text-sm text-text-secondary hover:text-accent transition-colors">Client SDKs</Link></li>
                <li><a href="https://github.com/zancrypt" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-accent transition-colors">Open Source</a></li>
                <li><Link to="/support-center" className="text-sm text-text-secondary hover:text-accent transition-colors">Support Center</Link></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h4 className="text-text-primary font-bold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about-us" className="text-sm text-text-secondary hover:text-accent transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="text-sm text-text-secondary hover:text-accent transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-sm text-text-secondary hover:text-accent transition-colors">Careers</Link></li>
                <li><Link to="/contact-us" className="text-sm text-text-secondary hover:text-accent transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div>
              <h4 className="text-text-primary font-bold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/terms-of-service" className="text-sm text-text-secondary hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="text-sm text-text-secondary hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="text-sm text-text-secondary hover:text-accent transition-colors">Refund Policy</Link></li>
                <li><Link to="/disclaimer" className="text-sm text-text-secondary hover:text-accent transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between">
            <p className="text-xs text-text-secondary mb-4 md:mb-0">
              © {new Date().getFullYear()} Zancrypt Infrastructure Inc. All rights reserved.
            </p>

            <div className="flex items-center space-x-2">
              {/* Globe — static external link */}
              <a
                href="https://zancrypt.in"
                target="_blank"
                rel="noopener noreferrer"
                title="Visit Website"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>

              {/* Message icon → Contact popup */}
              <button
                id="footer-contact-btn"
                onClick={() => { setContactOpen(true); setShareOpen(false); }}
                title="Contact Us"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Share icon → Share popup */}
              <button
                id="footer-share-btn"
                onClick={() => { setShareOpen(true); setContactOpen(false); }}
                title="Share Zancrypt"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Portaled modals */}
      <AnimatePresence>
        {contactOpen && <ContactPopup onClose={() => setContactOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {shareOpen && <SharePopup onClose={() => setShareOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Footer;
