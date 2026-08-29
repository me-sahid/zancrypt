import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Fingerprint, Network, Code, Layers, Activity, Plus, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: 1,
    title: 'Zero-knowledge',
    tag: 'AES-256-GCM',
    desc: 'We can\'t read your data. Ever. Not with a warrant, not with a wrench. Every byte is sealed with a key derived on your device via Argon2id — the server only ever sees ciphertext.',
    icon: Shield,
    image: '/asset/feat-zero-knowledge.jpg',
  },
  {
    id: 2,
    title: 'Passkey native',
    tag: 'WEBAUTHN L3',
    desc: 'Hardware-backed authentication means phishing is mathematically impossible. Your vault is bound to your physical device security enclave.',
    icon: Fingerprint,
    image: '/asset/feat-passkey.jpg',
  },
  {
    id: 3,
    title: 'Distributed storage',
    tag: 'GLOBAL',
    desc: 'No central database or single point of failure. Your files are split into secure shards and distributed globally across independent networks.',
    icon: Network,
    image: '/asset/distributed.avif',
  },
  {
    id: 4,
    title: 'Open source client',
    tag: 'MIT',
    desc: 'Don\'t trust us. Verify the cryptography yourself. Our entire client application is open source and reproducible.',
    icon: Code,
    image: '/asset/feat-opensource.jpg',
  },
  {
    id: 5,
    title: 'Shard replication',
    tag: 'MULTI-ZONE',
    desc: 'Self-healing redundancy. Each encrypted shard is replicated across independent availability zones automatically.',
    icon: Layers,
    image: '/asset/feat-sync.jpg',
  },
  {
    id: 6,
    title: 'Fault tolerance',
    tag: '100% UPTIME',
    desc: 'High availability architecture. The system remains fully operational even during complete cloud provider outages.',
    icon: Activity,
    image: '/asset/feat-fault tolerance-DQEQOQv3.jpg',
  },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const FeaturesGridSkeleton = () => (
  <section className="py-16 px-6 md:px-10 bg-void border-y border-border/50">
    <div className="max-w-6xl mx-auto">
      {/* Title skeleton */}
      <div className="mb-24 text-center flex flex-col items-center gap-4">
        <div className="h-12 w-2/3 rounded-lg bg-surface-raised animate-pulse" />
        <div className="h-12 w-1/2 rounded-lg bg-surface-raised animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
        {/* Left list skeleton */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-surface-raised animate-pulse" />
          ))}
        </div>
        {/* Right card skeleton */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-border/50 overflow-hidden">
          <div className="aspect-[4/3] w-full bg-surface-raised animate-pulse" />
          <div className="bg-surface px-6 py-6 md:px-8 md:py-7 flex flex-col gap-4">
            <div className="h-3 w-16 rounded bg-surface-raised animate-pulse" />
            <div className="h-7 w-2/3 rounded bg-surface-raised animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-surface-raised animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-surface-raised animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-surface-raised animate-pulse" />
            </div>
            <div className="h-4 w-28 rounded bg-surface-raised animate-pulse mt-2" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Component ─────────────────────────────────────────────────────────────────
const FeaturesGrid = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex];
  const imageRef = useRef(null);
  const cardRef = useRef(null);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const listRef = useRef(null);
  const rightRef = useRef(null);

  // ── Scroll entrance animations ────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading fades up on scroll
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // List items stagger in from the left
      gsap.fromTo(
        listRef.current?.querySelectorAll('li'),
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );

      // Right card slides in from the right
      gsap.fromTo(
        rightRef.current,
        { x: 40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: rightRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Active-tab transition animations ─────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        imageRef.current,
        { scale: 1.05, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [activeIndex]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-16 px-6 md:px-10 bg-void text-text-primary border-y border-border/50 relative"
    >
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <div ref={headingRef} className="mb-24 text-center">
          <div
            role="heading"
            aria-level="2"
            className="text-4xl sm:text-5xl lg:text-[58px] leading-[1.05] font-normal tracking-tight text-text-primary mx-auto max-w-4xl font-display"
          >
            Built for people who assume the network is{' '}
            <span className="font-mono text-accent italic">hostile.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left List — fixed to first 5 columns */}
          <div className="lg:col-span-5">
            <ul ref={listRef} className="flex flex-col gap-3">
              {features.map((feature, index) => {
                const isActive = activeIndex === index;
                const Icon = feature.icon;
                return (
                  <li key={feature.id}>
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={`w-full text-left py-4 px-4 rounded-xl flex items-center justify-between transition-colors duration-300 group hover:bg-surface-raised/50 ${isActive ? 'bg-surface/30' : 'bg-transparent'}`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className={`font-mono text-xs ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-accent'}`}>
                          {String(feature.id).padStart(2, '0')}
                        </span>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-accent'}`} />
                        <span className={`text-base md:text-xl font-medium ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-accent'}`}>
                          {feature.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`transform transition-transform duration-300 ${isActive ? 'rotate-45' : 'rotate-0'}`}>
                          <Plus className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Card — starts at col 7, spans to end, pushed right */}
          <div ref={rightRef} className="lg:col-start-7 lg:col-span-6 lg:sticky lg:top-24">
            <div className="w-full rounded-2xl border border-border/50 overflow-hidden relative group flex flex-col">

              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-void shrink-0">
                <img
                  ref={imageRef}
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-20"
                  style={{ background: 'linear-gradient(to top, var(--color-surface) 10%, transparent 100%)' }}
                />
              </div>

              {/* Text panel */}
              <div ref={cardRef} className="bg-surface px-6 py-6 md:px-8 md:py-7 flex flex-col gap-3">
                <span className="font-mono text-[10px] sm:text-xs text-text-secondary tracking-widest">
                  {String(activeFeature.id).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
                </span>
                <div role="heading" aria-level="3" className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                  {activeFeature.title}
                </div>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                  {activeFeature.desc}
                </p>
                <Link to="/architecture" className="inline-flex items-center gap-2 text-text-primary font-bold text-sm hover:opacity-70 transition-opacity mt-2">
                  Read the spec <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
