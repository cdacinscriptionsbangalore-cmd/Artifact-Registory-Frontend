import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import logo from "@assets/Frame1.png";
import { NavLink, useNavigate } from "react-router-dom";
import { getCookie, logout } from "@/utils/auth";
import { Home, LogIn, LogOut, Menu, Upload, X } from "lucide-react";
import meityLogo from "@assets/meitylogo2.png";
import DynamicFeedOutlinedIcon from "@mui/icons-material/DynamicFeedOutlined";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { clearUserActivityTracking, trackUserActivity } from "./EventManager";
import { jwtDecode } from "jwt-decode";
import CircularProgess from "../Spinner/CircularProgess";

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
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const [mobileNavbarOpen, setMobileNavbarOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);

    const navigate = useNavigate();

    const protectedLinks: NavItem[] = [
        { path: "/home", label: "Home", end: true, icon: <Home /> },
        { path: "/feed", label: "Feed", end: true, icon: <DynamicFeedOutlinedIcon /> },
        { path: "/upload", label: "Upload", end: true, icon: <Upload /> },
        { path: "/profile", label: "Profile", end: true, icon: <AccountBoxOutlinedIcon /> },
    ];

    const publicLinks: NavItem[] = [
        { path: "/home", label: "Home", end: true, scrollvalue: 90 },
        { path: "/home", label: "Featured Discoveries", scrollvalue: 1200 },
        { path: "/home", label: "How it works", scrollvalue: 2140 },
        { path: "/home", label: "Recent Discoveries", scrollvalue: 3300 },
        { path: "/home", label: "Community", scrollvalue: 4600 },
        { path: "/home", label: "Get Started", scrollvalue: 6000 },
    ];

    const linksToShow = authenticated ? protectedLinks : publicLinks;

    const handleScroll = () => setScrollPosition(window.scrollY);

    const syncAuthState = () => {
        const token = getCookie("token");
        setAuthenticated(!!token);
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

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        syncAuthState();

        const token = getCookie("token");
        if (!token) return;

        const decoded: any = jwtDecode(token);
        const sessionTimeout =
            (decoded.exp - decoded.iat) * 1000;

        const handleSessionTimeout = () => {
            logout();
            setAuthenticated(false);
            navigate("/login", { replace: true });
        };

        const activityEvents = [
            "mousemove",
            "click",
            "keydown",
            "scroll",
            "touchstart",
        ];

        trackUserActivity(activityEvents, sessionTimeout, handleSessionTimeout);

        return () => {
            clearUserActivityTracking(activityEvents);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="navbar-gradient">
            {/* Desktop header */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-6 navbar-logos">
                <NavLink to="/home" className="flex items-center space-x-3">
                    <img src={logo} alt="Logo" className="h-11" />
                    <div>
                        <h1 className="text-xl font-bold text-primary-text">
                            Inscriptions Platform
                        </h1>
                        <p className="text-sm text-primary-text">C-DAC Bangalore</p>
                    </div>
                </NavLink>
                <img src={meityLogo} alt="Logo" className="h-18" />
            </div>

            {/* Mobile header */}
            <div className="mx-auto px-4 flex items-center justify-between py-6 navbar-logos-mob">
                <NavLink to="/home" className="flex items-center space-x-3">
                    <img src={logo} alt="Logo" className="h-9" />
                    <div>
                        <p className="font-bold text-primary-text">
                            Inscriptions Platform
                        </p>
                        <p className="text-sm text-primary-text">C-DAC Bangalore</p>
                    </div>
                </NavLink>
                <img src={meityLogo} alt="Logo" className="h-11" />
            </div>

            <hr className="border-t border-white opacity-60" />

            <nav
                className={`top-0 z-50 navbar-shadow ${
                    scrollPosition > 200 ? "navscrollbehavior" : ""
                }`}
            >
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Links */}
                        <div className="flex items-center space-x-4 nav-focus-styling">
                            {linksToShow.map(({ path, label, end, scrollvalue }) => (
                                <NavLink
                                    key={label}
                                    to={path}
                                    end={end}
                                    onClick={() =>
                                        scrollvalue && scrollToSection(scrollvalue)
                                    }
                                    className={({ isActive }) =>
                                        `hover:text-primary-dark transition-colors ${
                                            isActive
                                                ? "text-primary-dark font-semibold"
                                                : ""
                                        }`
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}

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
                        </div>

                        {/* Auth buttons */}
                        <div className="flex items-center space-x-3">
                            {authenticated === null ? (
                                <CircularProgess />
                            ) : authenticated ? (
                                <button
                                    onClick={() => {
                                        logout();
                                        setAuthenticated(false);
                                        navigate("/login", { replace: true });
                                    }}
                                    className="flex items-center gap-2 bg-primary-dark text-white border-2 border-white px-4 py-2 rounded-lg"
                                >
                                    <LogOut /> Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex items-center gap-2 bg-primary-light border-2 border-white px-4 py-2 rounded-lg"
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
                        className={`mobile-navbar ${
                            isClosing ? "mobile-navbar-closing" : ""
                        }`}
                    >
                        {linksToShow.map(({ path, label, end, scrollvalue }) => (
                            <NavLink
                                key={label}
                                to={path}
                                end={end}
                                onClick={() => {
                                    if (scrollvalue)
                                        scrollToSection(scrollvalue);
                                    openMobileNavbarHandler();
                                }}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Nav;
