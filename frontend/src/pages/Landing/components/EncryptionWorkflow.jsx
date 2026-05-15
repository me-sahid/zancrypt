import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Key, Lock, Fingerprint, ShieldAlert } from 'lucide-react';

const EncryptionWorkflow = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        }
      });

      tl.fromTo('.enc-step',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'power3.out' }
      );

      tl.fromTo('.enc-code',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
        "-=0.5"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const codeSnippet = `// 1. Derive Key from Password & Salt
const keyMaterial = await crypto.subtle.importKey(
  "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
);

// 2. Generate AES-GCM Key
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
  keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
);

// 3. Encrypt Data locally
const iv = crypto.getRandomValues(new Uint8Array(12));
const encryptedBuffer = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, key, dataBuffer
);`;

  return (
    <section ref={containerRef} className="py-32 px-8 bg-surface-secondary/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Cryptographic Guarantees</h2>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            We don't just promise privacy; we guarantee it with math. Our architecture relies on standard, heavily vetted WebCrypto APIs to ensure your data is secure before it ever leaves your network interface.
          </p>

          <div className="space-y-8">
            {[
              { icon: Key, title: 'PBKDF2 Key Derivation', desc: 'Your master password is never sent to us. It is used locally to derive a unique 256-bit encryption key using 600,000 iterations of PBKDF2.' },
              { icon: Lock, title: 'AES-GCM Encryption', desc: 'Data is encrypted using AES-256-GCM, providing both confidentiality and authenticity. Any tampering with the ciphertext will be immediately detected.' },
              { icon: ShieldAlert, title: 'Blind Infrastructure', desc: 'Our servers only receive, store, and route opaque, encrypted shards. A database breach on our end yields nothing but mathematical noise.' }
            ].map((step, i) => (
              <div key={i} className="enc-step flex items-start">
                <div className="w-10 h-10 rounded-lg bg-primary-accent/10 flex items-center justify-center mr-4 shrink-0 mt-1">
                  <step.icon className="w-5 h-5 text-primary-accent" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{step.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="enc-code relative">
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-accent to-blue-600 rounded-2xl blur opacity-20" />
          
          <div className="relative bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#13131a]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs text-text-secondary font-mono">crypto.js</div>
            </div>
            
            {/* Code Content */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono text-blue-300">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EncryptionWorkflow;
