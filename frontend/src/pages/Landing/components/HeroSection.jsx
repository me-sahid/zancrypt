import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  Lock, FileText, FileVideo, FileImage, 
  Database, Search, Eye, Download, Trash2 
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

const HeroSection = () => {
  const containerRef = useRef(null);
  const vizRef = useRef(null);
  const { t } = useLanguageStore();

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Headline Animation
      gsap.fromTo('.hero-text-line', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );

      // Marquee animation
      gsap.to('.marquee-content', {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: 'linear'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen pt-24 lg:pt-32 flex flex-col justify-between">
      <div className="max-w-[1200px] mx-auto w-full px-6 grid lg:grid-cols-[55%_45%] gap-12 items-center flex-1">
        
        {/* LEFT COLUMN: Copy & CTA */}
        <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] mb-8 text-text-primary tracking-tight font-display">
            <div className="overflow-hidden"><div className="hero-text-line">{t('hero', 'files')}</div></div>
            <div className="overflow-hidden"><div className="hero-text-line">{t('hero', 'encrypted')}</div></div>
            <div className="overflow-hidden"><div className="hero-text-line italic">{t('hero', 'untouchable')}</div></div>
          </h1>
          
          <div className="overflow-hidden mb-8 lg:mb-10">
            <p className="hero-text-line text-base lg:text-[18px] text-text-secondary leading-relaxed max-w-lg font-sans mx-auto lg:mx-0">
              {t('hero', 'desc')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 overflow-hidden">
            <div className="hero-text-line w-full sm:w-auto">
              <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 bg-accent border border-transparent text-void font-mono tracking-widest uppercase text-sm rounded-md hover:brightness-110 transition-all">
                {t('hero', 'start')}
              </Link>
            </div>
            <div className="hero-text-line w-full sm:w-auto">
              <a href="#architecture" className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-border text-text-secondary font-mono tracking-widest uppercase text-sm rounded-md hover:text-text-primary hover:border-border-active transition-all">
                {t('hero', 'readArch')}
              </a>
            </div>
          </div>
          
          <div className="overflow-hidden mt-8 lg:mt-6">
            <p className="hero-text-line text-[10px] sm:text-xs font-sans text-text-secondary opacity-80 tracking-wider">
              No passwords &middot; No keys on servers &middot; No trust required
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: macOS Product Mockup Scene */}
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[620px] flex items-center justify-center select-none overflow-hidden sm:overflow-visible">
          <div className="relative transform scale-[0.55] sm:scale-75 lg:scale-100 flex items-center justify-center mt-8 lg:mt-0">
            {/* Subtle Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#d97757]/4 rounded-full blur-[120px] pointer-events-none" />

          {/* Style Tag for Animations */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes bob-slow {
              0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
              50% { transform: translateY(-10px) rotate(var(--rot)); }
            }
            .bobbing-element {
              animation: bob-slow 6s infinite ease-in-out;
            }
            .delay-1 { animation-delay: 1.5s; }
            .delay-2 { animation-delay: 3s; }
            .delay-3 { animation-delay: 4.5s; }
          ` }} />

          {/* Floating File Icons around the Main Window */}
          {/* Top Left Floating PDF Card */}
          <div 
            className="absolute z-30 left-[-40px] top-[10px] w-44 bg-white/95 border border-border/10 p-3.5 rounded-xl shadow-lg bobbing-element flex items-center gap-3"
            style={{ '--rot': '-10deg' }}
          >
            <div className="w-12 h-12 rounded-lg bg-[#d97757]/10 flex items-center justify-center text-[#d97757]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold text-void truncate">Q4 Report.pdf</p>
              <p className="font-sans text-[9px] text-text-secondary/70">12.4 MB</p>
            </div>
          </div>

          {/* Bottom Left Floating Audio/Video Card */}
          <div 
            className="absolute z-30 left-[-50px] bottom-[50px] w-48 bg-white/95 border border-border/10 p-3.5 rounded-xl shadow-lg bobbing-element delay-1 flex items-center gap-3"
            style={{ '--rot': '8deg' }}
          >
            <div className="w-12 h-12 rounded-lg bg-[#d97757]/10 flex items-center justify-center text-[#d97757]">
              <FileVideo className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold text-void truncate">Demo Reel.mp4</p>
              <p className="font-sans text-[9px] text-text-secondary/70">64.8 MB</p>
            </div>
          </div>

          {/* Top Right Floating Folder Icon */}
          <div 
            className="absolute z-0 right-[-25px] top-[30px] w-16 h-16 bg-white/90 border border-border/10 rounded-xl shadow-md bobbing-element delay-2 flex items-center justify-center"
            style={{ '--rot': '12deg' }}
          >
            <Database className="w-7 h-7 text-[#d97757]" />
          </div>

          {/* Bottom Right Floating Image Card */}
          <div 
            className="absolute z-30 right-[-40px] bottom-[80px] w-44 bg-white/95 border border-border/10 p-3.5 rounded-xl shadow-lg bobbing-element delay-3 flex items-center gap-3"
            style={{ '--rot': '-6deg' }}
          >
            <div className="w-12 h-12 rounded-lg bg-[#d97757]/10 flex items-center justify-center text-[#d97757]">
              <FileImage className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold text-void truncate">Brand Assets.png</p>
              <p className="font-sans text-[9px] text-text-secondary/70">3.7 MB</p>
            </div>
          </div>

          {/* Main Product macOS Window */}
          <div className="relative z-10 w-[560px] h-[420px] bg-white border border-[#d97757]/15 rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
            {/* macOS Window Top Header Bar */}
            <div className="h-11 border-b border-border/10 bg-[#fafafa] px-5 flex items-center justify-between shrink-0 select-none">
              {/* macOS Dots */}
              <div className="flex items-center space-x-2 w-1/4">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] opacity-90 inline-block" />
              </div>
              
              {/* Window Title with Zancrypt Lock Logo Mark */}
              <div className="flex items-center justify-center space-x-1.5 w-2/4 text-center">
                <Lock className="w-4 h-4 text-[#d97757]" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-void">Zancrypt Vault</span>
              </div>
              
              {/* Empty Spacer */}
              <div className="w-1/4" />
            </div>

            {/* Window Interior */}
            <div className="flex-1 p-6 flex flex-col min-h-0 bg-white">
              {/* Vault heading */}
              <div className="flex justify-between items-end border-b border-border/10 pb-3 shrink-0">
                <div>
                  <h3 className="font-mono text-lg font-bold text-void tracking-widest uppercase flex items-center leading-none">
                    <Database className="w-5 h-5 mr-2 text-[#d97757]" />
                    Vault
                  </h3>
                  <p className="text-text-secondary/70 mt-1 font-mono text-[9px] uppercase tracking-widest leading-none">
                    Encrypted Storage Matrix
                  </p>
                </div>
                
                {/* Simulated Upload Button */}
                <div className="px-4 py-2 border border-[#d97757] text-[#d97757] font-mono text-[9px] uppercase tracking-widest leading-none">
                  [ Upload ]
                </div>
              </div>

              {/* Simulated Search bar */}
              <div className="mt-3 relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary/60" />
                <input 
                  type="text" 
                  disabled
                  placeholder="Search Decrypted Names..."
                  className="w-full bg-[#fcfcfc] border border-border/10 text-void font-mono text-[9px] py-2.5 pl-8 pr-3 outline-none select-none cursor-default"
                />
              </div>

              {/* Simulated Table */}
              <div className="mt-3 border border-border/10 flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Table Header */}
                <div className="flex items-center text-[8px] font-mono text-text-secondary/70 uppercase tracking-widest bg-[#fafafa] border-b border-border/10 py-3 px-4 shrink-0">
                  <div className="w-6 text-center">
                    <input type="checkbox" disabled className="accent-[#d97757] scale-75" />
                  </div>
                  <div className="flex-1 pl-1">Filename</div>
                  <div className="w-14">Size</div>
                  <div className="w-16">Timestamp</div>
                  <div className="w-16 text-right">Actions</div>
                </div>

                {/* Table Body rows */}
                <div className="divide-y divide-border/10 font-mono text-[9px] text-text-secondary/95 overflow-hidden flex-1 select-none">
                  
                  {/* Row 1 */}
                  <div className="flex items-center py-3 px-4 bg-white">
                    <div className="w-6 text-center">
                      <input type="checkbox" disabled className="accent-[#d97757] scale-75" />
                    </div>
                    <div className="flex-1 flex items-center space-x-2 min-w-0">
                      <div className="w-6 h-6 flex items-center justify-center border border-border/10 bg-[#fafafa] shrink-0">
                        <Lock className="w-2.5 h-2.5 text-[#d97757]" />
                      </div>
                      <span className="truncate font-bold text-void">Q4 Report.pdf</span>
                    </div>
                    <div className="w-14 text-text-secondary/80">12.4 MB</div>
                    <div className="w-16 text-text-secondary/80">5/18/2026</div>
                    <div className="w-16 flex items-center justify-end space-x-2">
                      <Eye className="w-3 h-3 text-text-secondary/50" />
                      <Download className="w-3 h-3 text-text-secondary/50" />
                      <Trash2 className="w-3 h-3 text-text-secondary/50" />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center py-3 px-4 bg-white">
                    <div className="w-6 text-center">
                      <input type="checkbox" disabled className="accent-[#d97757] scale-75" />
                    </div>
                    <div className="flex-1 flex items-center space-x-2 min-w-0">
                      <div className="w-6 h-6 flex items-center justify-center border border-border/10 bg-[#fafafa] shrink-0">
                        <Lock className="w-2.5 h-2.5 text-[#d97757]" />
                      </div>
                      <span className="truncate font-bold text-void">Demo Reel.mp4</span>
                    </div>
                    <div className="w-14 text-text-secondary/80">64.8 MB</div>
                    <div className="w-16 text-text-secondary/80">5/17/2026</div>
                    <div className="w-16 flex items-center justify-end space-x-2">
                      <Eye className="w-3 h-3 text-text-secondary/50" />
                      <Download className="w-3 h-3 text-text-secondary/50" />
                      <Trash2 className="w-3 h-3 text-text-secondary/50" />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center py-3 px-4 bg-white">
                    <div className="w-6 text-center">
                      <input type="checkbox" disabled className="accent-[#d97757] scale-75" />
                    </div>
                    <div className="flex-1 flex items-center space-x-2 min-w-0">
                      <div className="w-6 h-6 flex items-center justify-center border border-border/10 bg-[#fafafa] shrink-0">
                        <Lock className="w-2.5 h-2.5 text-[#d97757]" />
                      </div>
                      <span className="truncate font-bold text-void">Brand Assets.png</span>
                    </div>
                    <div className="w-14 text-text-secondary/80">3.7 MB</div>
                    <div className="w-16 text-text-secondary/80">5/15/2026</div>
                    <div className="w-16 flex items-center justify-end space-x-2">
                      <Eye className="w-3 h-3 text-text-secondary/50" />
                      <Download className="w-3 h-3 text-text-secondary/50" />
                      <Trash2 className="w-3 h-3 text-text-secondary/50" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>

      {/* Marquee Ticker */}
      <div className="w-full border-t border-border py-4 overflow-hidden mt-12 bg-void z-10">
        <div className="marquee-container flex whitespace-nowrap">
          <div className="marquee-content flex items-center space-x-12 px-6 font-mono text-xs text-text-muted">
            {[...Array(4)].map((_, i) => (
              <React.Fragment key={i}>
                <span>{t('hero', 'securedBy')}</span>
                <span>·</span>
                <span className="text-text-primary">WebAuthn</span>
                <span>·</span>
                <span className="text-text-primary">AES-256-GCM</span>
                <span>·</span>
                <span className="text-text-primary">FIDO2</span>
                <span>·</span>
                <span className="text-text-primary">Passkey</span>
                <span>·</span>
                <span className="text-text-primary">Zero-Knowledge</span>
                <span>·</span>
                <span className="text-text-primary">OpenTelemetry</span>
                <span>·</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
