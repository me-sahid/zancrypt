import React from 'react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const tiers = [
    {
      name: "FREE",
      price: "₹0 / month",
      features: [
        "5 GB storage", 
        "3 storage nodes", 
        "Passkey auth", 
        "AES-256-GCM encryption", 
        "No credit card required", 
        "Download and share files"
      ],
      cta: "Get Started",
      recommended: false
    },
    {
      name: "SHIELD",
      price: "₹299 / month",
      features: [
        "50 GB storage", 
        "6 storage nodes", 
        "Passkey auth", 
        "AES-256-GCM encryption",
        "Download and share files",
        "Self-destruct links", 
        "Priority routing"
      ],
      cta: "Start Trial",
      recommended: true
    },
    {
      name: "VAULT",
      price: "₹999 / month",
      features: [
        "500 GB storage", 
        "Custom nodes", 
        "Passkey auth", 
        "AES-256-GCM encryption",
        "Download and share files",
        "Self-destruct links", 
        "Priority routing", 
        "OpenTelemetry export", 
        "Audit log export", 
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      recommended: false
    }
  ];

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-void/50 border-t border-border/20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">Simple, Transparent Pricing</h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto font-sans">
            Choose the tier that fits your capacity needs. All plans feature absolute client-side security.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col p-8 rounded-2xl border bg-surface transition-colors animate-on-scroll ${
                tier.recommended 
                  ? 'border-accent/40 shadow-[0_0_30px_rgba(79,255,176,0.05)]' 
                  : 'border-border/40 hover:border-border-active'
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {tier.recommended && (
                <div className="absolute top-4 right-4 font-mono text-[9px] text-accent uppercase tracking-widest border border-accent/30 px-2.5 py-1 rounded bg-accent/10">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="font-mono text-text-muted tracking-widest uppercase mb-1 text-xs">{tier.name}</h3>
              <div className="font-mono text-2xl md:text-3xl font-bold text-text-primary mb-4 tracking-wide">
                {tier.price}
              </div>
              <div className="w-full h-[1px] bg-border/40 mb-6" />
              
              <ul className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="font-sans text-sm text-text-secondary flex items-start">
                    <span className="text-accent mr-3 font-mono text-xs">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to={tier.recommended ? "/register" : "/contact"} 
                className={`w-full py-3.5 text-center rounded-xl font-mono text-xs uppercase tracking-widest transition-all ${
                  tier.recommended 
                    ? 'bg-accent text-void font-bold hover:brightness-110 active:scale-98 shadow-lg shadow-accent/10' 
                    : 'border border-border/60 text-text-secondary hover:text-text-primary hover:border-border-active bg-transparent active:scale-98'
                }`}
              >
                [ {tier.cta} ]
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
