import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Cpu, 
  ArrowLeft, 
  Bell, 
  CheckCircle,
  Shield,
  Zap,
  HardDrive,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../Landing/components/Navbar';
import Footer from '../Landing/components/Footer';

const Download = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    toast.success('Awesome! We will notify you as soon as the desktop build is ready.');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary-accent/30 selection:text-white font-sans overflow-hidden flex flex-col justify-between">
      <Navbar />

      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[50%] h-[40%] bg-primary-accent/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-8 pt-32 pb-20 w-full z-10 flex-1 flex flex-col justify-center">
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Security Platform</span>
          </Link>
        </div>

        {/* Grid: Copy on Left, Graphics on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* LEFT: Coming Soon Copy */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-accent/10 border border-primary-accent/30 text-primary-accent text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <Zap className="w-3.5 h-3.5" />
              <span>Native Desktop Redundancy</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                Zancrypt Desktop <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent via-blue-400 to-security">App Coming Soon</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-lg">
                Experience zero-knowledge cryptography natively. The full power of the distributed vault is migrating to macOS and Windows with multi-threaded local shard processing and direct file-system mounting.
              </p>
            </div>

            {/* Target Clients Grid (Resolution-proof layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* macOS card */}
              <div className="p-6 rounded-2xl bg-surface-elevated/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-primary-accent/30 transition-all">
                <div className="absolute top-0 right-0 p-3 text-xs font-black text-[#5F6368] uppercase tracking-widest">
                  macOS
                </div>
                <Cpu className="w-8 h-8 text-primary-accent mb-4 group-hover:scale-105 transition-transform" />
                <h3 className="font-bold text-white mb-1">Apple Silicon</h3>
                <p className="text-xs text-text-secondary mb-3">Native M1/M2/M3 builds</p>
                <div className="inline-flex px-2 py-0.5 rounded bg-white/[0.04] text-[11px] font-black text-text-secondary uppercase tracking-widest">
                  Alpha testing
                </div>
              </div>

              {/* Windows card */}
              <div className="p-6 rounded-2xl bg-surface-elevated/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-primary-accent/30 transition-all">
                <div className="absolute top-0 right-0 p-3 text-xs font-black text-[#5F6368] uppercase tracking-widest">
                  Windows
                </div>
                <Monitor className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-105 transition-transform" />
                <h3 className="font-bold text-white mb-1">Windows client</h3>
                <p className="text-xs text-text-secondary mb-3">DirectX accelerated engine</p>
                <div className="inline-flex px-2 py-0.5 rounded bg-white/[0.04] text-[11px] font-black text-text-secondary uppercase tracking-widest">
                  In Development
                </div>
              </div>

              {/* Android card */}
              <div className="p-6 rounded-2xl bg-surface-elevated/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-primary-accent/30 transition-all">
                <div className="absolute top-0 right-0 p-3 text-xs font-black text-[#5F6368] uppercase tracking-widest">
                  Android
                </div>
                <Smartphone className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-105 transition-transform" />
                <h3 className="font-bold text-white mb-1">Android app</h3>
                <p className="text-xs text-text-secondary mb-3">Mobile distributed key vault</p>
                <div className="inline-flex px-2 py-0.5 rounded bg-white/[0.04] text-[11px] font-black text-text-secondary uppercase tracking-widest">
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Newsletter Notify Form */}
            <div className="p-6 rounded-2xl bg-surface-secondary/40 border border-border/50 max-w-lg">
              {isSubmitted ? (
                <div className="flex items-center space-x-3 text-status-success">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold text-sm">You are on the launch list! We will email you.</span>
                </div>
              ) : (
                <form onSubmit={handleNotify} className="space-y-3">
                  <div className="text-xs font-black text-text-secondary uppercase tracking-wider">
                    Get Early Beta Access
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your enterprise email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#0d0d12] border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all text-white"
                    />
                    <button 
                      type="submit" 
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-accent hover:bg-primary-accent/90 text-white text-sm font-bold rounded-xl transition-all active:scale-98 shrink-0 shadow-lg"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Notify Me</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: Pulse Application UI Showcase */}
          <div className="lg:col-span-6 flex justify-center relative">
            {/* Main Pulse Mockup Screen */}
            <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-2xl bg-surface-elevated/70 border border-white/10 p-4 shadow-[0_0_80px_rgba(0,112,243,0.15)] flex flex-col justify-between overflow-hidden backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-status-danger/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-status-warning/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-status-success/40" />
                </div>
                <div className="text-[11px] font-black text-text-secondary uppercase tracking-widest">
                  Zancrypt Desktop v1.0.0
                </div>
                <Shield className="w-3.5 h-3.5 text-primary-accent" />
              </div>

              {/* Central Pulsing Shard Grid Graphic */}
              <div className="flex-1 flex items-center justify-center relative py-6">
                {/* Orbit Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[80%] h-[80%] rounded-full border border-white/[0.02] border-dashed animate-spin" style={{ animationDuration: '40s' }} />
                  <div className="w-[50%] h-[50%] rounded-full border border-white/[0.04] animate-spin" style={{ animationDuration: '20s' }} />
                </div>

                <div className="space-y-4 text-center z-10 relative">
                  <div className="relative w-16 h-16 mx-auto bg-primary-accent/5 border border-primary-accent/30 rounded-2xl flex items-center justify-center shadow-lg">
                    <HardDrive className="w-8 h-8 text-primary-accent animate-pulse" />
                    <div className="absolute inset-0 rounded-2xl border border-primary-accent/50 scale-110 opacity-30 animate-ping" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-widest">Shard Sync active</div>
                    <div className="text-[11px] text-[#5F6368] font-mono mt-1">12 shards replicated successfully</div>
                  </div>
                </div>
              </div>

              {/* Bottom Utilization status */}
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                  <span>Daemon Engine Online</span>
                </div>
                <div className="font-mono text-primary-accent">AES-256-GCM</div>
              </div>

              {/* Background ambient mesh */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-accent/5 to-transparent pointer-events-none" />
            </div>
            
            {/* Absolute side rings decorative */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Download;
