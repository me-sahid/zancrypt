import React, { useEffect, useRef } from 'react';
import { ShieldAlert, Fingerprint, History, Binary } from 'lucide-react';

const EnterpriseSecurity = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const cards = containerRef.current?.querySelectorAll('.animate-on-scroll');
    cards?.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Fingerprint,
      title: 'WebAuthn & FIDO2',
      desc: 'Hardware-backed biometric passkeys replace vulnerable passwords entirely.'
    },
    {
      icon: History,
      title: 'Immutable Audit Logs',
      desc: 'Every action is cryptographically signed and appended to a WORM log.'
    },
    {
      icon: Binary,
      title: 'Anti-Replay Architecture',
      desc: 'Cryptographic nonces and strict timestamping prevent replay attacks.'
    },
    {
      icon: ShieldAlert,
      title: 'Automated Threat Detection',
      desc: 'Real-time anomaly detection blocks suspicious access patterns instantly.'
    },
  ];

  return (
    <section
      id="security"
      ref={containerRef}
      className="py-32 px-8 bg-void border-y border-border/40 relative overflow-hidden"
    >
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: Text + Cards */}
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest mb-6 animate-on-scroll">
            <ShieldAlert className="w-3.5 h-3.5 mr-2" />
            Cybersecurity Posture
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 animate-on-scroll" style={{ transitionDelay: '80ms' }}>
            Defensive by Design
          </h2>

          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-sans animate-on-scroll" style={{ transitionDelay: '160ms' }}>
            We operate under an assumed-breach mindset. Every layer is designed to limit blast radius and protect data even if the underlying infrastructure is compromised.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="animate-on-scroll bg-surface/40 border border-border/50 p-6 rounded-2xl hover:border-red-500/30 hover:bg-surface-raised/40 transition-all duration-300 group"
                style={{ transitionDelay: `${(i + 3) * 80}ms` }}
              >
                <f.icon className="w-5 h-5 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-text-primary font-bold mb-2 font-sans">{f.title}</h3>
                <p className="text-sm text-text-secondary font-sans leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Radar Graphic */}
        <div className="relative h-[460px] flex items-center justify-center animate-on-scroll" style={{ transitionDelay: '200ms' }}>
          {/* Concentric rings */}
          <div className="absolute w-[400px] h-[400px] border border-red-500/15 rounded-full" />
          <div className="absolute w-[300px] h-[300px] border border-red-500/20 rounded-full" />
          <div className="absolute w-[200px] h-[200px] border border-red-500/20 rounded-full bg-red-500/3" />
          <div className="absolute w-[100px] h-[100px] border border-red-500/30 rounded-full bg-red-500/5" />

          {/* Center pulse dot */}
          <div className="relative w-4 h-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-10">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
          </div>

          {/* Radar sweep — pure CSS rotation */}
          <div
            className="absolute top-1/2 left-1/2 w-[200px] h-px origin-left opacity-60"
            style={{
              background: 'linear-gradient(to right, rgba(239,68,68,0.8), transparent)',
              animation: 'spin 4s linear infinite',
              transformOrigin: '0 50%',
              marginTop: '-0.5px',
            }}
          />

          {/* Blip dots */}
          <div className="absolute top-[28%] right-[30%] w-2 h-2 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse" />
          <div className="absolute bottom-[28%] left-[28%] w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" style={{ animationDelay: '700ms' }} />
          <div className="absolute top-[55%] left-[22%] w-1 h-1 bg-red-300 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" style={{ animationDelay: '1400ms' }} />

          {/* Corner labels */}
          <div className="absolute top-6 right-6 font-mono text-[9px] uppercase tracking-widest text-red-400/50">THREAT SCAN</div>
          <div className="absolute bottom-6 left-6 font-mono text-[9px] uppercase tracking-widest text-red-400/50">ACTIVE · 360°</div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSecurity;
