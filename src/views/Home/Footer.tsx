import type React from "react";
import logo from "@assets/Frame1.png"
import "./Footer.css";

const Footer: React.FC = () => {
    const date = new Date();
    const year = date.getFullYear();
    return (
        <footer className="footer-styling border-t border-slate-700/50 dark:border-slate-600 py-12 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "none" }} >
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 footer-logo-section">
                        <div className="flex items-center space-x-3 mb-4">
                            <img src={logo} alt="company Logo" className="h-11" />
                            <div>
                                <h4 className="font-bold text-primary-text dark:text-white">C-DAC Inscriptions Platform</h4>
                                <p className="text-sm text-primary-text dark:text-white">Centre for Development of Advanced Computing</p>
                            </div>
                        </div>
                        {/* <div className="text-primary-text dark:text-white mb-4 footer-logo-caption">
                            Empowering collaborative archaeological research through technology and community engagement.
                        </div> */}
                    </div>

                    {/* Remove this once footer links are active and uncomment above div and the links below */}
                    <div className="text-primary-text dark:text-white mb-4 footer-logo-caption">
                        Empowering collaborative archaeological research through technology and community engagement.
                    </div>

                    {/* <div className="footer-links-container-pc">
                        <h5 className="font-semibold mb-4 text-primary-text dark:text-white">Platform</h5>
                        <ul className="space-y-2 text-white dark:text-gray-300 footer-links">
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Explore</a></li>
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Upload</a></li>
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Research Tools</a></li>
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">API Access</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-container-pc">
                        <h5 className="font-semibold mb-4 text-primary-text dark:text-white">Community</h5>
                        <ul className="space-y-2 text-white dark:text-gray-300 footer-links">
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Guidelines</a></li>
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Forums</a></li>
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Events</a></li>
                            <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Contact</a></li>
                        </ul>
                    </div> */}
                    <div className="flex justify-around footer-links-container-mob">
                        <div>
                            <h5 className="font-semibold mb-4 text-primary-text dark:text-white">Platform</h5>
                            <ul className="space-y-2 text-white dark:text-gray-300 footer-links">
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Explore</a></li>
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Upload</a></li>
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Research Tools</a></li>
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">API Access</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-semibold mb-4 text-primary-text dark:text-white">Community</h5>
                            <ul className="space-y-2 text-white dark:text-gray-300 footer-links">
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Guidelines</a></li>
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Forums</a></li>
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Events</a></li>
                                <li className="footer-link-items"><a href="#" className="footer-link-item-anchor transition-colors hover:text-yellow-400">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white-700 dark:border-white mt-12 pt-8 text-center text-primary-text dark:text-white">
                    <p>&copy; {year}-{(year+1).toString().slice(2)} Centre for Development of Advanced Computing (C-DAC). All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;