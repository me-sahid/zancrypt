import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';

const CTASection = () => {
  const containerRef = useRef(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Magnetic button effect
      const buttons = document.querySelectorAll('.magnetic-btn');
      
      buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
          });
        });
      });

      // Animated background lines
      gsap.to('.cta-line', {
        strokeDashoffset: 0,
        duration: 3,
        repeat: -1,
        ease: 'linear',
        stagger: 0.5
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-40 px-8 relative overflow-hidden bg-[#050508]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cta-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#0070f3" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {[...Array(10)].map((_, i) => (
            <path 
              key={i}
              className="cta-line"
              d={`M 0 ${50 + i*40} Q ${window.innerWidth/2} ${150 + i*60} ${window.innerWidth} ${50 + i*40}`}
              fill="none"
              stroke="url(#cta-grad)"
              strokeWidth="1"
              strokeDasharray="200 800"
              strokeDashoffset="1000"
              opacity={1 - i*0.08}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-accent/20 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-elevated/80 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,112,243,0.3)] backdrop-blur-xl">
          <ShieldCheck className="w-10 h-10 text-primary-accent" />
        </div>
        
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
          Build the Future of <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-blue-400">Secure Infrastructure</span>
        </h2>
        
        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
          Join the elite engineering teams migrating to zero-knowledge distributed storage. Deploy your first Zancrypt instance in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          {isAuthenticated ? (
            <Link to="/dashboard" className="magnetic-btn group relative inline-flex items-center justify-center px-10 py-5 bg-primary-accent text-white font-medium rounded-xl overflow-hidden transition-all shadow-[0_0_40px_rgba(0,112,243,0.4)] w-full sm:w-auto">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center text-lg">
                Open Your Vault
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ) : (
            <Link to="/register" className="magnetic-btn group relative inline-flex items-center justify-center px-10 py-5 bg-primary-accent text-white font-medium rounded-xl overflow-hidden transition-all shadow-[0_0_40px_rgba(0,112,243,0.4)] w-full sm:w-auto">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center text-lg">
                Launch Vault
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          )}
          
          <Link to="/architecture" className="magnetic-btn group relative inline-flex items-center justify-center px-10 py-5 bg-surface-elevated/50 border border-white/10 text-white font-medium rounded-xl overflow-hidden transition-all hover:bg-surface-elevated hover:border-white/20 backdrop-blur-md w-full sm:w-auto">
            <span className="relative flex items-center text-lg">
              Explore Architecture
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
