import React from 'react';
import { motion } from 'framer-motion';

const ProgressSteps = ({ steps = [], currentStep = 0 }) => {
  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        
        return (
          <div key={index} className="flex items-center relative">
            {/* The vertical line connecting steps */}
            {index < steps.length - 1 && (
              <div className="absolute left-2.5 top-6 w-[1px] h-4 bg-border">
                {isCompleted && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    className="w-full bg-accent" 
                  />
                )}
              </div>
            )}
            
            {/* The Step Indicator */}
            <div className={`w-5 h-5 flex items-center justify-center rounded-sm z-10 font-mono text-xs transition-colors ${
              isCompleted ? 'bg-accent text-void' : 
              isActive ? 'border border-accent text-accent shadow-[0_0_8px_rgba(79,255,176,0.2)]' : 
              'border border-border text-text-muted bg-void'
            }`}>
              {isCompleted ? '✓' : index + 1}
            </div>
            
            {/* The Step Text */}
            <div className={`ml-4 text-sm font-sans transition-colors ${
              isCompleted ? 'text-text-primary' :
              isActive ? 'text-accent' :
              'text-text-muted'
            }`}>
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressSteps;
