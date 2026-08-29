import React from 'react';
import { Check, X, Shield } from 'lucide-react';

const ComparisonSection = () => {
  const columns = [
    { name: "Feature / Capability", isPrimary: false },
    { name: "Zancrypt", isPrimary: true },
    { name: "Dropbox", isPrimary: false },
    { name: "Internxt", isPrimary: false },
    { name: "Storj", isPrimary: false }
  ];

  const rows = [
    {
      feature: "Zero-Knowledge Encryption",
      desc: "Encryption keys remain only with the user, never uploaded.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "check", label: "Yes" },
        { type: "check", label: "Yes" }
      ]
    },
    {
      feature: "All Files Sharded",
      desc: "Files are split into discrete fragments prior to storage.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "check", label: "Yes" },
        { type: "check", label: "Yes" }
      ]
    },
    {
      feature: "All File Sizes Sharded",
      desc: "Sharding applies to every uploaded file size, no threshold limits.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No (Limit-based)" },
        { type: "check", label: "Yes" }
      ]
    },
    {
      feature: "Passkey (FIDO2) Auth",
      desc: "Passwordless, cryptographically secure biometric authentication.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No (Password)" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" }
      ]
    },
    {
      feature: "No Blockchain Dependency",
      desc: "SaaS speeds without volatile crypto token models.",
      values: [
        { type: "check", label: "Yes (Pure SaaS)" },
        { type: "check", label: "Yes" },
        { type: "cross", label: "No (Utility Token)" },
        { type: "cross", label: "No (Utility Token)" }
      ]
    },
    {
      feature: "Node Transparency",
      desc: "Real-time health status, location, and load info of nodes.",
      values: [
        { type: "check", label: "Yes" },
        { type: "cross", label: "No" },
        { type: "cross", label: "No" },
        { type: "check", label: "Yes" }
      ]
    },
    {
      feature: "Subpoena / Seizure Risk",
      desc: "Vulnerability of data to government or administrative intervention.",
      values: [
        { type: "text", text: "Zero Risk", highlight: true },
        { type: "text", text: "High", highlight: false },
        { type: "text", text: "Low", highlight: false },
        { type: "text", text: "Low", highlight: false }
      ]
    }
  ];

  return (
    <section id="comparison" className="py-24 lg:py-32 border-t border-border/20 bg-void">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">How Zancrypt Compares</h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto font-sans">
            A line-by-line comparison of security standards and architectural choices.
          </p>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-border/40 rounded-2xl bg-surface/10 backdrop-blur-md animate-on-scroll">
          <table className="w-full min-w-[800px] border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-surface/50">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`p-5 font-mono text-xs uppercase tracking-widest ${
                      col.isPrimary 
                        ? 'text-accent bg-accent/5 border-x border-accent/20 font-bold' 
                        : 'text-text-primary border-r border-border/20'
                    }`}
                  >
                    {col.isPrimary && (
                      <span className="inline-flex items-center text-[9px] bg-accent/10 border border-accent/30 text-accent px-1.5 py-0.5 rounded mr-2 uppercase tracking-tight">
                        <Shield className="w-2.5 h-2.5 mr-1" /> Core
                      </span>
                    )}
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr 
                  key={i} 
                  className="border-b border-border/10 hover:bg-surface/10 transition-colors"
                >
                  <td className="p-5 border-r border-border/20 max-w-[280px]">
                    <div className="font-bold text-text-primary">{row.feature}</div>
                    <div className="text-xs text-text-secondary mt-1 leading-relaxed">{row.desc}</div>
                  </td>
                  
                  {/* Values */}
                  {columns.slice(1).map((col, colIdx) => {
                    const cell = row.values[colIdx];
                    const isZancrypt = col.isPrimary;
                    
                    return (
                      <td 
                        key={colIdx} 
                        className={`p-5 text-center ${
                          isZancrypt 
                            ? 'bg-accent/5 border-x border-accent/20 text-accent font-medium' 
                            : 'text-text-secondary border-r border-border/20'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          {cell.type === "check" && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isZancrypt ? 'bg-accent/10 text-accent' : 'bg-surface-raised text-text-secondary'
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {cell.type === "cross" && (
                            <div className="w-6 h-6 rounded-full bg-void flex items-center justify-center text-text-muted">
                              <X className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {cell.type === "text" && (
                            <span className={`text-xs uppercase font-mono tracking-wider ${
                              cell.highlight ? 'text-accent font-bold' : 'text-text-muted'
                            }`}>
                              {cell.text}
                            </span>
                          )}
                          <span className="text-[10px] mt-1.5 opacity-80 block md:hidden">
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
      </div>
    </section>
  );
};

export default ComparisonSection;
