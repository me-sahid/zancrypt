import React from 'react';

const ProblemSection = () => {
  return (
    <section className="py-24 lg:py-32 border-b border-border">
      <div className="max-w-[1000px] mx-auto px-6">
        <h2 className="text-[48px] font-display italic text-text-primary mb-16">
          "The cloud knows everything about you."
        </h2>

        <div className="border border-border rounded-lg bg-surface overflow-hidden font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex bg-surface-raised border-b border-border px-6 py-4 text-text-muted uppercase tracking-widest text-[11px]">
            <div className="flex-1">Provider</div>
            <div className="flex-1">Claim</div>
            <div className="flex-1">Reality</div>
          </div>
          
          <div className="divide-y divide-border">
            {[
              { provider: 'Dropbox', claim: 'Encrypted', reality: 'They hold the keys' },
              { provider: 'Google Drive', claim: 'Private', reality: 'Scanned for AI' },
              { provider: 'Internxt', claim: 'Decentralized', reality: 'OVH servers only' },
              { provider: 'Storj', claim: 'Distributed', reality: 'Requires crypto' },
              { provider: 'Tresorit', claim: 'Zero-knowledge', reality: 'Centralized infra' },
            ].map((row, i) => (
              <div key={i} className="flex px-6 py-4 hover:bg-surface-raised transition-colors group">
                <div className="flex-1 text-text-primary group-hover:text-accent transition-colors">{row.provider}</div>
                <div className="flex-1 text-text-secondary">{row.claim}</div>
                <div className="flex-1 text-danger font-medium">{row.reality}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
