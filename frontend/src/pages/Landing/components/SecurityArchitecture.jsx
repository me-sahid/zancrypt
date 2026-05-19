import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, FileKey, Layers } from 'lucide-react';

const SecurityArchitecture = () => {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Pinning section for a premium reveal
      ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top top',
        end: '+=1000',
        pin: true,
        scrub: 1,
      });

      // Animated architecture line
      gsap.fromTo('.arch-line',
        { width: '0%' },
        { 
          width: '100%', 
          ease: 'none',
          scrollTrigger: {
            trigger: triggerRef.current,
            start: 'top top',
            end: '+=1000',
            scrub: 1,
          }
        }
      );

      gsap.fromTo('.arch-step',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 1,
          scrollTrigger: {
            trigger: triggerRef.current,
            start: 'top top',
            end: '+=1000',
            scrub: 1,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    { icon: FileKey, title: 'Local Key Derivation', desc: 'Keys are generated on your device using WebCrypto. We never see your password.' },
    { icon: Lock, title: 'Client-Side Encryption', desc: 'Data is encrypted locally with AES-GCM before it ever touches the network.' },
    { icon: Layers, title: 'Server Blindness', desc: 'The server receives opaque blobs. It cannot index, read, or infer file contents.' }
  ];

  return (
    <section id="architecture" ref={containerRef} className="bg-primary-bg overflow-hidden relative">
      <div ref={triggerRef} className="h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,112,243,0.05)_0%,rgba(0,0,0,0)_70%)]" />
        
        <div className="max-w-7xl mx-auto px-8 w-full z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Zero-Knowledge Architecture</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A paradigm shift in data security. Our architecture guarantees mathematically that no one—not even our own engineers—can access your files.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
            <div className="arch-line absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary-accent via-blue-500 to-transparent -translate-y-1/2 hidden md:block" />

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="arch-step flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative">
                    <div className="absolute inset-0 bg-primary-accent/5 rounded-2xl blur-md" />
                    <step.icon className="w-8 h-8 text-primary-accent relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityArchitecture;
