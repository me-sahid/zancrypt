import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  ArrowLeft, 
  CheckCircle,
  Monitor,
  Smartphone,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../Landing/components/Navbar';
import Footer from '../Landing/components/Footer';

const platforms = [
  {
    icon: Cpu,
    label: 'macOS',
    title: 'Apple Silicon',
    description: 'Native M1 / M2 / M3 builds with hardware-level encryption acceleration.',
    status: 'Alpha Testing',
    statusColor: 'text-accent border-accent/30 bg-accent/5',
  },
  {
    icon: Monitor,
    label: 'Windows',
    title: 'Windows Client',
    description: 'DirectX-accelerated engine with kernel-level shard replication.',
    status: 'In Development',
    statusColor: 'text-warning border-warning/30 bg-warning/5',
  },
  {
    icon: Smartphone,
    label: 'Android',
    title: 'Android App',
    description: 'Portable distributed key vault with biometric authentication.',
    status: 'Coming Soon',
    statusColor: 'text-text-muted border-border bg-void',
  },
];

const Download = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    toast.success('You are on the launch list! We will email you when it is ready.');
  };

  return (
    <div className="min-h-screen bg-void text-text-primary font-sans overflow-hidden flex flex-col">
      <Navbar />

      {/* Subtle ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-32 pb-24 w-full z-10 relative">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Security Platform
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-6 mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Zancrypt Desktop
            <br />
            <span className="text-accent">Coming Soon</span>
          </h1>

          <p className="text-text-secondary text-xl leading-relaxed max-w-2xl mx-auto">
            The full power of zero-knowledge distributed encryption — migrating natively to macOS, Windows, and Android with local shard processing and direct filesystem mounting.
          </p>
        </motion.div>

        {/* Platform cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16"
        >
          {platforms.map(({ icon: Icon, label, title, description, status, statusColor }) => (
            <div
              key={label}
              className="group p-6 rounded-2xl border border-border bg-surface hover:border-accent/30 hover:bg-surface-raised transition-all duration-300 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-accent/5 border border-accent/10 group-hover:border-accent/25 transition-colors">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-mono text-text-muted uppercase tracking-widest">{label}</span>
              </div>
              <div>
                <h3 className="font-semibold text-base text-text-primary mb-1">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold uppercase tracking-wider ${statusColor}`}>
                {status}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Email capture */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-xl mx-auto"
        >
          <div className="p-8 rounded-2xl border border-border bg-surface text-center space-y-5">
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <p className="font-semibold text-text-primary">You are on the list!</p>
                <p className="text-sm text-text-secondary">We will email you as soon as the desktop build is ready.</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-mono text-text-muted uppercase tracking-[0.2em] mb-1">Early Beta Access</p>
                  <h3 className="font-semibold text-text-primary text-lg">Get notified at launch</h3>
                </div>
                <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="your@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-void border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-void text-sm font-bold rounded-xl hover:bg-accent/90 active:scale-95 transition-all shrink-0"
                  >
                    <Bell className="w-4 h-4" />
                    Notify Me
                  </button>
                </form>
                <p className="text-[11px] text-text-muted">No spam. One email when we ship.</p>
              </>
            )}
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
};

export default Download;
