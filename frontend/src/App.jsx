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
import { useWorkspace } from './hooks/useWorkspace';

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
const Product = lazy(() => import('./pages/Product/Product'));

// Loading Placeholder
const PageLoader = () => (
  <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full" style={{ minHeight: '100vh' }}>
    <ContentSkeleton />
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();
  const workspace = useWorkspace();
  const hostname = window.location.hostname;
  const isDriveDomain = hostname === 'drive.zancrypt.in';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAppDomain = isDriveDomain || isLocal;

  return (
    <NetworkProvider>
      <Suspense fallback={<PageLoader />}>
        <DegradedBanner />
        <OfflineScreen />

        <Routes>
          {/* ── Landing (main domain only) ──────────────────────── */}
          <Route path="/" element={isDriveDomain ? <Navigate to={workspace.home} replace /> : <Landing />} />

          {/* ── Auth routes (drive domain) ───────────────────────── */}
          {/* On drive domain: /auth/login and /auth/register are the canonical paths */}
          {/* On main domain: /login and /register redirect to drive */}
          <Route path="/auth/login"    element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route
            path="/login"
            element={isAppDomain ? <Navigate to="/auth/login" replace /> : <Navigate to="https://drive.zancrypt.in/auth/login" replace />}
          />
          <Route
            path="/register"
            element={isAppDomain ? <Navigate to="/auth/register" replace /> : <Navigate to="https://drive.zancrypt.in/auth/register" replace />}
          />

          {/* ── Public share + download ─────────────────────────── */}
          {/* Short clean URLs: /s/{token} and /dl */}
          <Route path="/s/:token"  element={<SharedFile />} />
          <Route path="/dl"        element={<DownloadPage />} />
          {/* Legacy share URL support (backward compat) */}
          <Route path="/share/:token" element={<Navigate to={({ params }) => `/s/${params.token}`} replace />} />
          <Route path="/download"     element={<Navigate to="/dl" replace />} />

          {/* ── Static / Marketing pages (both domains) ─────────── */}
          <Route path="/api"              element={<ApiSoon />} />
          <Route path="/pricing"          element={<Suspense fallback={<PricingPageSkeleton />}><Pricing /></Suspense>} />
          <Route path="/architecture"     element={<Architecture />} />
          <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<PrivacyPolicy />} />
          <Route path="/cloud-alternative" element={<CloudAlternative />} />
          <Route path="/product"          element={<Suspense fallback={<PageLoader />}><Product /></Suspense>} />

          {/* Static Info Pages */}
          {Object.entries(pageContent).map(([key, content]) => (
            <Route
              key={key}
              path={`/${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`}
              element={<PublicInfoPage {...content} />}
            />
          ))}

          {/* ── Protected App Routes (drive domain, UUID-scoped) ── */}
          {/*
            Route structure:
              /home/:wid            → Dashboard + API Keys
              /drive/:wid           → File vault
              /drive/:wid/folder/:fid → Folder deep-link
              /drive/:wid/file/:fid   → File preview deep-link
              /drive/:wid/bin       → Recycle bin
              /drive/:wid/shared    → Shared files list
              /drive/:wid/upload    → Upload page
              /workspace/:wid/*     → Settings area

            Security: :wid is a frontend routing token only — NEVER sent to backend.
            All API calls use Bearer token from httpOnly cookie independently.
          */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Home / Dashboard */}
            <Route path="/home/:wid"      element={<Dashboard />} />
            <Route path="/home/:wid/keys" element={<ApiKeys />} />

            {/* Drive — file vault with folder/file deep links */}
            <Route path="/drive/:wid"                element={<Suspense fallback={<FileManagerSkeleton />}><Files /></Suspense>} />
            <Route path="/drive/:wid/folder/:fid"    element={<Suspense fallback={<FileManagerSkeleton />}><Files /></Suspense>} />
            <Route path="/drive/:wid/file/:fid"      element={<Suspense fallback={<FileManagerSkeleton />}><Files /></Suspense>} />
            <Route path="/drive/:wid/bin"            element={<RecycleBin />} />
            <Route path="/drive/:wid/shared"         element={<SharesPage />} />
            <Route path="/drive/:wid/upload"         element={<Upload />} />

            {/* Workspace settings area */}
            <Route path="/workspace/:wid/settings"   element={<Suspense fallback={<SettingsPageSkeleton />}><Settings /></Suspense>} />
            <Route path="/workspace/:wid/profile"    element={<Suspense fallback={<SettingsPageSkeleton />}><Profile /></Suspense>} />

            <Route path="/workspace/:wid/nodes"      element={<Nodes />} />
            <Route path="/workspace/:wid/monitor"    element={<Monitoring />} />
            <Route path="/workspace/:wid/analytics"  element={<Analytics />} />
            <Route path="/workspace/:wid/audit"      element={<Audit />} />

            {/* Legacy path redirects → new UUID routes */}
            <Route path="/dashboard"  element={<Navigate to={workspace.home} replace />} />
            <Route path="/vault"      element={<Navigate to={workspace.drive} replace />} />
            <Route path="/bin"        element={<Navigate to={workspace.bin} replace />} />
            <Route path="/shares"     element={<Navigate to={workspace.shared} replace />} />
            <Route path="/uploads"    element={<Navigate to={workspace.upload} replace />} />
            <Route path="/settings"   element={<Navigate to={workspace.settings} replace />} />
            <Route path="/profile"    element={<Navigate to={workspace.profile} replace />} />

            <Route path="/nodes"      element={<Navigate to={workspace.nodes} replace />} />
            <Route path="/monitoring" element={<Navigate to={workspace.monitor} replace />} />
            <Route path="/analytics"  element={<Navigate to={workspace.analytics} replace />} />
            <Route path="/audit"      element={<Navigate to={workspace.audit} replace />} />
          </Route>

          {/* ── 404 ─────────────────────────────────────────────── */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <GlobalUploadManager />
      <StorageLimitModal />
      <GlobalUpgradeModal />
    </NetworkProvider>
  );
}

export default App;
