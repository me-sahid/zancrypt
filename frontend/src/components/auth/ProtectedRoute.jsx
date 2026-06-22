import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';
import ContentSkeleton from '../layout/Skeletons';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing && !isAuthenticated) {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

