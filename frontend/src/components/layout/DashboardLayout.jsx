import React, { Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import ContentSkeleton from './Skeletons';
import { useDashboardStore } from '../../store/useDashboardStore';

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
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'circOut' }}
              className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full safari-hardware-accel"
            >
              <Suspense fallback={<ContentSkeleton />}>
                {children || <Outlet />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
          
          {/* Global Background Glows */}
          <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-accent/5 rounded-full blur-[120px] pointer-events-none safari-hardware-accel" />
          <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-status-success/5 rounded-full blur-[120px] pointer-events-none safari-hardware-accel" />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
