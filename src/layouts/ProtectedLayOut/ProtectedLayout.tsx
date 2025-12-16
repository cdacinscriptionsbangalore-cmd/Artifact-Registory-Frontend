// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';
import CircularProgess from '@components/Spinner/CircularProgess';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // synchronous check is fine — keep UX smooth by showing spinner while checking
    const ok = isAuthenticated();
    setAuthed(ok);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgess />
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


// components/PublicRoute.tsx

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = isAuthenticated();
    setAuthed(ok);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgess />
      </div>
    );
  }

  if (authed) {
    return <Navigate to="/feed" replace />;
  }
  return <>
    {children}
  </>;
};

export { ProtectedRoute, PublicRoute };