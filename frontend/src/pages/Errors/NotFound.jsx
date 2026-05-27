import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl w-full text-center relative z-10 space-y-8 flex flex-col items-center"
      >
        <div className="mb-2 text-text-primary">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-40 h-40 mx-auto"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <path d="M7 8l2 2m0 -2l-2 2"></path>
            <path d="M15 8l2 2m0 -2l-2 2"></path>
            <path d="M9 14c1.5 -1.5 4.5 -1.5 6 0"></path>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl md:text-[7rem] font-display font-bold text-text-primary tracking-tight leading-none">
            404
          </h1>
          <p className="text-4xl md:text-5xl font-display font-semibold text-text-muted tracking-tight text-[#d97757]">
            Page Not Found
          </p>
        </div>
        
        <p className="text-xl md:text-2xl font-sans text-text-secondary leading-relaxed max-w-2xl mx-auto pt-4">
          The requested path could not be resolved. It may have been relocated or permanently destroyed.
        </p>

        <div className="pt-12">
          <Link 
            to="/dashboard"
            className="inline-block px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-text-primary font-sans text-lg font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg"
          >
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
