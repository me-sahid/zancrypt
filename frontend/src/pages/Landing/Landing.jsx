import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Synchronous critical-path imports
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

// Lazy below-the-fold imports
const TrustedInfrastructure = lazy(() => import('./components/TrustedInfrastructure'));
const SecurityArchitecture = lazy(() => import('./components/SecurityArchitecture'));
const DistributedNodeVisualizer = lazy(() => import('./components/DistributedNodeVisualizer'));
const ZeroKnowledgeFlow = lazy(() => import('./components/ZeroKnowledgeFlow'));
const FeaturesGrid = lazy(() => import('./components/FeaturesGrid'));
const EncryptionWorkflow = lazy(() => import('./components/EncryptionWorkflow'));
const InfrastructureMetrics = lazy(() => import('./components/InfrastructureMetrics'));
const RealTimeMonitoring = lazy(() => import('./components/RealTimeMonitoring'));
const EnterpriseSecurity = lazy(() => import('./components/EnterpriseSecurity'));
const PerformanceSection = lazy(() => import('./components/PerformanceSection'));
const AuthenticationShowcase = lazy(() => import('./components/AuthenticationShowcase'));
const ApiDeveloper = lazy(() => import('./components/ApiDeveloper'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const FAQSection = lazy(() => import('./components/FAQSection'));
const CTASection = lazy(() => import('./components/CTASection'));
const Footer = lazy(() => import('./components/Footer'));

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initial ScrollTrigger update
    ScrollTrigger.refresh();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary-accent/30 selection:text-white font-sans overflow-y-auto scroll-smooth">
      <Navbar />
      <HeroSection />
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-text-secondary/40 text-xs">Loading Zancrypt Infrastructure...</div>}>
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
      </Suspense>
    </div>
  );
};

export default Landing;
