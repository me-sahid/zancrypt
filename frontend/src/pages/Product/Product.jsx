import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Key, HardDrive, Layers, Activity, Lock, Database, ArrowRight, Server, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../Landing/components/Navbar';

const Footer = lazy(() => import('../Landing/components/Footer'));

const HoverImage = ({ src, alt, position = "bottom" }) => (
  <span className="group relative inline-flex items-center justify-center align-middle mx-2 w-20 h-[1.3em] rounded-full bg-surface border border-border transition-all duration-300 shadow-sm cursor-pointer z-20">
    <img src={src} alt={alt} className="w-full h-full object-cover rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />
    
    <div className={`absolute ${position === 'bottom' ? 'bottom-full mb-4 origin-bottom' : 'top-full mt-4 origin-top'} left-1/2 -translate-x-1/2 w-[500px] rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none scale-[0.95] group-hover:scale-100`}>
      <img src={src} alt={alt + " Large"} className="w-full h-auto rounded-3xl border border-border/80 bg-surface shadow-2xl" />
    </div>
  </span>
);

gsap.registerPlugin(ScrollTrigger);

export default function Product() {
  const containerRef = useRef(null);

  // GSAP References
  const heroRef = useRef(null);
  const problemCardsRef = useRef([]);
  const vaultShowcaseRef = useRef(null);
  const vaultTextRefs = useRef([]);
  const vaultImgRef = useRef(null);
  const timelineStepsRef = useRef([]);
  const textFillRef = useRef(null);
  const securityListRef = useRef([]);

  useEffect(() => {
    // 1. Hero Animation
    const tlHero = gsap.timeline();
    tlHero.fromTo(
      heroRef.current.querySelectorAll('.hero-anim'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' }
    );

    // 2. The Problem Cards
    gsap.fromTo(
      problemCardsRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#problem-section',
          start: 'top 75%',
        },
      }
    );

    // 3. Vault Showcase (Pinned)
    const vaultTl = gsap.timeline({
      scrollTrigger: {
        trigger: vaultShowcaseRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1,
      },
    });

    vaultTextRefs.current.forEach((textRef, i) => {
      vaultTl.to(textRef, {
        opacity: 1,
        color: '#ffffff',
        duration: 1,
      })
      .to(vaultImgRef.current, {
        y: -10 * i, // Slight parallax effect on the image
        duration: 1,
      }, "<")
      .to(textRef, {
        opacity: 0.4,
        color: '#8888a0',
        duration: 1,
      });
    });

    // 4. Timeline Animation
    timelineStepsRef.current.forEach((step, i) => {
      gsap.fromTo(
        step,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
          },
        }
      );
    });

    // 5. Text Fill
    const chars = textFillRef.current.querySelectorAll('.text-char');
    gsap.fromTo(
      chars,
      { color: 'var(--color-text-muted)' }, // text-text-muted
      {
        color: 'var(--color-text-primary)', // text-text-primary
        stagger: 0.1,
        scrollTrigger: {
          trigger: textFillRef.current,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: true,
        },
      }
    );

    // 7. Security List
    gsap.fromTo(
      securityListRef.current,
      { opacity: 0, x: 20 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: {
          trigger: '#security-section',
          start: 'top 70%',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-void text-text-primary font-sans overflow-x-hidden selection:bg-accent/20 selection:text-accent">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center w-full space-y-8 z-10">

          <h1 className="hero-anim text-5xl lg:text-7xl font-light tracking-tight leading-[1.1]">
            Your files belong to you.
            <br />
            <span className="text-text-secondary">Not your cloud provider.</span>
          </h1>
          
          <div className="hero-anim text-xl lg:text-2xl text-text-secondary leading-relaxed max-w-4xl mt-8">
            Zancrypt is a privacy-first cloud storage platform. 
            We encrypt your files locally 
            <HoverImage src="/asset/dashboard-1.png" alt="Encryption" position="bottom" />
            breaking them into secure shards before they ever leave your device. 
            These shards are distributed across 
            <HoverImage src="/asset/dashboard-2.png" alt="Nodes" position="bottom" />
            independent global storage providers. 
            By eliminating central points of failure and keeping the encryption keys entirely on your device, 
            we ensure that your data remains yours alone.
          </div>
          
          <div className="hero-anim flex flex-wrap items-center justify-center gap-4 pt-8">
            <a href="https://drive.zancrypt.in/register" className="product-btn-primary h-14 px-8 flex items-center justify-center rounded-lg font-normal text-base shadow-lg">
              Start Storing Securely
            </a>
            <Link to="/architecture" className="h-14 px-8 flex items-center justify-center border border-border bg-surface-raised/50 hover:bg-surface-raised transition-colors rounded-lg font-normal text-base text-text-primary">
              View Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section id="problem-section" className="py-32 px-6 lg:px-12 bg-surface/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-normal mb-16 tracking-tight">
            Cloud storage was never built for privacy.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div ref={el => problemCardsRef.current[0] = el} className="p-8 rounded-2xl border border-border/50 bg-surface-raised/40">
              <h3 className="text-xl font-normal mb-6 text-text-muted">Traditional Cloud</h3>
              <ul className="space-y-4 text-text-secondary">
                <li className="flex gap-3"><span className="text-danger">•</span> Files stored centrally</li>
                <li className="flex gap-3"><span className="text-danger">•</span> Provider controls access</li>
                <li className="flex gap-3"><span className="text-danger">•</span> Single point of failure</li>
                <li className="flex gap-3"><span className="text-danger">•</span> Limited transparency</li>
              </ul>
            </div>
            
            <div ref={el => problemCardsRef.current[1] = el} className="p-8 rounded-2xl border border-border/50 bg-surface-raised/40">
              <h3 className="text-xl font-normal mb-6 text-text-muted">Encrypted Cloud</h3>
              <ul className="space-y-4 text-text-secondary">
                <li className="flex gap-3"><span className="text-warning">•</span> Files encrypted</li>
                <li className="flex gap-3"><span className="text-warning">•</span> Provider still stores complete file</li>
                <li className="flex gap-3"><span className="text-warning">•</span> Metadata visibility</li>
                <li className="flex gap-3"><span className="text-warning">•</span> Recovery dependency</li>
              </ul>
            </div>
            
            <div ref={el => problemCardsRef.current[2] = el} className="p-8 rounded-2xl border border-border bg-surface-elevated shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Shield className="w-32 h-32" /></div>
              <h3 className="text-xl font-normal mb-6 text-text-primary">Zancrypt</h3>
              <ul className="space-y-4 text-text-primary font-medium">
                <li className="flex gap-3"><Shield className="w-5 h-5 text-accent shrink-0" /> Client-side encryption</li>
                <li className="flex gap-3"><Layers className="w-5 h-5 text-accent shrink-0" /> Distributed storage</li>
                <li className="flex gap-3"><Key className="w-5 h-5 text-accent shrink-0" /> Passkey authentication</li>
                <li className="flex gap-3"><Lock className="w-5 h-5 text-accent shrink-0" /> Zero-knowledge architecture</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MARQUEE TICKER */}
      <section className="py-20 border-y border-border/40 overflow-hidden bg-surface/20">
        <style>{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-left {
            display: flex;
            width: max-content;
            animation: marquee-left 30s linear infinite;
          }
          .marquee-right {
            display: flex;
            width: max-content;
            animation: marquee-right 35s linear infinite;
          }
          .marquee-left:hover,
          .marquee-right:hover {
            animation-play-state: paused;
          }
          /* Dark theme (default): black button, white on hover */
          .product-btn-primary {
            background-color: #000000;
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.15);
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
          }
          .product-btn-primary:hover {
            background-color: #ffffff;
            color: #000000;
            border-color: transparent;
          }
          /* Light theme: orange button */
          html.light .product-btn-primary {
            background-color: #d97757;
            color: #ffffff;
            border-color: transparent;
          }
          html.light .product-btn-primary:hover {
            background-color: #c2684b;
            color: #ffffff;
          }
        `}</style>

        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden mb-5">
          <div className="marquee-left">
            {[
              'Zero-Knowledge Architecture',
              'Client-Side Encryption',
              'No Central Point of Failure',
              'AES-256-GCM Encryption',
              'Passkey Authentication',
              'Reed-Solomon Erasure Coding',
              'Your Keys. Your Data.',
              'End-to-End Encrypted',
              'Zero-Knowledge Architecture',
              'Client-Side Encryption',
              'No Central Point of Failure',
              'AES-256-GCM Encryption',
              'Passkey Authentication',
              'Reed-Solomon Erasure Coding',
              'Your Keys. Your Data.',
              'End-to-End Encrypted',
            ].map((text, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-6 text-2xl font-normal text-text-secondary whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] shrink-0" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden">
          <div className="marquee-right">
            {[
              'Distributed Shard Storage',
              'Open Security Model',
              'Privacy By Design',
              'No Password Required',
              'WebAuthn Standard',
              'Encrypted File Sharing',
              'Multi-Node Redundancy',
              'Surveillance-Resistant',
              'Distributed Shard Storage',
              'Open Security Model',
              'Privacy By Design',
              'No Password Required',
              'WebAuthn Standard',
              'Encrypted File Sharing',
              'Multi-Node Redundancy',
              'Surveillance-Resistant',
            ].map((text, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-6 text-2xl font-normal text-text-muted whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW ZANCRYPT WORKS */}
      <section className="py-32 px-6 lg:px-12 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-normal mb-16">How Zancrypt Works</h2>
          
          <div className="space-y-0 relative border-l border-border/40 ml-4 md:ml-8 pl-8 md:pl-12">
            {[
              { step: 'Step 1', title: 'Upload file', desc: 'Select any file from your local device.' },
              { step: 'Step 2', title: 'Encrypt locally', desc: 'File is encrypted in the browser using AES-256-GCM.' },
              { step: 'Step 3', title: 'Generate shards', desc: 'Encrypted file is split into multiple pieces via Reed-Solomon erasure coding.' },
              { step: 'Step 4', title: 'Distribute shards', desc: 'Shards are sent to independent storage nodes.' },
              { step: 'Step 5', title: 'Store metadata', desc: 'Encrypted metadata is saved to the central database.' },
              { step: 'Step 6', title: 'Recover on demand', desc: 'Reconstruct the original file requiring only a subset of shards.' }
            ].map((item, i) => (
              <div key={i} ref={el => timelineStepsRef.current[i] = el} className="relative py-8">
                <div className="absolute w-4 h-4 rounded-full bg-surface border-2 border-text-muted -left-[41px] md:-left-[57px] top-10" />
                <span className="text-xs font-mono text-text-muted tracking-widest uppercase mb-2 block">{item.step}</span>
                <h3 className="text-xl font-normal mb-2">{item.title}</h3>
                <p className="text-text-secondary text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TEXT FILL ANIMATION */}
      <section className="py-48 px-6 lg:px-12 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 ref={textFillRef} className="text-5xl lg:text-7xl font-normal tracking-tight leading-tight">
            {"Privacy should be the default.".split('').map((char, index) => (
              <span key={index} className="text-char inline-block">{char === ' ' ? '\\u00A0' : char}</span>
            ))}
          </h2>
        </div>
      </section>

      {/* SECTION 7: SECURITY LAYER */}
      <section id="security-section" className="py-32 px-6 lg:px-12 bg-void border-y border-border/40">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div className="sticky top-32">
            <h2 className="text-4xl font-normal mb-6">Security built into the foundation.</h2>
            <p className="text-text-secondary text-lg mb-8">
              Every feature is designed with the assumption that the server is compromised.
            </p>
            <Link to="/architecture" className="text-text-primary font-normal hover:underline flex items-center gap-2">
              Read our security whitepaper <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {[
              'AES-256-GCM Encryption',
              'Passkeys & WebAuthn',
              'SHA-256 Verification',
              'Row Level Security',
              'Distributed Storage',
              'Audit Logging'
            ].map((item, i) => (
              <div key={i} ref={el => securityListRef.current[i] = el} className="p-6 rounded-xl border border-border/50 bg-surface-raised/40 flex items-center gap-4">
                <Shield className="w-5 h-5 text-text-muted" />
                <span className="font-normal text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: STATISTICS */}
      <section className="py-24 px-6 lg:px-12 bg-surface/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-normal mb-2">3</div>
            <div className="text-sm text-text-muted uppercase tracking-wider font-mono">Storage Nodes</div>
          </div>
          <div>
            <div className="text-3xl font-normal mb-2">100%</div>
            <div className="text-sm text-text-muted uppercase tracking-wider font-mono">Encrypted</div>
          </div>
          <div>
            <div className="text-3xl font-normal mb-2">0</div>
            <div className="text-sm text-text-muted uppercase tracking-wider font-mono">Knowledge</div>
          </div>
          <div>
            <div className="text-3xl font-normal mb-2">24/7</div>
            <div className="text-sm text-text-muted uppercase tracking-wider font-mono">Availability</div>
          </div>
        </div>
      </section>



      {/* SECTION 10: FINAL CTA */}
      <section className="py-40 px-6 lg:px-12 relative overflow-hidden bg-void">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-normal mb-6 tracking-tight">Storage built around ownership.</h2>
          <p className="text-xl text-text-secondary mb-10">
            Your files should remain yours. Start using a cloud vault designed for privacy from the beginning.
          </p>
          <a href="https://drive.zancrypt.in/register" className="product-btn-primary inline-flex h-14 px-8 items-center justify-center rounded-lg font-normal text-lg shadow-lg">
            Create Free Vault
          </a>
        </div>
      </section>

      <Suspense fallback={<div className="h-40 bg-void" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
