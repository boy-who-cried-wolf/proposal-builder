
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  // Allow access to all routes, authentication state will be handled within components
  return <Outlet />;
};
