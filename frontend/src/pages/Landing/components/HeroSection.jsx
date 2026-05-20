import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Lock } from 'lucide-react';
import CipherText from '../../../components/crypto/CipherText';

const HeroSection = () => {
  const containerRef = useRef(null);
  const vizRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Headline Animation
      gsap.fromTo('.hero-text-line', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );

      // Packet visualization animation
      const packets = gsap.utils.toArray('.packet');
      const nodes = gsap.utils.toArray('.node-dot');

      const tl = gsap.timeline({ repeat: -1 });

      packets.forEach((packet, index) => {
        // Calculate destination based on node position
        // Assuming a hex/circle arrangement around the center
        const angle = (index * 60) * (Math.PI / 180);
        const distance = 180; 
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance * 1.1;

        tl.fromTo(packet, 
          { x: 0, y: 0, opacity: 1 }, 
          { 
            x: x, 
            y: y, 
            duration: 1.2, 
            ease: 'power1.inOut',
            onComplete: () => {
              // Pulse the corresponding node
              gsap.fromTo(nodes[index], 
                { scale: 1 },
                { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }
              );
            }
          }, 
          index * 0.3
        ).to(packet, { opacity: 0, duration: 0.1 }, "-=0.1");
      });

      // Marquee animation
      gsap.to('.marquee-content', {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: 'linear'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen pt-24 lg:pt-32 flex flex-col justify-between">
      <div className="max-w-[1200px] mx-auto w-full px-6 grid lg:grid-cols-[55%_45%] gap-12 items-center flex-1">
        
        {/* LEFT COLUMN: Copy & CTA */}
        <div className="max-w-xl">
          <h1 className="text-[72px] leading-[1.05] mb-8 text-text-primary tracking-tight font-display">
            <div className="overflow-hidden"><div className="hero-text-line">Your files.</div></div>
            <div className="overflow-hidden"><div className="hero-text-line">Encrypted.</div></div>
            <div className="overflow-hidden"><div className="hero-text-line italic">Untouchable.</div></div>
          </h1>
          
          <div className="overflow-hidden mb-10">
            <p className="hero-text-line text-[18px] text-text-secondary leading-relaxed max-w-lg font-sans">
              Zancrypt encrypts every file in your browser before it leaves your device.
              No passwords. No keys stored on servers. No trust required.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 overflow-hidden">
            <div className="hero-text-line">
              <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 bg-accent border border-transparent text-void font-mono tracking-widest uppercase text-sm rounded-md hover:brightness-110 transition-all">
                [ Start Encrypting ]
              </Link>
            </div>
            <div className="hero-text-line">
              <a href="#architecture" className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-border text-text-secondary font-mono tracking-widest uppercase text-sm rounded-md hover:text-text-primary hover:border-border-active transition-all">
                [ Read the Architecture ]
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Node Visualization */}
        <div className="relative h-[528px] w-full flex items-center justify-center" ref={vizRef}>
          <div className="relative w-full h-full max-w-[528px] max-h-[528px]">
            {/* Center Browser Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-border bg-surface-raised flex items-center justify-center z-20 shadow-[0_0_0_1px_var(--color-surface)]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-14 text-center z-20">
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest">YOUR BROWSER</div>
            </div>

            {/* Nodes and Paths */}
            {['Mumbai', 'Frankfurt', 'Singapore', 'Oregon', 'Tokyo', 'Amsterdam'].map((city, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const distance = 180; 
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance * 1.1;
              const isRight = x > 0;
              
              return (
                <div key={index} className="absolute top-1/2 left-1/2" style={{ transform: `translate(-50%, -50%)` }}>
                  
                  {/* Dotted Line */}
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none" style={{ width: '1px', height: '1px' }}>
                    <line x1={x * (40 / 180)} y1={y * (40 / 180)} x2={x} y2={y} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 4" />
                  </svg>
                  
                  {/* The Packet */}
                  <div className="packet absolute top-1/2 left-1/2 w-2 h-1 bg-accent -ml-1 -mt-0.5 shadow-[0_0_4px_rgba(79,255,176,0.5)] z-30 opacity-0 flex items-center justify-center">
                    <span className="absolute -top-4 font-mono text-[8px] text-accent opacity-50"><CipherText text={`shard-${index}`} duration={500} /></span>
                  </div>
                  
                  {/* The Node */}
                  <div 
                    className="absolute z-10 flex flex-col items-center justify-center"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <div className="node-dot w-2 h-2 rounded-full bg-border-active transition-colors duration-150" />
                    <div className={`absolute ${isRight ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 whitespace-nowrap`}>
                      <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{city}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="w-full border-t border-border py-4 overflow-hidden mt-12 bg-void z-10">
        <div className="marquee-container flex whitespace-nowrap">
          <div className="marquee-content flex items-center space-x-12 px-6 font-mono text-xs text-text-muted">
            {[...Array(4)].map((_, i) => (
              <React.Fragment key={i}>
                <span>SECURED BY</span>
                <span>·</span>
                <span className="text-text-primary">WebAuthn</span>
                <span>·</span>
                <span className="text-text-primary">AES-256-GCM</span>
                <span>·</span>
                <span className="text-text-primary">FIDO2</span>
                <span>·</span>
                <span className="text-text-primary">PBKDF2</span>
                <span>·</span>
                <span className="text-text-primary">Zero-Knowledge</span>
                <span>·</span>
                <span className="text-text-primary">OpenTelemetry</span>
                <span>·</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
