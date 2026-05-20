// useNavbar.ts
import { useState, useEffect } from "react";

export const useNavbar = () => {
  const [mobileNavbarOpen, setMobileNavbarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobileViewport) return;

    const shouldLockScroll = mobileNavbarOpen || isClosing;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [mobileNavbarOpen, isClosing]);

  const toggleMobileNavbar = () => {
    if (mobileNavbarOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setMobileNavbarOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setMobileNavbarOpen(true);
    }
  };

  return {
    mobileNavbarOpen,
    isClosing,
    scrollPosition,
    toggleMobileNavbar,
    setMobileNavbarOpen,
  };
};
