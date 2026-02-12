import React from "react";
import { NavLink } from "react-router-dom";
import { isAuthenticated, logout } from "@/utils/auth";
import logo from "@assets/Frame.png"

interface NavItem {
  path: string;
  label: string;
  end?: boolean;
}

const Navbar: React.FC = () => {
  const authenticated = isAuthenticated();

  // Only show these links when authenticated
  const protectedLinks: NavItem[] = [
    { path: "/home", label: "Home", end: true },
    { path: "/feed", label: "Feed", end: true },
    { path: "/upload", label: "Upload", end: true },
    { path: "/profile", label: "Profile", end: true },
  ];

  // Only show login when not authenticated
  const publicLinks: NavItem[] = [
    { path: "/login", label: "Login", end: true },
  ];

  const linksToShow = authenticated ? protectedLinks : publicLinks;

  return (
    <nav className="flex flex-row justify-between bg-secondary-background p-4 text-primary-text px-16">
      <div>
        <NavLink to="/home" end className="flex gap-4 justify-between">
          <img src={logo} alt="company Logo" className="h-11" />
          <div className="text-sm h-full flex flex-col justify-center">
            <div>Crowd Sourcing Platform</div>
            <div>C-DAC Bangalore</div>
          </div>
        </NavLink>
      </div>

      <div className="flex gap-6 items-center">
        {linksToShow.map(({ path, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `hover:text-primary-dark ${isActive ? "text-primary-dark font-semibold" : ""
              }`
            }
          >
            {label}
          </NavLink>
        ))}

        {authenticated && (
          <button
            onClick={logout}
            className="hover:text-primary-dark text-red-500 font-medium"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;