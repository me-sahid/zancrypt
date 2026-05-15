import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShieldCheck, Network, Copy, ServerCrash, 
  Activity, Fingerprint, RotateCcw, FileSearch, 
  Zap, Database, LineChart, Lock 
} from 'lucide-react';

const FeaturesGrid = () => {
  const containerRef = useRef(null);

  const features = [
    { icon: Lock, title: 'Zero-Knowledge Encryption', desc: 'End-to-end client-side encryption. We cannot access your data.' },
    { icon: Network, title: 'Distributed Storage', desc: 'No central database. Data lives across multiple independent nodes.' },
    { icon: Copy, title: 'Shard Replication', desc: 'Each encrypted shard is replicated across availability zones.' },
    { icon: ServerCrash, title: 'Multi-Provider Redundancy', desc: 'Mitigate risk by distributing shards across AWS, GCP, and Azure.' },
    { icon: Activity, title: 'Fault Tolerance', desc: 'System remains 100% operational even during node failures.' },
    { icon: LineChart, title: 'Enterprise Monitoring', desc: 'Real-time telemetry, latency tracking, and shard health.' },
    { icon: Fingerprint, title: 'WebAuthn Authentication', desc: 'Phishing-proof passwordless login with biometric passkeys.' },
    { icon: RotateCcw, title: 'Distributed Recovery', desc: 'Self-healing workers automatically recover lost shards.' },
    { icon: FileSearch, title: 'Audit Logging', desc: 'Immutable, cryptographically verifiable access logs.' },
    { icon: Zap, title: 'Async Infrastructure', desc: 'Non-blocking I/O with FastAPI for maximum throughput.' },
    { icon: Database, title: 'Redis Event Bus', desc: 'Real-time state propagation and rapid cache synchronization.' },
    { icon: ShieldCheck, title: 'Infrastructure Telemetry', desc: 'Comprehensive alerting and incident response integration.' },
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.feature-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-8 bg-primary-bg border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Uncompromising Infrastructure</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built from the ground up for absolute security and extreme resilience. Every component is designed with a zero-trust, highly-available philosophy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="feature-card group relative p-6 rounded-2xl bg-surface-elevated/20 border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary-accent/30 hover:bg-surface-elevated/60">
              {/* Hover Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary-accent/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-white/10 flex items-center justify-center mb-5 relative z-10 group-hover:scale-110 group-hover:bg-primary-accent/10 transition-all duration-300">
                <feature.icon className="w-5 h-5 text-text-secondary group-hover:text-primary-accent transition-colors" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 relative z-10 group-hover:text-primary-accent transition-colors">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed relative z-10 group-hover:text-white/70 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
