import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
const ApiKeys = lazy(() => import('./pages/Dashboard/ApiKeys'));
import { NetworkProvider } from './providers/NetworkProvider';
import OfflineScreen from './components/network/OfflineScreen';
import DegradedBanner from './components/network/DegradedBanner';

import { useAuthStore } from './store/useStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { pageContent } from './pages/Static/pageContent';

import FileManagerSkeleton from './components/skeletons/FileManagerSkeleton';
import PricingPageSkeleton from './components/skeletons/PricingPageSkeleton';
import SettingsPageSkeleton from './components/skeletons/SettingsPageSkeleton';
import ContentSkeleton from './components/layout/Skeletons';
import GlobalUploadManager from './components/layout/GlobalUploadManager';
import StorageLimitModal from './components/StorageLimitModal';
import GlobalUpgradeModal from './components/GlobalUpgradeModal';

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
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const Architecture = lazy(() => import('./pages/Architecture/Architecture'));
const PrivacyPolicy = lazy(() => import('./pages/Static/PrivacyPolicy'));
const CloudAlternative = lazy(() => import('./pages/Static/CloudAlternative'));

// Loading Placeholder
const PageLoader = () => (
  <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full" style={{ minHeight: '100vh' }}>
    <ContentSkeleton />
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
          <Route path="/pricing" element={<Suspense fallback={<PricingPageSkeleton />}><Pricing /></Suspense>} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cloud-alternative" element={<CloudAlternative />} />

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
            <Route path="/dashboard/api-keys" element={<ApiKeys />} />
            <Route path="/vault" element={<Suspense fallback={<FileManagerSkeleton />}><Files /></Suspense>} />
            <Route path="/bin" element={<RecycleBin />} />
            <Route path="/shares" element={<SharesPage />} />
            <Route path="/uploads" element={<Upload />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/security" element={<Security />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/settings" element={<Suspense fallback={<SettingsPageSkeleton />}><Settings /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<SettingsPageSkeleton />}><Profile /></Suspense>} />
          </Route>

          {/* 404 & Redirects */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <GlobalUploadManager />
      <StorageLimitModal />
      <GlobalUpgradeModal />
    </NetworkProvider>
  );
}

export default App;
