import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ArrowLeft, Mail, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const codeLines = [
  { text: 'import zancrypt', color: 'text-accent' },
  { text: '', color: '' },
  { text: '# Initialize the Zero-Knowledge Client', color: 'text-text-muted' },
  { text: 'client = zancrypt.Client(', color: 'text-text-primary' },
  { text: '    api_key="zc_live_..."', color: 'text-warning' },
  { text: ')', color: 'text-text-primary' },
  { text: '', color: '' },
  { text: '# Encrypt and shard directly from memory', color: 'text-text-muted' },
  { text: 'vault_response = client.upload(', color: 'text-text-primary' },
  { text: '    file_path="/data/classified.pdf",', color: 'text-warning' },
  { text: '    shard_count=5,', color: 'text-text-secondary' },
  { text: '    redundancy=2', color: 'text-text-secondary' },
  { text: ')', color: 'text-text-primary' },
  { text: '', color: '' },
  { text: 'print(f"Distributed across: {vault_response.nodes}")', color: 'text-accent' },
];

const ApiSoon = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-void text-text-primary flex flex-col relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
      
      {/* Top nav bar */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors font-mono text-xs uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Return Home
          </Link>
          <div className="flex items-center space-x-2 border border-border px-3 py-1 font-mono text-[10px] text-text-muted uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Zancrypt API V1</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center">
        <div className="max-w-[1200px] mx-auto w-full px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: copy */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center px-3 py-1 border border-accent/30 bg-accent/5 text-accent text-[10px] font-mono uppercase tracking-widest mb-8">
              <Terminal className="w-3.5 h-3.5 mr-2" />
              Developer API V1
            </div>

            <h1 className="font-display text-5xl md:text-6xl text-text-primary mb-4 leading-tight tracking-tight">
              Developer API is<br />
              <span className="text-accent">Launching Soon.</span>
            </h1>
            
            <p className="text-text-secondary font-sans text-lg mb-10 leading-relaxed max-w-lg">
              We&apos;re finalizing the programmatic backbone of the Zero-Knowledge Distributed Vault. Integrate enterprise-grade sharded encryption directly into your own applications with just a few lines of code.
            </p>

            {/* Features list */}
            <ul className="space-y-3 mb-10">
              {[
                'AES-256-GCM client-side encryption',
                'Shard-based distributed storage',
                'FIDO2/WebAuthn key management',
                'Self-destructing share links',
              ].map((feat) => (
                <li key={feat} className="flex items-center space-x-3 font-mono text-xs text-text-secondary uppercase tracking-widest">
                  <div className="w-4 h-4 border border-accent flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            {/* Waitlist form */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-3 p-4 bg-accent/5 border border-accent/30 font-mono"
              >
                <Check className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="text-accent text-xs uppercase tracking-widest font-bold">Access Requested</p>
                  <p className="text-text-muted text-[11px] mt-0.5">We&apos;ll notify you at {email} when API keys are available.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@system.io"
                    className="w-full bg-surface border border-border focus:border-accent pl-10 pr-4 py-3 font-mono text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-accent text-void font-mono text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Join Waitlist
                </button>
              </form>
            )}
          </motion.div>

          {/* Right: code terminal */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="relative bg-surface border border-border"
          >
            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/70" />
              </div>
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">upload.py</span>
              <div className="w-16" />
            </div>
            
            {/* Code content */}
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                {codeLines.map((line, i) => (
                  <div key={i} className={`${line.color || 'text-text-secondary'}`}>
                    {line.text || '\u00a0'}
                  </div>
                ))}
              </pre>
            </div>

            {/* Bottom status bar */}
            <div className="border-t border-border px-4 py-2 flex items-center justify-between bg-surface-raised">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">ZK_ENCRYPTION_ACTIVE</span>
              </div>
              <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Python 3.12</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApiSoon;
