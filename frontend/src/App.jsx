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
import { pageContent } from './pages/Static/pageContent';

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
const ApiSoon = lazy(() => import('./pages/Api/ApiSoon'));
const DownloadPage = lazy(() => import('./pages/Download/Download'));
const SharedFile = lazy(() => import('./pages/Download/SharedFile'));
const SharesPage = lazy(() => import('./pages/Shares/Shares'));
const RecycleBin = lazy(() => import('./pages/RecycleBin/RecycleBin'));
const PublicInfoPage = lazy(() => import('./pages/Static/PublicInfoPage'));

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
          <Route path="/api" element={<ApiSoon />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/share/:token" element={<SharedFile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Static Info Pages */}
          {Object.entries(pageContent).map(([key, content]) => (
            <Route 
              key={key} 
              path={`/${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`} 
              element={<PublicInfoPage {...content} />} 
            />
          ))}

          {/* Protected Dashboard Routes - Single Shared Layout instance for instant page loads */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<Files />} />
            <Route path="/bin" element={<RecycleBin />} />
            <Route path="/shares" element={<SharesPage />} />
            <Route path="/uploads" element={<Upload />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/security" element={<Security />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

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
