import React, { useEffect } from 'react';
import Navbar from '../Landing/components/Navbar';
import Footer from '../Landing/components/Footer';
import { Check, X, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const CloudAlternative = () => {
  useEffect(() => {
    document.title = "Zancrypt vs Google Drive, Dropbox, & Internxt - The Best Cloud Alternative";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Discover why Zancrypt is the ultimate cloud alternative to Google Drive, Dropbox, and Internxt. Zero-knowledge encryption, unmatched privacy, and superior security.");
    }
  }, []);

  const columns = [
    { name: "Feature / Capability", isPrimary: false, logo: null },
    { name: "Zancrypt", isPrimary: true, logo: "/favi/zancr.png" },
    { name: "Google Drive", isPrimary: false, logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" },
    { name: "Dropbox", isPrimary: false, logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg" },
    { name: "Internxt", isPrimary: false, logo: "https://internxt.com/favicon.ico" }
  ];

  const rows = [
    {
      feature: "Zero-Knowledge Encryption",
      desc: "Encryption keys remain only with the user. Server never sees your data.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No (Server-side)" },
        { type: "cross", label: "No (Server-side)" },
        { type: "check", label: "Yes" }
      ]
    },
    {
      feature: "Decentralized File Sharding",
      desc: "Files are split into discrete fragments and spread across multiple nodes.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" }
      ]
    },
    {
      feature: "Absolute Data Privacy",
      desc: "Zero data mining, tracking, or scanning of user files for advertising.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No (Scans Data)" },
        { type: "cross", label: "No (Tracks usage)" },
        { type: "check", label: "Yes" }
      ]
    },
    {
      feature: "Passkey (WebAuthn) Default",
      desc: "Phishing-resistant, cryptographically secure biometric authentication out of the box.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "Optional" },
        { type: "cross", label: "Optional" },
        { type: "cross", label: "No" }
      ]
    },
    {
      feature: "No Central Point of Failure",
      desc: "Resilient infrastructure that prevents complete service blackouts.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" }
      ]
    },
    {
      feature: "Enterprise Multi-Cloud Routing",
      desc: "Priority routing protocols for lightning-fast speeds across storage nodes.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" }
      ]
    },
    {
      feature: "Subpoena / Seizure Risk",
      desc: "Vulnerability of your data to administrative or government intervention.",
      values: [
        { type: "text", text: "Zero Risk", highlight: true },
        { type: "text", text: "High", highlight: false },
        { type: "text", text: "High", highlight: false },
        { type: "text", text: "Low", highlight: false }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-void text-text-primary selection:bg-accent/20 selection:text-accent font-sans overflow-x-hidden scroll-smooth">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight mb-6">
            The Ultimate <span className="text-accent font-normal">Cloud Alternative</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            See exactly why Zancrypt outpaces Google Drive, Dropbox, and Internxt in security, privacy, and architecture. No compromises.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <div className="overflow-x-auto custom-scrollbar border border-border/40 rounded-3xl bg-surface/10 backdrop-blur-md mb-24 shadow-2xl">
          <table className="w-full min-w-[900px] border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-surface/50">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`p-6 font-mono text-xs uppercase tracking-widest align-bottom ${
                      col.isPrimary 
                        ? 'text-accent bg-accent/5 border-x border-accent/20 font-normal' 
                        : 'text-text-primary border-r border-border/20 last:border-r-0'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-end h-full gap-3 text-center">
                      {col.logo && (
                        <div className="w-10 h-10 flex items-center justify-center bg-surface rounded-xl p-2 mb-1 border border-border/50">
                          <img src={col.logo} alt={`${col.name} logo`} className="max-w-full max-h-full object-contain filter drop-shadow-md" />
                        </div>
                      )}
                      <span className={col.isPrimary ? "text-base font-normal" : "text-sm"}>{col.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr 
                  key={i} 
                  className="border-b border-border/10 hover:bg-surface/30 transition-colors duration-200"
                >
                  <td className="p-6 border-r border-border/20 max-w-[320px]">
                    <div className="font-normal text-text-primary text-base mb-1.5">{row.feature}</div>
                    <div className="text-sm text-text-secondary leading-relaxed font-sans">{row.desc}</div>
                  </td>
                  
                  {columns.slice(1).map((col, colIdx) => {
                    const cell = row.values[colIdx];
                    const isZancrypt = col.isPrimary;
                    
                    return (
                      <td 
                        key={colIdx} 
                        className={`p-6 text-center ${
                          isZancrypt 
                            ? 'bg-accent/5 border-x border-accent/20 text-accent font-medium' 
                            : 'text-text-secondary border-r border-border/20 last:border-r-0'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          {cell.type === "check" && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                              isZancrypt ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-surface-raised text-text-secondary border border-border/50'
                            }`}>
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                          {cell.type === "cross" && (
                            <div className="w-8 h-8 rounded-full bg-void flex items-center justify-center text-text-muted border border-border/30">
                              <X className="w-4 h-4" />
                            </div>
                          )}
                          {cell.type === "text" && (
                            <span className={`text-sm uppercase font-mono tracking-wider px-3 py-1 rounded-md ${
                              cell.highlight ? 'bg-accent/10 text-accent border border-accent/20 font-normal' : 'bg-void border border-border/30 text-text-muted'
                            }`}>
                              {cell.text}
                            </span>
                          )}
                          <span className={`text-xs mt-1 block font-mono ${isZancrypt ? 'opacity-100 font-normal' : 'opacity-70'}`}>
                            {cell.label}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mb-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-normal mb-8 text-text-primary">Why Zancrypt is the Superior Choice</h2>
          <div className="space-y-8 text-lg text-text-secondary leading-relaxed text-left">
            <p>
              When evaluating cloud storage solutions, the standard defaults have always been <span className="text-text-primary">Google Drive</span> and <span className="text-text-primary">Dropbox</span>. While these platforms offer convenience, they operate on a legacy model that fundamentally compromises your privacy. Google Drive routinely scans user content to build advertising profiles, retaining the ultimate decryption keys on their servers. Dropbox similarly lacks default end-to-end encryption, leaving sensitive user data vulnerable to massive server breaches and unauthorized insider access.
            </p>
            <p>
              <span className="text-accent">Zancrypt</span> was engineered from the ground up to solve these architectural flaws. As a true zero-knowledge platform, Zancrypt ensures that your data is encrypted client-side before it ever leaves your device. We do not have your keys, meaning we cannot read, scan, or mine your files. Furthermore, our decentralized sharding means your file is broken apart and scattered across independent nodes—eliminating any central point of failure.
            </p>
            <p>
              Newer players like <span className="text-text-primary">Internxt</span> have attempted to address privacy concerns, offering basic encrypted storage. However, they frequently struggle with rigid infrastructure, slower synchronization speeds, and a lack of robust enterprise-grade architectures like multi-cloud routing or complete file sharding regardless of size.
            </p>
            <p className="p-6 bg-surface border border-accent/20 rounded-2xl text-text-primary font-normal">
              Choosing Zancrypt means choosing the ultimate cloud alternative. You get the seamless experience of Google Drive, the synchronization speed of Dropbox, and privacy protections that drastically surpass Internxt. Take absolute control of your digital sovereignty today.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default CloudAlternative;
