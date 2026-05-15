import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldAlert, Fingerprint, History, Binary } from 'lucide-react';

const EnterpriseSecurity = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.sec-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          }
        }
      );

      // Radar scan animation
      gsap.to('.radar-scan', {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: 'linear',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Fingerprint, title: 'WebAuthn & FIDO2', desc: 'Hardware-backed biometric passkeys replace vulnerable passwords.' },
    { icon: History, title: 'Immutable Audit Logs', desc: 'Every action is cryptographically signed and appended to a WORM log.' },
    { icon: Binary, title: 'Anti-Replay Architecture', desc: 'Cryptographic nonces and strict timestamping prevent replay attacks.' },
    { icon: ShieldAlert, title: 'Automated Threat Detection', desc: 'Real-time anomaly detection blocks suspicious traffic instantly.' },
  ];

  return (
    <section ref={containerRef} className="py-32 px-8 bg-[#050508] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldAlert className="w-3.5 h-3.5 mr-2" />
            Cybersecurity Posture
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Defensive by Design</h2>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            We operate under an assumed-breach mindset. Every layer of the platform is designed to limit blast radius and protect data even if the underlying infrastructure is compromised.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="sec-card bg-surface-elevated/20 border border-white/5 p-6 rounded-2xl">
                <f.icon className="w-6 h-6 text-red-400 mb-4" />
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Radar Graphic */}
        <div className="relative h-[500px] flex items-center justify-center hidden lg:flex">
          <div className="absolute w-[400px] h-[400px] border border-red-500/20 rounded-full" />
          <div className="absolute w-[300px] h-[300px] border border-red-500/20 rounded-full" />
          <div className="absolute w-[200px] h-[200px] border border-red-500/20 rounded-full bg-red-500/5" />
          
          <div className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" />

          {/* Radar Line */}
          <div className="radar-scan absolute top-1/2 left-1/2 w-[200px] h-0.5 bg-gradient-to-r from-red-500 to-transparent origin-left opacity-50" />
          
          {/* Decorative blips */}
          <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse delay-700" />
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSecurity;
