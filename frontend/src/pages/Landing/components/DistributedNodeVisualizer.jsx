import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Server, Activity, Database, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const DistributedNodeVisualizer = () => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const nodes = [
    { id: 'aws-us', x: 20, y: 35, label: 'AWS US-East', status: 'Healthy', shards: '2.4M', latency: '12ms' },
    { id: 'azure-eu', x: 45, y: 30, label: 'Azure Frankfurt', status: 'Healthy', shards: '1.8M', latency: '24ms' },
    { id: 'gcp-asia', x: 75, y: 45, label: 'GCP Tokyo', status: 'Healthy', shards: '3.1M', latency: '45ms' },
    { id: 'oracle-aus', x: 85, y: 75, label: 'Oracle Sydney', status: 'Healthy', shards: '1.2M', latency: '38ms' },
    { id: 'hetzner-eu', x: 50, y: 25, label: 'Hetzner HEL', status: 'Healthy', shards: '4.5M', latency: '18ms' },
  ];

  useEffect(() => {
    if (!mapRef.current) return;
    
    const updateSize = () => {
      if (!mapRef.current) return;
      setDimensions({
        width: mapRef.current.clientWidth,
        height: mapRef.current.clientHeight
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;

    let ctx = gsap.context(() => {
      // Reveal nodes
      gsap.fromTo('.map-node',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 60%',
          }
        }
      );

      // Animate connections
      gsap.fromTo('.map-connection',
        { strokeDasharray: "0, 1000" },
        {
          strokeDasharray: "1000, 0", duration: 2, ease: 'power2.inOut',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 50%',
          }
        }
      );

      // Safe and organic data packet animation
      if (containerRef.current) {
        const paths = containerRef.current.querySelectorAll('path.map-connection');
        const packets = containerRef.current.querySelectorAll('.data-packet');
        
        if (paths.length > 0 && packets.length > 0) {
          packets.forEach((packet, index) => {
            const targetPath = paths[index % paths.length];
            if (targetPath) {
              gsap.to(packet, {
                motionPath: {
                  path: targetPath,
                  align: targetPath,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: true
                },
                duration: 3.5 + Math.random() * 2, // Organic, varied speeds for high premium feel!
                repeat: -1,
                ease: 'linear',
                delay: index * 0.5,
                opacity: 1
              });
            }
          });
        }
      }
      
    }, containerRef);

    return () => ctx.revert();
  }, [dimensions.width]);

  return (
    <section ref={containerRef} className="py-32 px-8 bg-primary-bg overflow-hidden border-b border-white/5 relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:w-1/2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Activity className="w-3.5 h-3.5 mr-2" />
            Global Telemetry
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Distributed Node Infrastructure</h2>
          <p className="text-lg text-text-secondary">
            Your data is never stored in one place. It is encrypted, sharded, and distributed across independent providers globally, ensuring 100% availability even if an entire datacenter goes offline.
          </p>
        </div>

        <div className="relative w-full aspect-video md:aspect-[21/9] bg-surface-elevated/30 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md" ref={mapRef}>
          {/* Abstract Dotted Map Background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,112,243,0.1)" />
                <stop offset="50%" stopColor="rgba(0,112,243,0.8)" />
                <stop offset="100%" stopColor="rgba(0,112,243,0.1)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Draw lines between nodes in absolute coordinates */}
            {dimensions.width > 0 && nodes.map((node, i) => (
              nodes.map((target, j) => {
                if (i < j) {
                  const x1 = (node.x * dimensions.width) / 100;
                  const y1 = (node.y * dimensions.height) / 100;
                  const x2 = (target.x * dimensions.width) / 100;
                  const y2 = (target.y * dimensions.height) / 100;
                  const cx = dimensions.width / 2;
                  const cy = dimensions.height / 2;

                  return (
                    <path
                      key={`${i}-${j}`}
                      className="map-connection"
                      d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="1.5"
                    />
                  );
                }
                return null;
              })
            ))}

            {/* Shard Particles */}
            {[1, 2, 3, 4, 5].map((_, i) => (
              <circle key={`packet-${i}`} className="data-packet opacity-0" r="3" fill="#0070f3" filter="url(#glow)" />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node, i) => (
            <div
              key={node.id}
              className="map-node absolute -translate-x-1/2 -translate-y-1/2 group z-20"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* Pulsing ring */}
              <div className="absolute inset-0 bg-primary-accent/20 rounded-full animate-ping" />
              
              <div className="w-4 h-4 bg-primary-accent rounded-full border-2 border-white shadow-[0_0_15px_rgba(var(--primary-accent-rgb),0.8)] relative z-10 cursor-pointer" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-surface-elevated border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">{node.label}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary flex items-center"><Database className="w-3 h-3 mr-1" /> Shards</span>
                    <span className="text-white font-medium">{node.shards}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary flex items-center"><Activity className="w-3 h-3 mr-1" /> Latency</span>
                    <span className="text-white font-medium">{node.latency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Overlay Stats Card */}
          <div className="absolute bottom-8 right-8 bg-surface-elevated/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hidden md:block">
            <h3 className="text-white font-bold mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-primary-accent" /> Network Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Global Uptime</span>
                  <span className="text-white font-bold">99.999%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Active Shards</span>
                  <span className="text-white font-bold">13,240,512</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-accent w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DistributedNodeVisualizer;
