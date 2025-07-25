import { useState } from "react";
import logo from "./assets/logo.png";
import "./navbarAndFooter.css";
import hamburger from "./assets/hamburger.png";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <>
      <header>
        <div>
          <ul>
            <li>
              <img
                onClick={toggleSidebar}
                className="hamburger"
                src={hamburger}
                alt="hamburger"
              />
            </li>
            <li>
                <img className="logo" src={logo} alt="Logo" onClick={() => useNavigate('/')}/>
            </li>
            <li>
              <a href="#" className="shopName">
                Galanter and Jones
              </a>
            </li>
          </ul>
        </div>
      </header>
      {isSidebarVisible && <Sidebar />}
    </>
  );
};

export default Navbar;

export const Sidebar = () => {
  return (
    <div className="sidebar-container" id="sidebar">
      <a href="#">
        <div className="sidebar-item">sidebar-item</div>
      </a>
      <a href="#">
        <div className="sidebar-item">sidebar-item</div>
      </a>
      <a href="#">
        <div className="sidebar-item">sidebar-item</div>
      </a>
    </div>
  );
};
