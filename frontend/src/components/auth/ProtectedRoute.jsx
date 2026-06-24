import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';
import ContentSkeleton from '../layout/Skeletons';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  // Show skeleton for the full initialization window — this covers both:
  //  (a) isAuthenticated=false, isInitializing=true  → first-time visitor
  //  (b) isAuthenticated=true,  isInitializing=true  → returning user waiting
  //      for silentRefresh to restore the in-memory access token
  // Without this, case (b) would render the dashboard without a valid token,
  // causing API calls to fail before silentRefresh completes.
  if (isInitializing) {
    return (
      <div
        className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full"
        style={{ minHeight: '100vh' }}
      >
        <ContentSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Security: redirect to /auth/login — no ?next= param accepted (prevents open redirect)
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

