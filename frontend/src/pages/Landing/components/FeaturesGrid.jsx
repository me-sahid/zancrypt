import React, { useEffect, useRef } from 'react';
import { 
  Network, Copy, ServerCrash, 
  Activity, Fingerprint, LineChart, Lock,
  ShieldCheck, Server, Zap
} from 'lucide-react';

const FeaturesGrid = () => {
  const containerRef = useRef(null);

  const features = [
    { 
      icon: Lock, 
      title: 'Zero-Knowledge Encryption', 
      desc: 'End-to-end client-side encryption. Every file is encrypted in your browser before it ever hits the network. We cannot access your data under any circumstances — your recovery device passkey never leaves your local system.',
      badge: 'Core Protocol'
    },
    { 
      icon: Network, 
      title: 'Distributed Storage', 
      desc: 'No central database or single point of failure. Your files are split into secure shards and distributed globally.',
      badge: 'Network'
    },
    { 
      icon: Copy, 
      title: 'Shard Replication', 
      desc: 'Self-healing redundancy. Each encrypted shard is replicated across independent availability zones automatically.',
      badge: 'Resilience'
    },
    { 
      icon: ServerCrash, 
      title: 'Multi-Provider Redundancy', 
      desc: 'Shards distributed across Backblaze B2, Supabase, and Storj — three independent storage networks across different global regions.',
      badge: 'Infrastructure'
    },
    { 
      icon: Activity, 
      title: 'Fault Tolerance', 
      desc: 'High availability architecture. The system remains 100% operational even during complete cloud provider outages.',
      badge: 'Uptime'
    },
    { 
      icon: LineChart, 
      title: 'Enterprise Monitoring', 
      desc: 'Real-time infrastructure health tracking, network latency telemetry, and automatic background shard validation.',
      badge: 'Analytics'
    },
    { 
      icon: Fingerprint, 
      title: 'WebAuthn Authentication', 
      desc: 'Phishing-resistant, hardware-backed authentication using biometrics or secure passkeys natively.',
      badge: 'Identity'
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.animate-on-scroll');
      cards.forEach((card) => observer.observe(card));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={containerRef} className="py-32 px-8 bg-void border-y border-border/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[600px] h-[600px] bg-accent/2 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24 animate-on-scroll">
          <h2 className="text-4xl md:text-6xl font-semibold text-text-primary mb-6 tracking-tight">
            Uncompromising Infrastructure
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-sans leading-relaxed">
            Engineered from the ground up for absolute security and flawless reliability. A zero-trust storage fabric designed to withstand multi-region failures.
          </p>
        </div>

        {/* Master Asymmetrical 6-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {features.map((feature, i) => {
            const isLarge = i === 0;
            
            // Determine column span based on card index to achieve mathematical grid balance
            let colSpan = 'md:col-span-2'; // Default small card
            if (isLarge) {
              colSpan = 'md:col-span-4'; // Large card takes 4/6 of row
            } else if (i === 5 || i === 6) {
              colSpan = 'md:col-span-3'; // Bottom row cards split 50/50 (3/6 each)
            }

            return (
              <div 
                key={i} 
                className={`group relative rounded-2xl bg-surface/20 border border-border/40 overflow-hidden transition-all duration-500 hover:border-accent/40 hover:bg-surface-raised/40 animate-on-scroll ${colSpan} ${
                  isLarge ? 'p-8 md:p-12 min-h-[380px] flex flex-col justify-between' : 'p-6 md:p-8 flex flex-col justify-between'
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* Neon Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

                {/* Decorative Cyber Grid Brackets */}
                <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-border/40 group-hover:border-accent/40 transition-colors" />
                <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-border/40 group-hover:border-accent/40 transition-colors" />
                <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-border/40 group-hover:border-accent/40 transition-colors" />
                <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-border/40 group-hover:border-accent/40 transition-colors" />

                <div>
                  {/* Card Header (Icon & Badge) */}
                  <div className="flex items-center justify-between mb-8">
                    <div className={`${
                      isLarge ? 'w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30' : 'w-12 h-12 rounded-xl bg-surface-raised border border-border/50'
                    } flex items-center justify-center relative group-hover:scale-105 group-hover:border-accent/50 transition-all duration-300 shadow-[0_0_20px_rgba(79,255,176,0.05)]`}>
                      <feature.icon className={`${
                        isLarge ? 'w-8 h-8 text-accent' : 'w-5 h-5 text-text-secondary group-hover:text-accent'
                      } transition-colors`} />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted bg-surface/80 border border-border/30 px-2 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Card Body */}
                  <h3 className={`${
                    isLarge ? 'text-2xl md:text-3xl font-display italic mb-4' : 'text-lg font-bold mb-3'
                  } text-text-primary group-hover:text-accent transition-colors`}>
                    {feature.title}
                  </h3>
                  <p className={`${
                    isLarge ? 'text-base md:text-lg max-w-2xl' : 'text-sm'
                  } text-text-secondary leading-relaxed font-sans`}>
                    {feature.desc}
                  </p>
                </div>

                {isLarge && (
                  <div className="mt-8 pt-8 border-t border-border/20 flex flex-wrap items-center gap-6 text-xs font-mono text-text-muted">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      Client-Side AES-256-GCM
                    </span>
                    <span className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-accent" />
                      Zero Server Key Storage
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
