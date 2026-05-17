import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import { NetworkProvider } from './providers/NetworkProvider';
import OfflineScreen from './components/network/OfflineScreen';
import DegradedBanner from './components/network/DegradedBanner';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useStore';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy loading other pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
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
  const { isAuthenticated } = useAuthStore();

  return (
    <NetworkProvider>
      <Suspense fallback={<PageLoader />}>
        <DegradedBanner />
        <OfflineScreen />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><DashboardLayout><Files /></DashboardLayout></ProtectedRoute>} />
          <Route path="/uploads" element={<ProtectedRoute><DashboardLayout><Upload /></DashboardLayout></ProtectedRoute>} />
          <Route path="/nodes" element={<ProtectedRoute><DashboardLayout><Nodes /></DashboardLayout></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute><DashboardLayout><Security /></DashboardLayout></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute><DashboardLayout><Monitoring /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><DashboardLayout><Audit /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

          {/* 404 & Redirects */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
    </NetworkProvider>
  );
}

export default App;
