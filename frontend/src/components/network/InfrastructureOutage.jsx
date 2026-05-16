import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Server, ZapOff, Activity, ShieldAlert } from 'lucide-react';

const InfrastructureOutage = () => {
  const containerRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const nodes = nodesRef.current;
    
    nodes.forEach((node, i) => {
      if (!node) return;
      
      // Erratic movement for "failing" nodes
      gsap.to(node, {
        x: "random(-15, 15)",
        y: "random(-15, 15)",
        opacity: "random(0.1, 0.4)",
        duration: "random(0.5, 1.5)",
        repeat: -1,
        yoyo: true,
        ease: "rough({ strength: 1, points: 20, template: power1.inOut, taper: none, randomize: true, clamp: false })",
        delay: i * 0.05
      });
    });

    return () => {
      if (nodes && nodes.length > 0) {
        gsap.killTweensOf(nodes.filter(Boolean));
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] bg-black/40 rounded-3xl border border-status-danger/20 overflow-hidden flex items-center justify-center">
      {/* Background Error Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #EF4444 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="relative z-10 flex flex-col items-center">
         <div className="relative mb-8">
            <div className="absolute inset-0 bg-status-danger/20 blur-[100px] rounded-full scale-150 animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-status-danger/10 border border-status-danger/40 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
               <ZapOff className="w-12 h-12 text-status-danger" />
            </div>
         </div>
      </div>

      {/* Disconnected Nodes */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 120 + (i % 3) * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            ref={el => nodesRef.current[i] = el}
            className="absolute left-1/2 top-1/2 w-4 h-4 rounded-lg bg-surface-elevated border border-status-danger/30 flex items-center justify-center z-0"
            style={{ 
              marginLeft: x - 8, 
              marginTop: y - 8,
            }}
          >
            <Server className="w-2 h-2 text-status-danger opacity-50" />
            
            {/* Broken connection lines */}
            <div className="absolute w-px h-12 bg-gradient-to-t from-status-danger/20 to-transparent origin-bottom rotate-[var(--rot)] opacity-30" 
                 style={{ '--rot': `${Math.random() * 360}deg`, bottom: '100%' }} />
          </div>
        );
      })}

      {/* Status Indicators */}
      <div className="absolute top-6 left-6 flex space-x-2">
         <div className="flex items-center px-3 py-1.5 rounded-full bg-status-danger/10 border border-status-danger/20">
            <div className="w-1.5 h-1.5 rounded-full bg-status-danger animate-ping mr-2" />
            <span className="text-[10px] font-bold text-status-danger uppercase tracking-widest">Network Outage</span>
         </div>
      </div>
    </div>
  );
};

export default InfrastructureOutage;
