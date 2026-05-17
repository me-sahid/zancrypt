import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import ContentSkeleton from './Skeletons';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-surface-primary text-text-primary overflow-hidden font-sans antialiased selection:bg-primary-accent/30 selection:text-primary-accent">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: 'circOut' }}
              className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full"
            >
              <Suspense fallback={<ContentSkeleton />}>
                {children}
              </Suspense>
            </motion.div>
          </AnimatePresence>
          
          {/* Global Background Glows */}
          <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-accent/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-status-success/5 rounded-full blur-[120px] pointer-events-none" />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
