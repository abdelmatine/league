import React from "react";
import { Menu } from "lucide-react";

interface LogoProps {
  isPlaying: boolean;
  toggleSound: () => void;
}

export function Logo({ isPlaying, toggleSound }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Sidebar Toggle Button */}
      <button className="lg:hidden text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div className="w-10 h-10 rounded-full border-2 border-[#C8AA6E] bg-[#091428] flex items-center justify-center hover:bg-[#ad3c07]">
        <span className="text-[#C8AA6E] font-bold text-xl">L</span>
      </div>

      {/* PLAY Button */}
      <button
        onClick={toggleSound}
        className={`bg-[#1E2328] text-sm font-semibold px-6 py-2 rounded-r-full transition-colors duration-200 ${
          isPlaying
          ? "text-[#C8AA6E] hover:bg-[#ad3c07] hover:text-white"
          : "text-[#C8AA6E] hover:bg-[#ad3c07] hover:text-white"
        }`}
      >
        PLAY
      </button>
    </div>
  );
}
