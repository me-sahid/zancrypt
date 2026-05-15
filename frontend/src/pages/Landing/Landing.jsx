import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import all sections
import HeroSection from './components/HeroSection';
import TrustedInfrastructure from './components/TrustedInfrastructure';
import SecurityArchitecture from './components/SecurityArchitecture';
import DistributedNodeVisualizer from './components/DistributedNodeVisualizer';
import ZeroKnowledgeFlow from './components/ZeroKnowledgeFlow';
import FeaturesGrid from './components/FeaturesGrid';
import EncryptionWorkflow from './components/EncryptionWorkflow';
import InfrastructureMetrics from './components/InfrastructureMetrics';
import RealTimeMonitoring from './components/RealTimeMonitoring';
import EnterpriseSecurity from './components/EnterpriseSecurity';
import PerformanceSection from './components/PerformanceSection';
import AuthenticationShowcase from './components/AuthenticationShowcase';
import ApiDeveloper from './components/ApiDeveloper';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary-accent/30 selection:text-white font-sans overflow-hidden">
      <HeroSection />
      <TrustedInfrastructure />
      <SecurityArchitecture />
      <DistributedNodeVisualizer />
      <ZeroKnowledgeFlow />
      <FeaturesGrid />
      <EncryptionWorkflow />
      <InfrastructureMetrics />
      <RealTimeMonitoring />
      <EnterpriseSecurity />
      <PerformanceSection />
      <AuthenticationShowcase />
      <ApiDeveloper />
      <Testimonials />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
