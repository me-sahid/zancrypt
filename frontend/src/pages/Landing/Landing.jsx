import React, { useEffect, useRef, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import PricingSection from './components/PricingSection';
import FeaturesGrid from './components/FeaturesGrid';
import EnterpriseSecurity from './components/EnterpriseSecurity';

const Footer = lazy(() => import('./components/Footer'));

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-void text-text-primary selection:bg-accent/20 selection:text-accent font-sans overflow-x-hidden scroll-smooth">
      <Navbar />
      <HeroSection />

      {/* FEATURES section */}
      <section id="features">
        <FeaturesGrid />
      </section>

      {/* ARCHITECTURE section */}
      <section id="architecture">
        <HowItWorksSection />
      </section>


      {/* SECURITY section */}
      <section id="security">
        <EnterpriseSecurity />
      </section>

      <PricingSection />
      <Suspense fallback={<div className="h-40 flex items-center justify-center font-mono text-text-muted text-[10px] uppercase tracking-widest">Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Landing;
