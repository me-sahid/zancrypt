import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Globe, MessageSquare, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-void border-t border-border/40 pt-20 pb-10 px-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          
          {/* Column 1: Brand & Status */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(79,255,176,0.3)] group-hover:scale-105 transition-all duration-300">
                <Lock className="w-5 h-5 text-void" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                Zan<span className="text-accent">crypt</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary mb-8 pr-4 leading-relaxed">
              Enterprise-grade distributed zero-knowledge storage infrastructure. Built for scale, engineered for absolute privacy.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-text-primary font-bold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-sm text-text-secondary hover:text-accent transition-colors">Platform Features</Link></li>
              <li><Link to="/security-architecture" className="text-sm text-text-secondary hover:text-accent transition-colors">Security Architecture</Link></li>
              <li><Link to="/global-network" className="text-sm text-text-secondary hover:text-accent transition-colors">Global Network</Link></li>
              <li><Link to="/system-architecture" className="text-sm text-text-secondary hover:text-accent transition-colors">System Architecture</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-text-primary font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/api" className="text-sm text-text-secondary hover:text-accent transition-colors">REST API Reference</Link></li>
              <li><Link to="/client-sdks" className="text-sm text-text-secondary hover:text-accent transition-colors">Client SDKs</Link></li>
              <li><a href="https://github.com/zancrypt" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-accent transition-colors">Open Source</a></li>
              <li><Link to="/support-center" className="text-sm text-text-secondary hover:text-accent transition-colors">Support Center</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-text-primary font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about-us" className="text-sm text-text-secondary hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-sm text-text-secondary hover:text-accent transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-sm text-text-secondary hover:text-accent transition-colors">Careers</Link></li>
              <li><Link to="/contact-us" className="text-sm text-text-secondary hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="text-text-primary font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms-of-service" className="text-sm text-text-secondary hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-text-secondary hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="text-sm text-text-secondary hover:text-accent transition-colors">Refund Policy</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-text-secondary hover:text-accent transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-text-secondary mb-4 md:mb-0">
            © {new Date().getFullYear()} Zancrypt Infrastructure Inc. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
              <Share2 className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
