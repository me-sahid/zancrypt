import React, { Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import ContentSkeleton from './Skeletons';
import { useDashboardStore } from '../../store/useDashboardStore';
import { createPortal } from 'react-dom';
import StorageManager from '../StorageManager';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { isSidebarOpenMobile, setSidebarOpenMobile } = useDashboardStore();

  return (
    <div className="flex h-screen bg-surface-primary text-text-primary overflow-hidden font-sans antialiased selection:bg-primary-accent/30 selection:text-primary-accent">
      <Sidebar />
      
      {/* Mobile Sidebar Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpenMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpenMobile(false)}
            className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full"
            >
              <Suspense fallback={<ContentSkeleton />}>
                {children || <Outlet />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
          
          {/* Subtle static background accent — no costly blur animation */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary-accent/[0.03] rounded-full pointer-events-none" style={{ filter: 'blur(80px)', transform: 'translate(20%, -20%)', willChange: 'auto' }} />
        </main>
      </div>

      {/* Render Storage Manager at the portal root to overlay everything */}
      {createPortal(<StorageManager />, document.body)}
    </div>
  );
};

export default DashboardLayout;
