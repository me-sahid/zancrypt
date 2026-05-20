import React, { useState, useEffect } from 'react';
import { Lock, FileText, Server, ShieldCheck, Layers, Network } from 'lucide-react';

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Your file is encrypted in your browser",
      desc: "AES-256-GCM + a key that never leaves your device.",
      detail: "Before upload, the Web Crypto API performs client-side encryption. The generated key is encoded into your private vault URL fragment, ensuring Zancrypt servers never see the plaintext or the key."
    },
    {
      title: "The ciphertext is sharded",
      desc: "Split into ≥3 pieces. Even a 1KB file gets 3 shards.",
      detail: "The encrypted file is split byte-by-byte into multiple shards. This mathematical division guarantees that no individual shard contains enough readable data to compromise the file, even if analyzed."
    },
    {
      title: "Shards are distributed globally",
      desc: "Each shard goes to a different provider, different region.",
      detail: "Our storage router sends shards concurrently to Backblaze B2, Supabase S3, and Storj. No single cloud provider holds more than a useless fraction of your file."
    },
    {
      title: "Only you can reassemble and decrypt",
      desc: "The coordinator has a map — but the shards are meaningless ciphertext.",
      detail: "To download, the browser queries the coordinator for shard locations, downloads them directly from the cloud providers, reassembles them in memory, and decrypts using your local key."
    }
  ];

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveStep(index);
    }
  };

  return (
    <section id="architecture" className="py-24 lg:py-32 border-b border-border bg-void relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[40px] font-display text-text-primary mb-16 animate-on-scroll">
          How It Works
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-start">
          
          {/* LEFT: Steps selector */}
          <div className="relative pl-8 max-w-2xl animate-on-scroll">
            <div className="absolute left-[11px] top-2 bottom-6 w-[1px] bg-border" />
            
            <div className="space-y-6">
              {steps.map((step, i) => {
                const isActive = activeStep === i;
                return (
                  <div 
                    key={i} 
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onClick={() => setActiveStep(i)}
                    className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 select-none outline-none ${
                      isActive 
                        ? 'bg-surface-raised/40 border border-border/40 shadow-sm' 
                        : 'border border-transparent hover:bg-surface/20'
                    }`}
                  >
                    <div className="absolute -left-12 top-6 bg-void py-1">
                      <span className={`font-mono text-xs px-2 py-0.5 border rounded-md transition-colors ${
                        isActive 
                          ? 'text-accent border-accent/30 bg-accent/5' 
                          : 'text-text-muted border-border bg-void'
                      }`}>
                        0{i + 1}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className={`font-display italic text-2xl mb-2 flex items-center transition-colors ${
                        isActive ? 'text-accent' : 'text-text-primary'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="font-sans text-text-secondary text-sm leading-relaxed">
                        {step.desc}
                      </p>
                      
                      {/* Expanded detail */}
                      <div className={`grid transition-all duration-300 ease-in-out ${
                        isActive ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-border/30' : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <div className="overflow-hidden">
                          <p className="font-sans text-xs text-text-secondary leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Visual Panel */}
          <div className="lg:sticky lg:top-32 w-full aspect-square max-w-[450px] mx-auto bg-surface/20 border border-border/40 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl relative backdrop-blur-md animate-on-scroll">
            
            {/* Ambient glows inside the panel */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Simulated sandbox window top bar */}
            <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4 relative z-10">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
              </div>
              <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">
                {activeStep === 0 && 'Local Sandbox'}
                {activeStep === 1 && 'Cipher Sharding'}
                {activeStep === 2 && 'Cloud Cluster Routing'}
                {activeStep === 3 && 'Decryption Sequence'}
              </span>
            </div>

            {/* Illustration Display area */}
            <div className="flex-1 flex items-center justify-center relative w-full h-full">
              
              {/* STEP 1 ILLUSTRATION: Browser sandbox encryption */}
              {activeStep === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-24 h-24 bg-surface-raised border border-border/50 rounded-2xl flex items-center justify-center group">
                    {/* Ring animation */}
                    <div className="absolute inset-0 border border-accent/20 rounded-2xl animate-ping opacity-25" />
                    <FileText className="w-10 h-10 text-text-secondary" />
                    
                    {/* Glowing lock icon overlaid */}
                    <div className="absolute bottom-[-8px] right-[-8px] w-8 h-8 rounded-lg bg-accent/10 border border-accent text-accent flex items-center justify-center shadow-lg shadow-accent/20 animate-pulse-custom">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-text-muted flex space-x-3 bg-surface-elevated px-3 py-1 rounded border border-border/30">
                    <span className="text-accent">AES-GCM</span>
                    <span>·</span>
                    <span className="text-text-primary">SHA-256</span>
                  </div>
                </div>
              )}

              {/* STEP 2 ILLUSTRATION: Splitting / sharding */}
              {activeStep === 1 && (
                <div className="flex flex-col items-center justify-center space-y-6 w-full">
                  <div className="relative w-full max-w-[280px] h-32 flex items-center justify-center">
                    
                    {/* Left Shard */}
                    <div className="absolute left-0 w-16 h-16 rounded-xl bg-surface-raised border border-border/50 flex flex-col items-center justify-center shadow-lg animate-slide-left">
                      <Layers className="w-5 h-5 text-accent mb-1" />
                      <span className="font-mono text-[8px] text-text-muted">shard-0</span>
                    </div>

                    {/* Center File (fade/split representation) */}
                    <div className="relative w-16 h-16 rounded-xl bg-void border border-dashed border-border/80 flex items-center justify-center opacity-65">
                      <FileText className="w-6 h-6 text-text-muted" />
                    </div>

                    {/* Right Shard */}
                    <div className="absolute right-0 w-16 h-16 rounded-xl bg-surface-raised border border-border/50 flex flex-col items-center justify-center shadow-lg animate-slide-right">
                      <Layers className="w-5 h-5 text-accent mb-1" />
                      <span className="font-mono text-[8px] text-text-muted">shard-1</span>
                    </div>

                  </div>
                  <div className="font-mono text-[10px] text-accent uppercase tracking-widest bg-accent/5 border border-accent/20 px-3 py-1 rounded">
                    Division Coefficient: 3x
                  </div>
                </div>
              )}

              {/* STEP 3 ILLUSTRATION: Distribution */}
              {activeStep === 2 && (
                <div className="relative w-full h-full max-h-[220px] flex items-center justify-center">
                  
                  {/* Central Router Dot */}
                  <div className="absolute w-8 h-8 rounded-full bg-accent/10 border border-accent flex items-center justify-center shadow-lg z-20">
                    <Network className="w-4 h-4 text-accent" />
                  </div>

                  {/* Node 1: Supabase (Bottom Left) */}
                  <div className="absolute bottom-0 left-4 p-3 bg-surface-raised border border-border/40 rounded-xl flex flex-col items-center shadow-lg z-10 w-24">
                    <Server className="w-4 h-4 text-accent mb-1.5" />
                    <span className="font-mono text-[8px] text-text-primary">SUPABASE</span>
                    <span className="font-mono text-[7px] text-text-muted">Mumbai</span>
                  </div>

                  {/* Node 2: Backblaze B2 (Top Center) */}
                  <div className="absolute top-0 p-3 bg-surface-raised border border-border/40 rounded-xl flex flex-col items-center shadow-lg z-10 w-24">
                    <Server className="w-4 h-4 text-accent mb-1.5" />
                    <span className="font-mono text-[8px] text-text-primary">BACKBLAZE</span>
                    <span className="font-mono text-[7px] text-text-muted">Oregon</span>
                  </div>

                  {/* Node 3: Storj (Bottom Right) */}
                  <div className="absolute bottom-0 right-4 p-3 bg-surface-raised border border-border/40 rounded-xl flex flex-col items-center shadow-lg z-10 w-24">
                    <Server className="w-4 h-4 text-accent mb-1.5" />
                    <span className="font-mono text-[8px] text-text-primary">STORJ</span>
                    <span className="font-mono text-[7px] text-text-muted">Frankfurt</span>
                  </div>

                  {/* Path lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    {/* Top Path */}
                    <line x1="50%" y1="50%" x2="50%" y2="25%" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 3" />
                    {/* Left Path */}
                    <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 3" />
                    {/* Right Path */}
                    <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 3" />
                  </svg>
                </div>
              )}

              {/* STEP 4 ILLUSTRATION: Reassembly & Decryption */}
              {activeStep === 3 && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-24 h-24 rounded-full bg-accent/5 border border-accent/30 flex items-center justify-center">
                    
                    {/* Concentric rotating rings */}
                    <div className="absolute inset-[-8px] border border-dashed border-accent/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-[-18px] border border-dotted border-text-muted/40 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                    
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent flex items-center justify-center shadow-lg shadow-accent/15">
                      <ShieldCheck className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-accent uppercase tracking-[0.2em] bg-accent/5 border border-accent/20 px-3 py-1 rounded">
                    Integrity verified
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
