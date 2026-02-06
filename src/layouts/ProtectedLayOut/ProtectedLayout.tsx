// components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
// import { isAuthenticated } from '@/utils/auth';
import AuthContext from '@/context/AuthContextType';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const isAuth = isAuthenticated;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// components/PublicRoute.tsx

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const isAuth = isAuthenticated;

  if (isAuth) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};