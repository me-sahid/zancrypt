import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Database, ShieldCheck } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { twMerge } from 'tailwind-merge';

const ShardMap = () => {
  const { nodes, metrics } = useDashboardStore();
  const healthyCount = nodes.filter(n => n.status === 'success').length;
  const containerRef = useRef(null);
  const shardsRef = useRef([]);

  useEffect(() => {
    const shards = shardsRef.current;
    
    // Animate Shards floating and pulsing
    shards.forEach((shard, i) => {
      if (!shard) return; // Defensive check
      
      gsap.to(shard, {
        y: "random(-10, 10)",
        x: "random(-10, 10)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.1
      });

      gsap.to(shard, {
        opacity: "random(0.3, 1)",
        scale: "random(0.8, 1.2)",
        duration: "random(1, 3)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2
      });
    });

    return () => {
      if (shards && shards.length > 0) {
        gsap.killTweensOf(shards.filter(Boolean));
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[240px] bg-surface-elevated/20 rounded-2xl border border-border/30 overflow-hidden"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Central Vault Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-accent/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-primary-accent shadow-2xl shadow-primary-accent/50 flex items-center justify-center border border-white/20 z-10">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Distributed Shards */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const radius = 80 + Math.random() * 30;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            ref={el => shardsRef.current[i] = el}
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)] z-0"
            style={{ 
              marginLeft: x - 4, 
              marginTop: y - 4,
              backgroundColor: i % 5 === 0 ? '#F59E0B' : '#10B981'
            }}
          />
        );
      })}

      {/* Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em]">
        <div className="flex items-center">
           <div className={twMerge(
             "w-1.5 h-1.5 rounded-full mr-2",
             healthyCount === nodes.length ? "bg-status-success" : "bg-status-warning"
           )} />
           <span>Nodes Online: {healthyCount}/{nodes.length}</span>
        </div>
        <div className="flex items-center">
           <div className="w-1.5 h-1.5 rounded-full bg-status-warning mr-2 animate-pulse" />
           <span>Syncing: {metrics.activeShards || 0} Shards</span>
        </div>
      </div>
    </div>
  );
};

export default ShardMap;
