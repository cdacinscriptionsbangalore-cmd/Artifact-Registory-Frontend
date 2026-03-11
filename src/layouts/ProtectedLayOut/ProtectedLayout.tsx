import AuthContext from '@/context/AuthContext';
import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import cdacRoundLogo from '@/assets/cdacroundlogo.png';
import { clearPostLoginRedirect, getPostLoginRedirect, setPostLoginRedirect } from '@/utils/postLoginRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    // Preserve intended destination as early as possible, even while auth bootstrap
    // is still loading. This avoids losing target route on first login after refresh.
    if (!isAuthenticated && isLoading) {
      setPostLoginRedirect(currentPath);
      return;
    }

    if (!isAuthenticated || isLoading) return;

    if (getPostLoginRedirect() === currentPath) {
      clearPostLoginRedirect();
    }
  }, [isAuthenticated, isLoading, location.pathname, location.search, location.hash]);

  // While authentication check is in progress, render nothing for the protected
  // outlet area so surrounding layout (including Navbar) remains visible.
  // if (isLoading) return <Navigate to="/login" replace />;

  if (isLoading )
    return (
      <div style={{ minHeight: "62vh" }}>
        <div className='flex flex items-center justify-center w-100% h-110 flex-col gap-4'>
          {/* <FaSpinner className="animate-spin text-4xl text-[#66B0FF]" /> */}
          <img src={cdacRoundLogo} className="mr-3 mb-4 size-20 cdacSpinner" />
          <div className="text-[#000000] text-lg">
            Loading...
          </div>
        </div>
      </div>
    );

  if (!isAuthenticated && !isLoading) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    setPostLoginRedirect(from);
    return <Navigate to={`/login?next=${encodeURIComponent(from)}`} replace state={{ from }} />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();
  const nextParam = new URLSearchParams(location.search).get("next");
  const safeNextParam = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  // While auth status is being determined, render the public content area (no spinner)
  // so users can sign in while the auth check completes.
  if (isLoading) return <>{children}</>;

  // If user is already authenticated, redirect away from public pages like login
  if (isAuthenticated) {
    if (safeNextParam) {
      return <Navigate to={safeNextParam} replace />;
    }

    const pendingRedirect = getPostLoginRedirect();
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (pendingRedirect && pendingRedirect !== currentPath) {
      return <Navigate to={pendingRedirect} replace />;
    }

    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
