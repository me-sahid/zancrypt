import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const PublicInfoPage = ({ title, subtitle, content, isCareers }) => {
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const mouseX1 = useMotionValue(0);
  const mouseY1 = useMotionValue(0);
  const mouseX2 = useMotionValue(0);
  const mouseY2 = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 100 };
  const smoothX1 = useSpring(mouseX1, springConfig);
  const smoothY1 = useSpring(mouseY1, springConfig);
  const smoothX2 = useSpring(mouseX2, springConfig);
  const smoothY2 = useSpring(mouseY2, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate offset from center of screen to repel blobs
      const offsetX = e.clientX - window.innerWidth / 2;
      const offsetY = e.clientY - window.innerHeight / 2;
      
      // Negative multipliers to create a "repel" effect away from cursor
      mouseX1.set(offsetX * -0.3);
      mouseY1.set(offsetY * -0.3);
      
      mouseX2.set(offsetX * -0.15);
      mouseY2.set(offsetY * -0.15);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX1, mouseY1, mouseX2, mouseY2]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      // Dummy submission
      setTimeout(() => setSubmitted(true), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-void text-text-primary selection:bg-accent/30 font-sans relative overflow-hidden">
      
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ x: smoothX1, y: smoothY1 }} className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 150, -50, 0],
              y: [0, 80, 150, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-[5%] left-[5%] w-[45vw] h-[45vw] bg-accent opacity-50 rounded-full blur-[80px]"
          />
        </motion.div>
        
        <motion.div style={{ x: smoothX2, y: smoothY2 }} className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, -150, 50, 0],
              y: [0, -80, -150, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] bg-warning opacity-40 rounded-full blur-[90px]"
          />
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <Link to="/" className="inline-flex items-center text-text-secondary hover:text-accent transition-colors mb-12">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xl text-text-secondary">{subtitle}</p>}
          
          <div className="w-full h-px bg-border/40 my-10" />

          <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent max-w-none">
            {content.map((paragraph, idx) => (
              <p key={idx} className="mb-6 leading-relaxed text-lg">{paragraph}</p>
            ))}
          </div>

          {isCareers && (
            <div className="mt-16 p-8 border border-border/40 bg-surface/30 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-2">Join Zancrypt</h3>
              <p className="text-text-secondary mb-6">Send us your CV and we'll be in touch if there's a match.</p>
              
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required
                      className="flex-1 bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent text-white"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      className="flex-1 bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-text-secondary mx-auto mb-3" />
                    <p className="text-sm font-medium text-text-primary">
                      {file ? file.name : "Click to upload your CV (PDF, DOCX)"}
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx" 
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!file}
                    className="w-full sm:w-auto px-8 py-3 bg-accent text-void font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Application
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-3 text-emerald-400 bg-emerald-400/10 p-4 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium">Application received! We'll review your CV shortly.</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PublicInfoPage;
