import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }
  }, [isOpen]);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-white group-hover:text-primary-accent transition-colors">{question}</span>
        <div className="w-8 h-8 rounded-full bg-surface-elevated/50 flex items-center justify-center shrink-0 ml-4 group-hover:bg-primary-accent/20 transition-colors">
          {isOpen ? <Minus className="w-4 h-4 text-primary-accent" /> : <Plus className="w-4 h-4 text-text-secondary group-hover:text-primary-accent" />}
        </div>
      </button>
      <div 
        ref={contentRef} 
        className="h-0 opacity-0 overflow-hidden"
      >
        <p className="pb-6 text-text-secondary leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const containerRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.faq-container',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
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

  const faqs = [
    {
      question: "How does zero-knowledge encryption work?",
      answer: "When you upload a file, it is encrypted on your local device using AES-256-GCM. The encryption key is derived from your master password using PBKDF2. We only ever receive the encrypted ciphertext. Because we never possess your password or the derived key, it is mathematically impossible for us to decrypt your data."
    },
    {
      question: "Can the server read my files?",
      answer: "No. The server acts purely as a blind storage and routing engine. It receives opaque blobs of data, splits them into shards, and distributes them to geographic nodes. At no point does the server have the capability to read or index the contents of your files."
    },
    {
      question: "What happens if a node fails?",
      answer: "Our distributed architecture utilizes Reed-Solomon erasure coding. Files are split into data shards and parity shards. If a node goes offline, background Celery workers automatically reconstruct the missing shards from the remaining ones and replicate them to healthy nodes, ensuring zero data loss and 100% uptime."
    },
    {
      question: "How secure is passkey authentication?",
      answer: "Passkeys utilize the WebAuthn standard, replacing vulnerable passwords with public-key cryptography. Your device (using FaceID, TouchID, or a hardware token) signs a cryptographic challenge. This makes your account entirely immune to phishing, credential stuffing, and replay attacks."
    },
    {
      question: "How is data distributed?",
      answer: "We leverage a multi-provider strategy. Encrypted shards are distributed across AWS, Google Cloud, and Azure. This mitigates the risk of a single provider outage or vendor lock-in, guaranteeing enterprise-grade resilience."
    }
  ];

  return (
    <section ref={containerRef} className="py-32 px-8 bg-primary-bg border-y border-white/5 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-text-secondary">
            Deep dive into our architecture, security guarantees, and infrastructure design.
          </p>
        </div>

        <div className="faq-container bg-surface-elevated/20 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
