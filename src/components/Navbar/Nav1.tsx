import React, { useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import logo from "@assets/Frame1.png";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/utils/auth";
import { Home, LogIn, LogOut, Menu, Upload, X } from "lucide-react";
import meityLogo from "@assets/meitylogo2.png";
import DynamicFeedOutlinedIcon from "@mui/icons-material/DynamicFeedOutlined";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { clearUserActivityTracking, trackUserActivity } from "./EventManager";
import { jwtDecode } from "jwt-decode";
import CircularProgess from "../Spinner/CircularProgess";
import AuthContext from "@/context/AuthContext";

interface NavItem {
    path: string;
    label: string;
    icon?: ReactNode;
    end?: boolean;
    scrollvalue?: number;
}

interface NavProps {
    scrollToSection: (position: number) => void;
}

const Nav: React.FC<NavProps> = ({ scrollToSection }) => {
    const [mobileNavbarOpen, setMobileNavbarOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const authCtx = useContext(AuthContext);
    const authenticated = authCtx?.isAuthenticated;

    const navigate = useNavigate();

    const protectedLinks: NavItem[] = [
        { path: "/home", label: "Home", end: true, scrollvalue: 0, icon: <Home /> },
        { path: "/feed", label: "Feed", end: true, scrollvalue: 0, icon: <DynamicFeedOutlinedIcon /> },
        { path: "/upload", label: "Upload", end: true, scrollvalue: 0, icon: <Upload /> },
        { path: "/profile", label: "Profile", end: true, scrollvalue: 0, icon: <AccountBoxOutlinedIcon /> },
    ];

    const publicLinks: NavItem[] = [
        { path: "/home", label: "Home", end: true, scrollvalue: 60, icon: "" },
        { path: "/home", label: "Featured Discoveries", scrollvalue: 900, icon: "" },
        { path: "/home", label: "How it works", scrollvalue: 1550, icon: "" },
        // { path: "/home", label: "Recent Discoveries", scrollvalue: 3300, icon: "" },
        { path: "/home", label: "Community", scrollvalue: 2100, icon: "" },
        { path: "/home", label: "Get Started", scrollvalue: 2650, icon: "" },
    ];

    const publicLinksMobile: NavItem[] = [
        { path: "/home", label: "Home", end: true, scrollvalue: 90, icon: "" },
        { path: "/home", label: "Featured Discoveries", scrollvalue: 1200, icon: "" },
        { path: "/home", label: "How it works", scrollvalue: 2200, icon: "" },
        // { path: "/home", label: "Recent Discoveries", scrollvalue: 3300, icon: "" },
        { path: "/home", label: "Community", scrollvalue: 3300, icon: "" },
        { path: "/home", label: "Get Started", scrollvalue: 4600, icon: "" },
    ];

    const linksToShow = authenticated ? protectedLinks : mobileNavbarOpen ? publicLinksMobile : publicLinks;

    const handleScroll = () => setScrollPosition(window.scrollY);

    const syncAuthState = () => {
        // legacy helper kept for compatibility; auth state is read from context
        return;
    };

    const openMobileNavbarHandler = () => {
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

    const handleNavClick = (position: number) => {
        setIsClosing(true);
        setTimeout(() => {
            setMobileNavbarOpen(false);
            setIsClosing(false);
            scrollToSection(position);
        }, 300);
    }

    // useEffect(() => {
    //     window.addEventListener("scroll", handleScroll);
    //     syncAuthState();

    //     const token = authCtx.getToken();
    //     if (token === null) return;

    //     const decoded: any = jwtDecode(token);
    //     const sessionTimeout =
    //         (decoded.exp - decoded.iat) * 1000;

    //     const handleSessionTimeout = () => {
    //         logout();
    //         setAuthenticated(false);
    //         navigate("/login", { replace: true });
    //     };

    //     const activityEvents = [
    //         "mousemove",
    //         "click",
    //         "keydown",
    //         "scroll",
    //         "touchstart",
    //     ];

    //     trackUserActivity(activityEvents, sessionTimeout, handleSessionTimeout);

    //     return () => {
    //         clearUserActivityTracking(activityEvents);
    //         window.removeEventListener("scroll", handleScroll);
    //     };
    // }, [mobileNavbarOpen, openMobileNavbarHandler, setMobileNavbarOpen]);

    return (
        <div className="navbar-gradient">
            {/* Desktop header */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-6 navbar-logos">
                <NavLink to="/home" className="flex items-center space-x-3">
                    <img src={logo} alt="company Logo" className="h-11" />
                    <div>
                        <h1 className="text-xl font-bold text-primary-text">Inscriptions Platform</h1>
                        <p className="text-sm text-primary-text">C-DAC Bangalore</p>
                    </div>
                </NavLink>
                <img src={meityLogo} alt="company Logo" className="h-18" />
            </div>

            {/* Mobile header */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-6 navbar-logos-mob">
                <NavLink to="/home" className="flex items-center space-x-3">
                    <img src={logo} alt="company Logo" className="h-9" />
                    <div>
                        <p className="font-bold text-primary-text">
                            Inscriptions Platform
                        </p>
                        <p className="text-sm text-primary-text">C-DAC Bangalore</p>
                    </div>
                </NavLink>
                <img src={meityLogo} alt="company Logo" className="h-11" />
            </div>

            <hr className="border-t border-white opacity-60" />
            <div className="navbar-gradient" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <nav className={`top-0 z-50 text-secondary-text navbar-shadow ${mobileNavbarOpen ? (scrollPosition > 2 ? "navscrollbehavior" : "") : scrollPosition > 200 ? "navscrollbehavior" : ""}`} style={{ backgroundColor: "transparent", width: "100%" }} >
                    <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 ">
                            {/* Links */}
                            <div className="hidden md:flex justify-start space-x-6 header-links header-link-items cursor-pointer items-center nav-focus-styling hide-these-mobile-view" style={{ height: "100%" }}>
                                {linksToShow.map(({ path, label, end, scrollvalue, icon }) => (
                                    <NavLink
                                        key={label}
                                        to={path}
                                        end={end}
                                        onClick={() =>
                                            scrollToSection(scrollvalue)
                                        }
                                        className={({ isActive }) =>
                                            `text-white transition-colors ${isActive && linksToShow === protectedLinks ? "text-white border-b-4 font-semibold" : ""
                                            }`
                                        }
                                        style={{ height: "95%" }}
                                    >
                                        <div className="flex gap-2 justify-center items-center" style={{ height: "100%" }}>
                                            {icon}{label}
                                        </div>
                                    </NavLink>
                                ))}
                            </div>
                            {mobileNavbarOpen ? (
                                <X
                                    className="text-white"
                                    onClick={openMobileNavbarHandler}
                                />
                            ) : (
                                <Menu
                                    className="hamburger-icon text-white"
                                    onClick={openMobileNavbarHandler}
                                />
                            )}

                            {/* Auth buttons */}
                            <div className="flex justify-between items-center space-x-3" >
                                {authenticated ? (
                                    <button
                                        onClick={() => {
                                            const logoutSuccessful = authCtx.logout();
                                            if (logoutSuccessful) {
                                                navigate("/login", { replace: true });
                                            }
                                        }}
                                        className="flex items-center gap-2 bg-primary-dark text-white border-2 border-white cursor-pointer hover:bg-primary/80 pe-4 ps-3 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        <LogOut /> Logout
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate("/login", { replace: true })}
                                        className="flex items-center gap-2 bg-primary-light border-2 border-white cursor-pointer text-primary-text hover:bg-primary/80 pe-4 ps-3 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        <LogIn /> Login
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileNavbarOpen && (
                        <div
                            className={`mobile-navbar pt-10 space-y-8 flex flex-col items-center text-white ${isClosing ? "mobile-navbar-closing" : ""
                                }`}
                        >
                            {linksToShow.map(({ path, label, end, scrollvalue, icon }) => (
                                <NavLink
                                    key={label}
                                    to={path}
                                    end={end}
                                    onClick={() => handleNavClick(scrollvalue)}
                                    className={({ isActive }) =>
                                        `text-white py-4 transition-colors ${isActive && linksToShow === protectedLinks ? "text-white border-b-4 font-semibold" : ""
                                        }`
                                    }
                                >
                                    <div className="flex gap-2 justify-center items-center" >
                                        {icon}{label}
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </nav>
            </div>
        </div>
    );
};

export default Nav;
