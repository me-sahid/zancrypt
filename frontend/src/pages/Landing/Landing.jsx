import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesGrid from './components/FeaturesGrid';
import EnterpriseSecurity from './components/EnterpriseSecurity';
import CTASection from './components/CTASection';

const Footer = lazy(() => import('./components/Footer'));

const Landing = () => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading sequence for visual skeletons
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Global Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Initial query
    const targets = document.querySelectorAll('.animate-on-scroll');
    targets.forEach((target) => observer.observe(target));

    // Monitor dynamically added nodes (like lazy loaded components)
    const mutationObserver = new MutationObserver(() => {
      const newTargets = document.querySelectorAll('.animate-on-scroll:not(.fade-in-visible)');
      newTargets.forEach((target) => observer.observe(target));
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-void text-text-primary selection:bg-accent/20 selection:text-accent font-sans overflow-x-hidden scroll-smooth">
      <Navbar />
      <HeroSection isLoading={isLoading} />



      {/* FEATURES section */}
      <section id="features">
        <FeaturesGrid isLoading={isLoading} />
      </section>

      {/* ARCHITECTURE section */}
      <section id="architecture">
        <HowItWorksSection />
      </section>

      {/* SECURITY section */}
      <section id="security">
        <EnterpriseSecurity />
      </section>

      {/* PRICING section removed to separate page */}
      
      {/* CTA section */}
      <CTASection />

      <Suspense fallback={<div className="h-40 flex items-center justify-center font-mono text-text-muted text-xs uppercase tracking-widest">Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Landing;
