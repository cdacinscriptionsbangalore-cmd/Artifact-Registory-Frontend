// import Navbar from '@components/Navbar/Navbar';
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import CircularProgess from '@components/Spinner/CircularProgess';
// import Nav from '@components/Navbar/Nav';
import Footer from '@/views/Home/Footer';
import Nav from '@/components/Navbar/Nav';


const BaseLayout: React.FC = () => {
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
