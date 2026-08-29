import React, { useState } from 'react';

const faqData = [
  {
    "id": "q1",
    "question": "What makes Zancrypt's zero-knowledge architecture different?",
    "answer": "Unlike traditional cloud storage, encryption keys are derived client-side using Argon2id and your files are split into encrypted shards before ever hitting a server. We physically cannot read your files."
  },
  {
    "id": "q2",
    "question": "How securely are my access keys and credentials stored?",
    "answer": "We utilize the OPAQUE protocol along with hardware-bound FIDO2/WebAuthn passkeys. Your raw passwords never leave your browser, and we only retain a secure bcrypt hash of a SHA-256 hash of your credential registry."
  },
  {
    "id": "q3",
    "question": "Where are my encrypted file shards distributed?",
    "answer": "Your files are split using Shamir's Secret Sharing and Reed-Solomon erasure coding across 5 independent storage points, including AWS S3, Cloudflare R2, Backblaze B2, and self-hosted MinIO nodes. Any 4 shards can entirely reconstruct your file."
  },
  {
    "id": "q4",
    "question": "Is the system optimized for performance and network constraints?",
    "answer": "Yes. The frontend handles parallel chunked uploads directly to edge nodes, utilizing lightweight, non-blocking JWT states stored purely in browser memory to eliminate Cross-Site Scripting (XSS) extraction risks."
  }
];

const FAQAccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 px-6 md:px-8 text-left transition-colors hover:bg-surface-raised"
        aria-expanded={isOpen}
      >
        <span className="text-text-primary font-normal text-base md:text-lg pr-4">
          {item.question}
        </span>
        <div className="flex-shrink-0 text-text-secondary flex items-center justify-center w-6 h-6 ml-2">
          <div className="relative w-3.5 h-3.5 flex items-center justify-center">
            {/* Horizontal line (always present, rotates slightly for effect) */}
            <span
              className={`absolute w-full h-[2px] rounded-full bg-current transition-transform duration-300 ease-in-out ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
            {/* Vertical line (disappears when open to form a minus) */}
            <span
              className={`absolute h-full w-[2px] rounded-full bg-current transition-transform duration-300 ease-in-out ${
                isOpen ? 'rotate-90 scale-y-0' : 'rotate-0 scale-y-100'
              }`}
            />
          </div>
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 md:px-8 pb-6 pt-1">
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnterpriseSecurity = () => {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-24 md:py-32 px-4 bg-void border-y border-border/40 w-full relative overflow-hidden flex items-center justify-center">
      {/* Subtle radial gradient background effect - adapts to theme if possible, otherwise subtle enough for both */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface/20 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <div className="mb-14 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary mb-5 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to know about our zero-knowledge architecture and how we protect your data.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface/40 backdrop-blur-md overflow-hidden">
          {faqData.map((item) => (
            <FAQAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onClick={() => handleToggle(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSecurity;
