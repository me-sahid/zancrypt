import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-primary-bg">
      {/* Sidebar - Persistent */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNav />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
