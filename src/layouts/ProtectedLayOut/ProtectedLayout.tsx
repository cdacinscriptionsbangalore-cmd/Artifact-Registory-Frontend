import AuthContext from '@/context/AuthContext';
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // While authentication check is in progress, render nothing for the protected
  // outlet area so surrounding layout (including Navbar) remains visible.
  // if (isLoading) return <Navigate to="/login" replace />;

  if (isLoading) return <></>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // While auth status is being determined, render the public content area (no spinner)
  // if (isLoading) return <>{children}</>;
  if (isLoading) return <></>;

  // If user is already authenticated, redirect away from public pages like login
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};