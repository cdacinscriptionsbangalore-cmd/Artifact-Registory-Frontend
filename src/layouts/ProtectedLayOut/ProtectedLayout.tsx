import AuthContext from '@/context/AuthContext';
import { CircularProgress } from '@mui/material';
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) return <CircularProgress />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  // const { isAuthenticated, isLoading } = useContext(AuthContext);

  // if (isLoading) return <CircularProgress />;

  // if (isAuthenticated) {
  //   return <Navigate to="/feed" replace />;
  // }

  return <>{children}</>;
};