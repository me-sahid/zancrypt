import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, Cpu, Activity, Server, Lock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Staggered text reveal
      gsap.fromTo('.hero-text-line', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power4.out', delay: 0.2 }
      );
      
      gsap.fromTo('.hero-badge', 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.1 }
      );

      gsap.fromTo('.hero-btn',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.8 }
      );

      // Node animation on the right
      gsap.fromTo('.hero-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, stagger: 0.1, ease: 'back.out(1.2)', delay: 0.5 }
      );

      gsap.to('.hero-node-pulse', {
        scale: 1.5,
        opacity: 0,
        duration: 2,
        repeat: -1,
        ease: 'power2.out',
        stagger: 0.4
      });

      // Subtle parallax on mouse move
      const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(graphRef.current, {
          x: x,
          y: y,
          duration: 1,
          ease: 'power2.out'
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen pt-32 pb-20 px-8 overflow-hidden flex items-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary-accent/15 blur-[150px] rounded-full pointer-events-none opacity-60" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT COLUMN: Copy & CTA */}
        <div ref={textRef} className="max-w-xl">
          <div className="hero-badge inline-flex items-center px-3 py-1.5 rounded-full bg-primary-accent/10 border border-primary-accent/30 text-primary-accent text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 mr-2" />
            Zero-Knowledge Architecture
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white tracking-tight">
            <div className="overflow-hidden"><div className="hero-text-line">Enterprise-Grade</div></div>
            <div className="overflow-hidden"><div className="hero-text-line text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-blue-400">Encrypted Distributed</div></div>
            <div className="overflow-hidden"><div className="hero-text-line">Vault Infrastructure.</div></div>
          </h1>
          
          <div className="overflow-hidden mb-10">
            <p className="hero-text-line text-lg text-text-secondary leading-relaxed max-w-lg">
              Cryptographically secure distributed file architecture. Built for scale, engineered for absolute privacy with multi-provider redundancy and local key derivation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="hero-btn group relative inline-flex items-center justify-center px-8 py-4 bg-primary-accent text-white font-medium rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--primary-accent-rgb),0.4)]">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center">
                Launch Vault
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <a href="#architecture" className="hero-btn group relative inline-flex items-center justify-center px-8 py-4 bg-surface-elevated/50 border border-white/10 text-white font-medium rounded-lg overflow-hidden transition-all hover:bg-surface-elevated hover:border-white/20 backdrop-blur-md">
              <Cpu className="w-5 h-5 mr-2 text-text-secondary group-hover:text-white transition-colors" />
              Explore Infrastructure
            </a>
          </div>
          
          {/* Trust Metrics */}
          <div className="mt-16 flex items-center space-x-8 border-t border-white/10 pt-8">
            <div>
              <div className="text-2xl font-bold text-white mb-1">99.99%</div>
              <div className="text-xs text-text-secondary uppercase tracking-widest">Uptime SLA</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl font-bold text-white mb-1">&lt;50ms</div>
              <div className="text-xs text-text-secondary uppercase tracking-widest">Global Latency</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl font-bold text-white mb-1">AES-256</div>
              <div className="text-xs text-text-secondary uppercase tracking-widest">Encryption</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Node Visualization */}
        <div className="relative h-[600px] hidden lg:block" ref={graphRef}>
          {/* Main Central Vault Node */}
          <div className="hero-node absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-surface-elevated border border-primary-accent/30 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-accent-rgb),0.2)] z-30 backdrop-blur-xl">
            <Lock className="w-12 h-12 text-primary-accent" />
            <div className="hero-node-pulse absolute inset-0 border-2 border-primary-accent/50 rounded-2xl" />
          </div>

          {/* Orbit rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Orbiting Nodes */}
          {[
            { angle: 0, radius: 160, icon: Server, label: "AWS Tokyo", delay: 0 },
            { angle: 120, radius: 160, icon: Server, label: "Azure SG", delay: 0.2 },
            { angle: 240, radius: 160, icon: Server, label: "Oracle FRA", delay: 0.4 },
            { angle: 60, radius: 240, icon: Shield, label: "KMS Auth", delay: 0.1 },
            { angle: 180, radius: 240, icon: Shield, label: "Audit Log", delay: 0.3 },
            { angle: 300, radius: 240, icon: Activity, label: "Monitor", delay: 0.5 },
          ].map((node, i) => {
            const x = 300 + node.radius * Math.cos((node.angle * Math.PI) / 180) - 24;
            const y = 300 + node.radius * Math.sin((node.angle * Math.PI) / 180) - 24;
            
            return (
              <motion.div 
                key={i}
                className="hero-node absolute z-20"
                style={{ left: `${(x/600)*100}%`, top: `${(y/600)*100}%` }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
              >
                <div className="relative group">
                  <div className="w-12 h-12 bg-surface-elevated/80 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg transition-colors group-hover:border-primary-accent/50 group-hover:bg-primary-accent/10">
                    <node.icon className="w-5 h-5 text-text-secondary group-hover:text-primary-accent transition-colors" />
                  </div>
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-surface-elevated border border-white/10 text-xs text-white px-2 py-1 rounded shadow-lg backdrop-blur-md">
                      {node.label}
                    </div>
                  </div>
                  <div className="hero-node-pulse absolute inset-0 border border-primary-accent/30 rounded-xl" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
