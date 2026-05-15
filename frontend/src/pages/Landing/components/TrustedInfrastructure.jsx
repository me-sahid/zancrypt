import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Fingerprint, Database, ServerCrash, Clock, Network } from 'lucide-react';

const TrustedInfrastructure = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.infra-card',
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Shield, title: 'AES-256 Encryption', desc: 'Military-grade encryption at rest and in transit.' },
    { icon: Network, title: 'Multi-Provider Redundancy', desc: 'Data mirrored across AWS, Azure, and Oracle.' },
    { icon: Database, title: 'Distributed Sharding', desc: 'Files split into fragments for ultimate privacy.' },
    { icon: Fingerprint, title: 'WebAuthn Passkeys', desc: 'Phishing-resistant biometric authentication.' },
    { icon: ServerCrash, title: 'Fault Tolerance', desc: 'Self-healing network immune to node failures.' },
    { icon: Clock, title: 'Async Recovery Engine', desc: 'Background workers restore missing shards automatically.' },
  ];

  return (
    <section ref={containerRef} className="py-24 px-8 border-y border-white/5 bg-surface-secondary/20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-bg/80 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary-accent uppercase tracking-widest mb-2">Trusted Infrastructure</h2>
          <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">Engineered for Zero Downtime</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, i) => (
            <div key={i} className="infra-card group p-6 rounded-2xl bg-surface-elevated/40 border border-white/5 hover:border-primary-accent/30 hover:bg-surface-elevated transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary-accent/10 group-hover:border-primary-accent/30">
                <item.icon className="w-6 h-6 text-text-secondary group-hover:text-primary-accent transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedInfrastructure;
