import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';
import ContentSkeleton from '../layout/Skeletons';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  // Wait for silentRefresh() to finish on page load before making any
  // auth decision. Without this, we'd redirect to /login the moment
  // the page loads (isAuthenticated is false in memory) before the
  // httpOnly cookie refresh has had a chance to restore the session.
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
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

