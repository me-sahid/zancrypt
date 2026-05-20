import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      title: "Your file is encrypted in your browser",
      desc: "AES-256-GCM + a key that never leaves your device."
    },
    {
      title: "The ciphertext is sharded",
      desc: "Split into ≥3 pieces. Even a 1KB file gets 3 shards."
    },
    {
      title: "Shards are distributed globally",
      desc: "Each shard goes to a different provider, different region."
    },
    {
      title: "Only you can reassemble and decrypt",
      desc: "The coordinator has a map — but the shards are meaningless ciphertext."
    }
  ];

  return (
    <section className="py-24 lg:py-32 border-b border-border">
      <div className="max-w-[1000px] mx-auto px-6">
        <h2 className="text-[40px] font-display text-text-primary mb-16">
          How it works
        </h2>

        <div className="relative pl-8 max-w-2xl">
          <div className="absolute left-[11px] top-2 bottom-6 w-[1px] bg-border" />
          
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-8 top-1 bg-void py-1">
                  <span className="font-mono text-accent text-sm bg-void">0{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-display italic text-2xl text-text-primary mb-2 flex items-center">
                    <span className="font-mono text-accent text-sm mr-4 hidden md:inline">→</span>
                    {step.title}
                  </h3>
                  <p className="font-sans text-text-secondary text-base">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
