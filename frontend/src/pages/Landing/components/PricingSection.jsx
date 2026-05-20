import React from 'react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const tiers = [
    {
      name: "FREE",
      features: ["5 GB storage", "3 storage nodes", "Passkey auth"],
      cta: "Get Started",
      recommended: false
    },
    {
      name: "SHIELD",
      features: ["50 GB storage", "6 storage nodes", "Passkey auth", "Self-destruct links", "Priority routing"],
      cta: "Start Trial",
      recommended: true
    },
    {
      name: "VAULT",
      features: ["500 GB storage", "Custom nodes", "Passkey auth", "Self-destruct links", "Priority routing", "OpenTelemetry export", "Audit log export", "SLA guarantee"],
      cta: "Contact Sales",
      recommended: false
    }
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, i) => (
            <div key={i} className={`relative flex flex-col p-8 rounded-lg border bg-surface transition-colors ${
              tier.recommended 
                ? 'border-accent/40 shadow-[0_0_30px_rgba(79,255,176,0.05)]' 
                : 'border-border hover:border-border-active'
            }`}>
              {tier.recommended && (
                <div className="absolute top-4 right-4 font-mono text-[10px] text-accent uppercase tracking-widest border border-accent/30 px-2 py-1 rounded-sm bg-accent/10">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="font-mono text-text-primary tracking-widest uppercase mb-4 text-sm">{tier.name}</h3>
              <div className="w-full h-[1px] bg-border mb-8" />
              
              <ul className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="font-sans text-sm text-text-secondary">
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link 
                to={tier.recommended ? "/register" : "/contact"} 
                className={`w-full py-3 text-center rounded-md font-mono text-xs uppercase tracking-widest transition-colors ${
                  tier.recommended 
                    ? 'bg-accent text-void hover:brightness-110' 
                    : 'border border-border text-text-secondary hover:text-text-primary hover:border-border-active bg-transparent'
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
