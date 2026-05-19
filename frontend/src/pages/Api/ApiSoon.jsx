import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiSoon = () => {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] text-white flex flex-col justify-center relative px-6 py-24 lg:py-0 overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
        <Link to="/" className="flex items-center text-text-secondary hover:text-white transition-colors bg-[#0a0a0c]/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-bold text-xs md:text-sm">Return Home</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center z-10 mt-12 lg:mt-0">
        
        {/* Left Side: Copy and Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-left"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Terminal className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Zancrypt API V1
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Developer API is <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-purple-500">Launching Soon.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
            We're finalizing the programmatic backbone of the Zero-Knowledge Distributed Vault. Integrate enterprise-grade sharded encryption directly into your own applications with just a few lines of code.
          </p>

          {/* Waitlist Form */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:max-w-sm">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input 
                type="email" 
                placeholder="Enter your email to get early access" 
                className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-primary-accent transition-colors"
              />
            </div>
            <button className="w-full sm:w-auto px-6 py-3 bg-primary-accent hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] shrink-0">
              Join Waitlist
            </button>
          </div>
        </motion.div>

        {/* Right Side: Mock Terminal Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative bg-[#0d0d12] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left w-full"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#13131a]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs text-text-secondary font-mono">upload.py</div>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
          
          {/* Terminal Content */}
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
              <span className="text-purple-400">import</span> zancrypt<br/><br/>
              <span className="text-text-secondary"># Initialize the Zero-Knowledge Client</span><br/>
              client = zancrypt.Client(api_key=<span className="text-yellow-300">"zc_live_..."</span>)<br/><br/>
              <span className="text-text-secondary"># Encrypt and shard the file directly from memory</span><br/>
              vault_response = client.upload(<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;file_path=<span className="text-yellow-300">"/data/classified_report.pdf"</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;shard_count=<span className="text-blue-400">5</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;redundancy=<span className="text-blue-400">2</span><br/>
              )<br/><br/>
              <span className="text-blue-400">print</span>(<span className="text-yellow-300">f"Data distributed across: {"{"}vault_response.nodes{"}"}"</span>)
            </pre>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApiSoon;
