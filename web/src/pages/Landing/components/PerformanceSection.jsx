import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Server, Activity, ArrowRightLeft } from 'lucide-react';

const PerformanceSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        }
      });

      tl.fromTo('.perf-block',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
      );

      // Animate arrows
      gsap.to('.perf-arrow', {
        x: 10,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: 'power1.inOut'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-8 bg-surface-secondary/20 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Asynchronous Core</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Engineered in Python with FastAPI, Redis Streams, and Celery. Non-blocking I/O ensures we can handle millions of concurrent shard transactions without breaking a sweat.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto mt-16">
          
          {/* Client Request */}
          <div className="perf-block flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center mb-4 shadow-xl">
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>
            <span className="text-sm font-bold text-white">FastAPI Gateway</span>
            <span className="text-xs text-text-secondary">Async I/O</span>
          </div>

          <ArrowRightLeft className="perf-arrow w-8 h-8 text-white/20 hidden md:block" />

          {/* Redis Cache */}
          <div className="perf-block flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center mb-4 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/10" />
              <Activity className="w-10 h-10 text-red-500 relative z-10" />
            </div>
            <span className="text-sm font-bold text-white">Redis Streams</span>
            <span className="text-xs text-text-secondary">Pub/Sub Bus</span>
          </div>

          <ArrowRightLeft className="perf-arrow w-8 h-8 text-white/20 hidden md:block" />

          {/* Workers */}
          <div className="perf-block flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center mb-4 shadow-xl">
              <Server className="w-10 h-10 text-primary-accent" />
            </div>
            <span className="text-sm font-bold text-white">Celery Fleet</span>
            <span className="text-xs text-text-secondary">Background Tasks</span>
          </div>

        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="perf-block bg-surface-elevated/40 border border-white/5 p-6 rounded-xl">
            <h4 className="text-white font-bold mb-2">High Throughput Routing</h4>
            <p className="text-sm text-text-secondary">Requests are dynamically routed to the nearest geographic edge node, minimizing latency to under 50ms globally.</p>
          </div>
          <div className="perf-block bg-surface-elevated/40 border border-white/5 p-6 rounded-xl">
            <h4 className="text-white font-bold mb-2">Instant Failover</h4>
            <p className="text-sm text-text-secondary">If a storage node stops responding, the Redis event bus instantly reroutes traffic to healthy replicas without client interruption.</p>
          </div>
          <div className="perf-block bg-surface-elevated/40 border border-white/5 p-6 rounded-xl">
            <h4 className="text-white font-bold mb-2">Async Shard Recovery</h4>
            <p className="text-sm text-text-secondary">Background Celery workers constantly verify shard integrity. Missing fragments are asynchronously reconstructed from parity shards.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;
