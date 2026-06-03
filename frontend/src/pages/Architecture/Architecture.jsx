import React, { useEffect, useRef, Suspense, lazy } from 'react';
import Navbar from '../Landing/components/Navbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const Footer = lazy(() => import('../Landing/components/Footer'));

const Architecture = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.arch-hero-title', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo('.arch-hero-desc', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );
      gsap.fromTo('.arch-metric-card', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      );

      // Diagram entrance
      gsap.fromTo('.arch-diagram-node', 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'back.out(1.2)' }
      );
      
      gsap.fromTo('.arch-diagram-line', 
        { scaleY: 0, opacity: 0 }, 
        { scaleY: 1, opacity: 0.5, duration: 0.5, stagger: 0.1, delay: 0.6, transformOrigin: 'top center', ease: 'power2.out' }
      );

      // Scroll triggers for sections
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('arch-fade-in-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.arch-animate-on-scroll').forEach(el => observer.observe(el));
      
      // Journey Section Staggered ScrollTrigger
      gsap.fromTo('.journey-step',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.journey-container',
            start: 'top 80%',
          }
        }
      );

      return () => observer.disconnect();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const diagramNodes = [
    { id: 'client', label: 'Client', icon: 'ri-mac-line' },
    { id: 'enc', label: 'Encryption Engine', icon: 'ri-lock-2-line' },
    { id: 'auth', label: 'Authentication Layer', icon: 'ri-fingerprint-line' },
    { id: 'gw', label: 'Gateway Layer', icon: 'ri-route-line' },
    { id: 'core', label: 'Core Services', icon: 'ri-server-line' },
    { id: 'router', label: 'Storage Router', icon: 'ri-git-branch-line' },
    { id: 'nodes', label: 'Distributed Nodes', icon: 'ri-database-2-line' },
  ];

  const layers = [
    { num: '01', title: 'Client Encryption Layer', desc: 'Handles AES-256-GCM encryption entirely within the browser memory before any data transmission occurs.', tech: 'WebCrypto API, WebAssembly', resp: 'Data Encryption, Key Derivation, Chunking' },
    { num: '02', title: 'Edge & Gateway', desc: 'Global entry points that route traffic to the nearest core services, providing DDoS protection and SSL termination.', tech: 'Cloudflare, Nginx, Rust Gateway', resp: 'Traffic Routing, Rate Limiting, TLS Termination' },
    { num: '03', title: 'API Layer', desc: 'Stateless REST and gRPC endpoints that orchestrate requests between the client and core internal services.', tech: 'Go, gRPC, Protocol Buffers', resp: 'Request Validation, Endpoint Routing, Rate Limiting' },
    { num: '04', title: 'Core Services', desc: 'The heart of Zancrypt, managing metadata, user state, billing, and system orchestration.', tech: 'Go, Node.js, Redis', resp: 'Business Logic, Metadata Management, State Sync' },
    { num: '05', title: 'Security Services', desc: 'Handles WebAuthn/Passkey verification and Zero-Knowledge proofs without ever seeing plaintext keys.', tech: 'Rust, WebAuthn, HSMs', resp: 'Authentication, Access Control, Audit Logging' },
    { num: '06', title: 'Async Infrastructure', desc: 'Message queues and background workers for non-blocking operations like analytics aggregation and cleanup.', tech: 'Apache Kafka, RabbitMQ, Go Workers', resp: 'Event Streaming, Background Jobs, Webhooks' },
    { num: '07', title: 'Data Layer', desc: 'Highly available relational and key-value stores for metadata, user profiles, and directory structures.', tech: 'PostgreSQL, Redis, etcd', resp: 'ACID Transactions, Caching, Configuration State' },
    { num: '08', title: 'Distributed Storage', desc: 'The decentralized storage network where encrypted file shards are distributed globally for fault tolerance.', tech: 'S3 Compatible APIs, Erasure Coding', resp: 'Blob Storage, Data Replication, Shard Healing' },
    { num: '09', title: 'Observability', desc: 'Comprehensive logging, tracing, and metrics collection to ensure system health and performance.', tech: 'OpenTelemetry, Prometheus, Grafana', resp: 'Metrics, Distributed Tracing, Alerting' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-void text-text-primary font-sans overflow-x-hidden selection:bg-accent/20 selection:text-accent flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        .arch-animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .arch-fade-in-visible { opacity: 1; transform: translateY(0); }
        .arch-card-hover { transition: all 0.3s ease; }
        .arch-card-hover:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.02); }
      `}} />
      
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="max-w-[1200px] mx-auto px-6 mb-32 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="arch-hero-title text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight mb-6">
              Inside Zancrypt<br/>
              <span className="text-text-secondary">The Architecture Behind Zero-Knowledge Storage</span>
            </h1>
            <p className="arch-hero-desc text-lg text-text-muted mb-10 max-w-lg leading-relaxed">
              Zancrypt utilizes client-side encryption, a globally distributed storage network, passkey authentication, and a rigorous zero-knowledge design to ensure your data remains permanently untouchable by anyone but you.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Architecture', val: '9 Layers' },
                { label: 'Security', val: 'Client-Side Encryption' },
                { label: 'Infrastructure', val: 'Distributed Storage Nodes' },
                { label: 'Access', val: 'Zero-Knowledge Authentication' }
              ].map((m, i) => (
                <div key={i} className="arch-metric-card arch-card-hover border border-border/40 rounded-xl p-5 bg-surface/30">
                  <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-mono">{m.label}</p>
                  <p className="font-medium text-text-primary text-sm">{m.val}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* INTERACTIVE DIAGRAM */}
          <div className="relative flex flex-col items-center py-10">
            {diagramNodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <div className="arch-diagram-node relative z-10 w-64 bg-surface-raised border border-border/50 rounded-lg p-4 flex items-center gap-4 arch-card-hover group cursor-default shadow-lg">
                  <div className="w-10 h-10 rounded-md bg-void border border-border/50 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors">
                    <i className={`remixicon ${node.icon} text-lg`}></i>
                  </div>
                  <span className="font-mono text-sm tracking-wide text-text-primary group-hover:text-accent transition-colors">{node.label}</span>
                </div>
                {i < diagramNodes.length - 1 && (
                  <div className="arch-diagram-line w-px h-8 bg-border/60 relative z-0"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* LAYERS SECTION */}
        <section className="max-w-[1200px] mx-auto px-6 mb-32">
          <div className="text-center mb-20 arch-animate-on-scroll">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Architecture Layers</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">The complete stack, designed from the ground up for absolute security and maximum resilience.</p>
          </div>
          
          <div className="space-y-24">
            {layers.map((layer, i) => (
              <div key={i} className={`arch-animate-on-scroll grid lg:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={i % 2 !== 0 ? 'lg:col-start-2' : ''}>
                  <div className="text-accent font-mono text-sm mb-4 border border-accent/20 bg-accent/5 inline-block px-2 py-1 rounded">Layer {layer.num}</div>
                  <h3 className="text-2xl font-semibold mb-4">{layer.title}</h3>
                  <p className="text-text-secondary leading-relaxed mb-6">{layer.desc}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs text-text-muted uppercase tracking-wider font-mono mb-1">Technologies</span>
                      <span className="text-sm font-medium">{layer.tech}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-text-muted uppercase tracking-wider font-mono mb-1">Responsibilities</span>
                      <span className="text-sm font-medium">{layer.resp}</span>
                    </div>
                  </div>
                </div>
                <div className={`relative h-64 border border-border/30 rounded-2xl bg-surface/20 flex items-center justify-center overflow-hidden arch-card-hover ${i % 2 !== 0 ? 'lg:col-start-1' : ''}`}>
                  {/* Abstract visual representation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>
                  <div className="relative z-10 w-32 h-32 rounded-full border border-border/40 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-border/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-border/20 flex items-center justify-center bg-surface-raised">
                        <span className="font-mono text-text-muted text-xs">{layer.num}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section className="border-y border-border/30 bg-surface/10 py-24 mb-32">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16 arch-animate-on-scroll">
              <h2 className="text-3xl font-bold tracking-tight mb-4">How a File Travels Through Zancrypt</h2>
              <p className="text-text-secondary">A step-by-step lifecycle of encrypted data.</p>
            </div>
            
            <div className="journey-container grid grid-cols-2 lg:grid-cols-6 gap-6 relative">
              <div className="hidden lg:block absolute top-8 left-10 right-10 h-px bg-border/40 z-0"></div>
              {[
                { title: 'Upload', desc: 'File selected in browser', icon: 'ri-upload-line' },
                { title: 'Encrypt', desc: 'AES-256-GCM applied locally', icon: 'ri-lock-password-line' },
                { title: 'Split', desc: 'Divided into redundant shards', icon: 'ri-scissors-cut-line' },
                { title: 'Route', desc: 'Sent via secure gateway', icon: 'ri-route-line' },
                { title: 'Store', desc: 'Distributed across nodes', icon: 'ri-server-line' },
                { title: 'Recover', desc: 'Reassembled on demand', icon: 'ri-loop-right-line' },
              ].map((step, i) => (
                <div key={i} className="journey-step opacity-0 relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-void border border-border/50 flex items-center justify-center mb-4 text-text-secondary arch-card-hover shadow-lg">
                    <i className={`remixicon ${step.icon} text-2xl`}></i>
                  </div>
                  <div className="text-xs font-mono text-text-muted mb-1">STEP {i + 1}</div>
                  <h4 className="font-semibold text-sm mb-2">{step.title}</h4>
                  <p className="text-xs text-text-secondary px-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* SECURITY & PERFORMANCE SECTION */}
        <section className="max-w-[1200px] mx-auto px-6 mb-16">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="arch-animate-on-scroll">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Why Zero-Knowledge Matters</h2>
              <div className="space-y-6 text-text-secondary leading-relaxed">
                <p>Traditional cloud storage providers hold the encryption keys to your data. This means they can read, scan, or accidentally expose your files.</p>
                <p>Zancrypt shifts the paradigm. Our servers <strong className="text-text-primary">cannot read your files</strong>. Encryption occurs before a single byte leaves your device, and passwords never leave your client.</p>
                <p>Storage nodes only receive indistinguishable encrypted shards. Even a total database breach yields zero usable data without your client-side key.</p>
              </div>
            </div>
            
            <div className="arch-animate-on-scroll">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Performance Advantages</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Fault Tolerant', desc: 'Survives node failures' },
                  { title: 'Distributed', desc: 'Global edge network' },
                  { title: 'Encrypted', desc: 'End-to-end security' },
                  { title: 'Scalable', desc: 'Elastic infrastructure' },
                  { title: 'Observable', desc: 'Real-time telemetry' },
                  { title: 'Cloud Ready', desc: 'Agnostic deployment' },
                ].map((adv, i) => (
                  <div key={i} className="border border-border/30 rounded-lg p-4 bg-surface/20 arch-card-hover">
                    <h5 className="font-semibold text-sm mb-1">{adv.title}</h5>
                    <p className="text-xs text-text-secondary">{adv.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRE-FOOTER */}
        <div className="max-w-[1200px] mx-auto px-6 text-center mt-32 mb-16 arch-animate-on-scroll">
          <div className="w-16 h-px bg-border mx-auto mb-8"></div>
          <h3 className="font-mono text-sm tracking-[0.2em] text-text-secondary uppercase">
            Built for privacy. Engineered for resilience. Designed for trust.
          </h3>
        </div>
      </main>

      <Suspense fallback={<div className="h-40 flex items-center justify-center font-mono text-text-muted text-xs uppercase tracking-widest">Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Architecture;
