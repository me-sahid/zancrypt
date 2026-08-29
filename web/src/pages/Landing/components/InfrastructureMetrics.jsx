import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const InfrastructureMetrics = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const counters = document.querySelectorAll('.metric-counter');
      
      counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isFloat = target % 1 !== 0;
        
        gsap.to(counter, {
          innerHTML: target,
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
          onUpdate: function() {
            if (isFloat) {
              counter.innerHTML = parseFloat(this.targets()[0].innerHTML).toFixed(2);
            } else {
              counter.innerHTML = Math.ceil(this.targets()[0].innerHTML);
            }
          }
        });
      });

      gsap.fromTo('.metric-card',
        { y: 30, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const metrics = [
    { prefix: '', target: '99.99', suffix: '%', label: 'Uptime SLA' },
    { prefix: '<', target: '50', suffix: 'ms', label: 'Global API Latency' },
    { prefix: '', target: '256', suffix: '-bit', label: 'AES Encryption' },
    { prefix: '', target: '24', suffix: '/7', label: 'Automated Monitoring' },
  ];

  return (
    <section ref={containerRef} className="py-24 px-8 border-y border-white/5 bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/5">
        {metrics.map((metric, i) => (
          <div key={i} className="metric-card text-center px-4">
            <div className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2 flex justify-center items-baseline">
              {metric.prefix && <span className="text-3xl text-primary-accent mr-1">{metric.prefix}</span>}
              <span className="metric-counter" data-target={metric.target}>0</span>
              <span className="text-2xl text-text-secondary ml-1">{metric.suffix}</span>
            </div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfrastructureMetrics;
