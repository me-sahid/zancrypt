import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.test-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      quote: "The Zero-Knowledge guarantees aren't just marketing. We audited their client-side encryption flow and it's mathematically impossible for them to access our data.",
      name: "Dr. Sarah Jenkins",
      role: "Chief Information Security Officer",
      company: "Aegis Financial Systems"
    },
    {
      quote: "Migrating from S3 to a truly distributed sharded architecture reduced our compliance overhead by 80%. Multi-region redundancy out-of-the-box is a game changer.",
      name: "Marcus Chen",
      role: "VP of Infrastructure",
      company: "HealthData Global"
    },
    {
      quote: "Finally, an enterprise storage solution that treats passwords like the liability they are. The native WebAuthn passkey integration is flawless.",
      name: "Elena Rodriguez",
      role: "Lead Security Architect",
      company: "CipherGrid Technologies"
    }
  ];

  return (
    <section ref={containerRef} className="py-32 px-8 bg-surface-secondary/10 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Trusted by Elite Engineering Teams</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From financial institutions to healthcare providers, organizations that require absolute data sovereignty rely on Zancrypt.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <div key={i} className="test-card relative p-8 rounded-2xl bg-surface-elevated/40 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden hover:border-primary-accent/30 transition-colors">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5" />
              
              <div className="relative z-10">
                <p className="text-white/90 text-lg leading-relaxed mb-8 italic">
                  "{test.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-accent to-blue-600 p-[2px] mr-4">
                    <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center text-white font-bold text-sm">
                      {test.name.charAt(0)}{test.name.split(' ')[1].charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{test.name}</h4>
                    <p className="text-xs text-text-secondary">{test.role}</p>
                    <p className="text-xs text-primary-accent mt-0.5">{test.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
