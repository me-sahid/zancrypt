import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Globe, MessageSquare, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#050508] border-t border-white/10 pt-20 pb-10 px-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-accent/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          
          {/* Column 1: Brand & Status */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-accent flex items-center justify-center shadow-[0_0_15px_rgba(0,112,243,0.5)]">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Zan<span className="text-primary-accent">crypt</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary mb-8 pr-4 leading-relaxed">
              Enterprise-grade distributed zero-knowledge storage infrastructure. Built for scale, engineered for absolute privacy.
            </p>
            
            {/* System Status */}
            <div className="inline-flex flex-col border border-white/10 rounded-xl p-4 bg-surface-elevated/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-white">All Systems Operational</span>
              </div>
              <div className="text-xs text-text-secondary flex items-center justify-between">
                <span>Global Uptime</span>
                <span className="text-green-400 font-mono">99.999%</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Security Architecture</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Global Network</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Monitoring</a></li>
            </ul>
          </div>

          {/* Column 3: Developers */}
          <div>
            <h4 className="text-white font-bold mb-4">Developers</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Client SDKs</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">System Architecture</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 5: Resources */}
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Whitepaper</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Changelog</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-primary-accent transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-text-secondary mb-4 md:mb-0">
            © {new Date().getFullYear()} Zancrypt Infrastructure Inc. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-text-secondary hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-text-secondary hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="#" className="text-text-secondary hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
