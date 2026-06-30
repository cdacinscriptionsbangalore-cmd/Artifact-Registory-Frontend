// import Navbar from '@components/Navbar/Navbar';
import React, { Suspense, useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// import Nav from '@components/Navbar/Nav';
import Footer from '@/views/Home/Footer';
import Nav from '@/components/Navbar/Nav';
import AuthContext from '@/context/AuthContext';
import { clearPostLoginRedirect, getPostLoginRedirect } from '@/utils/postLoginRedirect';


const BaseLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const pendingRedirect = getPostLoginRedirect();
    if (!pendingRedirect) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    if (pendingRedirect === currentPath) {
      clearPostLoginRedirect();
      return;
    }

    const isFallbackLanding = location.pathname === "/" || location.pathname === "/home" || location.pathname === "/login";
    if (isFallbackLanding) {
      navigate(pendingRedirect, { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, location.search, location.hash, navigate]);

  // const homeRef = useRef(null);
  // const fdRef = useRef(null);
  // const hiwRef = useRef(null);
  // const rdRef = useRef(null);
  // const communityRef = useRef(null);
  // const startRef = useRef(null);
  // const NAV_HEIGHT_OFFSET = 60;

  const scrollToSection = (yScrollPosition: number) => {
    window.scrollTo({
      top: yScrollPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col background">

      {/* <Nav scrollToSection={scrollToSection} /> */}
      <Nav scrollToSection={scrollToSection} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-primary-background scrollbar-hide px-4 sm:px-6 lg:px-8 ">
        <div className="text-text-secondary py-8 sm:py-12">
          <Suspense fallback={''}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      <button className="ux4g-button btn-primary" aria-label="Accessibility Options">
      </button>
      <Footer />
    </div>
  );
};

export default BaseLayout;
