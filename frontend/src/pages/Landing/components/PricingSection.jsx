import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useThemeStore } from '../../../store/useThemeStore';

const PricingSection = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const tiers = [
    {
      name: "FREE",
      baseInr: 0,
      description: "Forever free, client-side zero-knowledge security standard.",
      features: [
        "5 GB secure storage", 
        "3 distributed storage nodes", 
        "Passkey (WebAuthn) authentication", 
        "Client-side AES-256-GCM encryption", 
        "No credit card required", 
        "Download and share encrypted files"
      ],
      cta: "Get Started",
      recommended: false
    },
    {
      name: "SHIELD",
      baseInr: 299,
      description: "Enhanced capabilities for active developers and creators.",
      features: [
        "50 GB secure storage", 
        "6 distributed storage nodes", 
        "Passkey (WebAuthn) authentication", 
        "Client-side AES-256-GCM encryption",
        "Download and share encrypted files",
        "Self-destructing file links", 
        "Priority multi-cloud routing",
        "Dedicated upload bandwidth"
      ],
      cta: "Start Trial",
      recommended: true
    },
    {
      name: "VAULT",
      baseInr: 999,
      description: "Complete infrastructure scale for custom nodes and auditing.",
      features: [
        "500 GB secure storage", 
        "Custom private node connection", 
        "Passkey (WebAuthn) authentication", 
        "Client-side AES-256-GCM encryption",
        "Download and share encrypted files",
        "Self-destructing file links", 
        "Priority multi-cloud routing", 
        "OpenTelemetry monitoring export", 
        "Immutable audit log exports", 
        "99.99% data availability SLA"
      ],
      cta: "Contact Sales",
      recommended: false
    }
  ];

  const getPriceString = (baseInrMonthly) => {
    if (baseInrMonthly === 0) {
      return {
        primary: '₹0',
        secondary: 'Forever free storage',
        period: 'mo'
      };
    }

    // Apply 20% discount for yearly billing
    const monthlyRate = billingCycle === 'monthly' ? baseInrMonthly : Math.round(baseInrMonthly * 0.8);

    return {
      primary: `₹${monthlyRate}`,
      secondary: billingCycle === 'yearly' ? `Billed annually as ₹${monthlyRate * 12}/yr` : `Billed monthly`,
      period: 'mo'
    };
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-void/30 border-t border-border/20 relative overflow-hidden">
      {/* Decorative background grid pattern for light/dark theme depth */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(var(--color-text-primary)_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 font-display tracking-tight">
            Simple, Transparent Plans
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto font-sans leading-relaxed">
            Choose the capacity that fits your operation. Every plan includes absolute zero-knowledge encryption in the browser.
          </p>
        </div>

        {/* Dash Controls: Billing Cycle Switcher */}
        <div className="flex items-center justify-center gap-6 mb-16 animate-on-scroll">
          <div className="bg-surface border border-border/60 p-1 rounded-full flex items-center shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-accent text-void font-bold shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-accent text-void font-bold shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Yearly
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-all ${
                billingCycle === 'yearly' ? 'bg-void/25 text-void' : 'bg-accent/15 text-accent'
              }`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {tiers.map((tier, i) => {
            const priceInfo = getPriceString(tier.baseInr);
            return (
              <div 
                key={i} 
                className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 animate-on-scroll ${
                  tier.recommended 
                    ? isDark
                      ? 'border-accent/40 bg-gradient-to-b from-surface to-accent/5 shadow-[0_0_40px_rgba(79,255,176,0.08)] scale-102 z-10'
                      : 'border-accent bg-gradient-to-b from-surface to-accent/5 shadow-[0_15px_40px_rgba(217,119,87,0.12)] scale-102 z-10'
                    : isDark
                      ? 'border-border/40 hover:border-border-active bg-surface hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1'
                      : 'border-border/60 hover:border-border-active bg-surface hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {tier.recommended && (
                  <div className="absolute top-5 right-5 font-mono text-[9px] text-accent uppercase tracking-widest border border-accent/30 px-2.5 py-1 rounded bg-accent/10 font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="font-mono text-text-muted tracking-widest uppercase mb-2 text-xs font-bold">{tier.name}</h3>
                <p className="text-xs text-text-secondary mb-6 font-sans leading-relaxed">{tier.description}</p>
                
                {/* Pricing Block */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight font-mono">
                      {priceInfo.primary}
                    </span>
                    <span className="text-xs text-text-secondary font-mono">
                      / {priceInfo.period}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-secondary/80 mt-2 font-mono min-h-[16px]">
                    {priceInfo.secondary}
                  </div>
                </div>

                <div className="w-full h-[1px] bg-border/40 mb-6" />
                
                {/* Features List */}
                <ul className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="font-sans text-sm text-text-secondary flex items-start">
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        tier.recommended
                          ? 'bg-accent/15 text-accent'
                          : 'bg-border/50 text-text-secondary'
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={tier.recommended ? "/register" : "/contact"} 
                  className={`w-full py-4 text-center rounded-2xl font-mono text-xs uppercase tracking-widest transition-all duration-300 font-bold ${
                    tier.recommended 
                      ? 'bg-accent text-void hover:brightness-110 active:scale-98 shadow-lg shadow-accent/15' 
                      : 'border border-border/80 text-text-secondary hover:text-text-primary hover:border-border-active hover:bg-border/20 active:scale-98'
                  }`}
                >
                  [ {tier.cta} ]
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
