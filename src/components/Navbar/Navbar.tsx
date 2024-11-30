import React, { useState } from "react";
import { Shield, Star, Trophy, Gift } from "lucide-react";
import Separator from "../ui/Separator";
import { Logo } from "./Logo";
import { UserStats } from "./UserStats";

interface NavbarProps {
  isSidebarMinimized: boolean;
  isPlaying: boolean;
  toggleSound: () => void;
}

export function Navbar({ isSidebarMinimized, isPlaying, toggleSound }: NavbarProps) {
  const [activeLink, setActiveLink] = useState<string>("home");

  const navLinks = [
    { id: "home", label: "HOME" },
    { id: "projects", label: "PROJECTS" },
    { id: "stack", label: "STACK" },
    { id: "contact", label: "CONTACT" },
  ];

  return (
    <nav className="bg-[#111111]/90 backdrop-blur-sm border-b border-[#1E282D] py-2 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-4 max-w-[2000px] mx-auto">
        {/* Left Section: Logo and NavLinks */}
        <div className="flex items-center space-x-6">
          <Logo isPlaying={isPlaying} toggleSound={toggleSound} />

          {/* NavLinks */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setActiveLink(link.id)}
                className={`relative text-sm font-medium transition-colors duration-200 ${
                  activeLink === link.id
                    ? "text-[#C8AA6E]"
                    : "text-[#A09B8C] hover:text-[#C8AA6E]"
                }`}
              >
                {link.label}
                {/* Triangle Indicator */}
                {activeLink === link.id && (
                  <span className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#C8AA6E]" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Right Section: Icons and User Stats */}
        <div className={`flex items-center space-x-6 ${isSidebarMinimized ? "" : "lg:pr-72"}`}>
          {isSidebarMinimized && (
            <div className="flex items-center gap-4">
              {[Shield, Star, Trophy, Gift].map((Icon, index) => (
                <button
                  key={index}
                  className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          )}
          <Separator className="mx-4" />
          <UserStats />
        </div>
      </div>
    </nav>
  );
}
