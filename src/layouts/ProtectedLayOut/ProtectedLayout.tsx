import AuthContext from '@/context/AuthContext';
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import cdacRoundLogo from '@/assets/cdacroundlogo.png';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // While authentication check is in progress, render nothing for the protected
  // outlet area so surrounding layout (including Navbar) remains visible.
  // if (isLoading) return <Navigate to="/login" replace />;

  if (isLoading)
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
  // so users can sign in while the auth check completes.


  if (isLoading) return (
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


  if (!isLoading) return <>{children}</>;

  // If user is already authenticated, redirect away from public pages like login
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};