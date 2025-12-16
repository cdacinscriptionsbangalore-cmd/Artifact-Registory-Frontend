import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import logo from "@assets/Frame1.png"
import { NavLink } from "react-router-dom";
import { isAuthenticated, logout } from "@/utils/auth";
import { Home, LogIn, LogOut, Menu, Upload, X } from "lucide-react";
import meityLogo from "@assets/meitylogo2.png";
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
interface NavItem {
    path: string;
    label: string;
    icon?: ReactNode;
    end?: boolean;
}
interface NavProps {
    scrollToSection: (position: number) => void;
}

const Nav: React.FC<NavProps> = ({ scrollToSection }) => {
    const authenticated = isAuthenticated();
    // const [authenticated, ToggleAuthenticated] = useState(false);
    const [mobileNavbarOpen, setMobileNavbarOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const protectedLinks: NavItem[] = [
        { path: "/home", label: "Home", end: true, icon: <Home /> },
        { path: "/feed", label: "Feed", end: true, icon: <DynamicFeedOutlinedIcon /> },
        { path: "/upload", label: "Upload", end: true, icon: <Upload /> },
        { path: "/profile", label: "Profile", end: true, icon: <AccountBoxOutlinedIcon /> },
    ];

    const publicLinks: NavItem[] = [];

    const linksToShow = authenticated ? protectedLinks : publicLinks;
    const [scrollPosition, setScrollPosition] = useState(0);

    const handleScroll = () => {
        setScrollPosition(window.scrollY);
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
    }

    const handleNavClick = (position: number) => {
        setIsClosing(true);
        setTimeout(() => {
            setMobileNavbarOpen(false);
            setIsClosing(false);
            scrollToSection(position);
        }, 300);
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [mobileNavbarOpen, openMobileNavbarHandler, setMobileNavbarOpen]);

    return (
        <>
            <div className="navbar-gradient">
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
                <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-6 navbar-logos-mob">
                    <NavLink to="/home" className="flex items-center space-x-3">
                        <img src={logo} alt="company Logo" className="h-9" />
                        <div>
                            <p className="font-bold text-primary-text">Inscriptions Platform</p>
                            <p className="text-sm text-primary-text">C-DAC Bangalore</p>
                        </div>
                    </NavLink>
                    <img src={meityLogo} alt="company Logo" className="h-11" />
                </div>
                <hr className="border-t border-white opacity-60" />
                <div className="navbar-gradient" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <nav className={`top-0 z-50 text-secondary-text navbar-shadow ${scrollPosition > 200 ? "navscrollbehavior" : "w-100C"}`} style={{ backgroundColor: "transparent" }} >
                        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16 ">
                                <div className="flex items-center space-x-3 nav-focus-styling " style={{ height: "100%" }}>
                                    {authenticated ? (
                                        <div className="hidden md:flex justify-start space-x-6 header-links header-link-items hide-these-mobile-view " style={{ height: "100%" }}>
                                            {protectedLinks.map(({ path, label, end, icon }) => (
                                                <NavLink
                                                    key={path}
                                                    to={path}
                                                    end={end}
                                                    className={({ isActive }) =>
                                                        `text-white transition-colors ${isActive ? "text-white border-b-4 font-semibold" : ""
                                                        }`
                                                    }
                                                    style={{ height: "99%" }}
                                                >
                                                    <div className="flex gap-2 justify-center items-center" style={{ height: "100%" }}>
                                                        {icon}{label}
                                                    </div>
                                                </NavLink>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="navbar-list" style={{ userSelect: "none", height: "100%" }}>
                                            <ul className="space-y-2 flex-row text-white items-center" style={{ display: "flex", flexDirection: "row", gap: "1rem", height: "100%", }}>
                                                <li className="header-links header-link-items cursor-pointer flex items-center" onClick={() => { scrollToSection(0) }} style={{ height: "100%" }}><NavLink to={'/home'} className="transition-colors flex items-center" style={{ height: "98%" }}>Home</NavLink></li>
                                                <li className="header-links header-link-items cursor-pointer flex items-center" onClick={() => { scrollToSection(900) }} style={{ height: "100%" }}><NavLink to={'/home'} className=" transition-colors flex items-center" style={{ height: "98%" }}>Featured Discoveries</NavLink></li>
                                                <li className="header-links header-link-items cursor-pointer flex items-center" onClick={() => { scrollToSection(1540) }} style={{ height: "100%" }}><NavLink to={'/home'} className=" transition-colors flex items-center" style={{ height: "98%" }}>How it works</NavLink></li>
                                                <li className="header-links header-link-items cursor-pointer flex items-center" onClick={() => { scrollToSection(2140) }} style={{ height: "100%" }}><NavLink to={'/home'} className=" transition-colors flex items-center" style={{ height: "98%" }}>Recent Discoveries</NavLink></li>
                                                <li className="header-links header-link-items cursor-pointer flex items-center" onClick={() => { scrollToSection(2940) }} style={{ height: "100%" }}><NavLink to={'/home'} className=" transition-colors flex items-center" style={{ height: "98%" }}>Community</NavLink></li>
                                                <li className="header-links header-link-items cursor-pointer flex items-center" onClick={() => { scrollToSection(3570) }} style={{ height: "100%" }}><NavLink to={'/home'} className=" transition-colors flex items-center" style={{ height: "98%" }}>Get Started</NavLink></li>
                                            </ul>
                                        </div>)}
                                    {mobileNavbarOpen ? <X className='text-white' onClick={openMobileNavbarHandler} /> :
                                        <Menu className="hamburger-icon text-white" onClick={openMobileNavbarHandler} />
                                    }
                                </div>
                                <div className="flex justify-between items-center space-x-3">
                                    <div className="ps-4 flex items-center justify-between">
                                        {authenticated && (
                                            <button
                                                onClick={logout}
                                                // onClick={() => ToggleAuthenticated(false)}
                                                className="flex items-center gap-2 bg-primary-dark text-white border-2 border-white cursor-pointer hover:bg-primary/80 pe-4 ps-3 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                <LogOut />Logout
                                            </button>
                                        )}
                                        {!authenticated && (
                                            <button
                                                onClick={logout}
                                                // onClick={() => ToggleAuthenticated(true)}
                                                className="flex items-center gap-2 bg-primary-light border-2 border-white cursor-pointer text-primary-text hover:bg-primary/80 pe-4 ps-3 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                <LogIn />
                                                Login
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {mobileNavbarOpen && (
                            <div className={`mobile-navbar ${isClosing ? "mobile-navbar-closing" : ""}`}>
                                <ul className="mt-6 space-y-8 flex flex-col items-center text-white">
                                    {authenticated ? (
                                        <>
                                            {protectedLinks.map((item) => (
                                                <li key={item.path} className="w-full text-center">

                                                    <NavLink
                                                        to={item.path}
                                                        className="block w-full py-4 header-link-item-anchor"
                                                        onClick={() => {
                                                            openMobileNavbarHandler();
                                                        }}
                                                    >
                                                        <div className="flex justify-center items-center gap-4">

                                                            {item.icon}
                                                            {item.label}
                                                        </div>
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            <li className="w-full text-center"><button className="w-full py-4" onClick={() => handleNavClick(90)}>Home</button></li>
                                            <li className="w-full text-center"><button className="w-full py-4" onClick={() => handleNavClick(1200)}>Featured Discoveries</button></li>
                                            <li className="w-full text-center"><button className="w-full py-4" onClick={() => handleNavClick(2140)}>How it works</button></li>
                                            <li className="w-full text-center"><button className="w-full py-4" onClick={() => handleNavClick(3300)}>Recent Discoveries</button></li>
                                            <li className="w-full text-center"><button className="w-full py-4" onClick={() => handleNavClick(4600)}>Community</button></li>
                                            <li className="w-full text-center"><button className="w-full py-4" onClick={() => handleNavClick(6000)}>Get Started</button></li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}

                    </nav>
                </div>
            </div>
        </>
    )
}

export default Nav;