// Nav.tsx
import { Menu, X } from "lucide-react";
import DesktopHeader from "./DesktopHeader";
import AuthButtons from "./AuthButtons";
import { useNavbar } from "./useNavbar";
import { protectedLinks, publicLinks, publicLinksMobile } from "./NavLinks";
import { type NavProps } from "./types";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { NavLink } from "react-router-dom";
import Nav2 from "./Nav2.tsx";

const Nav: React.FC<NavProps> = ({ scrollToSection }) => {
  const {
    mobileNavbarOpen,
    isClosing,
    scrollPosition,
    toggleMobileNavbar,
  } = useNavbar();

  const { isAuthenticated, isLoading } = useContext(AuthContext);

  const linksToShow = isLoading
    ? []
    : isAuthenticated
      ? protectedLinks
      : mobileNavbarOpen
        ? publicLinksMobile
        : publicLinks;

  return (
    <div className="navbar-gradient">
      <Nav2/>
      <DesktopHeader />
      <hr className="border-t border-gray-300" />
      <nav className={`top-0 z-50 text-secondary-text navbar-shadow ${scrollPosition > 200 ? "navscrollbehavior w-100C" : "w-100C"}`}>
        <div className="flex justify-between items-center h-16 px-6">
          <div className="hidden md:flex justify-start space-x-6 header-links header-link-items hide-these-mobile-view " style={{ height: "100%" }}>
            {linksToShow.map((link) => (
              <NavLink
                to={link.path}
                key={link.label}
                onClick={() => scrollToSection(link.scrollvalue ?? 0)}
                className={({ isActive }) =>
                  `text-gray-800 transition-colors ${linksToShow !== publicLinks && isActive ? "text-white border-b-4 font-semibold" : ""}`
                }
                style={{ height: "99%" }}
              >
                <div className="flex gap-2 justify-center items-center" style={{ height: "100%" }}>
                  {link.icon}
                  {link.label}
                </div>
              </NavLink>
            ))}
          </div>

          <div className="md:hidden">
            {mobileNavbarOpen ? (
              <X className="text-white" onClick={toggleMobileNavbar} />
            ) : (
              <Menu className="hamburger-icon text-white" onClick={toggleMobileNavbar} />
            )}
          </div>

          <AuthButtons authenticated={isLoading ? null : isAuthenticated} />
        </div>

        {(mobileNavbarOpen || isClosing) && (
          <div className={`mobile-navbar pt-10 space-y-8 flex flex-col items-center text-white ${isClosing ? "mobile-navbar-closing" : ""}`}>
            {linksToShow.map((link) => (
              <NavLink
                to={link.path}
                key={link.label}
                onClick={() => {
                  toggleMobileNavbar();
                  scrollToSection(link.scrollvalue ?? 0);
                }}
                className={({ isActive }) => `text-white py-4 transition-colors ${linksToShow !== publicLinksMobile && isActive ? "text-white border-b-4 font-semibold" : ""}`}
              >
                <div className="flex gap-2 justify-center items-center">
                  {link.icon}
                  {link.label}
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Nav;
