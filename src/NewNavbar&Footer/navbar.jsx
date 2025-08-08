"use client";

import { useState } from "react";
import logo from "../assets/logo.png";

export const Navbar = ({className = ""}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className= {className + " w-full relative"}>
      <div className="w-full h-[55px] md:h-[60px] lg:h-[65px] flex items-center justify-between px-6 md:px-8 lg:px-12 bg-white shadow-md">
        <div className="flex items-center gap-3">
          <a href="/">
            <img
              className="w-[45px] h-[45px] md:w-[50px] md:h-[50px] lg:w-[55px] lg:h-[55px] object-contain"
              src={logo || "/placeholder.svg"}
              alt="Galanter and Jones Logo"
            />
          </a>
          <a href="#" className="font-semibold text-sm text-[#263145]">
            Galanter and Jones
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
