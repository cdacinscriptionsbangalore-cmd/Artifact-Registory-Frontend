import { NavLink } from "react-router-dom";
import logo from "@assets/Frame1.png";
import meityLogo from "@assets/meitylogo2.png";

const DesktopHeader = () => (
  <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-6 navbar-logos">
    <NavLink to="/home" className="flex items-center space-x-3">
      <img src={logo} className="h-11" />
      <div>
        <h1 className="text-xl font-bold text-primary-text">Inscriptions Platform</h1>
        <p className="text-sm text-primary-text">Bangalore</p>
      </div>
    </NavLink>
    <img src={meityLogo} className="h-18" />
  </div>
);

export default DesktopHeader;
