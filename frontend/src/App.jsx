import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy loading pages
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Files = lazy(() => import('./pages/Files/Files'));
const Upload = lazy(() => import('./pages/Upload/Upload'));
const Nodes = lazy(() => import('./pages/Nodes/Nodes'));
const Security = lazy(() => import('./pages/Security/Security'));
const Monitoring = lazy(() => import('./pages/Monitoring/Monitoring'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Audit = lazy(() => import('./pages/Audit/Audit'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Profile = lazy(() => import('./pages/Settings/Profile'));
const NotFound = lazy(() => import('./pages/Errors/NotFound'));

// Loading Placeholder
const PageLoader = () => (
  <div className="flex items-center justify-center h-[calc(100vh-200px)]">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-primary-accent border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-text-secondary text-sm font-medium">Synchronizing shards...</p>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/files" element={<DashboardLayout><Files /></DashboardLayout>} />
        <Route path="/upload" element={<DashboardLayout><Upload /></DashboardLayout>} />
        <Route path="/nodes" element={<DashboardLayout><Nodes /></DashboardLayout>} />
        <Route path="/security" element={<DashboardLayout><Security /></DashboardLayout>} />
        <Route path="/monitoring" element={<DashboardLayout><Monitoring /></DashboardLayout>} />
        <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
        <Route path="/audit" element={<DashboardLayout><Audit /></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />

        {/* 404 & Redirects */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
