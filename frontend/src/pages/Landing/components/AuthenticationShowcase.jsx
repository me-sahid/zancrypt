import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fingerprint, Smartphone, CheckCircle, Unlock, ShieldCheck } from 'lucide-react';

const AuthenticationShowcase = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        }
      });

      // Show the device
      tl.fromTo('.auth-device',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Pulse fingerprint
      tl.to('.auth-fingerprint', {
        scale: 1.1,
        color: '#0070f3',
        duration: 0.5,
        repeat: 3,
        yoyo: true,
      });

      // Show challenge signing
      tl.fromTo('.auth-challenge',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );

      // Unlock vault
      tl.to('.auth-lock-icon', {
        rotateY: 180,
        color: '#10b981',
        duration: 0.6,
        delay: 0.5
      });
      
      tl.fromTo('.auth-success',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 }
      );

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-8 bg-primary-bg border-y border-white/5 relative">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Visual Animation Side */}
        <div className="relative h-[500px] flex items-center justify-center">
          {/* Mock Device */}
          <div className="auth-device relative w-[300px] h-[550px] bg-[#0d0d12] border border-white/20 rounded-[40px] shadow-2xl overflow-hidden p-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0d0d12] rounded-b-3xl z-20" />
            
            <div className="relative w-full h-full bg-[#13131a] rounded-[32px] overflow-hidden flex flex-col items-center pt-24 px-6 border border-white/5">
              
              <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-8 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-primary-accent" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Sign In to Vault</h3>
              <p className="text-sm text-text-secondary text-center mb-16">Use your passkey to authenticate securely.</p>

              {/* Fingerprint Scanner Area */}
              <div className="relative mt-auto mb-20 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
                  <Fingerprint className="auth-fingerprint w-10 h-10 text-white/50 transition-colors" />
                  <div className="absolute inset-0 rounded-full border border-primary-accent/50 animate-ping opacity-0" />
                </div>
                
                <div className="auth-challenge absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-elevated border border-white/10 rounded-xl p-3 shadow-xl flex items-center space-x-3 w-48 opacity-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-xs font-bold text-white">Challenge Signed</span>
                </div>
              </div>

              {/* Success State Overlay */}
              <div className="auth-success absolute inset-0 bg-[#13131a]/90 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Unlock className="auth-lock-icon w-10 h-10 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Vault Unlocked</span>
              </div>
              
            </div>
          </div>
        </div>

        {/* Copy Side */}
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Fingerprint className="w-3.5 h-3.5 mr-2" />
            Passwordless Identity
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Phishing-Proof Authentication</h2>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            Passwords are a liability. We utilize WebAuthn and FIDO2 standards to authenticate users via hardware-backed passkeys. Your private key never leaves your device.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center mr-4 shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Hardware Backed</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Leverage FaceID, TouchID, or YubiKeys to sign cryptographic challenges locally.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center mr-4 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Phishing Resistant</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Passkeys are bound to the specific domain. Even if tricked, the credential cannot be used on a malicious site.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AuthenticationShowcase;
