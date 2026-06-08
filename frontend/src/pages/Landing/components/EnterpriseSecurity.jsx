import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Fingerprint, History, Binary, CheckCircle2, Lock } from 'lucide-react';

const PasskeyAnimation = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto h-[320px] flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 bg-surface/20 rounded-3xl border border-border/50 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden">
        
        {/* Browser Mockup Header */}
        <div className="h-10 bg-surface border-b border-border/50 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto flex items-center gap-2 bg-void/50 px-3 py-1 rounded-md text-[10px] font-mono text-text-muted border border-border/30">
            <Lock className="w-3 h-3" /> zancrypt.in
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          
          {step === 0 && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border/50 flex items-center justify-center shadow-lg mb-6">
                <ShieldAlert className="w-8 h-8 text-accent" />
              </div>
              <h4 className="text-text-primary font-bold text-lg text-center mb-2">Sign in with Passkey</h4>
              <p className="text-text-secondary text-sm text-center">Verify your identity to access your vault.</p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="relative mb-6">
                <Fingerprint className="w-20 h-20 text-accent/20" />
                <div className="absolute inset-0 overflow-hidden">
                  <Fingerprint className="w-20 h-20 text-accent" style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    animation: 'scan 1.5s ease-in-out infinite alternate'
                  }} />
                  {/* CSS scanline */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_10px_rgba(79,255,176,0.8)]"
                    style={{
                      animation: 'scanline 1.5s ease-in-out infinite alternate'
                    }}
                  />
                </div>
              </div>
              <h4 className="text-accent font-bold text-lg text-center animate-pulse">Scanning biometric...</h4>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h4 className="text-text-primary font-bold text-lg text-center mb-2">Authenticated</h4>
              <p className="text-accent text-sm text-center font-mono">Master key derived locally</p>
            </div>
          )}

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }
        @keyframes scan {
          0% { clip-path: inset(0 0 100% 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
      `}} />
    </div>
  );
};

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

        {/* Right: Security Details Block */}
        <div className="relative flex flex-col items-center justify-center animate-on-scroll w-full" style={{ transitionDelay: '200ms' }}>
          <PasskeyAnimation />
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSecurity;
