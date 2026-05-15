import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { File, Lock, SplitSquareHorizontal, Network, Copy } from 'lucide-react';

const ZeroKnowledgeFlow = () => {
  const containerRef = useRef(null);

  const steps = [
    { id: 'file', icon: File, label: 'Raw File', color: 'text-text-secondary' },
    { id: 'encrypt', icon: Lock, label: 'Encrypt (AES-256)', color: 'text-primary-accent' },
    { id: 'split', icon: SplitSquareHorizontal, label: 'Split to Shards', color: 'text-blue-400' },
    { id: 'distribute', icon: Network, label: 'Distribute', color: 'text-purple-400' },
    { id: 'replicate', icon: Copy, label: 'Replicate', color: 'text-green-400' },
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Timeline for sequential flow animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        }
      });

      // Animate the icons sequentially
      tl.fromTo('.flow-step',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.3, ease: 'back.out(1.5)' }
      );

      // Animate the connection lines
      tl.fromTo('.flow-line',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.5, stagger: 0.3, ease: 'power2.out' },
        "-=1.2" // Overlap with steps
      );

      // Continuous pulse on the encrypt node
      gsap.to('.flow-encrypt-glow', {
        opacity: 0.5,
        scale: 1.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });

      // Animated "shards" flying to the right
      gsap.to('.flying-shard', {
        x: '300px',
        opacity: 0,
        duration: 2,
        repeat: -1,
        stagger: 0.2,
        ease: 'power1.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-8 bg-surface-secondary/10 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Zero-Knowledge Data Pipeline</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Witness the exact lifecycle of your data. End-to-end encryption is just the beginning.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flow-step flex flex-col items-center relative z-10 my-4 md:my-0">
                <div className={`w-20 h-20 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center relative mb-4 shadow-xl`}>
                  {step.id === 'encrypt' && (
                    <div className="flow-encrypt-glow absolute inset-0 bg-primary-accent rounded-2xl blur-xl opacity-0" />
                  )}
                  <step.icon className={`w-8 h-8 relative z-10 ${step.color}`} />
                </div>
                <span className="text-sm font-bold text-white">{step.label}</span>
              </div>

              {/* Connecting Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-px bg-white/10 relative mx-4">
                  <div className="flow-line absolute inset-0 bg-gradient-to-r from-primary-accent to-blue-500 origin-left" />
                  
                  {/* Particles / Shards moving along the line */}
                  {index >= 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 flex space-x-1">
                      <div className="flying-shard w-2 h-2 rounded-sm bg-primary-accent/80 shadow-[0_0_10px_rgba(var(--primary-accent-rgb),0.8)]" />
                      <div className="flying-shard w-2 h-2 rounded-sm bg-blue-400/80 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ZeroKnowledgeFlow;
