"use client";

import { useState } from "react";
import logo from "../assets/logo.png";
import "./navbar-footer.css";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">
            <img
              className="logo"
              src={logo || "/placeholder.svg"}
              alt="Galanter and Jones Logo"
            />
          </a>
          <a href="#" className="shop-name">
            Galanter and Jones
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
