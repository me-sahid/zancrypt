import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';

const CTASection = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative py-40 px-8 overflow-hidden bg-void">
      {/* Layered ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-accent/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Decorative corner brackets */}
      <div className="absolute top-12 left-12 w-10 h-10 border-t border-l border-accent/30" />
      <div className="absolute top-12 right-12 w-10 h-10 border-t border-r border-accent/30" />
      <div className="absolute bottom-12 left-12 w-10 h-10 border-b border-l border-accent/30" />
      <div className="absolute bottom-12 right-12 w-10 h-10 border-b border-r border-accent/30" />

      <div className="max-w-3xl mx-auto text-center relative z-10 animate-on-scroll">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(79,255,176,0.12)] relative">
          <div className="absolute inset-0 rounded-2xl border border-accent/20 animate-ping opacity-20" />
          <ShieldCheck className="w-9 h-9 text-accent" />
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-display italic text-text-primary mb-6 leading-tight tracking-tight">
          Your files deserve
          <br />
          <span className="text-accent">absolute privacy.</span>
        </h2>

        <p className="text-lg text-text-secondary font-sans mb-12 max-w-xl mx-auto leading-relaxed">
          Zero passwords. Zero keys on servers. No trust required. Start encrypting today — your first vault is completely free.
        </p>



        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/vault"
              className="group relative flex items-center gap-2.5 px-10 py-4 bg-accent text-void font-mono text-sm uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_30px_rgba(79,255,176,0.2)] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
              <Lock className="w-4 h-4 relative" />
              <span className="relative">Open Vault</span>
              <ArrowRight className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="group relative flex items-center gap-2.5 px-10 py-4 bg-accent text-void font-mono text-sm uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_30px_rgba(79,255,176,0.2)] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
              <span className="relative">[ Start Encrypting — Free ]</span>
              <ArrowRight className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          <a
            href="#architecture"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#architecture')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-8 py-4 border border-border/60 text-text-secondary hover:text-text-primary hover:border-border-active font-mono text-sm uppercase tracking-widest rounded-xl transition-all"
          >
            [ Read the Architecture ]
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
